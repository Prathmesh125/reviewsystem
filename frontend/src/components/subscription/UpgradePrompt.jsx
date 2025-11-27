import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Zap, ArrowRight } from 'lucide-react';

const UpgradePrompt = ({ 
  isOpen, 
  onClose, 
  currentPlan = 'Free', 
  feature = 'AI Enhancement',
  usageInfo = null
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getUpgradePlan = () => {
    return currentPlan === 'Free' ? 'Pro' : 'Ultimate';
  };

  const getUpgradePrice = () => {
    const prices = { Pro: '$29.99', Ultimate: '$99.99' };
    return prices[getUpgradePlan()];
  };

  const getUpgradeFeatures = () => {
    if (currentPlan === 'Free') {
      return [
        '100 AI-enhanced reviews per month',
        'Advanced analytics dashboard',
        'Priority customer support',
        'Custom review templates',
        'Export capabilities'
      ];
    } else {
      return [
        'Unlimited AI-enhanced reviews',
        'Premium analytics with insights',
        '24/7 priority support',
        'White-label options',
        'Advanced integrations',
        'Custom branding'
      ];
    }
  };

  const handleUpgrade = () => {
    navigate('/subscription');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center mb-2">
            <Crown className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">Upgrade Required</h2>
          </div>
          
          <p className="text-blue-100">
            {usageInfo ? 
              `You've used ${usageInfo.used}/${usageInfo.limit} ${feature} this month.` :
              `You've reached your ${feature} limit for this month.`
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Unlock More Power
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upgrade to {getUpgradePlan()}
            </h3>
            
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {getUpgradePrice()}<span className="text-lg font-normal text-gray-500">/month</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {getUpgradeFeatures().map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
            >
              Upgrade Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 py-2 px-4 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                30-day guarantee
              </span>
              <span>•</span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </span>
              <span>•</span>
              <span>Secure billing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;