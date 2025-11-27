import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import businessAPI from '../../services/businessAPI';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  Building2, 
  Users, 
  Star, 
  QrCode, 
  TrendingUp,
  Calendar,
  Eye,
  EyeOff,
  Activity,
  BarChart3
} from 'lucide-react';

const DashboardStats = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalCustomers: 0,
    totalReviews: 0,
    totalQRCodes: 0,
    publishedBusinesses: 0,
    avgRating: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await businessAPI.getBusinesses();
      
      if (response.success) {
        const businesses = response.data;
        
        // Calculate stats from businesses data
        const totalBusinesses = businesses.length;
        const publishedBusinesses = businesses.filter(b => b.isPublished).length;
        const totalCustomers = businesses.reduce((sum, b) => sum + (b._count?.customers || 0), 0);
        const totalReviews = businesses.reduce((sum, b) => sum + (b._count?.reviews || 0), 0);
        const totalQRCodes = businesses.reduce((sum, b) => sum + (b._count?.qrCodes || 0), 0);
        
        setStats({
          totalBusinesses,
          totalCustomers,
          totalReviews,
          totalQRCodes,
          publishedBusinesses,
          avgRating: totalReviews > 0 ? 4.2 : 0, // Mock average rating
          monthlyGrowth: 12.5 // Mock growth percentage
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Businesses',
      value: stats.totalBusinesses,
      icon: Building2,
      color: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      icon: Star,
      color: 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'QR Codes Generated',
      value: stats.totalQRCodes,
      icon: QrCode,
      color: 'bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600',
      change: '+5%',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 p-4 sm:p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2 sm:space-y-3 flex-1">
                <div className="h-3 sm:h-4 bg-gray-200 rounded-lg w-20 sm:w-24"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded-lg w-12 sm:w-16"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded-lg w-16 sm:w-20"></div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-xl sm:rounded-2xl flex-shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 mb-10">
      {/* Enhanced Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="group bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-purple-50/30 pointer-events-none"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 flex-shrink-0" />
                    <span className={`text-xs sm:text-sm font-medium truncate ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} this month
                    </span>
                  </div>
                </div>
                <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${stat.color} shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0 ml-3`}>
                  <stat.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Engagement Analytics */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">QR Code Engagement</h3>
            <p className="text-sm sm:text-base text-gray-600">Customer engagement through QR codes</p>
          </div>
          <div className="flex items-center space-x-2 text-gray-500 flex-shrink-0 ml-4">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Active QR Codes Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">Active QR Codes</h4>
                  <p className="text-sm text-purple-600 font-medium">Generated & Ready</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-purple-600">{stats.totalQRCodes}</div>
                <div className="text-sm text-purple-500 font-semibold">+5% this month</div>
              </div>
            </div>
            <div className="relative">
              <div className="h-4 bg-purple-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((stats.totalQRCodes / Math.max(stats.totalBusinesses, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* QR Code Scans Card */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">Total Scans</h4>
                  <p className="text-sm text-orange-600 font-medium">Customer Engagement</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-orange-600">{(stats.totalQRCodes * 15).toLocaleString()}</div>
                <div className="text-sm text-orange-500 font-semibold">+18% this month</div>
              </div>
            </div>
            <div className="relative">
              <div className="h-4 bg-orange-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `75%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating and Growth Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Average Rating Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Average Rating</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Customer satisfaction score</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-6xl font-black text-gray-900 mb-3 sm:mb-4">{stats.avgRating.toFixed(1)}</div>
            <div className="flex justify-center space-x-1 mb-3 sm:mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-200 ${
                    star <= Math.floor(stats.avgRating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="bg-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-sm sm:text-base text-gray-700 font-medium">Based on <span className="font-bold text-yellow-600">{stats.totalReviews}</span> reviews</p>
            </div>
          </div>
        </div>

        {/* Growth Rate Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Growth Rate</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Monthly review growth</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-6xl font-black text-gray-900 mb-3 sm:mb-4">+{stats.monthlyGrowth}%</div>
            <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm sm:text-base text-green-700 font-semibold">Trending Up</span>
              </div>
              <p className="text-xs sm:text-base text-gray-600 mt-2">Excellent monthly performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;