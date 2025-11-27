import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Star, 
  MessageSquare, 
  Download, 
  Search, 
  Filter, 
  Eye,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/FirebaseAuthContext';

const CustomerManager = ({ businessId, onClose }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, [businessId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!user) {
        throw new Error('Authentication required');
      }

      // Get Firebase ID token
      const token = await user.getIdToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/customers/business/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const exportCustomers = async () => {
    try {
      console.log('Export customers called with businessId:', businessId);
      
      if (!user) {
        throw new Error('Authentication required');
      }

      console.log('User authenticated, getting token...');
      const token = await user.getIdToken();
      console.log('Token obtained, making request to:', `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/customers/business/${businessId}/export`);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/customers/business/${businessId}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Export error response:', errorText);
        throw new Error(`Failed to export customers: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Export data received:', data);
      
      // Convert to CSV and download
      const csvContent = convertToCSV(data);
      downloadCSV(csvContent, `customers-${businessId}-${new Date().toISOString().split('T')[0]}.csv`);
      
      toast.success('Customer data exported successfully!');
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error(`Failed to export customer data: ${error.message}`);
    }
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle dates and format properly
        if (header.includes('Date') && value) {
          return `"${new Date(value).toLocaleDateString()}"`;
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(customer => {
    // Search term filter (name, email, phone)
    const matchesSearch = searchTerm === '' || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm));

    // Name filter
    const matchesName = nameFilter === '' || 
      customer.name.toLowerCase().includes(nameFilter.toLowerCase());

    // Email filter
    const matchesEmail = emailFilter === '' || 
      customer.email.toLowerCase().includes(emailFilter.toLowerCase());

    // Review count filter
    const matchesReview = reviewFilter === 'all' || 
      (reviewFilter === 'with-reviews' && customer.reviews && customer.reviews.length > 0) ||
      (reviewFilter === 'no-reviews' && (!customer.reviews || customer.reviews.length === 0));

    // Date filter (customers created on specific date)
    const matchesDate = dateFilter === '' || 
      customer.createdAt.startsWith(dateFilter);

    // Rating filter (average rating)
    const customerAvgRating = customer.reviews && customer.reviews.length > 0 
      ? customer.reviews.reduce((sum, review) => sum + review.rating, 0) / customer.reviews.length 
      : 0;
    
    const matchesRating = ratingFilter === 'all' ||
      (ratingFilter === '5' && customerAvgRating >= 4.5) ||
      (ratingFilter === '4' && customerAvgRating >= 3.5 && customerAvgRating < 4.5) ||
      (ratingFilter === '3' && customerAvgRating >= 2.5 && customerAvgRating < 3.5) ||
      (ratingFilter === '2' && customerAvgRating >= 1.5 && customerAvgRating < 2.5) ||
      (ratingFilter === '1' && customerAvgRating >= 0.5 && customerAvgRating < 1.5) ||
      (ratingFilter === '0' && customerAvgRating < 0.5);

    return matchesSearch && matchesName && matchesEmail && matchesReview && matchesDate && matchesRating;
  });

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const closeCustomerDetails = () => {
    setSelectedCustomer(null);
    setShowCustomerDetails(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading customers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setNameFilter('');
              setEmailFilter('');
              setReviewFilter('all');
              setDateFilter('');
              setRatingFilter('all');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
          <button
            onClick={exportCustomers}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Customers</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{customers.length}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">With Reviews</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {customers.filter(c => c.reviews && c.reviews.length > 0).length}
          </p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {customers.length > 0 ? (
              customers
                .filter(c => c.reviews && c.reviews.length > 0)
                .reduce((sum, c) => {
                  const avgRating = c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length;
                  return sum + avgRating;
                }, 0) / Math.max(1, customers.filter(c => c.reviews && c.reviews.length > 0).length)
            ).toFixed(1) : '0.0'}
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">This Month</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {customers.filter(c => {
              const createdDate = new Date(c.createdAt);
              const now = new Date();
              return createdDate.getMonth() === now.getMonth() && 
                     createdDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Database</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredCustomers.length} customers found
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
        
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {customers.length === 0 ? 'No customers yet' : 'No customers found'}
            </h3>
            <p className="text-gray-600">
              {customers.length === 0 
                ? 'Customer data will appear here when people submit reviews through your QR codes.'
                : 'Try adjusting your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="space-y-1">
                      <div>Customer</div>
                      <input
                        type="text"
                        placeholder="Filter by name..."
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="space-y-1">
                      <div>Contact</div>
                      <input
                        type="text"
                        placeholder="Filter by email..."
                        value={emailFilter}
                        onChange={(e) => setEmailFilter(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="space-y-1">
                      <div>Reviews</div>
                      <select
                        value={reviewFilter}
                        onChange={(e) => setReviewFilter(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="all">All</option>
                        <option value="with-reviews">With Reviews</option>
                        <option value="no-reviews">No Reviews</option>
                      </select>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="space-y-1">
                      <div>Joined</div>
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="space-y-1">
                      <div>Actions</div>
                      <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="all">All Ratings</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 Star</option>
                        <option value="4">⭐⭐⭐⭐ 4 Star</option>
                        <option value="3">⭐⭐⭐ 3 Star</option>
                        <option value="2">⭐⭐ 2 Star</option>
                        <option value="1">⭐ 1 Star</option>
                        <option value="0">No Rating</option>
                      </select>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {customer.email}
                        </div>
                        {customer.phone && customer.phone !== '000-000-0000' && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.reviews ? customer.reviews.length : 0} reviews
                        </div>
                        {customer.reviews && customer.reviews.length > 0 && (
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600">
                              {(customer.reviews.reduce((sum, r) => sum + r.rating, 0) / customer.reviews.length).toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewCustomerDetails(customer)}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
              <button
                onClick={closeCustomerDetails}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedCustomer.email}</p>
                    </div>
                    {selectedCustomer.phone && selectedCustomer.phone !== '000-000-0000' && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-gray-900">{selectedCustomer.phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Customer Since</label>
                      <p className="text-gray-900">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Reviews ({selectedCustomer.reviews ? selectedCustomer.reviews.length : 0})
                  </h4>
                  {selectedCustomer.reviews && selectedCustomer.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {selectedCustomer.reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {review.rating}/5
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{review.feedback}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No reviews submitted yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;