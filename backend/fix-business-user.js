const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const firebaseUID = 'RBpIuqnf2YMjWq3QVxPmbSldeRr1';
    
    console.log('Checking if user exists...');
    
    const user = await prisma.user.findUnique({
      where: { firebaseUid: firebaseUID },
      select: { id: true, firebaseUid: true, email: true }
    });
    
    if (user) {
      console.log('User found:', user);
      return user.id;
    } else {
      console.log('User not found. Creating user...');
      
      const newUser = await prisma.user.create({
        data: {
          firebaseUid: firebaseUID,
          email: 'millrockindustries@gmail.com',
          role: 'BUSINESS_OWNER'
        },
        select: { id: true, firebaseUid: true, email: true }
      });
      
      console.log('User created:', newUser);
      return newUser.id;
    }
  } catch (error) {
    console.error('Error checking/creating user:', error);
    return null;
  }
}

async function fixBusiness() {
  try {
    const userId = await checkUser();
    
    if (userId) {
      const businessId = 'cmg5h2ny30005rcbnjtyzugdx';
      
      console.log('Updating business with userId:', userId);
      
      const updatedBusiness = await prisma.business.update({
        where: { id: businessId },
        data: { userId: userId },
        select: { id: true, userId: true, name: true }
      });
      
      console.log('✅ Business updated successfully:', updatedBusiness);
    }
  } catch (error) {
    console.error('Error fixing business:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBusiness();