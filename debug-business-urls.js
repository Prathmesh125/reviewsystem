// Debug script to check business Google Review URLs
const { PrismaClient } = require('./backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function debugBusinessUrls() {
  try {
    console.log('=== CHECKING ALL BUSINESSES ===');
    
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        googleReviewUrl: true,
        userId: true
      }
    });
    
    console.log('Found', businesses.length, 'businesses:');
    
    businesses.forEach((business, index) => {
      console.log(`\n${index + 1}. Business: ${business.name}`);
      console.log(`   ID: ${business.id}`);
      console.log(`   User ID: ${business.userId}`);
      console.log(`   Google Review URL: ${business.googleReviewUrl || 'NOT SET'}`);
      
      if (business.googleReviewUrl && business.googleReviewUrl.includes('Hair+Affair+Professionnel')) {
        console.log('   ⚠️  FOUND PROBLEMATIC URL!');
      }
    });
    
    console.log('\n=== CHECKING FORM TEMPLATES ===');
    
    const templates = await prisma.formTemplate.findMany({
      select: {
        id: true,
        name: true,
        businessId: true,
        settings: true
      }
    });
    
    console.log('Found', templates.length, 'form templates:');
    
    templates.forEach((template, index) => {
      console.log(`\n${index + 1}. Template: ${template.name}`);
      console.log(`   ID: ${template.id}`);
      console.log(`   Business ID: ${template.businessId}`);
      
      if (template.settings) {
        try {
          const settings = JSON.parse(template.settings);
          if (settings.googleReviewUrl) {
            console.log(`   Template Google Review URL: ${settings.googleReviewUrl}`);
            if (settings.googleReviewUrl.includes('Hair+Affair+Professionnel')) {
              console.log('   ⚠️  FOUND PROBLEMATIC URL IN TEMPLATE!');
            }
          }
        } catch (e) {
          console.log('   Settings parse error:', e.message);
        }
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugBusinessUrls();