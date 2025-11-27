const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const subscriptionService = require('../services/subscriptionService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * @route GET /api/subscription/plans
 * @description Get all available subscription plans
 * @access Public
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = subscriptionService.getAllPlans();
    
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription plans',
      error: error.message
    });
  }
});

/**
 * @route GET /api/subscription/current
 * @description Get current subscription for authenticated user
 * @access Private
 */
router.get('/current', verifyFirebaseToken, async (req, res) => {
  try {
    // Get user's business
    const business = await prisma.business.findFirst({
      where: {
        user: { email: req.user.email }
      },
      include: { subscription: true }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Get subscription analytics
    const analytics = await subscriptionService.getSubscriptionAnalytics(business.id);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting current subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription information',
      error: error.message
    });
  }
});

/**
 * @route POST /api/subscription/upgrade
 * @description Upgrade subscription plan
 * @access Private
 */
router.post('/upgrade',
  verifyFirebaseToken,
  [
    body('planId')
      .notEmpty()
      .withMessage('Plan ID is required')
      .isIn(['FREE', 'PRO', 'ULTIMATE'])
      .withMessage('Invalid plan ID'),
    body('paymentIntentId')
      .optional()
      .isString()
      .withMessage('Payment intent ID must be a string')
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

      const { planId, paymentIntentId } = req.body;

      // Get user's business
      const business = await prisma.business.findFirst({
        where: {
          user: { email: req.user.email }
        }
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Business not found'
        });
      }

      // Create or update subscription
      const subscription = await subscriptionService.createSubscription(
        business.id,
        planId,
        paymentIntentId
      );

      res.json({
        success: true,
        message: `Successfully upgraded to ${planId} plan`,
        subscription
      });
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upgrade subscription',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/subscription/cancel
 * @description Cancel current subscription
 * @access Private
 */
router.post('/cancel', verifyFirebaseToken, async (req, res) => {
  try {
    // Get user's business
    const business = await prisma.business.findFirst({
      where: {
        user: { email: req.user.email }
      }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Cancel subscription
    const subscription = await subscriptionService.cancelSubscription(business.id);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

/**
 * @route GET /api/subscription/usage/:feature
 * @description Check usage limit for a specific feature
 * @access Private
 */
router.get('/usage/:feature', verifyFirebaseToken, async (req, res) => {
  try {
    const { feature } = req.params;

    // Get user's business
    const business = await prisma.business.findFirst({
      where: {
        user: { email: req.user.email }
      }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check usage limit
    const usageCheck = await subscriptionService.checkUsageLimit(business.id, feature);

    res.json({
      success: true,
      feature,
      usage: usageCheck
    });
  } catch (error) {
    console.error('Error checking usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check usage limit',
      error: error.message
    });
  }
});

/**
 * @route GET /api/subscription/features
 * @description Get available features for current subscription
 * @access Private
 */
router.get('/features', verifyFirebaseToken, async (req, res) => {
  try {
    // Get user's business
    const business = await prisma.business.findFirst({
      where: {
        user: { email: req.user.email }
      },
      include: { subscription: true }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Get current plan features
    const planId = business.subscription?.planId || 'FREE';
    const plan = subscriptionService.getPlan(planId);

    res.json({
      success: true,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        features: plan.features
      }
    });
  } catch (error) {
    console.error('Error getting features:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription features',
      error: error.message
    });
  }
});

/**
 * @route GET /api/subscription/usage
 * @description Get usage statistics for current subscription
 * @access Private
 */
router.get('/usage', verifyFirebaseToken, async (req, res) => {
  try {
    // Get user's business
    const business = await prisma.business.findFirst({
      where: {
        user: { email: req.user.email }
      },
      include: { subscription: true }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Get current plan
    const planId = business.subscription?.planId || 'FREE';
    const plan = subscriptionService.getPlan(planId);

    // Calculate usage statistics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get review count for this month
    const reviewCount = await prisma.review.count({
      where: {
        businessId: business.id,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // Get AI enhancement count (assuming you have this data)
    // For now, we'll use a placeholder
    const aiEnhancementCount = 0; // You can implement actual tracking

    const usageStats = {
      reviews: {
        used: reviewCount,
        limit: plan.features.reviewsPerMonth,
        percentage: plan.features.reviewsPerMonth > 0 
          ? Math.min(100, (reviewCount / plan.features.reviewsPerMonth) * 100) 
          : 0
      },
      aiEnhancements: {
        used: aiEnhancementCount,
        limit: plan.features.aiEnhancementsPerMonth,
        percentage: plan.features.aiEnhancementsPerMonth > 0 
          ? Math.min(100, (aiEnhancementCount / plan.features.aiEnhancementsPerMonth) * 100) 
          : 0
      }
    };

    res.json({
      success: true,
      usage: usageStats,
      plan: {
        id: plan.id,
        name: plan.name
      },
      billingPeriod: {
        start: startOfMonth,
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      }
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage statistics',
      error: error.message
    });
  }
});

module.exports = router;