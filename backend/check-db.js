const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== Checking Business Record ===');
    const business = await prisma.business.findUnique({
      where: { id: 'cmg5h2ny30005rcbnjtyzugdx' },
      select: { id: true, userId: true, name: true }
    });
    console.log('Business:', business);

    if (business) {
      console.log('\n=== Checking User Record ===');
      const user = await prisma.user.findUnique({
        where: { id: business.userId },
        select: { id: true, email: true, role: true }
      });
      console.log('User:', user);
      
      if (!user) {
        console.log('\n=== User not found, checking all users ===');
        const allUsers = await prisma.user.findMany({
          select: { id: true, email: true, role: true }
        });
        console.log('All users:', allUsers);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();