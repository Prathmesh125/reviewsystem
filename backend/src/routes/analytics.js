const express = require('express');
const router = express.Router();
const { param, query, validationResult } = require('express-validator');
const analyticsService = require('../services/analyticsService');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @route GET /api/analytics/business/:businessId
 * @description Get comprehensive business analytics
 * @access Private (Business Owner)
 */
router.get('/business/:businessId',
  verifyFirebaseToken,
  [
    param('businessId').notEmpty().withMessage('Business ID is required'),
    query('range').optional().isIn(['7days', '30days', '90days', '1year']).withMessage('Invalid date range')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { businessId } = req.params;
      const { range = '7days' } = req.query;

      console.log('Analytics request - User UID:', req.user.uid, 'User Email:', req.user.email, 'Business ID:', businessId);

      // Verify user owns this business by checking email match
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { 
          userId: true,
          user: {
            select: {
              email: true
            }
          }
        }
      });

      console.log('Business found:', business);

      if (!business) {
        console.log('Business not found for ID:', businessId);
        return res.status(404).json({
          success: false,
          message: 'Business not found'
        });
      }

      // Check if Firebase user email matches the business owner's email
      if (business.user.email !== req.user.email) {
        console.log('Access denied - Business owner email:', business.user.email, 'Firebase user email:', req.user.email);
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not own this business'
        });
      }

      console.log('Business ownership verified by email match, fetching analytics...');

      // Get analytics data
      const analyticsData = await analyticsService.getBusinessAnalytics(businessId, range);

      res.json({
        success: true,
        data: analyticsData,
        message: 'Analytics data retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching business analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics data',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/analytics/business/:businessId/export
 * @description Export analytics data as CSV
 * @access Private (Business Owner)
 */
router.get('/business/:businessId/export',
  verifyFirebaseToken,
  [
    param('businessId').notEmpty().withMessage('Business ID is required'),
    query('range').optional().isIn(['7days', '30days', '90days', '1year']).withMessage('Invalid date range')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { businessId } = req.params;
      const { range = '7days' } = req.query;

      // Verify user owns this business
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { userId: true, name: true }
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Business not found'
        });
      }

      if (business.userId !== req.user.uid) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const csvData = await analyticsService.exportAnalyticsData(businessId, range);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${business.name}-${range}.csv"`);
      
      res.send(csvData);

    } catch (error) {
      console.error('Error exporting analytics data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export analytics data',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/analytics/overview
 * @description Get system-wide analytics overview (Super Admin only)
 * @access Private (Super Admin)
 */
router.get('/overview',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      // Check if user is super admin
      if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Super admin access required'
        });
      }

      const overview = await analyticsService.getSystemOverview();

      res.json({
        success: true,
        data: overview,
        message: 'System overview retrieved successfully'
      });

    } catch (error) {
      console.error('Error fetching system overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system overview',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/analytics/business/:businessId/insights
 * @description Get AI-powered business insights
 * @access Private (Business Owner)
 */
router.get('/business/:businessId/insights',
  verifyFirebaseToken,
  [
    param('businessId').notEmpty().withMessage('Business ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { businessId } = req.params;

      // Verify user owns this business
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { userId: true }
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Business not found'
        });
      }

      if (business.userId !== req.user.uid) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const insights = await analyticsService.generateBusinessInsights(businessId);

      res.json({
        success: true,
        data: insights,
        message: 'Business insights generated successfully'
      });

    } catch (error) {
      console.error('Error generating business insights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate business insights',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/analytics/create-demo-business
 * @description Create a demo business with sample data for analytics testing
 * @access Private
 */
router.post('/create-demo-business',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      console.log('Creating demo business for user:', req.user.uid);

      // Check if user already has a demo business
      const existingDemo = await prisma.business.findFirst({
        where: {
          userId: req.user.uid,
          name: 'Demo Analytics Business'
        }
      });

      if (existingDemo) {
        return res.json({
          success: true,
          data: existingDemo,
          message: 'Demo business already exists'
        });
      }

      // Create demo business
      const demoBusiness = await prisma.business.create({
        data: {
          name: 'Demo Analytics Business',
          type: 'restaurant',
          description: 'A sample business to demonstrate analytics features',
          userId: req.user.uid,
          isPublished: true,
          brandColor: '#3B82F6'
        }
      });

      res.json({
        success: true,
        data: demoBusiness,
        message: 'Demo business created successfully'
      });

    } catch (error) {
      console.error('Error creating demo business:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create demo business',
        error: error.message
      });
    }
  }
);

module.exports = router;