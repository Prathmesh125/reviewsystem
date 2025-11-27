import React, { useState, useEffect } from 'react';
import { subscriptionAPI } from '../../services/subscriptionAPI';

const UsageDashboard = () => {
  const [usageData, setUsageData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usageResponse, subscriptionResponse] = await Promise.all([
        subscriptionAPI.getUsageStats(),
        subscriptionAPI.getCurrentSubscription()
      ]);
      
      setUsageData(usageResponse.usage);
      setSubscription(subscriptionResponse.subscription);
    } catch (err) {
      setError('Failed to load usage data');
      console.error('Error fetching usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateUsagePercentage = (used, limit) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-2 text-sm text-red-700 hover:text-red-900"
        >
          Try again
        </button>
      </div>
    );
  }

  const aiUsagePercentage = calculateUsagePercentage(
    usageData?.ai_enhancement || 0,
    subscription?.aiEnhancementLimit || 0
  );

  return (
    <div className="space-y-6">
      {/* Current Plan Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Current Subscription</h3>
          {subscription?.plan && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription.plan === 'Free' 
                ? 'bg-gray-100 text-gray-800' 
                : subscription.plan === 'Pro'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {subscription.plan}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {subscription?.plan || 'Free'}
            </div>
            <div className="text-sm text-gray-500">Current Plan</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ${subscription?.amount || '0'}
            </div>
            <div className="text-sm text-gray-500">Monthly Cost</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {subscription?.nextBilling ? formatDate(subscription.nextBilling) : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Next Billing</div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Usage Statistics</h3>
        
        {/* AI Enhancement Usage */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">AI-Enhanced Reviews</span>
            <span className="text-sm text-gray-500">
              {usageData?.ai_enhancement || 0} / {
                subscription?.aiEnhancementLimit === -1 
                  ? 'Unlimited' 
                  : subscription?.aiEnhancementLimit || 0
              }
            </span>
          </div>
          
          {subscription?.aiEnhancementLimit !== -1 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(aiUsagePercentage)}`}
                style={{ width: `${aiUsagePercentage}%` }}
              ></div>
            </div>
          )}
          
          {subscription?.aiEnhancementLimit === -1 && (
            <div className="text-sm text-green-600 font-medium">✓ Unlimited usage</div>
          )}
        </div>

        {/* Usage Alerts */}
        {aiUsagePercentage >= 90 && subscription?.plan === 'Free' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-red-800 font-medium">Usage Limit Almost Reached</p>
                <p className="text-red-600 text-sm">You've used {Math.round(aiUsagePercentage)}% of your monthly AI enhancement quota. Consider upgrading to Pro for more usage.</p>
              </div>
            </div>
          </div>
        )}

        {aiUsagePercentage >= 75 && aiUsagePercentage < 90 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-yellow-800 font-medium">High Usage Warning</p>
                <p className="text-yellow-600 text-sm">You've used {Math.round(aiUsagePercentage)}% of your monthly quota. Consider upgrading for more features.</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Usage */}
        {usageData?.recentActivity && usageData.recentActivity.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-2">
              {usageData.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">{activity.description}</span>
                  <span className="text-sm text-gray-500">{formatDate(activity.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Billing Information */}
      {subscription?.plan !== 'Free' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Billing Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Current Period</label>
              <p className="text-gray-900">
                {formatDate(subscription.startDate)} - {formatDate(subscription.nextBilling)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Payment Method</label>
              <p className="text-gray-900">
                {subscription.paymentMethod || 'Credit Card •••• 1234'}
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Update Payment Method
            </button>
            <span className="mx-2 text-gray-300">•</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Download Invoices
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageDashboard;