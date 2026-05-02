import prisma from '../lib/prisma.js';

export async function runRetentionScanForTenant(tenantId) {
    // 1. Mark expired members as Inactive
    const expiredMembers = await prisma.member.updateMany({
      where: {
        tenantId,
        status: "Active",
        subscriptionEnd: { lt: new Date() }
      },
      data: { status: "Inactive" }
    });

    if (expiredMembers.count > 0) {
      console.log(`[RETENTION] Tenant ${tenantId}: Deactivated ${expiredMembers.count} expired memberships.`);
    }

    // 2. Find memberships expiring in the next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const expiringMembers = await prisma.member.findMany({
      where: {
        tenantId,
        status: "Active",
        subscriptionEnd: {
          lte: nextWeek,
          gte: new Date()
        }
      }
    });

    const notificationsCreated = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    for (const member of expiringMembers) {
        // Check if reminder already sent today
        const existing = await prisma.notification.findFirst({
            where: {
                tenantId,
                userId: member.id,
                type: "EXPIRY",
                createdAt: { gte: today }
            }
        });

        if (!existing) {
            const daysLeft = Math.ceil((new Date(member.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24));
            
            const n = await prisma.notification.create({
                data: {
                    tenantId,
                    userId: member.id,
                    title: "Membership Expiring Soon",
                    message: `${member.name}'s membership will expire in ${daysLeft} days (${new Date(member.subscriptionEnd).toLocaleDateString()}).`,
                    type: "EXPIRY"
                }
            });
            notificationsCreated.push(n);
        }
    }

    return {
        scanned: expiringMembers.length,
        remindersSent: notificationsCreated.length
    };
}

export async function runGlobalRetentionScan() {
    console.log(`[RETENTION] Starting global scan at ${new Date().toISOString()}`);
    
    // Get all tenants (gyms)
    const tenants = await prisma.tenant.findMany({
        select: { id: true }
    });

    let totalReminders = 0;
    for (const tenant of tenants) {
        try {
            const results = await runRetentionScanForTenant(tenant.id);
            totalReminders += results.remindersSent;
        } catch (err) {
            console.error(`[RETENTION] Failed for tenant ${tenant.id}:`, err);
        }
    }

    console.log(`[RETENTION] Global scan complete. Reminders sent: ${totalReminders}`);
    return totalReminders;
}
