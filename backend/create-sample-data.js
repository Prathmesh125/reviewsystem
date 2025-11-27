const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    const businessId = 'cmg5h2ny30005rcbnjtyzugdx';
    
    console.log('Creating sample QR scans...');
    
    // Get QR codes for this business
    const qrCodes = await prisma.qRCode.findMany({
      where: { businessId },
      select: { id: true }
    });
    
    console.log(`Found ${qrCodes.length} QR codes`);
    
    if (qrCodes.length > 0) {
      // Create some QR scans for the past few days
      const scansToCreate = [];
      const now = new Date();
      
      // Create scans for the last 5 days
      for (let i = 0; i < 5; i++) {
        const scanDate = new Date(now);
        scanDate.setDate(scanDate.getDate() - i);
        
        // Create 2-5 scans per day
        const scansPerDay = Math.floor(Math.random() * 4) + 2;
        
        for (let j = 0; j < scansPerDay; j++) {
          const randomQrCode = qrCodes[Math.floor(Math.random() * qrCodes.length)];
          
          scansToCreate.push({
            qrCodeId: randomQrCode.id,
            scannedAt: new Date(scanDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
          });
        }
      }
      
      console.log(`Creating ${scansToCreate.length} QR scans...`);
      
      const result = await prisma.qRScan.createMany({
        data: scansToCreate
      });
      
      console.log(`✅ Created ${result.count} QR scans successfully!`);
    } else {
      console.log('No QR codes found, cannot create scans');
    }
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData();