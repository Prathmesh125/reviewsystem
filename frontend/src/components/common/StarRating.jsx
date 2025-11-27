import { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating, 
  onRatingChange, 
  size = 'large', 
  readonly = false,
  required = false,
  error = null 
}) => {
  const [hoveredStar, setHoveredStar] = useState(0);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'medium':
        return 'w-8 h-8';
      case 'large':
      default:
        return 'w-10 h-10';
    }
  };

  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!readonly) {
      setHoveredStar(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredStar(0);
    }
  };

  const getStarColor = (starValue) => {
    const effectiveRating = hoveredStar || rating;
    
    if (starValue <= effectiveRating) {
      if (effectiveRating >= 4) return 'text-green-500';
      if (effectiveRating >= 3) return 'text-yellow-500';
      return 'text-red-500';
    }
    
    return 'text-gray-300';
  };

  const getRatingText = () => {
    if (!rating) return '';
    
    const texts = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    
    return texts[rating] || '';
  };

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-center space-x-1"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            disabled={readonly}
            className={`
              ${getSizeClasses()}
              transition-all duration-200 ease-in-out
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 focus:scale-110'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded
              ${getStarColor(starValue)}
            `}
            aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
          >
            <Star 
              className={`w-full h-full transition-all duration-200 ${
                starValue <= (hoveredStar || rating) ? 'fill-current' : ''
              }`}
            />
          </button>
        ))}
      </div>

      {/* Rating text */}
      {rating > 0 && (
        <div className="text-center">
          <span className="text-sm font-medium text-gray-700">
            {getRatingText()}
          </span>
          {!readonly && (
            <span className="text-xs text-gray-500 ml-2">
              ({rating}/5 stars)
            </span>
          )}
        </div>
      )}

      {/* Required indicator */}
      {required && !rating && (
        <div className="text-center">
          <span className="text-xs text-gray-500">
            Please select a rating *
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-center">
          <span className="text-sm text-red-600">
            {error}
          </span>
        </div>
      )}
    </div>
  );
};

export default StarRating;