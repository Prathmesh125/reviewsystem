const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBusinessData() {
  try {
    const businessId = 'cmg5h2ny30005rcbnjtyzugdx';
    
    console.log('=== Checking Business Data ===');
    
    // Check Reviews
    const reviews = await prisma.review.findMany({
      where: { businessId },
      select: { id: true, rating: true, createdAt: true }
    });
    console.log(`Reviews: ${reviews.length} found`);
    if (reviews.length > 0) {
      console.log('Sample review:', reviews[0]);
    }
    
    // Check QR Codes
    const qrCodes = await prisma.qRCode.findMany({
      where: { businessId },
      select: { id: true, createdAt: true }
    });
    console.log(`QR Codes: ${qrCodes.length} found`);
    if (qrCodes.length > 0) {
      console.log('Sample QR Code:', qrCodes[0]);
    }
    
    // Check QR Scans
    const qrScans = await prisma.qRScan.findMany({
      where: { 
        qrCode: { businessId }
      },
      select: { id: true, scannedAt: true }
    });
    console.log(`QR Scans: ${qrScans.length} found`);
    if (qrScans.length > 0) {
      console.log('Sample QR Scan:', qrScans[0]);
    }
    
    // Check Customers
    const customers = await prisma.customer.findMany({
      where: { businessId },
      select: { id: true, createdAt: true }
    });
    console.log(`Customers: ${customers.length} found`);
    if (customers.length > 0) {
      console.log('Sample Customer:', customers[0]);
    }
    
    // Check Form Templates
    const formTemplates = await prisma.formTemplate.findMany({
      where: { businessId },
      select: { id: true, title: true }
    });
    console.log(`Form Templates: ${formTemplates.length} found`);
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBusinessData();