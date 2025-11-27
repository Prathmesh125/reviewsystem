/**
 * Text formatting and cleanup utilities
 */

/**
 * Clean up and improve user input text formatting
 */
function improveTextFormatting(text) {
  if (!text || typeof text !== 'string') return text;
  
  let improved = text.trim();
  
  // Fix basic capitalization
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);
  
  // Fix common spacing issues
  improved = improved.replace(/\s+/g, ' '); // Multiple spaces to single space
  improved = improved.replace(/\s*,\s*/g, ', '); // Fix comma spacing
  improved = improved.replace(/\s*\.\s*/g, '. '); // Fix period spacing
  improved = improved.replace(/\s*!\s*/g, '! '); // Fix exclamation spacing
  improved = improved.replace(/\s*\?\s*/g, '? '); // Fix question mark spacing
  
  // Fix capitalization after periods
  improved = improved.replace(/\.\s+([a-z])/g, (match, letter) => '. ' + letter.toUpperCase());
  
  // Fix capitalization after exclamation marks
  improved = improved.replace(/!\s+([a-z])/g, (match, letter) => '! ' + letter.toUpperCase());
  
  // Fix capitalization after question marks
  improved = improved.replace(/\?\s+([a-z])/g, (match, letter) => '? ' + letter.toUpperCase());
  
  // Capitalize 'I' when it appears as a standalone word
  improved = improved.replace(/\bi\b/g, 'I');
  
  // Common word capitalizations
  const properNouns = ['google', 'facebook', 'instagram', 'twitter', 'linkedin', 'youtube'];
  properNouns.forEach(noun => {
    const regex = new RegExp(`\\b${noun}\\b`, 'gi');
    improved = improved.replace(regex, noun.charAt(0).toUpperCase() + noun.slice(1));
  });
  
  // Fix common contractions
  const contractions = {
    'dont': "don't",
    'cant': "can't", 
    'wont': "won't",
    'isnt': "isn't",
    'arent': "aren't",
    'wasnt': "wasn't",
    'werent': "weren't",
    'havent': "haven't",
    'hasnt': "hasn't",
    'hadnt': "hadn't",
    'wouldnt': "wouldn't",
    'couldnt': "couldn't",
    'shouldnt': "shouldn't",
    'im': "I'm",
    'ive': "I've",
    'ill': "I'll",
    'id': "I'd",
    'youre': "you're",
    'youve': "you've",
    'youll': "you'll",
    'youd': "you'd",
    'theyre': "they're",
    'theyve': "they've",
    'theyll': "they'll",
    'theyd': "they'd",
    'were': "we're",
    'weve': "we've",
    'well': "we'll",
    'wed': "we'd",
    'its': "it's",
    'thats': "that's",
    'whats': "what's",
    'heres': "here's",
    'theres': "there's",
    'wheres': "where's"
  };
  
  Object.keys(contractions).forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    improved = improved.replace(regex, contractions[word]);
  });
  
  // Ensure text ends with proper punctuation
  const lastChar = improved.trim().slice(-1);
  if (!['.', '!', '?'].includes(lastChar)) {
    improved = improved.trim() + '.';
  }
  
  return improved.trim();
}

/**
 * Extract and improve key phrases from user input
 */
function extractKeyPhrases(text) {
  const improved = improveTextFormatting(text);
  
  // Split into sentences and phrases
  const sentences = improved.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const phrases = [];
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length > 0) {
      // Capitalize first letter if not already
      const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      phrases.push(capitalized);
    }
  });
  
  return phrases;
}

/**
 * Enhance text while preserving user's core message
 */
function enhanceWithFormatting(originalText, enhancedText) {
  // Get improved formatting of original text
  const improvedOriginal = improveTextFormatting(originalText);
  
  // If the enhanced text doesn't include the improved original text well, 
  // make sure it's prominently featured
  if (!enhancedText.toLowerCase().includes(improvedOriginal.toLowerCase().substring(0, 10))) {
    // The enhancement should build around the improved original text
    return enhancedText.replace(originalText, improvedOriginal);
  }
  
  return enhancedText;
}

module.exports = {
  improveTextFormatting,
  extractKeyPhrases,
  enhanceWithFormatting
};