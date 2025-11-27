import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionPlans = ({ currentPlan = 'Free', onPlanSelect }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const navigate = useNavigate();

  const handleSelectPlan = async (plan) => {
    if (plan.id === currentPlan) return; // Already on this plan
    
    try {
      // Navigate to checkout page with plan details
      navigate(`/checkout?plan=${plan.name}&billing=${plan.billing}&price=${plan.price}`);
    } catch (err) {
      console.error('Error selecting plan:', err);
    }
  };

  const getPlanFeatures = () => {
    return [
      'Unlimited AI-enhanced reviews',
      'Advanced analytics dashboard',
      'QR code generation',
      'Custom review templates',
      'Priority support',
      'Export capabilities',
      'Custom branding',
      'Advanced integrations'
    ];
  };

  const isCurrentPlan = (planId) => {
    return planId === currentPlan;
  };

  const getPrice = () => {
    if (billingCycle === 'monthly') {
      return { amount: '₹149', period: 'per month' };
    } else {
      return { amount: '₹99', period: 'per month', note: 'Billed yearly (₹1,188/year)' };
    }
  };

  const getSavings = () => {
    if (billingCycle === 'yearly') {
      const yearlyTotal = 99 * 12; // 1188
      const monthlyTotal = 149 * 12; // 1788
      const savings = monthlyTotal - yearlyTotal;
      return `Save ₹${savings} per year`;
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600 font-medium">Get access to all premium features</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl flex border border-white/50 shadow-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/60'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/60'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-pulse font-bold">
              Save 33%
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Premium Plan */}
        <div className="relative bg-gradient-to-br from-white/90 via-blue-50/80 to-indigo-50/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gradient-to-r from-blue-400 to-indigo-500 p-8 sm:p-10 hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl">
              ✨ Premium Plan ✨
            </div>
          </div>
          
          <div className="text-center pt-4">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">Premium</h3>
            </div>
            <div className="mb-8">
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{getPrice().amount}</div>
              <div className="text-gray-600 font-semibold text-lg">{getPrice().period}</div>
              {getPrice().note && (
                <div className="text-sm text-gray-500 mt-2 font-medium">{getPrice().note}</div>
              )}
              {getSavings() && (
                <div className="inline-flex items-center mt-3 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-bold text-sm rounded-full border border-green-200 shadow-lg">
                  🎉 {getSavings()}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg mb-8">
            <ul className="space-y-4">
              {getPlanFeatures().map((feature, index) => (
                <li key={index} className="flex items-center group">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="h-4 w-4 text-white font-bold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => handleSelectPlan({ 
              id: 'Premium', 
              name: 'Premium', 
              price: billingCycle === 'monthly' ? 149 : 99,
              billing: billingCycle
            })}
            disabled={isCurrentPlan('Premium')}
            className={`group relative w-full px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl ${
              isCurrentPlan('Premium')
                ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white hover:shadow-2xl hover:scale-105 transform'
            }`}
          >
            {isCurrentPlan('Premium') ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Current Plan</span>
              </span>
            ) : (
              <>
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>Upgrade to Premium</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg mb-6">
          <p className="text-gray-700 font-semibold text-lg mb-2">
            🛡️ 30-day money-back guarantee. Cancel anytime.
          </p>
          <p className="text-gray-600 text-sm">
            Try risk-free and see the difference premium features make!
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-center space-x-2 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700">🔒 Secure payments</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700">🎆 No setup fees</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700">🚪 Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;