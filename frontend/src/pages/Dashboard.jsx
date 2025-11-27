import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import BusinessDashboard from '../components/business/BusinessDashboard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  Building2, 
  Users, 
  Star, 
  QrCode, 
  BarChart3,
  Calendar,
  Shield,
  TrendingUp,
  LogOut,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAuthenticated, isBusinessOwner, isAdmin, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    if (isAuthenticated()) {
      setLoading(false);
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <LoadingSpinner size="lg">
            <span className="text-lg font-medium text-gray-700">Loading your dashboard...</span>
          </LoadingSpinner>
        </div>
      </div>
    );
  }

  // If user is authenticated and has business owner permissions, show the full business dashboard
  if (isBusinessOwner() || isAdmin() || isSuperAdmin()) {
    return <BusinessDashboard />;
  }

  // Enhanced welcome screen for new users or users without business permissions
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Review System
                </h1>
                <p className="text-sm text-gray-500">Professional Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user?.displayName || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Welcome to Your
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Professional Dashboard
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create stunning review forms, manage customer relationships, and grow your business with our comprehensive suite of professional tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/business/create"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create Your First Business</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            
            <Link
              to="/subscription"
              className="px-8 py-4 border-2 border-purple-200 text-purple-700 font-semibold rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            >
              View Plans & Pricing
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Form Builder Feature */}
          <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Form Builder</h3>
            <p className="text-gray-600 mb-4">Create professional review forms with 7+ field types, validation rules, and live preview.</p>
            <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* QR Code Generator */}
          <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart QR Codes</h3>
            <p className="text-gray-600 mb-4">Generate customizable QR codes with analytics tracking and brand colors.</p>
            <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
              <span>Discover features</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Analytics</h3>
            <p className="text-gray-600 mb-4">Track performance with detailed insights, charts, and customer behavior analysis.</p>
            <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
              <span>View demo</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Customer Management */}
          <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Database</h3>
            <p className="text-gray-600 mb-4">Manage customer data, export contacts, and track review history seamlessly.</p>
            <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
              <span>Explore tools</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Email Marketing */}
          <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-pink-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Email Marketing</h3>
            <p className="text-gray-600 mb-4">Send targeted campaigns, promotional coupons, and announcements to customers.</p>
            <div className="flex items-center text-pink-600 font-medium group-hover:text-pink-700">
              <span>Start campaign</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Review Management */}
          <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Review Management</h3>
            <p className="text-gray-600 mb-4">Collect, organize, and respond to customer reviews with AI-powered insights.</p>
            <div className="flex items-center text-yellow-600 font-medium group-hover:text-yellow-700">
              <span>Manage reviews</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of businesses using our platform to enhance customer relationships and grow their reputation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <div className="text-sm text-gray-600">Reviews Collected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <div className="text-sm text-gray-600">Active Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                99.9%
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                4.8★
              </div>
              <div className="text-sm text-gray-600">Customer Rating</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white shadow-2xl">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Start collecting reviews, managing customers, and growing your reputation today with our professional tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/business/create"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/subscription"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-200"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard