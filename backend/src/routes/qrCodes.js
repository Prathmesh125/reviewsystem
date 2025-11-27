const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const QRCodeService = require('../services/qrCodeService');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// GET /api/qr-codes - Get all QR codes for user's business
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    // Find business owned by this user
    const business = await prisma.business.findFirst({
      where: { 
        user: {
          email: req.user.email
        }
      }
    });
    
    if (!business) {
      return res.status(400).json({ error: 'No business associated with user' });
    }

    const qrCodes = await QRCodeService.getBusinessQRCodes(business.id);
    res.json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ error: 'Failed to fetch QR codes' });
  }
});

// POST /api/qr-codes - Create new QR code
router.post('/', 
  verifyFirebaseToken,
  [
    body('title').optional().trim().isLength({ min: 1, max: 100 }),
    body('backgroundColor').optional().matches(/^#[0-9A-F]{6}$/i),
    body('foregroundColor').optional().matches(/^#[0-9A-F]{6}$/i),
    body('size').optional().isInt({ min: 100, max: 1000 }),
    body('errorCorrection').optional().isIn(['L', 'M', 'Q', 'H'])
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      // Find business owned by this user
      const business = await prisma.business.findFirst({
        where: { 
          user: {
            email: req.user.email
          }
        }
      });
      
      if (!business) {
        return res.status(400).json({ error: 'No business associated with user' });
      }

      const qrData = {
        title: req.body.title || 'Leave us a review',
        backgroundColor: req.body.backgroundColor || '#FFFFFF',
        foregroundColor: req.body.foregroundColor || '#000000',
        size: req.body.size || 300,
        logoUrl: req.body.logoUrl || null,
        errorCorrection: req.body.errorCorrection || 'M'
      };

      const qrCode = await QRCodeService.createQRCode(business.id, qrData);
      res.status(201).json(qrCode);
    } catch (error) {
      console.error('Error creating QR code:', error);
      res.status(500).json({ error: error.message || 'Failed to create QR code' });
    }
  }
);

// GET /api/qr-codes/:id - Get specific QR code
router.get('/:id',
  verifyFirebaseToken,
  [param('id').isString().isLength({ min: 1 })],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find business owned by this user
      const business = await prisma.business.findFirst({
        where: { 
          user: {
            email: req.user.email
          }
        }
      });
      
      if (!business) {
        return res.status(400).json({ error: 'No business associated with user' });
      }

      const qrCode = await QRCodeService.getQRCodeAnalytics(id);
      
      // Verify QR code belongs to user's business
      if (qrCode.qrCode && qrCode.qrCode.businessId !== business.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!qrCode.qrCode) {
        return res.status(404).json({ error: 'QR code not found' });
      }

      res.json(qrCode);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      res.status(500).json({ error: 'Failed to fetch QR code' });
    }
  }
);

// PUT /api/qr-codes/:id - Update QR code
router.put('/:id',
  verifyFirebaseToken,
  [
    param('id').isString().isLength({ min: 1 }),
    body('title').optional().trim().isLength({ min: 1, max: 100 }),
    body('backgroundColor').optional().matches(/^#[0-9A-F]{6}$/i),
    body('foregroundColor').optional().matches(/^#[0-9A-F]{6}$/i),
    body('size').optional().isInt({ min: 100, max: 1000 }),
    body('errorCorrection').optional().isIn(['L', 'M', 'Q', 'H']),
    body('isActive').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Find business owned by this user
      const business = await prisma.business.findFirst({
        where: { 
          user: {
            email: req.user.email
          }
        }
      });
      
      if (!business) {
        return res.status(400).json({ error: 'No business associated with user' });
      }

      // First verify QR code belongs to user's business
      const existingQRCode = await QRCodeService.getQRCodeAnalytics(id);
      
      if (!existingQRCode.qrCode) {
        return res.status(404).json({ error: 'QR code not found' });
      }

      if (existingQRCode.qrCode.businessId !== business.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedQRCode = await QRCodeService.updateQRCode(id, updates);
      res.json(updatedQRCode);
    } catch (error) {
      console.error('Error updating QR code:', error);
      res.status(500).json({ error: error.message || 'Failed to update QR code' });
    }
  }
);

// DELETE /api/qr-codes/:id - Delete QR code
router.delete('/:id',
  verifyFirebaseToken,
  [param('id').isString().isLength({ min: 1 })],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find business owned by this user
      const business = await prisma.business.findFirst({
        where: { 
          user: {
            email: req.user.email
          }
        }
      });
      
      if (!business) {
        return res.status(400).json({ error: 'No business associated with user' });
      }

      // First verify QR code belongs to user's business
      const existingQRCode = await QRCodeService.getQRCodeAnalytics(id);
      
      if (!existingQRCode.qrCode) {
        return res.status(404).json({ error: 'QR code not found' });
      }

      if (existingQRCode.qrCode.businessId !== business.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await QRCodeService.deleteQRCode(id);
      res.json({ success: true, message: 'QR code deleted successfully' });
    } catch (error) {
      console.error('Error deleting QR code:', error);
      res.status(500).json({ error: error.message || 'Failed to delete QR code' });
    }
  }
);

// POST /api/qr-codes/:id/track-scan - Track QR code scan (public endpoint)
router.post('/:id/track-scan',
  [param('id').isString().isLength({ min: 1 })],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const scanData = {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        location: req.body.location || null
      };

      await QRCodeService.trackScan(id, scanData);
      res.json({ success: true, message: 'Scan tracked successfully' });
    } catch (error) {
      console.error('Error tracking scan:', error);
      res.status(500).json({ error: 'Failed to track scan' });
    }
  }
);

// GET /api/qr-codes/:id/analytics - Get QR code analytics
router.get('/:id/analytics',
  verifyFirebaseToken,
  [
    param('id').isString().isLength({ min: 1 }),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      // Find business owned by this user
      const business = await prisma.business.findFirst({
        where: { 
          user: {
            email: req.user.email
          }
        }
      });
      
      if (!business) {
        return res.status(400).json({ error: 'No business associated with user' });
      }

      const analytics = await QRCodeService.getQRCodeAnalytics(id, {
        startDate,
        endDate
      });

      // Verify QR code belongs to user's business
      if (analytics.qrCode && analytics.qrCode.businessId !== business.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!analytics.qrCode) {
        return res.status(404).json({ error: 'QR code not found' });
      }

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching QR code analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
);

// GET /api/qr-codes/:id/download - Download QR code image
router.get('/:id/download',
  [param('id').isString().isLength({ min: 1 })],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { format = 'png' } = req.query;

      const qrCodeData = await QRCodeService.getQRCodeAnalytics(id);
      
      if (!qrCodeData.qrCode) {
        return res.status(404).json({ error: 'QR code not found' });
      }

      const qrCode = qrCodeData.qrCode;

      // Generate QR code buffer for download
      const qrCodeBuffer = await QRCodeService.generateQRCodeBuffer(qrCode.qrCodeUrl, {
        size: qrCode.size,
        backgroundColor: qrCode.backgroundColor,
        foregroundColor: qrCode.foregroundColor,
        errorCorrection: qrCode.errorCorrection
      });

      // Set appropriate headers for download
      res.set({
        'Content-Type': `image/${format}`,
        'Content-Disposition': `attachment; filename="qr-code-${qrCode.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${format}"`,
        'Content-Length': qrCodeBuffer.length
      });

      res.send(qrCodeBuffer);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      res.status(500).json({ error: 'Failed to download QR code' });
    }
  }
);

module.exports = router;