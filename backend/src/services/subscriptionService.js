const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SubscriptionService {
  constructor() {
    this.plans = {
      FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        priceINR: 0,
        features: {
          aiEnhancementsPerMonth: 5,
          reviewsPerMonth: 10,
          customFormFields: 3,
          basicAnalytics: true,
          emailSupport: false,
          customBranding: false,
          advancedAnalytics: false,
          prioritySupport: false,
          apiAccess: false,
          whiteLabel: false,
          multipleLocations: 1
        }
      },
      PREMIUM: {
        id: 'premium',
        name: 'Premium',
        price: 49.99,
        priceINR: 4149, // ₹4,149 (approx $49.99 * 83)
        monthlyPriceINR: 4149,
        yearlyPriceINR: 41490, // 10 months price for yearly (discount)
        features: {
          aiEnhancementsPerMonth: -1, // Unlimited
          reviewsPerMonth: -1, // Unlimited
          customFormFields: -1, // Unlimited
          basicAnalytics: true,
          emailSupport: true,
          customBranding: true,
          advancedAnalytics: true,
          prioritySupport: true,
          apiAccess: true,
          whiteLabel: true,
          multipleLocations: -1 // Unlimited
        }
      }
    };
  }

  /**
   * Get subscription plan details
   */
  getPlan(planId) {
    const upperPlanId = planId.toUpperCase();
    return this.plans[upperPlanId] || this.plans.FREE;
  }

  /**
   * Get plan pricing based on billing cycle
   */
  getPlanPricing(planId, billingCycle = 'monthly') {
    const plan = this.getPlan(planId);
    if (planId.toUpperCase() === 'FREE') {
      return { price: 0, priceINR: 0, billingCycle: 'free' };
    }
    
    if (billingCycle === 'yearly') {
      return {
        price: plan.price * 10, // 10 months price (2 months free)
        priceINR: plan.yearlyPriceINR,
        billingCycle: 'yearly'
      };
    }
    
    return {
      price: plan.price,
      priceINR: plan.monthlyPriceINR,
      billingCycle: 'monthly'
    };
  }

  /**
   * Get all available plans
   */
  getAllPlans() {
    return Object.values(this.plans);
  }

  /**
   * Check if user can perform an action based on their subscription
   */
  async checkUsageLimit(businessId, feature) {
    try {
      // Get business subscription
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { subscription: true }
      });

      if (!business || !business.subscription) {
        // No subscription, use free plan limits
        return this.checkFeatureLimit('FREE', feature, businessId);
      }

      const plan = this.getPlan(business.subscription.planId);
      return this.checkFeatureLimit(business.subscription.planId, feature, businessId);
      
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return { allowed: false, message: 'Unable to verify subscription' };
    }
  }

  /**
   * Check specific feature limit
   */
  async checkFeatureLimit(planId, feature, businessId) {
    const plan = this.getPlan(planId);
    const limit = plan.features[feature];

    // If unlimited (-1), allow
    if (limit === -1) {
      return { allowed: true, limit: 'unlimited', used: 0 };
    }

    // If feature is boolean, return the boolean value
    if (typeof limit === 'boolean') {
      return { allowed: limit, limit, used: 0 };
    }

    // For numeric limits, check current usage
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    let used = 0;

    try {
      switch (feature) {
        case 'aiEnhancementsPerMonth':
          used = await prisma.aIReviewGeneration.count({
            where: {
              review: { businessId },
              createdAt: { gte: new Date(currentMonth + '-01') }
            }
          });
          break;

        case 'reviewsPerMonth':
          used = await prisma.review.count({
            where: {
              businessId,
              createdAt: { gte: new Date(currentMonth + '-01') }
            }
          });
          break;

        default:
          // For other features, assume no current usage tracking needed
          used = 0;
      }
    } catch (error) {
      console.error('Error checking current usage:', error);
      used = 0;
    }

    return {
      allowed: used < limit,
      limit,
      used,
      remaining: Math.max(0, limit - used)
    };
  }

  /**
   * Create or update subscription
   */
  async createSubscription(businessId, planId, paymentIntentId = null) {
    try {
      const plan = this.getPlan(planId);
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { subscription: true }
      });

      if (!business) {
        throw new Error('Business not found');
      }

      const subscriptionData = {
        planId: plan.id.toUpperCase(),
        planName: plan.name,
        price: plan.price,
        status: plan.price === 0 ? 'ACTIVE' : 'PENDING', // Free plan is immediately active
        paymentIntentId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        features: JSON.stringify(plan.features)
      };

      let subscription;
      if (business.subscription) {
        // Update existing subscription
        subscription = await prisma.subscription.update({
          where: { id: business.subscription.id },
          data: subscriptionData
        });
      } else {
        // Create new subscription
        subscription = await prisma.subscription.create({
          data: {
            ...subscriptionData,
            businessId
          }
        });
      }

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(businessId) {
    try {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { subscription: true }
      });

      if (!business?.subscription) {
        throw new Error('No active subscription found');
      }

      // Update subscription to cancelled, but keep it active until end date
      const subscription = await prisma.subscription.update({
        where: { id: business.subscription.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      return subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription analytics for business owner
   */
  async getSubscriptionAnalytics(businessId) {
    try {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { subscription: true }
      });

      if (!business) {
        throw new Error('Business not found');
      }

      const currentPlan = business.subscription ? 
        this.getPlan(business.subscription.planId) : 
        this.plans.FREE;

      // Get current month usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const [aiEnhancements, reviews] = await Promise.all([
        prisma.aIReviewGeneration.count({
          where: {
            review: { businessId },
            createdAt: { gte: new Date(currentMonth + '-01') }
          }
        }),
        prisma.review.count({
          where: {
            businessId,
            createdAt: { gte: new Date(currentMonth + '-01') }
          }
        })
      ]);

      return {
        subscription: business.subscription,
        currentPlan,
        usage: {
          aiEnhancements: {
            used: aiEnhancements,
            limit: currentPlan.features.aiEnhancementsPerMonth,
            percentage: currentPlan.features.aiEnhancementsPerMonth === -1 ? 0 : 
              Math.round((aiEnhancements / currentPlan.features.aiEnhancementsPerMonth) * 100)
          },
          reviews: {
            used: reviews,
            limit: currentPlan.features.reviewsPerMonth,
            percentage: currentPlan.features.reviewsPerMonth === -1 ? 0 : 
              Math.round((reviews / currentPlan.features.reviewsPerMonth) * 100)
          }
        }
      };
    } catch (error) {
      console.error('Error getting subscription analytics:', error);
      throw error;
    }
  }

  /**
   * Check if subscription is expired and handle accordingly
   */
  async checkAndUpdateExpiredSubscriptions() {
    try {
      const now = new Date();
      
      // Find expired subscriptions
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          endDate: { lt: now },
          status: { in: ['ACTIVE', 'CANCELLED'] }
        }
      });

      // Update expired subscriptions to expired status
      for (const subscription of expiredSubscriptions) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'EXPIRED' }
        });
      }

      return expiredSubscriptions.length;
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
      return 0;
    }
  }
}

module.exports = new SubscriptionService();