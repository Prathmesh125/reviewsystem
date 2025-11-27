import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import analyticsAPI from '../../services/analyticsAPI';
import advancedAnalyticsAPI from '../../services/advancedAnalyticsAPI';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  QrCode,
  Eye,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Lightbulb,
  Award,
  Plus,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

const AnalyticsDashboard = ({ businessId, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7days');
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalReviews: 0,
      averageRating: 0,
      totalScans: 0,
      totalCustomers: 0,
      trends: {
        reviewsChange: 0,
        ratingChange: 0,
        scansChange: 0,
        customersChange: 0
      }
    },
    charts: {
      reviewsTrend: [],
      ratingDistribution: [],
      scanActivity: [],
      customerGrowth: []
    }
  });

  // Advanced Analytics State
  const [activeTab, setActiveTab] = useState('overview');
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'REVIEWS',
    targetValue: '',
    targetDate: '',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    console.log('AnalyticsDashboard useEffect - businessId:', businessId, 'user:', user);
    if (businessId && user) {
      fetchAnalytics();
      fetchAdvancedAnalytics();
    }
  }, [businessId, dateRange, user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching analytics for business:', businessId, 'range:', dateRange);
      console.log('Current user:', user?.uid, user?.email);
      const data = await analyticsAPI.getBusinessAnalytics(businessId, dateRange);
      console.log('Analytics data received:', data);
      console.log('Overview data:', data?.overview);
      console.log('Total Reviews:', data?.overview?.totalReviews);
      console.log('Average Rating:', data?.overview?.averageRating);
      console.log('Total Scans:', data?.overview?.totalScans);
      console.log('Total Customers:', data?.overview?.totalCustomers);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      console.error('Error details:', error.response?.data || error.message || error);
      
      setError(error.message || 'Failed to load analytics data');
      
      // Better error handling with specific messages
      if (error.response?.status === 403) {
        toast.error('Access denied: You do not own this business. Please create your own business to view analytics.');
      } else if (error.response?.status === 404) {
        toast.error('Business not found. Please refresh the page and try again.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to load analytics data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const blob = await analyticsAPI.exportBusinessAnalytics(businessId, dateRange);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `analytics-${businessId}-${dateRange}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export analytics data');
    }
  };

  // Advanced Analytics Functions
  const fetchAdvancedAnalytics = async () => {
    try {
      const [goalsData, insightsData, benchmarksData] = await Promise.all([
        advancedAnalyticsAPI.getBusinessGoals(businessId),
        advancedAnalyticsAPI.getBusinessInsights(businessId),
        advancedAnalyticsAPI.getIndustryBenchmarks(businessId)
      ]);
      
      setGoals(goalsData.data || []);
      setInsights(insightsData.data || []);
      setBenchmarks(benchmarksData.data || null);
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
      // Don't show error toast for advanced features as they're optional
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const goalData = {
        ...newGoal,
        businessId,
        targetValue: parseInt(newGoal.targetValue),
        targetDate: new Date(newGoal.targetDate).toISOString()
      };
      
      await advancedAnalyticsAPI.createGoal(goalData);
      toast.success('Goal created successfully!');
      setShowGoalModal(false);
      setNewGoal({
        title: '',
        description: '',
        type: 'REVIEWS',
        targetValue: '',
        targetDate: '',
        priority: 'MEDIUM'
      });
      fetchAdvancedAnalytics();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    }
  };

  const generateInsights = async () => {
    try {
      await advancedAnalyticsAPI.generateInsights(businessId);
      toast.success('New insights generated!');
      fetchAdvancedAnalytics();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const isPositive = change >= 0;
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };

    return (
      <div className={`p-4 sm:p-6 rounded-xl border ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center mt-1 sm:mt-2">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1" />
              )}
              <span className={`text-xs sm:text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">vs last period</span>
            </div>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-white ml-2 flex-shrink-0">
            <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-8 border w-11/12 max-w-6xl shadow-lg rounded-xl bg-white">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-8 border w-11/12 max-w-6xl shadow-lg rounded-xl bg-white">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchAnalytics();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">📊 Business Analytics</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowGoalModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Target className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Set Goal</span>
              </button>
              <button
                onClick={fetchAnalytics}
                className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={exportData}
                className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-bold px-2"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Reviews"
              value={analyticsData?.overview?.totalReviews || 0}
              change={analyticsData?.overview?.trends?.reviewsChange || 0}
              icon={Star}
              color="blue"
            />
            <StatCard
              title="Average Rating"
              value={(analyticsData?.overview?.averageRating || 0).toFixed(1)}
              change={analyticsData?.overview?.trends?.ratingChange || 0}
              icon={Star}
              color="green"
            />
            <StatCard
              title="QR Code Scans"
              value={analyticsData?.overview?.totalScans || 0}
              change={analyticsData?.overview?.trends?.scansChange || 0}
              icon={QrCode}
              color="purple"
            />
            <StatCard
              title="Total Customers"
              value={analyticsData?.overview?.totalCustomers || 0}
              change={analyticsData?.overview?.trends?.customersChange || 0}
              icon={Users}
              color="orange"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
            {/* Reviews Trend Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Reviews Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analyticsData?.charts?.reviewsTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="reviews" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="rating" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData?.charts?.ratingDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* QR Scan Activity */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">QR Code Scan Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analyticsData?.charts?.scanActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="scans" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Growth */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Customer Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analyticsData?.charts?.customerGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="customers" stroke="#ff7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
        </div>

          {/* Insights Section */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">📊 Key Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {insights.map((insight, index) => (
                <div key={index} className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{insight.title}</h4>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">{insight.description}</p>
                      {insight.impact && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Impact: {insight.impact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Section */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">🎯 Business Goals</h3>
              <button
                onClick={() => setShowGoalModal(true)}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Goal
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span className="font-semibold">{goal.currentValue} / {goal.targetValue}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                      <span>{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {goals.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No goals set yet. Click "Add Goal" to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Goal Setting Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Set New Goal</h3>
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleCreateGoal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                    <input
                      type="text"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Increase Monthly Reviews"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Describe your goal..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                    <select
                      value={newGoal.type}
                      onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select goal type</option>
                      <option value="REVIEWS">Total Reviews</option>
                      <option value="RATING">Average Rating</option>
                      <option value="QR_SCANS">QR Code Scans</option>
                      <option value="CUSTOMERS">Form Responses</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                    <input
                      type="number"
                      value={newGoal.targetValue}
                      onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 100"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowGoalModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Goal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;