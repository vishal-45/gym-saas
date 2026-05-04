const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const email = 'amurboss1955@gmail.com';
  console.log(`Checking user: ${email}`);
  
  const tenant = await prisma.tenant.findFirst({ where: { email } });
  const trainer = await prisma.trainer.findFirst({ where: { email } });
  const staff = await prisma.staff.findFirst({ where: { email } });
  const member = await prisma.member.findFirst({ where: { email } });

  console.log('Tenant:', tenant ? 'Found' : 'Not Found');
  console.log('Trainer:', trainer ? 'Found' : 'Not Found');
  console.log('Staff:', staff ? 'Found' : 'Not Found');
  console.log('Member:', member ? 'Found' : 'Not Found');

  process.exit(0);
}

checkUser();
