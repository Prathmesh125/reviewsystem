const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUserId() {
  try {
    const businessId = 'cmg5h2ny30005rcbnjtyzugdx';
    const correctFirebaseUID = 'RBpIuqnf2YMjWq3QVxPmbSldeRr1';
    
    console.log('Checking current business record...');
    
    const currentBusiness = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, userId: true, name: true }
    });
    
    console.log('Current business:', currentBusiness);
    
    if (currentBusiness) {
      console.log('Updating business userId...');
      
      const updatedBusiness = await prisma.business.update({
        where: { id: businessId },
        data: { userId: correctFirebaseUID },
        select: { id: true, userId: true, name: true }
      });
      
      console.log('Updated business:', updatedBusiness);
      console.log('✅ Business userId fixed successfully!');
    } else {
      console.log('❌ Business not found');
    }
  } catch (error) {
    console.error('Error fixing userId:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserId();