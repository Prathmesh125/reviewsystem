const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Create some test users
    const testUsers = [
      {
        email: 'millrockindustries@gmail.com',
        password: 'hashed_password',
        firstName: 'Mill',
        lastName: 'Rock',
        role: 'SUPER_ADMIN'
      },
      {
        email: 'john.doe@example.com',
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'BUSINESS_OWNER'
      },
      {
        email: 'jane.smith@example.com',
        password: 'hashed_password',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'BUSINESS_OWNER'
      }
    ];

    for (const userData of testUsers) {
      try {
        const user = await prisma.user.create({
          data: userData
        });
        console.log(`Created user: ${user.email} with role: ${user.role}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`User ${userData.email} already exists`);
        } else {
          console.error(`Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    // Check total users
    const totalUsers = await prisma.user.count();
    console.log(`\nTotal users in database: ${totalUsers}`);

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    console.log('\nAll users:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`);
    });

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();