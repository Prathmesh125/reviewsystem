import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import businessAPI from '../../services/businessAPI';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import DashboardStats from './DashboardStats';
import FormBuilder from './FormBuilderClean';
import QRCodeManager from './QRCodeManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import CustomerManager from './CustomerManager';
import EmailMarketing from './EmailMarketing';
import { 
  Plus, 
  Building2, 
  Users, 
  Star, 
  QrCode, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Download,
  Settings,
  Layout,
  X,
  Copy,
  Shield,
  TrendingUp,
  LogOut,
  Mail,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const BusinessDashboard = () => {
  const { user, isBusinessOwner, isAdmin, isAuthenticated, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'published'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name'
  
  // Form Builder state
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  
  // QR Code Manager state
  const [showQRCodeManager, setShowQRCodeManager] = useState(false);
  

  
  // Analytics Dashboard state
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  
  // Customer Manager state
  const [showCustomerManager, setShowCustomerManager] = useState(false);
  
  // Email Marketing state
  const [showEmailMarketing, setShowEmailMarketing] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    filterAndSortBusinesses();
  }, [businesses, searchTerm, filterStatus, sortBy]);

  // Debug user authentication
  useEffect(() => {
    console.log('BusinessDashboard Debug:', {
      user: user?.email,
      isBusinessOwner: isBusinessOwner(),
      isAdmin: isAdmin(),
      businessesLength: businesses.length
    });
  }, [user, businesses]);

  const filterAndSortBusinesses = () => {
    let filtered = [...businesses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === 'published') {
      filtered = filtered.filter(business => business.isPublished);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredBusinesses(filtered);
  };

  const fetchBusinesses = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching businesses...', retryCount > 0 ? `(retry ${retryCount})` : '');
      const response = await businessAPI.getBusinesses();
      console.log('Business API response:', response);
      
      if (response.success) {
        setBusinesses(response.data);
        setFilteredBusinesses(response.data);
      } else {
        setError(response.message || 'Failed to fetch businesses');
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
      console.error('Error details:', err.response?.data);
      
      // Better error handling for different types of errors
      let errorMessage = 'Failed to fetch businesses';
      
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view businesses.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Retry logic for network errors
      if ((err.code === 'NETWORK_ERROR' || err.message.includes('Network Error') || err.code === 'ECONNABORTED') && retryCount < 2) {
        console.log(`Retrying request in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          fetchBusinesses(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublication = async (businessId) => {
    try {
      const response = await businessAPI.togglePublication(businessId);
      
      if (response.success) {
        // Update the business in the state
        setBusinesses(prev => 
          prev.map(business => 
            business.id === businessId 
              ? { ...business, isPublished: response.data.isPublished }
              : business
          )
        );
        toast.success(response.message);
      } else {
        toast.error(response.message || 'Failed to update business');
      }
    } catch (err) {
      console.error('Error toggling publication:', err);
      toast.error(err.message || 'Failed to update business');
    }
  };

  const handleDeleteBusiness = async (businessId, businessName) => {
    if (!window.confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await businessAPI.deleteBusiness(businessId);
      
      if (response.success) {
        setBusinesses(prev => prev.filter(business => business.id !== businessId));
        toast.success('Business deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete business');
      }
    } catch (err) {
      console.error('Error deleting business:', err);
      toast.error(err.message || 'Failed to delete business');
    }
  };

  const openFormBuilder = (businessId) => {
    setSelectedBusinessId(businessId);
    setShowFormBuilder(true);
  };

  const closeFormBuilder = () => {
    setShowFormBuilder(false);
    setSelectedBusinessId(null);
  };

  const openQRCodeManager = (businessId) => {
    setSelectedBusinessId(businessId);
    setShowQRCodeManager(true);
  };

  const closeQRCodeManager = () => {
    setShowQRCodeManager(false);
    setSelectedBusinessId(null);
  };



  const openAnalyticsDashboard = (businessId) => {
    setSelectedBusinessId(businessId);
    setShowAnalyticsDashboard(true);
  };

  const closeAnalyticsDashboard = () => {
    setShowAnalyticsDashboard(false);
    setSelectedBusinessId(null);
  };

  const openCustomerManager = (businessId) => {
    setSelectedBusinessId(businessId);
    setShowCustomerManager(true);
  };

  const closeCustomerManager = () => {
    setShowCustomerManager(false);
    setSelectedBusinessId(null);
  };

  const openEmailMarketing = (businessId) => {
    setSelectedBusinessId(businessId);
    setShowEmailMarketing(true);
  };

  const closeEmailMarketing = () => {
    setShowEmailMarketing(false);
    setSelectedBusinessId(null);
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

  const createDemoBusiness = async () => {
    try {
      setLoading(true);
      console.log('Creating demo business for analytics...');
      
      const response = await fetch('http://localhost:3001/api/analytics/create-demo-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Demo business created:', result.data);
        toast.success('Demo business created successfully!');
        
        // Refresh the businesses list
        await fetchBusinesses();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create demo business');
      }
    } catch (error) {
      console.error('Error creating demo business:', error);
      toast.error('Failed to create demo business');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg">Loading businesses...</LoadingSpinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchBusinesses}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Header with Glass Morphism */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent truncate">
                  {isAdmin() ? 'Business Hub' : 'My Dashboard'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {isAdmin() ? 'Manage all businesses' : 'Your business command center'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
              {isSuperAdmin() && (
                <Link to="/super-admin" className="group">
                  <div className="px-2 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium text-xs sm:text-sm hidden sm:inline">Admin</span>
                  </div>
                </Link>
              )}
              <Link to="/subscription" className="group">
                <div className="px-2 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium text-xs sm:text-sm hidden sm:inline">Plans</span>
                </div>
              </Link>
              {isAuthenticated() && (
                <Link to="/business/create" className="group">
                  <div className="px-2 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium text-xs sm:text-sm hidden sm:inline">Create</span>
                  </div>
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">


        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Enhanced Search and Filter Controls */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 pointer-events-none"></div>
          <div className="relative">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {/* Filter by Status */}
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 w-4 h-4 flex-shrink-0" />
                <div className="relative flex-1 sm:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All Businesses</option>
                    <option value="published">Published Only</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Export Button */}
              {isAdmin() && (
                <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              )}
            </div>
          </div>

          {/* Filter Results Info */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-600">
            <span>
              Showing {filteredBusinesses.length} of {businesses.length} businesses
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            {filteredBusinesses.length !== businesses.length && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="text-blue-600 hover:text-blue-700 self-start sm:self-auto"
              >
                Clear filters
              </button>
            )}
          </div>
          </div>
        </div>

        {/* Businesses Grid */}
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Building2 className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              {businesses.length === 0 ? 'No businesses yet' : 'No businesses found'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-md mx-auto">
              {businesses.length === 0 
                ? (isAdmin() 
                    ? 'Businesses created by users will appear here.' 
                    : 'Create your first business to start collecting reviews and access the Form Builder.'
                  )
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {businesses.length === 0 && (
              <div className="flex flex-col gap-3 justify-center">
                <Link to="/business/create" className="w-full sm:w-auto mx-auto">
                  <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Business
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={createDemoBusiness}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  {loading ? 'Creating...' : 'Create Demo Business with Analytics'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {filteredBusinesses.map((business) => (
              <div key={business.id} className="group bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-purple-50/30 pointer-events-none"></div>
                <div className="relative">
                {/* Enhanced Business Header */}
                <div className="p-4 sm:p-6 lg:p-8 border-b border-white/20">
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 animate-pulse flex-shrink-0" style={{ backgroundColor: business.brandColor }}></div>
                        <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                          {business.name}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium px-2 sm:px-3 py-1 bg-gray-100/80 rounded-full inline-block">{business.type}</p>
                    </div>
                    
                    {/* Publication Status */}
                    <div className="flex items-center gap-2 ml-2 sm:ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleTogglePublication(business.id)}
                        className={`p-1.5 sm:p-1 rounded transition-colors ${
                          business.isPublished 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={business.isPublished ? 'Published' : 'Unpublished'}
                      >
                        {business.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {business.description && (
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 line-clamp-2">
                      {business.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
                    <div>
                      <div className="flex items-center justify-center text-blue-600 mb-1 sm:mb-2">
                        <Users className="w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        {business._count?.customers || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">Customers</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center text-yellow-600 mb-1 sm:mb-2">
                        <Star className="w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        {business._count?.reviews || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">Reviews</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center text-purple-600 mb-1 sm:mb-2">
                        <QrCode className="w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        {business._count?.qrCodes || 0}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">QR Codes</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Business Actions */}
                <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50/80 to-blue-50/40 backdrop-blur-sm">
                  {/* Top row with website and brand color */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      {business.website && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="Visit website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      
                      {/* Brand Color Indicator */}
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: business.brandColor }}
                        title={`Brand color: ${business.brandColor}`}
                      />
                    </div>

                    {/* Management buttons */}
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Link
                        to={`/business/${business.id}/edit`}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit business"
                      >
                        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                      
                      <Link
                        to={`/business/${business.id}/settings`}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Business settings"
                      >
                        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleDeleteBusiness(business.id, business.name)}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete business"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Main Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <button
                      onClick={() => openFormBuilder(business.id)}
                      className="group relative px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1 sm:gap-2"
                      title="Advanced Form Builder - Create custom review forms"
                    >
                      <Layout className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline lg:hidden xl:inline">Forms</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>

                    <button
                      onClick={() => openQRCodeManager(business.id)}
                      className="group relative px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl hover:from-purple-600 hover:via-violet-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1 sm:gap-2"
                      title="QR Code Manager - Create and manage QR codes"
                    >
                      <QrCode className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline lg:hidden xl:inline">QR</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>

                    <button
                      onClick={() => openCustomerManager(business.id)}
                      className="group relative px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-500 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl hover:from-blue-600 hover:via-sky-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1 sm:gap-2"
                      title="Customer Manager - View and manage customer data"
                    >
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline lg:hidden xl:inline">Users</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>

                    <button
                      onClick={() => openEmailMarketing(business.id)}
                      className="group relative px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl hover:from-rose-600 hover:via-pink-600 hover:to-fuchsia-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1 sm:gap-2"
                      title="Email Marketing - Send promotions and coupons to customers"
                    >
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline lg:hidden xl:inline">Email</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>

                    <button
                      onClick={() => openAnalyticsDashboard(business.id)}
                      className="group relative px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl hover:from-amber-600 hover:via-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 col-span-2 sm:col-span-1"
                      title="Analytics Dashboard - View detailed business insights"
                    >
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Analytics</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  </div>

                  {/* Quick Actions */}
                  {business.isPublished && (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Link
                        to={`/review/${business.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Review Form
                      </Link>
                      <button
                        onClick={() => {
                          const reviewLink = `${window.location.origin}/review/${business.id}`;
                          navigator.clipboard.writeText(reviewLink).then(() => {
                            toast.success('Review link copied to clipboard!');
                          }).catch(() => {
                            // Fallback for older browsers
                            const textArea = document.createElement('textarea');
                            textArea.value = reviewLink;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            toast.success('Review link copied to clipboard!');
                          });
                        }}
                        className="w-full sm:w-auto px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                        title="Copy review link"
                      >
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>

                {/* Admin Info */}
                {isAdmin() && business.user && (
                  <div className="px-4 py-2 bg-blue-50 text-xs text-blue-700">
                    Owner: {business.user.firstName} {business.user.lastName} ({business.user.email})
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Builder Modal */}
      {showFormBuilder && selectedBusinessId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Layout className="w-6 h-6 text-blue-600" />
                  Advanced Form Builder
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Create professional review forms with 7 field types, validation rules, templates, and live preview
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Drag & Drop Fields
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Real-time Editor
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Template System
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Live Preview
                  </span>
                </div>
              </div>
              <button
                onClick={closeFormBuilder}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="max-h-[80vh] overflow-y-auto">
              <FormBuilder 
                key={selectedBusinessId} // Force remount when business changes
                businessId={selectedBusinessId}
                onClose={closeFormBuilder}
              />
            </div>
          </div>
        </div>
      )}

      {/* QR Code Manager Modal */}
      {showQRCodeManager && selectedBusinessId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-4 sm:my-8 max-h-[95vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-xl flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  QR Code Manager
                </h2>
                <p className="text-sm text-gray-600 mt-1 hidden sm:block">
                  Create, customize, and manage QR codes for your review forms with analytics and tracking
                </p>
                <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="hidden sm:inline">Custom QR Codes</span>
                    <span className="sm:hidden">Custom</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="hidden sm:inline">Scan Analytics</span>
                    <span className="sm:hidden">Analytics</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="hidden sm:inline">Download & Share</span>
                    <span className="sm:hidden">Download</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline">Color Customization</span>
                    <span className="sm:hidden">Colors</span>
                  </span>
                </div>
              </div>
              <button
                onClick={closeQRCodeManager}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <QRCodeManager 
                businessId={selectedBusinessId}
                onClose={closeQRCodeManager}
              />
            </div>
          </div>
        </div>
      )}



      {/* Analytics Dashboard Modal */}
      {showAnalyticsDashboard && selectedBusinessId && (
        <AnalyticsDashboard 
          businessId={selectedBusinessId}
          onClose={closeAnalyticsDashboard}
        />
      )}

      {/* Customer Manager Modal */}
      {showCustomerManager && selectedBusinessId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-4 sm:my-8 max-h-[95vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-xl flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  Customer Database
                </h2>
                <p className="text-sm text-gray-600 mt-1 hidden sm:block">
                  View, manage, and export customer data collected from review submissions
                </p>
                <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="hidden sm:inline">Customer Data</span>
                    <span className="sm:hidden">Data</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline">Review History</span>
                    <span className="sm:hidden">Reviews</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">Export</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="hidden sm:inline">Marketing Data</span>
                    <span className="sm:hidden">Marketing</span>
                  </span>
                </div>
              </div>
              <button
                onClick={closeCustomerManager}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <CustomerManager 
                businessId={selectedBusinessId}
                onClose={closeCustomerManager}
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Marketing Modal */}
      {showEmailMarketing && selectedBusinessId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-4 sm:my-8 max-h-[95vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-xl flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                  Email Marketing
                </h2>
                <p className="text-sm text-gray-600 mt-1 hidden sm:block">
                  Send promotional emails, coupons, and announcements to your customers
                </p>
                <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="hidden sm:inline">Email Campaigns</span>
                    <span className="sm:hidden">Campaigns</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                    <span className="hidden sm:inline">Coupon Codes</span>
                    <span className="sm:hidden">Coupons</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="hidden sm:inline">Customer Targeting</span>
                    <span className="sm:hidden">Targeting</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="hidden sm:inline">Templates</span>
                    <span className="sm:hidden">Templates</span>
                  </span>
                </div>
              </div>
              <button
                onClick={closeEmailMarketing}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <EmailMarketing 
                businessId={selectedBusinessId}
                onClose={closeEmailMarketing}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;