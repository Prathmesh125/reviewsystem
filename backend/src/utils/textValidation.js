/**
 * Text validation utilities for preventing gibberish and ensuring quality content
 */

/**
 * Check if text contains meaningful content (not gibberish)
 */
function isValidMeaningfulText(text) {
  if (!text || typeof text !== 'string') return false;
  
  // Remove extra whitespace
  const cleanedText = text.trim();
  
  // Basic length check
  if (cleanedText.length < 5 || cleanedText.length > 5000) return false;
  
  // Check for minimum word count (at least 2 words)
  const words = cleanedText.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 2) return false;
  
  // Check for gibberish patterns
  if (isGibberish(cleanedText)) return false;
  
  // Check for meaningful content
  if (!hasMeaningfulContent(cleanedText)) return false;
  
  return true;
}

/**
 * Detect gibberish text patterns
 */
function isGibberish(text) {
  const cleanedText = text.toLowerCase().replace(/[^a-z\s]/g, '');
  
  // Pattern 1: Too many consecutive consonants or vowels
  const consecutivePattern = /([bcdfghjklmnpqrstvwxyz]{5,}|[aeiou]{4,})/g;
  if (consecutivePattern.test(cleanedText)) return true;
  
  // Pattern 2: Repetitive character patterns
  const repetitivePattern = /(.)\1{4,}/g;
  if (repetitivePattern.test(text)) return true;
  
  // Pattern 3: Random keyboard mashing patterns
  const keyboardPatterns = [
    /qwerty|asdf|zxcv|hjkl/gi,
    /123456|abcdef|[a-z]{6,}[0-9]{3,}/gi,
    /[;',./]{3,}|[\[\]]{2,}|[{}]{2,}/g
  ];
  
  for (const pattern of keyboardPatterns) {
    if (pattern.test(text)) return true;
  }
  
  // Pattern 4: Too many special characters relative to letters
  const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
  
  if (letterCount > 0 && specialCharCount / letterCount > 0.5) return true;
  
  // Pattern 5: No vowels in words longer than 3 characters
  const words = cleanedText.split(/\s+/);
  let noVowelWords = 0;
  
  for (const word of words) {
    if (word.length > 3 && !/[aeiou]/i.test(word)) {
      noVowelWords++;
    }
  }
  
  // If more than 50% of words have no vowels, it's likely gibberish
  if (words.length > 0 && noVowelWords / words.length > 0.5) return true;
  
  return false;
}

/**
 * Check if text contains meaningful content
 */
function hasMeaningfulContent(text) {
  const cleanedText = text.toLowerCase().replace(/[^a-z\s]/g, '');
  const words = cleanedText.split(/\s+/).filter(word => word.length > 0);
  
  // Common English words that suggest meaningful content
  const commonWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'this', 'that', 'these', 'those', 'here', 'there', 'where', 'when', 'why', 'how',
    'good', 'great', 'bad', 'nice', 'excellent', 'amazing', 'terrible', 'awful',
    'service', 'product', 'quality', 'price', 'staff', 'customer', 'experience',
    'recommend', 'satisfied', 'disappointed', 'happy', 'unhappy', 'love', 'hate',
    'fast', 'slow', 'quick', 'easy', 'hard', 'clean', 'dirty', 'friendly', 'rude',
    'food', 'restaurant', 'store', 'shop', 'business', 'company', 'place',
    'time', 'day', 'week', 'month', 'year', 'today', 'yesterday', 'tomorrow'
  ];
  
  // Review-specific keywords
  const reviewKeywords = [
    'ordered', 'bought', 'purchased', 'visited', 'went', 'tried', 'used',
    'delivery', 'shipping', 'arrived', 'received', 'package',
    'star', 'stars', 'rating', 'review', 'feedback', 'opinion',
    'thank', 'thanks', 'grateful', 'appreciate', 'impressed',
    'disappointed', 'frustrated', 'satisfied', 'pleased', 'happy',
    'money', 'worth', 'value', 'expensive', 'cheap', 'affordable',
    'return', 'refund', 'exchange', 'warranty', 'guarantee'
  ];
  
  const allMeaningfulWords = [...commonWords, ...reviewKeywords];
  
  // Check if at least 30% of words are meaningful
  let meaningfulWordCount = 0;
  for (const word of words) {
    if (allMeaningfulWords.includes(word) || word.length >= 4) {
      meaningfulWordCount++;
    }
  }
  
  const meaningfulRatio = meaningfulWordCount / words.length;
  
  // Require at least 30% meaningful words for short text, 20% for longer text
  const requiredRatio = words.length <= 10 ? 0.3 : 0.2;
  
  return meaningfulRatio >= requiredRatio;
}

/**
 * Validate text for review enhancement
 */
function validateReviewText(text) {
  const errors = [];
  
  if (!text || typeof text !== 'string') {
    errors.push('Text is required and must be a string');
    return { isValid: false, errors };
  }
  
  const trimmedText = text.trim();
  
  if (trimmedText.length < 10) {
    errors.push('Review must be at least 10 characters long');
  }
  
  if (trimmedText.length > 5000) {
    errors.push('Review must not exceed 5000 characters');
  }
  
  if (!isValidMeaningfulText(trimmedText)) {
    errors.push('Please provide a meaningful review with proper words. Random characters or gibberish text is not allowed.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get suggestions for improving review text
 */
function getTextImprovementSuggestions(text) {
  const suggestions = [];
  
  if (!text || text.trim().length < 20) {
    suggestions.push('Try to provide more details about your experience');
  }
  
  const words = text.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 5) {
    suggestions.push('Consider adding more specific details about what you liked or disliked');
  }
  
  // Check for lack of descriptive words
  const descriptiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'terrible', 'awful', 'bad', 'poor', 'fantastic', 'outstanding', 'disappointing'];
  const hasDescriptiveWords = descriptiveWords.some(word => text.toLowerCase().includes(word));
  
  if (!hasDescriptiveWords) {
    suggestions.push('Try including words that describe your experience (e.g., excellent, disappointing, helpful)');
  }
  
  return suggestions;
}

module.exports = {
  isValidMeaningfulText,
  isGibberish,
  hasMeaningfulContent,
  validateReviewText,
  getTextImprovementSuggestions
};