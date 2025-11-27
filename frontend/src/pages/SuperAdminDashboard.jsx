import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Super Admin Dashboard - Fixed API calls and database issues
import { 
  Users, 
  Building2, 
  Star, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Shield, 
  Eye,
  UserCheck,
  UserX,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  RefreshCw,
  X,
  Home,
  Activity,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/FirebaseAuthContext';
import superAdminAPI from '../services/superAdminAPI';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const { user, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [platformAnalytics, setPlatformAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Navigation state for drill-down
  const [navigationStack, setNavigationStack] = useState([]);
  const [currentView, setCurrentView] = useState('users'); // 'users', 'user-businesses', 'business-details'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [userBusinesses, setUserBusinesses] = useState([]);
  const [businessCustomers, setBusinessCustomers] = useState([]);
  const [businessReviews, setBusinessReviews] = useState([]);
  
  // Advanced Super Admin Features
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [contentModerationQueue, setContentModerationQueue] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  
  // Pagination and filters
  const [userPage, setUserPage] = useState(1);
  const [businessPage, setBusinessPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [analyticsRange, setAnalyticsRange] = useState('30days');

  useEffect(() => {
    if (!isSuperAdmin()) {
      toast.error('Super admin access required');
      return;
    }
    
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.getDashboardStats();
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1, search = '') => {
    try {
      const response = await superAdminAPI.getUsers(page, 20, search);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchBusinesses = async (page = 1, search = '') => {
    try {
      const response = await superAdminAPI.getBusinesses(page, 20, search);
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to load businesses');
    }
  };

  const fetchReviews = async (page = 1, status = 'all') => {
    try {
      const response = await superAdminAPI.getReviews(page, 20, status);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    }
  };

  const fetchPlatformAnalytics = async (range = '30days') => {
    try {
      const response = await superAdminAPI.getPlatformAnalytics(range);
      setPlatformAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      toast.error('Failed to load platform analytics');
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await superAdminAPI.getSystemHealth();
      setSystemHealth(response.data);
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast.error('Failed to load system health');
    }
  };

  const fetchAuditLogs = async (page = 1, action = '', userId = '') => {
    try {
      const response = await superAdminAPI.getAuditLogs(page, 20, action, userId);
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await superAdminAPI.toggleUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'suspended'} successfully`);
      fetchUsers(userPage, searchTerm);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteBusiness = async (businessId, businessName) => {
    if (!window.confirm(`Are you sure you want to delete "${businessName}"? This action will permanently delete the business and all its related data (reviews, customers, QR codes, etc.), which cannot be undone.`)) {
      return;
    }

    try {
      await superAdminAPI.deleteBusiness(businessId);
      toast.success('Business deleted successfully');
      fetchBusinesses(businessPage, searchTerm);
    } catch (error) {
      console.error('Error deleting business:', error);
      const errorMessage = error.message || error.error || 'Failed to delete business';
      toast.error(errorMessage);
    }
  };

  const handleModerateReview = async (reviewId, status) => {
    try {
      await superAdminAPI.moderateReview(reviewId, status);
      toast.success(`Review ${status.toLowerCase()} successfully`);
      fetchReviews(reviewPage, reviewFilter);
    } catch (error) {
      console.error('Error moderating review:', error);
      toast.error('Failed to moderate review');
    }
  };

  const handleUpdateBusinessStatus = async (businessId, isApproved, businessName) => {
    if (!window.confirm(`Are you sure you want to ${isApproved ? 'approve' : 'suspend'} "${businessName}"?`)) {
      return;
    }

    try {
      await superAdminAPI.updateBusinessStatus(businessId, isApproved);
      toast.success(`Business ${isApproved ? 'approved' : 'suspended'} successfully`);
      fetchBusinesses(businessPage, searchTerm);
    } catch (error) {
      console.error('Error updating business status:', error);
      toast.error('Failed to update business status');
    }
  };

  const handleResetPassword = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to reset the password for ${userEmail}?`)) {
      return;
    }

    try {
      const response = await superAdminAPI.resetUserPassword(userId);
      toast.success('Password reset initiated successfully');
      // In a real app, you wouldn't show the temp password
      console.log('Temp password:', response.data.tempPassword);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  // Navigation functions for drill-down
  const navigateToUserBusinesses = async (user) => {
    try {
      setSelectedUser(user);
      const response = await superAdminAPI.getUserBusinesses(user.id);
      setUserBusinesses(response.data?.businesses || []);
      setNavigationStack([...navigationStack, { view: 'users', data: null }]);
      setCurrentView('user-businesses');
    } catch (error) {
      console.error('Error fetching user businesses:', error);
      toast.error('Failed to load user businesses');
    }
  };

  const navigateToBusinessDetails = async (business) => {
    try {
      setSelectedBusiness(business);
      // Fetch business customers and reviews
      const [customersResponse, reviewsResponse] = await Promise.all([
        superAdminAPI.getBusinessCustomers(business.id),
        superAdminAPI.getBusinessReviews(business.id)
      ]);
      setBusinessCustomers(customersResponse.data?.customers || []);
      setBusinessReviews(reviewsResponse.data?.reviews || []);
      setNavigationStack([...navigationStack, { view: currentView, data: { user: selectedUser, businesses: userBusinesses } }]);
      setCurrentView('business-details');
    } catch (error) {
      console.error('Error fetching business details:', error);
      toast.error('Failed to load business details');
    }
  };

  const navigateBack = () => {
    if (navigationStack.length > 0) {
      const previous = navigationStack[navigationStack.length - 1];
      setNavigationStack(navigationStack.slice(0, -1));
      setCurrentView(previous.view);
      
      if (previous.data) {
        setSelectedUser(previous.data.user || null);
        setUserBusinesses(previous.data.businesses || []);
      }
    }
  };

  const resetNavigation = () => {
    setNavigationStack([]);
    setCurrentView('users');
    setSelectedUser(null);
    setSelectedBusiness(null);
    setUserBusinesses([]);
    setBusinessCustomers([]);
    setBusinessReviews([]);
  };

  // Enhanced Users Management with Hierarchical Navigation
  const UsersManagement = () => {
    const [localUsers, setLocalUsers] = useState([]);
    const [userLoading, setUserLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
      if (currentView === 'users') {
        fetchUsers();
      }
    }, [userPage, userSearch, currentView]);

    const fetchUsers = async () => {
      setUserLoading(true);
      try {
        const response = await superAdminAPI.getUsers(
          userPage, 
          20, 
          userSearch.trim() || undefined 
        );
        setLocalUsers(response.data?.users || []);
      } catch (error) {
        toast.error('Failed to fetch users');
      } finally {
        setUserLoading(false);
      }
    };

    const handleDeleteUser = async (userId, userName) => {
      if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action will permanently delete the user and all their businesses, which cannot be undone.`)) return;
      
      try {
        await superAdminAPI.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        const errorMessage = error.message || error.error || 'Failed to delete user';
        toast.error(errorMessage);
      }
    };

    // Breadcrumb component
    const Breadcrumb = () => (
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={resetNavigation}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Users
        </button>
        {selectedUser && (
          <>
            <span className="text-gray-400">/</span>
            <button
              onClick={() => setCurrentView('user-businesses')}
              className={`font-medium ${currentView === 'business-details' ? 'text-blue-600 hover:text-blue-800' : 'text-gray-900'}`}
            >
              {selectedUser.email} Businesses
            </button>
          </>
        )}
        {selectedBusiness && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{selectedBusiness.name} Details</span>
          </>
        )}
      </div>
    );

    // Users List View
    if (currentView === 'users') {
      return (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Management</h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {userLoading ? (
              <div className="p-8 text-center">
                <LoadingSpinner />
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Businesses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {localUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.email?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => navigateToUserBusinesses(user)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              {user.email}
                            </button>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {user._count?.businesses || 0} businesses
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'BUSINESS_OWNER' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigateToUserBusinesses(user)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.isActive !== false)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              user.isActive !== false
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                          >
                            {user.isActive !== false ? (
                              <>
                                <UserX className="w-3 h-3" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {localUsers.length === 0 && !userLoading && (
            <div className="p-8 text-center text-gray-500">
              No users found
            </div>
          )}
        </div>
      );
    }

    // User Businesses View
    if (currentView === 'user-businesses') {
      return (
        <div className="space-y-6">
          <Breadcrumb />
          
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {selectedUser?.email}'s Businesses
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {userBusinesses.length} business{userBusinesses.length !== 1 ? 'es' : ''} found
                  </p>
                </div>
                <button
                  onClick={navigateBack}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Users
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {userBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigateToBusinessDetails(business)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {business.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{business.type}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      business.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {business.isPublished ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {business._count?.customers || 0}
                      </div>
                      <div className="text-xs text-gray-600">Customers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {business._count?.reviews || 0}
                      </div>
                      <div className="text-xs text-gray-600">Reviews</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {business._count?.qrCodes || 0}
                      </div>
                      <div className="text-xs text-gray-600">QR Codes</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(business.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {userBusinesses.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4" />
                <p>This user has no businesses yet</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Business Details View
    if (currentView === 'business-details') {
      return (
        <div className="space-y-6">
          <Breadcrumb />
          
          {/* Business Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedBusiness?.name}</h2>
                <p className="text-gray-600 mt-1">{selectedBusiness?.type} • {selectedBusiness?.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={navigateBack}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-lg ${
                  selectedBusiness?.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedBusiness?.isPublished ? 'Active Business' : 'Pending Approval'}
                </span>
              </div>
            </div>
            
            {/* Business Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{businessCustomers.length}</div>
                <div className="text-sm text-blue-600">Customers</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{businessReviews.length}</div>
                <div className="text-sm text-green-600">Reviews</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {businessReviews.length > 0 
                    ? (businessReviews.reduce((sum, review) => sum + review.rating, 0) / businessReviews.length).toFixed(1)
                    : '0.0'
                  }
                </div>
                <div className="text-sm text-purple-600">Avg Rating</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Date(selectedBusiness?.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-orange-600">Created</div>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Customers ({businessCustomers.length})</h3>
            </div>
            <div className="overflow-x-auto">
              {businessCustomers.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {businessCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{customer.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {customer.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {customer.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {customer._count?.reviews || 0} reviews
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p>No customers found for this business</p>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reviews ({businessReviews.length})</h3>
            </div>
            <div className="overflow-x-auto">
              {businessReviews.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {businessReviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {review.customerName || review.customer?.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {review.customerEmail || review.customer?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-medium">{review.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {review.title || 'No title'}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {review.comment || 'No comment'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            review.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            review.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {review.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                  <p>No reviews found for this business</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Businesses Management Component
  const BusinessesManagement = () => {
    const [localBusinesses, setLocalBusinesses] = useState([]);
    const [businessLoading, setBusinessLoading] = useState(false);
    const [businessSearch, setBusinessSearch] = useState('');

    useEffect(() => {
      fetchBusinesses();
    }, [businessPage, businessSearch]);

    const fetchBusinesses = async () => {
      setBusinessLoading(true);
      try {
        const response = await superAdminAPI.getBusinesses(
          businessPage, 
          20, 
          businessSearch.trim() || undefined 
        );
        setLocalBusinesses(response.data?.businesses || []);
      } catch (error) {
        toast.error('Failed to fetch businesses');
      } finally {
        setBusinessLoading(false);
      }
    };

    const handleDeleteBusiness = async (businessId, businessName) => {
      if (!window.confirm(`Are you sure you want to delete "${businessName}"? This action will permanently delete the business and all its related data (reviews, customers, QR codes, etc.), which cannot be undone.`)) return;
      
      try {
        await superAdminAPI.deleteBusiness(businessId);
        toast.success('Business deleted successfully');
        fetchBusinesses();
      } catch (error) {
        console.error('Error deleting business:', error);
        const errorMessage = error.message || error.error || 'Failed to delete business';
        toast.error(errorMessage);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Business Management</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={businessSearch}
                  onChange={(e) => setBusinessSearch(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {businessLoading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {localBusinesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{business.name}</div>
                          <div className="text-sm text-gray-500">ID: {business.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {business.owner?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {business.industry || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {business._count?.reviews || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        business.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {business.isPublished ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateBusinessStatus(business.id, !business.isPublished, business.name)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            business.isPublished
                              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                        >
                          {business.isPublished ? (
                            <>
                              <XCircle className="w-3 h-3" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteBusiness(business.id, business.name)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {localBusinesses.length === 0 && !businessLoading && (
          <div className="p-8 text-center text-gray-500">
            No businesses found
          </div>
        )}
      </div>
    );
  };

  // Reviews Management Component
  const ReviewsManagement = () => {
    const [localReviews, setLocalReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewSearch, setReviewSearch] = useState('');

    useEffect(() => {
      fetchReviews();
    }, [reviewPage, reviewFilter, reviewSearch]);

    const fetchReviews = async () => {
      setReviewLoading(true);
      try {
        const response = await superAdminAPI.getReviews(
          reviewPage, 
          20,
          reviewFilter !== 'all' ? reviewFilter : undefined,
          reviewSearch.trim() || undefined 
        );
        setLocalReviews(response.data?.reviews || []);
      } catch (error) {
        toast.error('Failed to fetch reviews');
      } finally {
        setReviewLoading(false);
      }
    };

    const handleModerateReview = async (reviewId, action) => {
      try {
        // Convert action to backend-expected status format
        const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
        await superAdminAPI.moderateReview(reviewId, status);
        toast.success(`Review ${action}d successfully`);
        fetchReviews();
      } catch (error) {
        console.error('Error moderating review:', error);
        toast.error(`Failed to ${action} review`);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Review Management</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {reviewLoading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {localReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {review.title || 'Untitled Review'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {review.comment || 'No comment'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.business?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {review.customerName || review.customerEmail || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{review.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        review.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        review.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {review.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleModerateReview(review.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                        )}
                        {review.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleModerateReview(review.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {localReviews.length === 0 && !reviewLoading && (
          <div className="p-8 text-center text-gray-500">
            No reviews found
          </div>
        )}
      </div>
    );
  };

  // Analytics View Component
  const AnalyticsView = () => {
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
      fetchAnalytics();
    }, [analyticsRange]);

    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const data = await superAdminAPI.getPlatformAnalytics(analyticsRange);
        setAnalytics(data);
      } catch (error) {
        toast.error('Failed to fetch analytics');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    if (analyticsLoading) {
      return (
        <div className="p-8 text-center">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Platform Analytics</h2>
          <select
            value={analyticsRange}
            onChange={(e) => setAnalyticsRange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Trends</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {analytics?.growth?.users || 0}%
              </div>
              <div className="text-sm text-gray-600">User Growth</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {analytics?.growth?.businesses || 0}%
              </div>
              <div className="text-sm text-gray-600">Business Growth</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {analytics?.growth?.reviews || 0}%
              </div>
              <div className="text-sm text-gray-600">Review Growth</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Health</h3>
          <div className="text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4" />
            <p>Detailed analytics charts coming soon</p>
          </div>
        </div>
      </div>
    );
  };

  // System Health View Component
  const SystemHealthView = () => {
    const [healthData, setHealthData] = useState(null);
    const [healthLoading, setHealthLoading] = useState(false);

    useEffect(() => {
      fetchSystemHealthData();
    }, []);

    const fetchSystemHealthData = async () => {
      setHealthLoading(true);
      try {
        const data = await superAdminAPI.getSystemHealth();
        setHealthData(data.data);
      } catch (error) {
        console.error('Error fetching system health:', error);
        toast.error('Failed to load system health data');
      } finally {
        setHealthLoading(false);
      }
    };

    if (healthLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
          <button
            onClick={fetchSystemHealthData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {healthData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">System Status</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  healthData.status === 'healthy' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {healthData.status}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className={`font-medium ${
                    healthData.database?.status === 'connected' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {healthData.database?.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">
                    {Math.floor(healthData.uptime / 3600)}h {Math.floor((healthData.uptime % 3600) / 60)}m
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="font-medium">{healthData.performance?.avgResponseTime || 0}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory Used</span>
                  <span className="font-medium">
                    {healthData.performance?.memory?.used?.toFixed(1) || 0} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Rate</span>
                  <span className="font-medium text-green-600">
                    {((healthData.errorRate?.rate || 0) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">New Users</span>
                  <span className="font-medium text-blue-600">
                    {healthData.metrics?.daily?.newUsers?.today || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Businesses</span>
                  <span className="font-medium text-green-600">
                    {healthData.metrics?.daily?.newBusinesses?.today || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Reviews</span>
                  <span className="font-medium text-purple-600">
                    {healthData.metrics?.daily?.newReviews?.today || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!healthData && !healthLoading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <p>Unable to load system health data</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Real-time Monitor View Component
  const RealTimeMonitorView = () => {
    const [liveStats, setLiveStats] = useState({
      activeUsers: 0,
      onlineBusinesses: 0,
      recentReviews: 0,
      systemLoad: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
      fetchRealTimeData();
      const interval = setInterval(fetchRealTimeData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }, []);

    const fetchRealTimeData = async () => {
      try {
        const [statsResponse, activitiesResponse] = await Promise.all([
          superAdminAPI.getRealTimeStats(),
          superAdminAPI.getRecentActivities()
        ]);
        setLiveStats(statsResponse.data);
        setRecentActivities(activitiesResponse.data?.activities || []);
      } catch (error) {
        console.error('Error fetching real-time data:', error);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Real-time Monitor</h2>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>

        {/* Live Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Users</p>
                <p className="text-3xl font-bold">{liveStats.activeUsers}</p>
                <p className="text-blue-100 text-xs">Last 15 minutes</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Online Businesses</p>
                <p className="text-3xl font-bold">{liveStats.onlineBusinesses}</p>
                <p className="text-green-100 text-xs">Currently active</p>
              </div>
              <Building2 className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Recent Reviews</p>
                <p className="text-3xl font-bold">{liveStats.recentReviews}</p>
                <p className="text-purple-100 text-xs">Last hour</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">System Load</p>
                <p className="text-3xl font-bold">{liveStats.systemLoad}%</p>
                <p className="text-orange-100 text-xs">CPU Usage</p>
              </div>
              <Activity className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {recentActivities.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'user_login' ? 'bg-green-500' :
                        activity.type === 'review_submitted' ? 'bg-blue-500' :
                        activity.type === 'business_created' ? 'bg-purple-500' :
                        'bg-gray-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{activity.userEmail}</span>
                          <span>{activity.ipAddress}</span>
                          <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Revenue Analytics View Component
  const RevenueAnalyticsView = () => {
    const [revenueData, setRevenueData] = useState(null);
    const [subscriptionMetrics, setSubscriptionMetrics] = useState(null);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [revenueRange, setRevenueRange] = useState('30days');
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedBusinessOwner, setSelectedBusinessOwner] = useState(null);

    useEffect(() => {
      fetchRevenueAnalytics();
      fetchSubscriptionMetrics();
    }, [revenueRange]);

    const fetchRevenueAnalytics = async () => {
      setRevenueLoading(true);
      try {
        const response = await superAdminAPI.getRevenueAnalytics(revenueRange);
        setRevenueData(response.data || response);
      } catch (error) {
        toast.error('Failed to fetch revenue analytics');
      } finally {
        setRevenueLoading(false);
      }
    };

    const fetchSubscriptionMetrics = async () => {
      try {
        const response = await superAdminAPI.getSubscriptionMetrics();
        setSubscriptionMetrics(response.data);
      } catch (error) {
        toast.error('Failed to fetch subscription metrics');
      }
    };

    const formatINR = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const formatUSD = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount);
    };

    if (revenueLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics & Business Owner Insights</h2>
          <div className="flex space-x-4">
            <select
              value={revenueRange}
              onChange={(e) => setRevenueRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            <button
              onClick={() => {
                fetchRevenueAnalytics();
                fetchSubscriptionMetrics();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'business-owners', 'plans', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && revenueData && (
          <>
            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue (INR)</p>
                    <p className="text-2xl font-bold text-green-600">{formatINR(revenueData.totalRevenueINR || 0)}</p>
                    <p className="text-xs text-gray-500">{formatUSD(revenueData.totalRevenue || 0)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                {revenueData.revenueGrowth && (
                  <div className="mt-2">
                    <span className={`text-sm ${
                      parseFloat(revenueData.revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(revenueData.revenueGrowth) >= 0 ? '↗' : '↘'} {revenueData.revenueGrowth}%
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-blue-600">{revenueData.activeSubscriptions || 0}</p>
                    <p className="text-xs text-gray-500">Business Owners</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                {revenueData.subscriptionGrowth && (
                  <div className="mt-2">
                    <span className={`text-sm ${
                      parseFloat(revenueData.subscriptionGrowth) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(revenueData.subscriptionGrowth) >= 0 ? '↗' : '↘'} {revenueData.subscriptionGrowth}%
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ARPU (Monthly)</p>
                    <p className="text-2xl font-bold text-purple-600">{formatINR(revenueData.arpuINR || 0)}</p>
                    <p className="text-xs text-gray-500">{formatUSD(revenueData.arpu || 0)}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Churn Rate</p>
                    <p className="text-2xl font-bold text-red-600">{revenueData.churnRate || 0}%</p>
                    <p className="text-xs text-gray-500">Monthly Churn</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Billing Cycle Breakdown */}
            {revenueData.billingCycles && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Cycle Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border-2 border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-blue-700">Monthly Subscriptions</h4>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {revenueData.billingCycles.monthly.percentage}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{revenueData.billingCycles.monthly.count}</p>
                    <p className="text-green-600 font-semibold">{formatINR(revenueData.billingCycles.monthly.revenueINR)}</p>
                    <p className="text-sm text-gray-500">{formatUSD(revenueData.billingCycles.monthly.revenue)}</p>
                  </div>
                  
                  <div className="p-6 border-2 border-purple-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-purple-700">Yearly Subscriptions</h4>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                        {revenueData.billingCycles.yearly.percentage}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{revenueData.billingCycles.yearly.count}</p>
                    <p className="text-green-600 font-semibold">{formatINR(revenueData.billingCycles.yearly.revenueINR)}</p>
                    <p className="text-sm text-gray-500">{formatUSD(revenueData.billingCycles.yearly.revenue)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Plans Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plans Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {revenueData.planBreakdown?.map((plan) => {
                  const getPlanColor = (planId) => {
                    switch(planId) {
                      case 'FREE': return 'gray';
                      case 'PREMIUM': return 'blue';
                      default: return 'gray';
                    }
                  };
                  
                  const color = getPlanColor(plan.planId);
                  
                  return (
                    <div key={plan.planId} className={`p-6 border-2 border-${color}-200 rounded-lg`}>
                      <div className="text-center mb-4">
                        <h4 className={`text-lg font-bold text-${color}-700`}>{plan.name} Plan</h4>
                        <div className="flex justify-center items-center space-x-2 mt-2">
                          <span className={`text-2xl font-bold text-${color}-600`}>{plan.subscribers}</span>
                          <span className="text-sm text-gray-500">subscribers</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Price:</span>
                          <span className="font-semibold">{formatINR(plan.priceINR)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Revenue:</span>
                          <span className="font-semibold text-green-600">{formatINR(plan.revenueINR)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Monthly/User:</span>
                          <span className="font-semibold">{formatINR(plan.avgMonthlyRevenueINR)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Status Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{revenueData.paymentStatus?.successful || 0}</div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{revenueData.paymentStatus?.failed || 0}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{revenueData.paymentStatus?.pending || 0}</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{revenueData.paymentStatus?.refunded || 0}</div>
                  <div className="text-sm text-blue-700">Refunds</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Business Owners Tab */}
        {activeTab === 'business-owners' && subscriptionMetrics && (
          <div className="space-y-6">
            {/* Business Owner Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="text-sm text-gray-600 mb-2">Total Business Owners</h4>
                <p className="text-2xl font-bold text-blue-600">{subscriptionMetrics.totalSubscriptions}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="text-sm text-gray-600 mb-2">Active Subscribers</h4>
                <p className="text-2xl font-bold text-green-600">{subscriptionMetrics.activeSubscriptions}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="text-sm text-gray-600 mb-2">Monthly Revenue</h4>
                <p className="text-2xl font-bold text-purple-600">{formatINR(subscriptionMetrics.totalMonthlyRevenueINR)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="text-sm text-gray-600 mb-2">Yearly Revenue</h4>
                <p className="text-2xl font-bold text-indigo-600">{formatINR(subscriptionMetrics.totalYearlyRevenueINR)}</p>
              </div>
            </div>

            {/* Top Revenue Contributors */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Contributing Business Owners</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptionMetrics.topRevenueOwners?.slice(0, 10).map((owner) => (
                      <tr key={owner.ownerId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{owner.ownerName}</p>
                            <p className="text-sm text-gray-500">{owner.ownerEmail}</p>
                            <p className="text-xs text-gray-400">{owner.ownerPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{owner.businessName}</p>
                            <p className="text-sm text-gray-500">{owner.businessType}</p>
                            <p className="text-xs text-gray-400">Since {new Date(owner.businessCreatedAt).toLocaleDateString()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              owner.planId === 'FREE' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {owner.planName}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{owner.billingCycle}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-green-600">{formatINR(owner.monthlyRevenueContributionINR)}/mo</p>
                            <p className="text-xs text-gray-500">{formatINR(owner.yearlyRevenueContributionINR)}/yr</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div>
                            <p className="text-gray-900">{owner.customersCount} customers</p>
                            <p className="text-gray-500">{owner.reviewsCount} reviews</p>
                            <p className="text-yellow-600">⭐ {owner.avgRating}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedBusinessOwner(owner)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Business Owners Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Business Owners</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrics</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptionMetrics.businessOwnerMetrics?.slice(0, 20).map((owner) => (
                      <tr key={owner.ownerId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{owner.ownerName}</p>
                            <p className="text-sm text-gray-500">{owner.businessName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            owner.planId === 'FREE' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {owner.planName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            owner.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            owner.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {owner.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <p className="text-green-600 font-medium">{formatINR(owner.monthlyPriceINR)}/mo</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <p>{owner.customersCount} customers</p>
                            <p>{owner.reviewsCount} reviews</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && subscriptionMetrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(subscriptionMetrics.planDistribution).map(([planId, planData]) => (
                <div key={planId} className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
                  planId === 'FREE' ? 'border-gray-200' : 'border-blue-200'
                }`}>
                  <div className="text-center mb-4">
                    <h3 className={`text-2xl font-bold ${
                      planId === 'FREE' ? 'text-gray-600' : 'text-blue-600'
                    }`}>
                      {planId} Plan
                    </h3>
                    {planId === 'PREMIUM' && (
                      <div className="mt-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          ₹4,149/month or ₹41,490/year
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">{planData.count}</p>
                      <p className="text-sm text-gray-500">Active Subscribers</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{formatINR(planData.revenue)}</p>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-700">
                        {subscriptionMetrics.activeSubscriptions > 0 ? 
                          ((planData.count / subscriptionMetrics.activeSubscriptions) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-sm text-gray-500">Market Share</p>
                    </div>
                    
                    {planId !== 'FREE' && (
                      <div className="text-center pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Avg Revenue per User: {formatINR(planData.count > 0 ? planData.revenue / planData.count : 0)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && revenueData && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueData.recentTransactions?.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.ownerName}</p>
                            <p className="text-sm text-gray-500">{transaction.businessName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {transaction.planName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-green-600">{formatINR(transaction.amountINR)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.billingCycle === 'Monthly' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {transaction.billingCycle}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Business Owner Detail Modal */}
        {selectedBusinessOwner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Business Owner Details</h3>
                  <button
                    onClick={() => setSelectedBusinessOwner(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Owner Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Owner Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedBusinessOwner.ownerName}</span></div>
                      <div><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedBusinessOwner.ownerEmail}</span></div>
                      <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedBusinessOwner.ownerPhone || 'N/A'}</span></div>
                      <div><span className="text-gray-600">Address:</span> <span className="font-medium">{selectedBusinessOwner.businessAddress || 'N/A'}</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Business Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Business:</span> <span className="font-medium">{selectedBusinessOwner.businessName}</span></div>
                      <div><span className="text-gray-600">Type:</span> <span className="font-medium">{selectedBusinessOwner.businessType}</span></div>
                      <div><span className="text-gray-600">Created:</span> <span className="font-medium">{new Date(selectedBusinessOwner.businessCreatedAt).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                </div>
                
                {/* Subscription Details */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Subscription Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Plan:</span>
                      <div className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedBusinessOwner.planId === 'FREE' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedBusinessOwner.planName}
                      </div>
                    </div>
                    <div><span className="text-gray-600">Billing:</span> <span className="font-medium">{selectedBusinessOwner.billingCycle}</span></div>
                    <div><span className="text-gray-600">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedBusinessOwner.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedBusinessOwner.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Revenue & Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                    <p className="text-lg font-bold text-green-600">{formatINR(selectedBusinessOwner.monthlyRevenueContributionINR)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Yearly Revenue</p>
                    <p className="text-lg font-bold text-purple-600">{formatINR(selectedBusinessOwner.yearlyRevenueContributionINR)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Customers</p>
                    <p className="text-lg font-bold text-blue-600">{selectedBusinessOwner.customersCount}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Reviews</p>
                    <p className="text-lg font-bold text-yellow-600">{selectedBusinessOwner.reviewsCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Security Center View Component
  const SecurityCenterView = () => {
    const [securityData, setSecurityData] = useState(null);
    const [securityLoading, setSecurityLoading] = useState(false);

    useEffect(() => {
      fetchSecurityData();
    }, []);

    const fetchSecurityData = async () => {
      setSecurityLoading(true);
      try {
        const response = await superAdminAPI.getSecurityAnalytics();
        setSecurityData(response.data);
      } catch (error) {
        toast.error('Failed to fetch security data');
      } finally {
        setSecurityLoading(false);
      }
    };

    if (securityLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Security Center</h2>
          <button
            onClick={fetchSecurityData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Shield className="w-4 h-4 mr-2 inline" />
            Refresh
          </button>
        </div>

        {securityData && (
          <>
            {/* Security Alerts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Security Threats</p>
                    <p className="text-3xl font-bold text-red-700">{securityData.threats || 0}</p>
                  </div>
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Suspicious Logins</p>
                    <p className="text-3xl font-bold text-yellow-700">{securityData.suspiciousLogins || 0}</p>
                  </div>
                  <UserX className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Failed Attempts</p>
                    <p className="text-3xl font-bold text-orange-700">{securityData.failedAttempts || 0}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Blocked IPs</p>
                    <p className="text-3xl font-bold text-green-700">{securityData.blockedIps || 0}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Recent Security Events */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Security Events</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {securityData.recentEvents?.map((event, index) => (
                  <div key={index} className="p-4 flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      event.severity === 'high' ? 'bg-red-500' :
                      event.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{event.ipAddress}</span>
                        <span>{event.userAgent}</span>
                        <span>{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      event.status === 'flagged' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Content Moderation View Component
  const ContentModerationView = () => {
    const [moderationData, setModerationData] = useState(null);
    const [moderationLoading, setModerationLoading] = useState(false);

    useEffect(() => {
      fetchModerationData();
    }, []);

    const fetchModerationData = async () => {
      setModerationLoading(true);
      try {
        const response = await superAdminAPI.getModerationQueue();
        setModerationData(response.data);
      } catch (error) {
        toast.error('Failed to fetch moderation data');
      } finally {
        setModerationLoading(false);
      }
    };

    const handleBulkModeration = async (action, reviewIds) => {
      try {
        await superAdminAPI.bulkModerateReviews(action, reviewIds);
        toast.success(`Reviews ${action}d successfully`);
        fetchModerationData();
      } catch (error) {
        toast.error(`Failed to ${action} reviews`);
      }
    };

    if (moderationLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleBulkModeration('approve', [])}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => handleBulkModeration('reject', [])}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Bulk Reject
            </button>
          </div>
        </div>

        {moderationData && (
          <>
            {/* Moderation Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-yellow-700">{moderationData.pending || 0}</div>
                <div className="text-yellow-600 font-medium">Pending Review</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-red-700">{moderationData.flagged || 0}</div>
                <div className="text-red-600 font-medium">Flagged Content</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-700">{moderationData.aiDetected || 0}</div>
                <div className="text-blue-600 font-medium">AI Detected</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-700">{moderationData.processed || 0}</div>
                <div className="text-green-600 font-medium">Processed Today</div>
              </div>
            </div>

            {/* Moderation Queue */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Moderation Queue</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flags</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {moderationData.queue?.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
                            <div className="text-sm text-gray-500 truncate">{item.content}</div>
                            <div className="flex items-center space-x-2 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.businessName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.riskScore > 70 ? 'bg-red-100 text-red-800' :
                            item.riskScore > 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.riskScore}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {item.flags?.map((flag, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                {flag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleBulkModeration('approve', [item.id])}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleBulkModeration('reject', [item.id])}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Audit Logs View Component
  const AuditLogsView = () => {
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionFilter, setActionFilter] = useState('');

    useEffect(() => {
      fetchAuditLogsData();
    }, [currentPage, actionFilter]);

    const fetchAuditLogsData = async () => {
      setLogsLoading(true);
      try {
        const data = await superAdminAPI.getAuditLogs(currentPage, 20, actionFilter);
        setLogs(data.data.logs);
        setTotalPages(data.data.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        toast.error('Failed to load audit logs');
      } finally {
        setLogsLoading(false);
      }
    };

    const formatTimestamp = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <div className="flex items-center space-x-4">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="BUSINESS_CREATED">Business Created</option>
              <option value="REVIEW_MODERATED">Review Moderated</option>
              <option value="USER_SUSPENDED">User Suspended</option>
            </select>
            <button
              onClick={fetchAuditLogsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {logsLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.userId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {logs.length === 0 && !logsLoading && (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No audit logs found</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-50 to-blue-100 text-blue-700 border-blue-200',
      green: 'from-green-50 to-green-100 text-green-700 border-green-200',
      purple: 'from-purple-50 to-purple-100 text-purple-700 border-purple-200',
      orange: 'from-orange-50 to-orange-100 text-orange-700 border-orange-200',
      red: 'from-red-50 to-red-100 text-red-700 border-red-200'
    };

    const iconColors = {
      blue: 'bg-blue-600 text-white',
      green: 'bg-green-600 text-white',
      purple: 'bg-purple-600 text-white',
      orange: 'bg-orange-600 text-white',
      red: 'bg-red-600 text-white'
    };

    return (
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-2xl border hover:shadow-lg transition-all duration-200`}>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold opacity-75 truncate mb-2">{title}</p>
            <p className="text-3xl font-bold mb-2">{value}</p>
            {change !== undefined && (
              <div className="flex items-center text-sm font-medium">
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
                )}
                <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(change)}% this month
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconColors[color]} shadow-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  const TabButton = ({ id, title, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
        isActive 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
      }`}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="text-sm sm:text-base">{title}</span>
    </button>
  );

  if (!isSuperAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Super admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Load data for the selected tab
    switch (tabId) {
      case 'users':
        fetchUsers();
        break;
      case 'businesses':
        fetchBusinesses();
        break;
      case 'reviews':
        fetchReviews();
        break;
      case 'analytics':
        fetchPlatformAnalytics(analyticsRange);
        break;
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6 sm:h-20 gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Super Admin Portal</h1>
                <p className="text-sm text-gray-600 hidden sm:block">System Management & Analytics</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <span className="hidden sm:inline font-medium">Admin: </span>
                  <span className="truncate max-w-[200px] sm:max-w-none font-medium">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Enhanced Navigation Tabs */}
        <div className="mb-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          <TabButton
            id="dashboard"
            title="Dashboard"
            icon={BarChart3}
            isActive={activeTab === 'dashboard'}
            onClick={handleTabChange}
          />
          <TabButton
            id="users"
            title="Users"
            icon={Users}
            isActive={activeTab === 'users'}
            onClick={handleTabChange}
          />
          <TabButton
            id="businesses"
            title="Businesses"
            icon={Building2}
            isActive={activeTab === 'businesses'}
            onClick={handleTabChange}
          />
          <TabButton
            id="reviews"
            title="Reviews"
            icon={MessageSquare}
            isActive={activeTab === 'reviews'}
            onClick={handleTabChange}
          />
          <TabButton
            id="analytics"
            title="Analytics"
            icon={Activity}
            isActive={activeTab === 'analytics'}
            onClick={handleTabChange}
          />
          <TabButton
            id="system-health"
            title="System Health"
            icon={Shield}
            isActive={activeTab === 'system-health'}
            onClick={handleTabChange}
          />
          <TabButton
            id="audit-logs"
            title="Audit Logs"
            icon={Eye}
            isActive={activeTab === 'audit-logs'}
            onClick={handleTabChange}
          />
          <TabButton
            id="real-time"
            title="Real-time Monitor"
            icon={Activity}
            isActive={activeTab === 'real-time'}
            onClick={handleTabChange}
          />
          <TabButton
            id="revenue"
            title="Revenue Analytics"
            icon={TrendingUp}
            isActive={activeTab === 'revenue'}
            onClick={handleTabChange}
          />
          <TabButton
            id="security"
            title="Security Center"
            icon={Shield}
            isActive={activeTab === 'security'}
            onClick={handleTabChange}
          />
          <TabButton
            id="moderation"
            title="Content Moderation"
            icon={Filter}
            isActive={activeTab === 'moderation'}
            onClick={handleTabChange}
          />
            </div>
          </div>
        </div>

        {/* Enhanced Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="space-y-10">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to Admin Portal</h2>
                  <p className="text-blue-100 text-lg">Monitor and manage your entire platform from here</p>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Last Updated</p>
                    <p className="text-white font-semibold">{new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Total Users"
                value={dashboardStats.overview.totalUsers}
                change={dashboardStats.growth.users}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Total Businesses"
                value={dashboardStats.overview.totalBusinesses}
                change={dashboardStats.growth.businesses}
                icon={Building2}
                color="green"
              />
              <StatCard
                title="Total Reviews"
                value={dashboardStats.overview.totalReviews}
                change={dashboardStats.growth.reviews}
                icon={Star}
                color="purple"
              />
              <StatCard
                title="Total Customers"
                value={dashboardStats.overview.totalCustomers}
                icon={Users}
                color="orange"
              />
              <StatCard
                title="QR Codes"
                value={dashboardStats.overview.totalQRCodes}
                icon={Eye}
                color="red"
              />
            </div>

            {/* Enhanced Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Live Updates
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="bg-blue-50 rounded-2xl p-6 mb-4 group-hover:bg-blue-100 transition-colors">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {dashboardStats.recentActivity.newUsersThisMonth}
                    </div>
                    <div className="text-sm font-medium text-blue-700">New Users</div>
                  </div>
                  <div className="text-sm text-gray-500">This Month</div>
                </div>
                <div className="text-center group">
                  <div className="bg-green-50 rounded-2xl p-6 mb-4 group-hover:bg-green-100 transition-colors">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {dashboardStats.recentActivity.newBusinessesThisMonth}
                    </div>
                    <div className="text-sm font-medium text-green-700">New Businesses</div>
                  </div>
                  <div className="text-sm text-gray-500">This Month</div>
                </div>
                <div className="text-center group">
                  <div className="bg-purple-50 rounded-2xl p-6 mb-4 group-hover:bg-purple-100 transition-colors">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {dashboardStats.recentActivity.reviewsThisWeek}
                    </div>
                    <div className="text-sm font-medium text-purple-700">Reviews</div>
                  </div>
                  <div className="text-sm text-gray-500">This Week</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UsersManagement />
        )}

        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <BusinessesManagement />
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <ReviewsManagement />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {/* System Health Tab */}
        {activeTab === 'system-health' && (
          <SystemHealthView />
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit-logs' && (
          <AuditLogsView />
        )}

        {/* Real-time Monitor Tab */}
        {activeTab === 'real-time' && (
          <RealTimeMonitorView />
        )}

        {/* Revenue Analytics Tab */}
        {activeTab === 'revenue' && (
          <RevenueAnalyticsView />
        )}

        {/* Security Center Tab */}
        {activeTab === 'security' && (
          <SecurityCenterView />
        )}

        {/* Content Moderation Tab */}
        {activeTab === 'moderation' && (
          <ContentModerationView />
        )}

        {/* Fallback for unimplemented tabs */}
        {!['dashboard', 'users', 'businesses', 'reviews', 'analytics', 'system-health', 'audit-logs'].includes(activeTab) && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h3>
              <p>This section is under development and will be available soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard