import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const AIEnhanceButton = ({ review, businessId, onEnhanced, className = '' }) => {
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState(null);

  const handleEnhance = async () => {
    try {
      setEnhancing(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/ai/enhance-review', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviewId: review.id,
          businessContext: {
            businessId: businessId
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enhance review');
      }

      const data = await response.json();
      
      // Call the callback function to notify parent component
      if (onEnhanced) {
        onEnhanced(data.data);
      }

    } catch (error) {
      console.error('Error enhancing review:', error);
      setError(error.message);
    } finally {
      setEnhancing(false);
    }
  };

  // Don't show button if review already has AI enhancement
  if (review.status === 'AI_GENERATED' || review.status === 'APPROVED') {
    return (
      <div className="flex items-center space-x-2 text-sm text-green-600">
        <Sparkles className="w-4 h-4" />
        <span>AI Enhanced</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleEnhance}
        disabled={enhancing}
        className={`flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {enhancing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        <span>{enhancing ? 'Enhancing...' : 'Enhance with AI'}</span>
      </button>
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default AIEnhanceButton;