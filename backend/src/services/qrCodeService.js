const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class QRCodeService {
  /**
   * Generate QR code image data URL
   */
  static async generateQRCode(url, options = {}) {
    const defaultOptions = {
      width: options.size || 300,
      margin: 2,
      color: {
        dark: options.foregroundColor || '#000000',
        light: options.backgroundColor || '#FFFFFF'
      },
      errorCorrectionLevel: options.errorCorrection || 'M'
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, defaultOptions);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code as Buffer for file saving
   */
  static async generateQRCodeBuffer(url, options = {}) {
    const defaultOptions = {
      width: options.size || 300,
      margin: 2,
      color: {
        dark: options.foregroundColor || '#000000',
        light: options.backgroundColor || '#FFFFFF'
      },
      errorCorrectionLevel: options.errorCorrection || 'M'
    };

    try {
      const qrCodeBuffer = await QRCode.toBuffer(url, defaultOptions);
      return qrCodeBuffer;
    } catch (error) {
      console.error('Error generating QR code buffer:', error);
      throw new Error('Failed to generate QR code buffer');
    }
  }

  /**
   * Create QR code record in database
   */
  static async createQRCode(businessId, qrData) {
    try {
      console.log('Creating QR code for business:', businessId);
      console.log('QR data:', qrData);

      const {
        title = 'Leave us a review',
        backgroundColor = '#FFFFFF',
        foregroundColor = '#000000',
        size = 300,
        logoUrl = null,
        errorCorrection = 'M'
      } = qrData;

      // Generate the review form URL
      const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/review/${businessId}`;
      console.log('Generated QR code URL:', qrCodeUrl);

      // Generate QR code image
      console.log('Generating QR code image...');
      const qrImageDataURL = await this.generateQRCode(qrCodeUrl, {
        size,
        backgroundColor,
        foregroundColor,
        errorCorrection
      });
      console.log('QR code image generated successfully');

      // Create QR code record
      console.log('Creating QR code record in database...');
      const qrCode = await prisma.qRCode.create({
        data: {
          businessId,
          qrCodeUrl,
          qrImageUrl: qrImageDataURL, // Store data URL for now, later we'll use Cloudinary
          title,
          backgroundColor,
          foregroundColor,
          size,
          logoUrl,
          errorCorrection
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              brandColor: true
            }
          }
        }
      });

      console.log('QR code created successfully:', qrCode.id);
      return qrCode;
    } catch (error) {
      console.error('Error creating QR code:', error);
      throw new Error('Failed to create QR code');
    }
  }

  /**
   * Get QR codes for a business
   */
  static async getBusinessQRCodes(businessId) {
    try {
      const qrCodes = await prisma.qRCode.findMany({
        where: { businessId },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              brandColor: true
            }
          },
          _count: {
            select: { scans: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return qrCodes;
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      throw new Error('Failed to fetch QR codes');
    }
  }

  /**
   * Update QR code
   */
  static async updateQRCode(qrCodeId, updates) {
    try {
      const existingQRCode = await prisma.qRCode.findUnique({
        where: { id: qrCodeId }
      });

      if (!existingQRCode) {
        throw new Error('QR code not found');
      }

      // If visual options changed, regenerate QR code
      const visualOptionsChanged = [
        'backgroundColor',
        'foregroundColor',
        'size',
        'errorCorrection'
      ].some(field => updates[field] && updates[field] !== existingQRCode[field]);

      let qrImageUrl = existingQRCode.qrImageUrl;

      if (visualOptionsChanged) {
        qrImageUrl = await this.generateQRCode(existingQRCode.qrCodeUrl, {
          size: updates.size || existingQRCode.size,
          backgroundColor: updates.backgroundColor || existingQRCode.backgroundColor,
          foregroundColor: updates.foregroundColor || existingQRCode.foregroundColor,
          errorCorrection: updates.errorCorrection || existingQRCode.errorCorrection
        });
      }

      const updatedQRCode = await prisma.qRCode.update({
        where: { id: qrCodeId },
        data: {
          ...updates,
          qrImageUrl
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              brandColor: true
            }
          }
        }
      });

      return updatedQRCode;
    } catch (error) {
      console.error('Error updating QR code:', error);
      throw new Error('Failed to update QR code');
    }
  }

  /**
   * Delete QR code
   */
  static async deleteQRCode(qrCodeId) {
    try {
      await prisma.qRCode.delete({
        where: { id: qrCodeId }
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw new Error('Failed to delete QR code');
    }
  }

  /**
   * Track QR code scan
   */
  static async trackScan(qrCodeId, scanData = {}) {
    try {
      const { ipAddress, userAgent, location } = scanData;

      // Create scan record
      await prisma.qRScan.create({
        data: {
          qrCodeId,
          ipAddress,
          userAgent,
          location: location ? JSON.stringify(location) : null
        }
      });

      // Increment scan count
      await prisma.qRCode.update({
        where: { id: qrCodeId },
        data: {
          scansCount: {
            increment: 1
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error tracking QR scan:', error);
      throw new Error('Failed to track scan');
    }
  }

  /**
   * Get QR code analytics
   */
  static async getQRCodeAnalytics(qrCodeId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      
      const whereClause = { qrCodeId };
      if (startDate && endDate) {
        whereClause.scannedAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const [qrCode, totalScans, recentScans] = await Promise.all([
        prisma.qRCode.findUnique({
          where: { id: qrCodeId },
          include: {
            business: {
              select: {
                id: true,
                name: true,
                brandColor: true
              }
            }
          }
        }),
        prisma.qRScan.count({ where: whereClause }),
        prisma.qRScan.findMany({
          where: whereClause,
          orderBy: { scannedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            ipAddress: true,
            location: true,
            scannedAt: true
          }
        })
      ]);

      return {
        qrCode,
        analytics: {
          totalScans,
          recentScans
        }
      };
    } catch (error) {
      console.error('Error fetching QR code analytics:', error);
      throw new Error('Failed to fetch QR code analytics');
    }
  }
}

module.exports = QRCodeService;