const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const staff = await prisma.staff.findMany();
  const members = await prisma.member.findMany();
  const tenants = await prisma.tenant.findMany();
  
  console.log('--- STAFF ---');
  console.log(JSON.stringify(staff, null, 2));
  
  console.log('--- MEMBERS ---');
  console.log(JSON.stringify(members, null, 2));

  console.log('--- TENANTS ---');
  console.log(JSON.stringify(tenants, null, 2));
  
  await prisma.$disconnect();
}

check();
