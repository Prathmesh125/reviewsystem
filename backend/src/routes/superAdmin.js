const express = require('express');
const router = express.Router();
const { query, param, body, validationResult } = require('express-validator');
const superAdminService = require('../services/superAdminService');
const { verifySuperAdmin } = require('../middleware/superAdminAuth');

// Apply super admin authentication to all routes
router.use(verifySuperAdmin);

/**
 * @route GET /api/super-admin/dashboard
 * @description Get super admin dashboard statistics
 * @access Super Admin Only
 */
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await superAdminService.getDashboardStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics'
    });
  }
});

/**
 * @route GET /api/super-admin/users
 * @description Get all users with pagination
 * @access Super Admin Only
 */
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await superAdminService.getAllUsers(
      parseInt(page), 
      parseInt(limit), 
      search
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

/**
 * @route GET /api/super-admin/businesses
 * @description Get all businesses with pagination
 * @access Super Admin Only
 */
router.get('/businesses', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await superAdminService.getAllBusinesses(
      parseInt(page), 
      parseInt(limit), 
      search
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get businesses'
    });
  }
});

/**
 * @route GET /api/super-admin/reviews
 * @description Get all reviews with moderation capabilities
 * @access Super Admin Only
 */
router.get('/reviews', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['all', 'pending', 'approved', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, status = 'all' } = req.query;
    const result = await superAdminService.getAllReviews(
      parseInt(page), 
      parseInt(limit), 
      status
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews'
    });
  }
});

/**
 * @route PUT /api/super-admin/users/:id/status
 * @description Toggle user active status
 * @access Super Admin Only
 */
router.put('/users/:id/status', [
  param('id').notEmpty().withMessage('User ID is required'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { isActive } = req.body;
    
    const user = await superAdminService.toggleUserStatus(id, isActive);
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

/**
 * @route DELETE /api/super-admin/users/:id
 * @description Delete a user (super admin only)
 * @access Super Admin Only
 */
router.delete('/users/:id', [
  param('id').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    
    await superAdminService.deleteUser(id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

/**
 * @route DELETE /api/super-admin/businesses/:id
 * @description Delete a business (super admin only)
 * @access Super Admin Only
 */
router.delete('/businesses/:id', [
  param('id').notEmpty().withMessage('Business ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    await superAdminService.deleteBusiness(id);
    
    res.json({
      success: true,
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete business'
    });
  }
});

/**
 * @route PUT /api/super-admin/reviews/:id/moderate
 * @description Moderate a review (approve/reject)
 * @access Super Admin Only
 */
router.put('/reviews/:id/moderate', [
  param('id').notEmpty().withMessage('Review ID is required'),
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
  body('moderatorNotes').optional().isString().withMessage('Moderator notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, moderatorNotes = '' } = req.body;
    
    console.log(`Moderating review ${id} with status: ${status}`);
    
    const review = await superAdminService.moderateReview(id, status, moderatorNotes);
    
    res.json({
      success: true,
      message: `Review ${status.toLowerCase()} successfully`,
      data: review
    });
  } catch (error) {
    console.error('Error moderating review:', error);
    
    // Provide more specific error messages
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to moderate review',
      error: error.message
    });
  }
});

/**
 * @route GET /api/super-admin/analytics
 * @description Get platform-wide analytics
 * @access Super Admin Only
 */
router.get('/analytics', [
  query('range').optional().isIn(['7days', '30days', '90days']).withMessage('Invalid range')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { range = '30days' } = req.query;
    const analytics = await superAdminService.getPlatformAnalytics(range);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting platform analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get platform analytics'
    });
  }
});

/**
 * @route GET /api/super-admin/system-health
 * @description Get system health and performance metrics
 * @access Super Admin Only
 */
router.get('/system-health', async (req, res) => {
  try {
    const health = await superAdminService.getSystemHealth();
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system health'
    });
  }
});

/**
 * @route PUT /api/super-admin/businesses/:id/status
 * @description Update business status (approve/suspend)
 * @access Super Admin Only
 */
router.put('/businesses/:id/status', [
  param('id').notEmpty().withMessage('Business ID is required'),
  body('isApproved').isBoolean().withMessage('isApproved must be a boolean'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { isApproved, notes = '' } = req.body;
    
    const business = await superAdminService.updateBusinessStatus(id, isApproved, notes);
    
    res.json({
      success: true,
      message: `Business ${isApproved ? 'approved' : 'suspended'} successfully`,
      data: business
    });
  } catch (error) {
    console.error('Error updating business status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update business status'
    });
  }
});

/**
 * @route POST /api/super-admin/users/:id/reset-password
 * @description Reset user password
 * @access Super Admin Only
 */
router.post('/users/:id/reset-password', [
  param('id').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const result = await superAdminService.resetUserPassword(id);
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      data: result
    });
  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset user password'
    });
  }
});

/**
 * @route GET /api/super-admin/audit-logs
 * @description Get system audit logs
 * @access Super Admin Only
 */
router.get('/audit-logs', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('action').optional().isString().withMessage('Action must be a string'),
  query('userId').optional().isString().withMessage('User ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, action = '', userId = '' } = req.query;
    const logs = await superAdminService.getAuditLogs(
      parseInt(page), 
      parseInt(limit), 
      action, 
      userId
    );
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs'
    });
  }
});

// ==============================================
// HIERARCHICAL NAVIGATION ENDPOINTS
// ==============================================

/**
 * @route GET /api/super-admin/users/:userId/businesses
 * @description Get all businesses for a specific user
 * @access Super Admin Only
 */
router.get('/users/:userId/businesses', [
  param('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const businesses = await superAdminService.getUserBusinesses(userId);
    
    res.json({
      success: true,
      data: { businesses }
    });
  } catch (error) {
    console.error('Error getting user businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user businesses'
    });
  }
});

/**
 * @route GET /api/super-admin/businesses/:businessId/customers
 * @description Get all customers for a specific business
 * @access Super Admin Only
 */
router.get('/businesses/:businessId/customers', [
  param('businessId').notEmpty().withMessage('Business ID is required')
], async (req, res) => {
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
    const customers = await superAdminService.getBusinessCustomers(businessId);
    
    res.json({
      success: true,
      data: { customers }
    });
  } catch (error) {
    console.error('Error getting business customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get business customers'
    });
  }
});

/**
 * @route GET /api/super-admin/businesses/:businessId/reviews
 * @description Get all reviews for a specific business
 * @access Super Admin Only
 */
router.get('/businesses/:businessId/reviews', [
  param('businessId').notEmpty().withMessage('Business ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
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
    const { page = 1, limit = 50 } = req.query;
    const reviews = await superAdminService.getBusinessReviews(
      businessId, 
      parseInt(page), 
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    console.error('Error getting business reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get business reviews'
    });
  }
});

/**
 * @route GET /api/super-admin/businesses/:businessId/analytics
 * @description Get detailed analytics for a specific business
 * @access Super Admin Only
 */
router.get('/businesses/:businessId/analytics', [
  param('businessId').notEmpty().withMessage('Business ID is required'),
  query('range').optional().isIn(['7days', '30days', '90days', '1year']).withMessage('Invalid range')
], async (req, res) => {
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
    const { range = '30days' } = req.query;
    const analytics = await superAdminService.getBusinessAnalytics(businessId, range);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting business analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get business analytics'
    });
  }
});

/**
 * @route GET /api/super-admin/users/:userId/activity
 * @description Get activity logs for a specific user
 * @access Super Admin Only
 */
router.get('/users/:userId/activity', [
  param('userId').notEmpty().withMessage('User ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const activity = await superAdminService.getUserActivityLogs(
      userId, 
      parseInt(page), 
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity'
    });
  }
});

/**
 * @route GET /api/super-admin/businesses/:businessId/export
 * @description Export business data (customers, reviews, analytics)
 * @access Super Admin Only
 */
router.get('/businesses/:businessId/export', [
  param('businessId').notEmpty().withMessage('Business ID is required'),
  query('format').optional().isIn(['csv', 'excel', 'json']).withMessage('Invalid format')
], async (req, res) => {
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
    const { format = 'csv' } = req.query;
    
    const exportData = await superAdminService.exportBusinessData(businessId, format);
    
    // Set appropriate headers for file download
    const filename = `business-${businessId}-data.${format}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
    } else if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else {
      res.setHeader('Content-Type', 'application/json');
    }
    
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting business data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export business data'
    });
  }
});

// ==============================================
// ADVANCED MONITORING ENDPOINTS
// ==============================================

/**
 * @route GET /api/super-admin/real-time/stats
 * @description Get real-time system statistics
 * @access Super Admin Only
 */
router.get('/real-time/stats', async (req, res) => {
  try {
    const stats = await superAdminService.getRealTimeStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting real-time stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time statistics'
    });
  }
});

/**
 * @route GET /api/super-admin/real-time/activities
 * @description Get recent system activities
 * @access Super Admin Only
 */
router.get('/real-time/activities', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { limit = 50 } = req.query;
    const activities = await superAdminService.getRecentActivities(parseInt(limit));
    res.json({ activities });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
});

/**
 * @route GET /api/super-admin/analytics/revenue
 * @description Get comprehensive revenue analytics
 * @access Super Admin Only
 */
router.get('/analytics/revenue', [
  query('range').optional().isIn(['7days', '30days', '90days', '1year']).withMessage('Invalid range')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { range = '30days' } = req.query;
    const analytics = await superAdminService.getRevenueAnalytics(range);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics'
    });
  }
});

/**
 * @route GET /api/super-admin/analytics/subscriptions
 * @description Get detailed subscription metrics with business owner details
 * @access Super Admin Only
 */
router.get('/analytics/subscriptions', async (req, res) => {
  try {
    const metrics = await superAdminService.getSubscriptionMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error getting subscription metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription metrics'
    });
  }
});

/**
 * @route GET /api/super-admin/security/analytics
 * @description Get security and threat analytics
 * @access Super Admin Only
 */
router.get('/security/analytics', async (req, res) => {
  try {
    const analytics = await superAdminService.getSecurityAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting security analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security analytics'
    });
  }
});

/**
 * @route GET /api/super-admin/moderation/queue
 * @description Get content moderation queue
 * @access Super Admin Only
 */
router.get('/moderation/queue', [
  query('status').optional().isIn(['pending', 'flagged', 'all']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status = 'pending' } = req.query;
    const queue = await superAdminService.getModerationQueue(status);
    res.json(queue);
  } catch (error) {
    console.error('Error getting moderation queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch moderation queue'
    });
  }
});

/**
 * @route POST /api/super-admin/moderation/bulk
 * @description Perform bulk moderation actions
 * @access Super Admin Only
 */
router.post('/moderation/bulk', [
  body('action').isIn(['approve', 'reject', 'flag', 'delete']).withMessage('Invalid action'),
  body('reviewIds').isArray({ min: 1 }).withMessage('Review IDs must be a non-empty array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { action, reviewIds } = req.body;
    const result = await superAdminService.bulkModerateReviews(action, reviewIds, req.user.uid);
    res.json({
      success: true,
      message: `${reviewIds.length} reviews ${action}d successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error performing bulk moderation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk moderation'
    });
  }
});

/**
 * @route GET /api/super-admin/performance/metrics
 * @description Get system performance metrics
 * @access Super Admin Only
 */
router.get('/performance/metrics', async (req, res) => {
  try {
    const metrics = await superAdminService.getPerformanceMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics'
    });
  }
});

/**
 * @route GET /api/super-admin/sessions/active
 * @description Get active user sessions
 * @access Super Admin Only
 */
router.get('/sessions/active', async (req, res) => {
  try {
    const sessions = await superAdminService.getActiveSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active sessions'
    });
  }
});

module.exports = router;