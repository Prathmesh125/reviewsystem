import { subscriptionAPI } from '../services/subscriptionAPI';
import { toast } from 'react-hot-toast';

// Cache for subscription data to avoid excessive API calls
let subscriptionCache = null;
let usageCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if user has reached their subscription limits
 * @param {string} featureType - Type of feature to check ('ai_enhancement', etc.)
 * @returns {Promise<boolean>} - true if usage is allowed, false if limit reached
 */
export const checkUsageLimit = async (featureType = 'ai_enhancement') => {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION && subscriptionCache && usageCache) {
      return validateUsage(featureType, subscriptionCache, usageCache);
    }

    // Fetch fresh data
    const [subscriptionResponse, usageResponse] = await Promise.all([
      subscriptionAPI.getCurrentSubscription(),
      subscriptionAPI.getUsageStats()
    ]);

    subscriptionCache = subscriptionResponse.subscription;
    usageCache = usageResponse.usage;
    cacheTimestamp = now;

    return validateUsage(featureType, subscriptionCache, usageCache);
  } catch (error) {
    console.error('Error checking usage limit:', error);
    // Allow usage if we can't check (fail open for better UX)
    return true;
  }
};

/**
 * Validate usage against subscription limits
 */
const validateUsage = (featureType, subscription, usage) => {
  const plan = subscription?.plan || 'Free';
  const currentUsage = usage?.[featureType] || 0;

  // Get limits based on plan
  const limits = {
    Free: { ai_enhancement: 5 },
    Pro: { ai_enhancement: 100 },
    Ultimate: { ai_enhancement: -1 } // -1 = unlimited
  };

  const limit = limits[plan]?.[featureType];
  
  if (limit === undefined) {
    console.warn(`No limit defined for ${featureType} on ${plan} plan`);
    return true;
  }

  // Unlimited usage
  if (limit === -1) {
    return true;
  }

  // Check if limit is reached
  const isLimitReached = currentUsage >= limit;
  
  if (isLimitReached) {
    showLimitReachedNotification(featureType, plan, currentUsage, limit);
    return false;
  }

  // Show warning when approaching limit
  const warningThreshold = 0.8; // 80%
  if (currentUsage >= limit * warningThreshold) {
    showUsageWarning(featureType, plan, currentUsage, limit);
  }

  return true;
};

/**
 * Show notification when usage limit is reached
 */
const showLimitReachedNotification = (featureType, plan, currentUsage, limit) => {
  const featureName = getFeatureName(featureType);
  
  toast.error(
    <div className="text-sm">
      <p className="font-medium">Usage Limit Reached</p>
      <p>You've used all {limit} {featureName} for this month on your {plan} plan.</p>
      <button 
        onClick={() => window.open('/subscription', '_blank')}
        className="mt-2 text-blue-600 underline hover:text-blue-800"
      >
        Upgrade Plan
      </button>
    </div>,
    {
      duration: 8000,
      position: 'top-center'
    }
  );
};

/**
 * Show warning when approaching usage limit
 */
const showUsageWarning = (featureType, plan, currentUsage, limit) => {
  const featureName = getFeatureName(featureType);
  const remaining = limit - currentUsage;
  
  toast.warning(
    <div className="text-sm">
      <p className="font-medium">Approaching Usage Limit</p>
      <p>You have {remaining} {featureName} remaining this month.</p>
    </div>,
    {
      duration: 5000
    }
  );
};

/**
 * Get human-readable feature name
 */
const getFeatureName = (featureType) => {
  const names = {
    ai_enhancement: 'AI enhancements'
  };
  return names[featureType] || featureType;
};

/**
 * Clear the usage cache (call this after successful operations that consume usage)
 */
export const clearUsageCache = () => {
  subscriptionCache = null;
  usageCache = null;
  cacheTimestamp = null;
};

/**
 * Get current subscription and usage info
 */
export const getSubscriptionInfo = () => {
  return {
    subscription: subscriptionCache,
    usage: usageCache,
    isCached: cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION
  };
};

/**
 * Show upgrade prompt for specific feature
 */
export const showUpgradePrompt = (featureType, currentPlan = 'Free') => {
  const featureName = getFeatureName(featureType);
  const upgradePlan = currentPlan === 'Free' ? 'Pro' : 'Ultimate';
  
  toast.custom(
    <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-4 max-w-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            ⭐
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">Upgrade to {upgradePlan}</p>
          <p className="text-sm text-gray-600">Get more {featureName} and unlock premium features.</p>
          <div className="mt-2 flex space-x-2">
            <button 
              onClick={() => {
                window.open('/subscription', '_blank');
                toast.dismiss();
              }}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              View Plans
            </button>
            <button 
              onClick={() => toast.dismiss()}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>,
    {
      duration: 10000,
      position: 'bottom-right'
    }
  );
};