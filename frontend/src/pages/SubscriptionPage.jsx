import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionAPI } from '../services/subscriptionAPI';
import SubscriptionPlans from '../components/subscription/SubscriptionPlans';

const SubscriptionPage = () => {
  const [currentTab, setCurrentTab] = useState('plans');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await subscriptionAPI.getCurrentSubscription();
      setSubscription(response.subscription);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan) => {
    try {
      if (plan.id === 'Free') {
        // Handle downgrade to free
        await subscriptionAPI.cancelSubscription();
        setSubscription({ plan: 'Free', amount: 0 });
        alert('Successfully downgraded to Free plan');
      } else {
        // For paid plans, we would integrate with Stripe
        // For now, show a placeholder
        alert(`Redirecting to checkout for ${plan.name} plan ($${plan.price}/month)`);
        
        // Simulate subscription creation
        const response = await subscriptionAPI.subscribe(plan.id);
        if (response.success) {
          setSubscription(response.subscription);
          alert(`Successfully subscribed to ${plan.name} plan!`);
        }
      }
    } catch (err) {
      console.error('Error updating subscription:', err);
      alert('Failed to update subscription. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      try {
        await subscriptionAPI.cancelSubscription();
        setSubscription(prev => ({ ...prev, status: 'cancelled' }));
        alert('Subscription cancelled successfully. You will retain access until your current billing period ends.');
      } catch (err) {
        console.error('Error cancelling subscription:', err);
        alert('Failed to cancel subscription. Please try again.');
      }
    }
  };

  const tabs = [
    { id: 'plans', name: 'Subscription Plans', icon: 'credit-card' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 shadow-lg"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Glassmorphism Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center space-x-3 px-4 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Back to Dashboard</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">Subscription Management</h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Manage your subscription plans and billing</p>
            </div>
            
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
            <nav className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    currentTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Current Plan Summary */}
        {subscription && (
          <div className="mb-8 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/50 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Current Plan: {subscription.plan || 'Free'}
                  </h3>
                </div>
                <p className="text-gray-600 font-medium">
                  {subscription.plan === 'Free' 
                    ? 'Enjoy basic features at no cost'
                    : `₹${subscription.amount}/month - ${subscription.status || 'Active'}`
                  }
                </p>
              </div>
              
              {subscription.plan !== 'Free' && subscription.status !== 'cancelled' && (
                <button
                  onClick={handleCancelSubscription}
                  className="px-6 py-3 bg-red-50/80 hover:bg-red-100/80 text-red-600 hover:text-red-700 border border-red-200/50 rounded-2xl text-sm font-semibold transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 mb-8">
          {currentTab === 'plans' && (
            <div className="p-6 sm:p-8">
              <SubscriptionPlans 
                currentPlan={subscription?.plan || 'Free'}
                onPlanSelect={handlePlanSelect}
              />
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/50 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">?</span>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">FAQ</h4>
              <p className="text-sm text-gray-600">Common questions about subscriptions</p>
            </div>
            
            <div className="group text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Contact Support</h4>
              <p className="text-sm text-gray-600">Get help from our team</p>
            </div>
            
            <div className="group text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">📖</span>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Documentation</h4>
              <p className="text-sm text-gray-600">Learn how to make the most of your plan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;