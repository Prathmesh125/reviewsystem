const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleCustomers() {
  try {
    // Get the first business to add customers to
    const business = await prisma.business.findFirst();
    
    if (!business) {
      console.log('No business found');
      return;
    }
    
    console.log('Adding customers to business:', business.name, '(ID:', business.id, ')');
    
    // Create sample customers with valid emails
    const sampleCustomers = [
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '555-0101',
        businessId: business.id
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@gmail.com',
        phone: '555-0102',
        businessId: business.id
      },
      {
        name: 'Mike Davis',
        email: 'mike.davis@yahoo.com',
        phone: '555-0103',
        businessId: business.id
      },
      {
        name: 'Emily Wilson',
        email: 'emily.wilson@outlook.com',
        phone: '555-0104',
        businessId: business.id
      },
      {
        name: 'Robert Brown',
        email: 'robert.brown@email.com',
        phone: '555-0105',
        businessId: business.id
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@gmail.com',
        phone: '555-0106',
        businessId: business.id
      }
    ];
    
    // Delete existing customers first (to avoid duplicates)
    const deleted = await prisma.customer.deleteMany({
      where: { businessId: business.id }
    });
    console.log('Deleted', deleted.count, 'existing customers');
    
    // Create new customers
    for (const customerData of sampleCustomers) {
      const customer = await prisma.customer.create({
        data: customerData
      });
      console.log('✅ Created customer:', customer.name, '-', customer.email);
    }
    
    console.log('\n🎉 Successfully created', sampleCustomers.length, 'sample customers with valid emails!');
    
    // Create customers for all other businesses too
    const allBusinesses = await prisma.business.findMany();
    
    for (const biz of allBusinesses) {
      if (biz.id !== business.id) {
        console.log('\nAdding customers to business:', biz.name, '(ID:', biz.id, ')');
        
        // Create a subset of customers for other businesses
        const otherCustomers = sampleCustomers.slice(0, 3).map(customer => ({
          ...customer,
          businessId: biz.id
        }));
        
        for (const customerData of otherCustomers) {
          const customer = await prisma.customer.create({
            data: customerData
          });
          console.log('✅ Created customer:', customer.name, '-', customer.email);
        }
      }
    }
    
  } catch (error) {
    console.error('Error creating sample customers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleCustomers();