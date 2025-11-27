import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Send, 
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  Filter,
  Search,
  Calendar,
  Target,
  Gift,
  Percent,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/FirebaseAuthContext';

const EmailMarketing = ({ businessId, onClose }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [uniqueEmails, setUniqueEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  
  // Email campaign data
  const [emailCampaign, setEmailCampaign] = useState({
    subject: '',
    message: '',
    type: 'promotion', // 'promotion', 'coupon', 'announcement', 'custom'
    couponCode: '',
    discount: '',
    validUntil: ''
  });

  // Email templates
  const emailTemplates = {
    promotion: {
      subject: '🎉 Special Offer Just for You!',
      message: `Hi there!

We hope you're having a great day! As one of our valued customers, we wanted to share an exclusive offer with you.

🌟 Special Promotion Details:
- [Your offer details here]
- Valid until: [Date]

Don't miss out on this amazing opportunity to save!

Thank you for being a loyal customer. We appreciate your business and look forward to serving you again soon.

Best regards,
[Your Business Name] Team`
    },
    coupon: {
      subject: '💰 Exclusive Coupon Code Inside!',
      message: `Hello!

We have something special for you! Here's an exclusive coupon code just for our valued customers.

🎟️ Coupon Code: [COUPON_CODE]
💸 Discount: [DISCOUNT]% OFF
📅 Valid Until: [VALID_UNTIL]

How to use:
1. Visit our store/website
2. Use the coupon code at checkout
3. Enjoy your savings!

Terms and conditions apply. This offer cannot be combined with other promotions.

Thank you for choosing us!

Warm regards,
[Your Business Name]`
    },
    announcement: {
      subject: '📢 Important Update from [Business Name]',
      message: `Dear Valued Customer,

We wanted to reach out with some important news and updates about our business.

📋 What's New:
- [Update 1]
- [Update 2]
- [Update 3]

We're committed to providing you with the best service and experience possible. These updates are designed to serve you better.

If you have any questions or concerns, please don't hesitate to reach out to us.

Thank you for your continued support!

Best wishes,
[Your Business Name] Team`
    },
    custom: {
      subject: '',
      message: ''
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [businessId]);

  useEffect(() => {
    if (customers.length > 0) {
      extractUniqueEmails();
    }
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      console.log('Fetching customers for business ID:', businessId);
      
      if (!user) {
        console.error('No user found - authentication required');
        throw new Error('Authentication required');
      }

      const token = await user.getIdToken();
      console.log('Got Firebase token, making API request...');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/customers/business/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched customers:', data);
      console.log('Number of customers:', data.length);
      
      setCustomers(data);
      
      // Show success message if customers were loaded
      if (data.length > 0) {
        toast.success(`Loaded ${data.length} customers successfully`);
      } else {
        toast.info('No customers found for this business');
      }
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error(`Failed to load customers: ${error.message}`);
      // Set empty array on error to show "no customers" message
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const extractUniqueEmails = () => {
    console.log('Extracting unique emails from customers:', customers);
    const emailMap = new Map();
    
    customers.forEach(customer => {
      console.log('Processing customer:', customer.name, customer.email);
      
      // Include customers with valid email addresses (not the default placeholder)
      if (customer.email && 
          customer.email !== 'no-email@example.com' && 
          customer.email.includes('@') &&
          customer.email.includes('.')) {
        
        const email = customer.email.toLowerCase();
        if (!emailMap.has(email)) {
          emailMap.set(email, {
            email: customer.email,
            name: customer.name || 'Unknown Customer',
            joinDate: customer.createdAt,
            reviewCount: customer.reviews?.length || 0,
            lastReview: customer.reviews?.length > 0 ? 
              customer.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt : null
          });
        }
      }
    });
    
    const uniqueEmailsArray = Array.from(emailMap.values());
    console.log('Unique emails extracted:', uniqueEmailsArray);
    setUniqueEmails(uniqueEmailsArray);
  };

  const filteredEmails = uniqueEmails.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(customer => customer.email));
    }
  };

  const handleSelectEmail = (email) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleTemplateSelect = (templateType) => {
    const template = emailTemplates[templateType];
    setEmailCampaign(prev => ({
      ...prev,
      type: templateType,
      subject: template.subject,
      message: template.message
    }));
  };

  const handleSendEmails = async () => {
    if (selectedEmails.length === 0) {
      toast.error('Please select at least one email address');
      return;
    }

    if (!emailCampaign.subject || !emailCampaign.message) {
      toast.error('Please fill in the subject and message');
      return;
    }

    try {
      setSending(true);
      
      const token = await user.getIdToken();

      // Prepare email data
      let processedMessage = emailCampaign.message;
      
      // Replace placeholders in message
      if (emailCampaign.type === 'coupon') {
        processedMessage = processedMessage
          .replace('[COUPON_CODE]', emailCampaign.couponCode)
          .replace('[DISCOUNT]', emailCampaign.discount)
          .replace('[VALID_UNTIL]', emailCampaign.validUntil);
      }

      const emailData = {
        businessId,
        recipients: selectedEmails,
        subject: emailCampaign.subject,
        message: processedMessage,
        campaignType: emailCampaign.type,
        couponData: emailCampaign.type === 'coupon' ? {
          code: emailCampaign.couponCode,
          discount: emailCampaign.discount,
          validUntil: emailCampaign.validUntil
        } : null
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/email/send-campaign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      const result = await response.json();
      toast.success(`Successfully sent ${selectedEmails.length} emails!`);
      
      // Reset form
      setSelectedEmails([]);
      setEmailCampaign({
        subject: '',
        message: '',
        type: 'promotion',
        couponCode: '',
        discount: '',
        validUntil: ''
      });
      
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading customers...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-7 h-7 text-blue-600" />
              Email Marketing
            </h2>
            <p className="text-gray-600 mt-1">
              Send promotional emails, coupons, and announcements to your customers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{uniqueEmails.length}</div>
                <div className="text-sm text-blue-600">Unique Customers</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">{selectedEmails.length}</div>
                <div className="text-sm text-green-600">Selected Recipients</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Send className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">{customers.length}</div>
                <div className="text-sm text-purple-600">Total Customers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipients</h3>
            
            {/* Search and Select All */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {selectedEmails.length === filteredEmails.length ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {selectedEmails.length === filteredEmails.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Customer List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No customers with valid email addresses found</p>
                <p className="text-sm mt-2">Total customers in database: {customers.length}</p>
                {customers.length > 0 && (
                  <div className="mt-3 text-xs text-gray-400">
                    <p>Customers without valid emails:</p>
                    {customers.slice(0, 3).map((customer, idx) => (
                      <div key={idx} className="mt-1">
                        {customer.name}: {customer.email || 'No email'}
                      </div>
                    ))}
                    {customers.length > 3 && <div className="mt-1">... and {customers.length - 3} more</div>}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredEmails.map((customer, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(customer.email)}
                      onChange={() => handleSelectEmail(customer.email)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{customer.name}</div>
                      <div className="text-sm text-gray-500 truncate">{customer.email}</div>
                      <div className="text-xs text-gray-400">
                        {customer.reviewCount} reviews • Joined {new Date(customer.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Composer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Email Campaign</h3>
            
            {/* Email Templates */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTemplateSelect('promotion')}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    emailCampaign.type === 'promotion' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Gift className="w-5 h-5 mb-1" />
                  <div className="font-medium text-sm">Promotion</div>
                </button>
                <button
                  onClick={() => handleTemplateSelect('coupon')}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    emailCampaign.type === 'coupon' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Percent className="w-5 h-5 mb-1" />
                  <div className="font-medium text-sm">Coupon</div>
                </button>
                <button
                  onClick={() => handleTemplateSelect('announcement')}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    emailCampaign.type === 'announcement' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 mb-1" />
                  <div className="font-medium text-sm">Announcement</div>
                </button>
                <button
                  onClick={() => handleTemplateSelect('custom')}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    emailCampaign.type === 'custom' 
                      ? 'border-orange-500 bg-orange-50 text-orange-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mail className="w-5 h-5 mb-1" />
                  <div className="font-medium text-sm">Custom</div>
                </button>
              </div>
            </div>

            {/* Coupon Details (if coupon template selected) */}
            {emailCampaign.type === 'coupon' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3 bg-green-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-green-800 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="SAVE20"
                    value={emailCampaign.couponCode}
                    onChange={(e) => setEmailCampaign(prev => ({ ...prev, couponCode: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-800 mb-1">Discount %</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={emailCampaign.discount}
                    onChange={(e) => setEmailCampaign(prev => ({ ...prev, discount: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-800 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={emailCampaign.validUntil}
                    onChange={(e) => setEmailCampaign(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            )}

            {/* Email Subject */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
              <input
                type="text"
                placeholder="Enter email subject..."
                value={emailCampaign.subject}
                onChange={(e) => setEmailCampaign(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Email Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                placeholder="Write your email message here..."
                value={emailCampaign.message}
                onChange={(e) => setEmailCampaign(prev => ({ ...prev, message: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendEmails}
              disabled={selectedEmails.length === 0 || !emailCampaign.subject || !emailCampaign.message || sending}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Emails...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send to {selectedEmails.length} Recipients
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailMarketing;