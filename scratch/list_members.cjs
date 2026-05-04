const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listMembers() {
  const members = await prisma.member.findMany();
  console.log('Members in DB:');
  members.forEach(m => {
    console.log(`- ${m.name} (${m.email})`);
  });
  process.exit(0);
}

listMembers();
