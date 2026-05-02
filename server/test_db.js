import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { members: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Tenants found:", tenants.length);
    if (tenants.length > 0) {
      console.log(tenants[0]);
    }
  } catch (err) {
    console.error("Error fetching tenants:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
