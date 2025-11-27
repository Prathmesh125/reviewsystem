import React, { useState, useEffect } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, RotateCcw, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { auth } from '../../config/firebase';

const AIReviewManager = ({ businessId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    if (user && businessId) {
      fetchAIReviews();
    }
  }, [businessId, filter, user]);

  const getAuthToken = async () => {
    if (!user) throw new Error('User not authenticated');
    return await user.getIdToken();
  };

  const fetchAIReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      const params = new URLSearchParams();
      
      if (filter !== 'all') {
        params.append('status', filter.toUpperCase());
      }

      const response = await fetch(`/api/ai/reviews/${businessId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI reviews');
      }

      const data = await response.json();
      setReviews(data.data.aiGenerations || []);
    } catch (error) {
      console.error('Error fetching AI reviews:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const enhanceReview = async (reviewId, businessContext = {}) => {
    try {
      setEnhancing(true);
      const token = await getAuthToken();

      const response = await fetch('/api/ai/enhance-review', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviewId,
          businessContext
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enhance review');
      }

      const data = await response.json();
      
      // Refresh the reviews list
      await fetchAIReviews();
      
      return data.data;
    } catch (error) {
      console.error('Error enhancing review:', error);
      setError(error.message);
      throw error;
    } finally {
      setEnhancing(false);
    }
  };

  const approveReview = async (reviewId) => {
    try {
      const token = await getAuthToken();

      const response = await fetch(`/api/ai/approve-review/${reviewId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve review');
      }

      // Refresh the reviews list
      await fetchAIReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      setError(error.message);
    }
  };

    const rejectReview = async (reviewId, rejectionNote = '') => {
    try {
      const token = await getAuthToken();

      const response = await fetch(`/api/ai/reject-review/${reviewId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionNote })
      });

      if (!response.ok) {
        throw new Error('Failed to reject review');
      }

      // Refresh the reviews list
      await fetchAIReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      setError(error.message);
    }
  };

  const regenerateReview = async (reviewId) => {
    try {
      const token = await getAuthToken();

      const response = await fetch(`/api/ai/regenerate-review/${reviewId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate review');
      }

      // Refresh the reviews list
      await fetchAIReviews();
    } catch (error) {
      console.error('Error regenerating review:', error);
      setError(error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view AI reviews.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading AI reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Review Enhancement</h2>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                filter === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <div className="mt-2 space-x-2">
            <button 
              onClick={fetchAIReviews}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Enhanced Reviews</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Start enhancing reviews with AI to see them here.'
                : `No reviews with ${filter} status found.`
              }
            </p>
          </div>
        ) : (
          reviews.map((aiGeneration) => (
            <AIReviewCard
              key={aiGeneration.id}
              aiGeneration={aiGeneration}
              onApprove={approveReview}
              onReject={rejectReview}
              onRegenerate={regenerateReview}
              onViewDetails={setSelectedReview}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          ))
        )}
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <ReviewDetailsModal
          aiGeneration={selectedReview}
          onClose={() => setSelectedReview(null)}
          onApprove={approveReview}
          onReject={rejectReview}
          onRegenerate={regenerateReview}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
};

// AI Review Card Component
const AIReviewCard = ({ 
  aiGeneration, 
  onApprove, 
  onReject, 
  onRegenerate, 
  onViewDetails,
  getStatusIcon,
  getStatusColor 
}) => {
  const { review, status, confidence, sentiment } = aiGeneration;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            <span>{status}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Confidence: {Math.round(confidence * 100)}%</span>
            {sentiment && (
              <>
                <span>•</span>
                <span className="capitalize">{sentiment}</span>
              </>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onViewDetails(aiGeneration)}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Customer: {review.customer.name}</div>
        <div className="text-sm text-gray-600">Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Original Review</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {review.feedback}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">AI Enhanced</h4>
          <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
            {aiGeneration.enhancedText}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {status === 'PENDING' && (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onApprove(review.id)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Approve</span>
          </button>
          <button
            onClick={() => onReject(review.id)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Reject</span>
          </button>
          <button
            onClick={() => onRegenerate(review.id)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Regenerate</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Review Details Modal Component
const ReviewDetailsModal = ({ 
  aiGeneration, 
  onClose, 
  onApprove, 
  onReject, 
  onRegenerate,
  getStatusIcon,
  getStatusColor 
}) => {
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { review, status, confidence, sentiment, keywords, improvements } = aiGeneration;
  
  const parsedKeywords = keywords ? JSON.parse(keywords) : [];
  const parsedImprovements = improvements ? JSON.parse(improvements) : [];

  const handleReject = async () => {
    await onReject(review.id, rejectionNote);
    setRejectionNote('');
    setShowRejectForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">AI Review Enhancement Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status and Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(status)}
                <span className="font-medium text-gray-900">Status</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">Confidence</div>
              <div className="text-2xl font-bold text-blue-600">{Math.round(confidence * 100)}%</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">Sentiment</div>
              <div className="text-lg font-medium capitalize text-gray-700">{sentiment || 'N/A'}</div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{review.customer.name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Rating:</span>
                  <span className="ml-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Original Review</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{review.feedback}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">AI Enhanced Version</h4>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-gray-700">{aiGeneration.enhancedText}</p>
              </div>
            </div>
          </div>

          {/* Keywords and Improvements */}
          {(parsedKeywords.length > 0 || parsedImprovements.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {parsedKeywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {parsedImprovements.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Improvements</h4>
                  <ul className="space-y-1">
                    {parsedImprovements.map((improvement, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            {status === 'PENDING' && (
              <>
                <button
                  onClick={() => {
                    onApprove(review.id);
                    onClose();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                
                {!showRejectForm ? (
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Rejection reason (optional)"
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionNote('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    onRegenerate(review.id);
                    onClose();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Regenerate</span>
                </button>
              </>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReviewManager;