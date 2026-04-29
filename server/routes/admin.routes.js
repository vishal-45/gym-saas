import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Protection Layer
const verifySuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: "Access Denied. God Mode authorization required." });
  }
  next();
};

// 2. Global Member Search
router.get('/members/search', verifyToken, verifySuperAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const members = await prisma.member.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } }
        ]
      },
      include: { tenant: true },
      take: 20
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: "Global search failure." });
  }
});

// 3. Platform Audit Logs
router.get('/logs', verifyToken, verifySuperAdmin, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Audit retrieval failure." });
  }
});

// 4. Impersonation Engine
router.post('/tenants/:id/impersonate', verifyToken, verifySuperAdmin, async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.params.id } });
    if (!tenant) return res.status(404).json({ error: "Gym not found." });

    const token = jwt.sign(
      { id: tenant.id, name: tenant.name, tier: tenant.tier },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await prisma.auditLog.create({
      data: {
        adminId: req.user.id,
        action: 'IMPERSONATE',
        target: tenant.name,
        details: `Super Admin accessed ${tenant.name} portal.`
      }
    });

    res.json({ token, tenant: { id: tenant.id, name: tenant.name, email: tenant.email, tier: tenant.tier } });
  } catch (err) {
    res.status(500).json({ error: "Impersonation failed." });
  }
});

// Fetch Platform Stats
router.get('/stats', verifyToken, verifySuperAdmin, async (req, res) => {
  try {
    const totalTenants = await prisma.tenant.count();
    const totalMembers = await prisma.member.count();
    
    // Revenue Estimate: members * 89 (average plan)
    const estimatedMRR = totalMembers * 89;

    // New Gyms this week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const newTenantsThisWeek = await prisma.tenant.count({
      where: { createdAt: { gte: lastWeek } }
    });

    res.json({
      totalTenants,
      totalMembers,
      estimatedMRR,
      newTenantsThisWeek,
      systemHealth: '99.9%'
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load platform stats" });
  }
});

// Fetch All Gyms
router.get('/tenants', verifyToken, verifySuperAdmin, async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { members: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map data to math logic required by frontend
    const payload = tenants.map(t => ({
      id: t.id,
      name: t.name,
      owner: t.email,
      tier: t.tier,
      status: t.status,
      members: t.members.length,
      mrr: (t.members.length * 89) // Dummy calculation for prototype
    }));
    
    res.json(payload);
  } catch(err) {
    res.status(500).json({ error: "Failed to fetch platforms" });
  }
});

// Toggle Status (Suspend / Reactivate)
router.put('/tenants/:id/toggle', verifyToken, verifySuperAdmin, async (req, res) => {
  try {
    const target = await prisma.tenant.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "Tenant not found" });

    const newStatus = target.status === 'Active' ? 'Suspended' : 'Active';

    const updated = await prisma.tenant.update({
      where: { id: req.params.id },
      data: { status: newStatus }
    });

    // LOG the status change
    await prisma.auditLog.create({
      data: {
        adminId: req.user.id,
        action: newStatus === 'Suspended' ? 'SUSPEND_GYM' : 'REACTIVATE_GYM',
        target: target.name,
        details: `${newStatus} gym access for ${target.email}`
      }
    });

    res.json(updated);
  } catch(err) {
    res.status(500).json({ error: "Failed to modify tenant status" });
  }
});

export default router;
