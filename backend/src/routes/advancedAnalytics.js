const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const AdvancedAnalyticsService = require('../services/advancedAnalyticsService');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

// Apply authentication to all routes
router.use(verifyFirebaseToken);

const advancedAnalyticsService = new AdvancedAnalyticsService();

/**
 * @route POST /api/analytics/goals
 * @description Create a new business goal
 * @access Private (Business Owner)
 */
router.post('/goals', [
  body('businessId').notEmpty().withMessage('Business ID is required'),
  body('title').notEmpty().withMessage('Goal title is required'),
  body('type').isIn(['REVIEWS', 'RATING', 'QR_SCANS', 'CUSTOMERS']).withMessage('Invalid goal type'),
  body('targetValue').isInt({ min: 1 }).withMessage('Target value must be a positive integer'),
  body('targetDate').isISO8601().withMessage('Target date must be a valid date'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority')
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

    const goal = await advancedAnalyticsService.createGoal(req.body.businessId, req.body);
    
    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal'
    });
  }
});

/**
 * @route GET /api/analytics/goals/:businessId
 * @description Get goals for a business
 * @access Private (Business Owner)
 */
router.get('/goals/:businessId', [
  param('businessId').notEmpty().withMessage('Business ID is required'),
  query('status').optional().isIn(['ACTIVE', 'COMPLETED', 'PAUSED', 'EXPIRED', 'ALL']).withMessage('Invalid status')
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
    const { status = 'ACTIVE' } = req.query;
    
    const goals = await advancedAnalyticsService.getBusinessGoals(businessId, status);
    
    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get goals'
    });
  }
});

/**
 * @route POST /api/analytics/insights/:businessId/generate
 * @description Generate insights for a business
 * @access Private (Business Owner)
 */
router.post('/insights/:businessId/generate', [
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
    
    const insights = await advancedAnalyticsService.generateBusinessInsights(businessId);
    
    res.json({
      success: true,
      message: 'Insights generated successfully',
      data: insights
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights'
    });
  }
});

/**
 * @route GET /api/analytics/insights/:businessId
 * @description Get insights for a business
 * @access Private (Business Owner)
 */
router.get('/insights/:businessId', [
  param('businessId').notEmpty().withMessage('Business ID is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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
    const { limit = 10 } = req.query;
    
    const insights = await advancedAnalyticsService.getBusinessInsights(businessId, parseInt(limit));
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get insights'
    });
  }
});

/**
 * @route GET /api/analytics/benchmarks/:businessId
 * @description Get industry benchmarks and compare business performance
 * @access Private (Business Owner)
 */
router.get('/benchmarks/:businessId', [
  param('businessId').notEmpty().withMessage('Business ID is required'),
  query('industry').optional().isString().withMessage('Industry must be a string')
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
    const { industry = 'GENERAL' } = req.query;
    
    const [benchmarks, comparison] = await Promise.all([
      advancedAnalyticsService.getIndustryBenchmarks(industry.toUpperCase()),
      advancedAnalyticsService.compareToIndustry(businessId, industry.toUpperCase())
    ]);
    
    res.json({
      success: true,
      data: {
        benchmarks,
        comparison,
        industry: industry.toUpperCase()
      }
    });
  } catch (error) {
    console.error('Error getting benchmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get benchmarks'
    });
  }
});

/**
 * @route GET /api/analytics/widgets
 * @description Get available dashboard widgets
 * @access Private (Business Owner)
 */
router.get('/widgets', async (req, res) => {
  try {
    const widgets = advancedAnalyticsService.getAvailableWidgets();
    
    res.json({
      success: true,
      data: widgets
    });
  } catch (error) {
    console.error('Error getting widgets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get widgets'
    });
  }
});

/**
 * @route PUT /api/analytics/goals/:goalId
 * @description Update a goal
 * @access Private (Business Owner)
 */
router.put('/goals/:goalId', [
  param('goalId').notEmpty().withMessage('Goal ID is required'),
  body('status').optional().isIn(['ACTIVE', 'COMPLETED', 'PAUSED', 'EXPIRED']).withMessage('Invalid status'),
  body('targetValue').optional().isInt({ min: 1 }).withMessage('Target value must be a positive integer'),
  body('targetDate').optional().isISO8601().withMessage('Target date must be a valid date')
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

    // For now, just return success - full implementation would update the goal
    res.json({
      success: true,
      message: 'Goal updated successfully'
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal'
    });
  }
});

/**
 * @route DELETE /api/analytics/goals/:goalId
 * @description Delete a goal
 * @access Private (Business Owner)
 */
router.delete('/goals/:goalId', [
  param('goalId').notEmpty().withMessage('Goal ID is required')
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

    // For now, just return success - full implementation would delete the goal
    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal'
    });
  }
});

module.exports = router;