const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const { validateReviewText } = require('../utils/textValidation');

const prisma = new PrismaClient();

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
  }

  /**
   * Enhance a customer review using AI
   */
  async enhanceReview(reviewId, originalText, businessContext = {}) {
    const startTime = Date.now();
    let success = true;
    let errorMessage = null;
    
    try {
      console.log('🤖 Enhancing review with AI:', { reviewId, originalText });

      // Validate text quality before processing
      const textValidation = validateReviewText(originalText);
      if (!textValidation.isValid) {
        throw new Error(`Invalid review content: ${textValidation.errors.join(', ')}`);
      }

      // Get or create default prompt template
      const promptTemplate = await this.getPromptTemplate('REVIEW_ENHANCEMENT', businessContext.businessId);
      
      // Build the enhancement prompt
      const prompt = this.buildEnhancementPrompt(originalText, businessContext, promptTemplate);
      
      // Generate enhanced review with Gemini
      const result = await this.model.generateContent(prompt);
      const enhancedText = result.response.text();
      
      // Analyze sentiment and extract keywords
      const analysis = await this.analyzeReview(enhancedText);
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(originalText, enhancedText);
      
      // Save AI generation record
      const aiGeneration = await prisma.aIReviewGeneration.create({
        data: {
          reviewId,
          originalText,
          enhancedText,
          confidence,
          sentiment: analysis.sentiment,
          keywords: JSON.stringify(analysis.keywords),
          improvements: JSON.stringify(analysis.improvements),
          status: 'PENDING'
        }
      });

      // Update review status
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          generatedReview: enhancedText,
          status: 'AI_GENERATED'
        }
      });

      // Record usage analytics
      await this.recordUsage({
        businessId: businessContext.businessId,
        operation: 'REVIEW_ENHANCEMENT',
        tokensUsed: this.estimateTokens(prompt + enhancedText),
        responseTime: Date.now() - startTime,
        success: true
      });

      console.log('✅ Review enhanced successfully:', aiGeneration.id);
      return aiGeneration;

    } catch (error) {
      success = false;
      errorMessage = error.message;
      
      console.error('❌ Error enhancing review:', error);
      
      // Record failed usage
      await this.recordUsage({
        businessId: businessContext.businessId,
        operation: 'REVIEW_ENHANCEMENT',
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
        success: false,
        errorMessage
      });

      throw new Error(`Failed to enhance review: ${error.message}`);
    }
  }

  /**
   * Analyze review sentiment and extract insights
   */
  async analyzeReview(reviewText) {
    try {
      const analysisPrompt = `
        Analyze the following review and provide:
        1. Sentiment (positive/negative/neutral)
        2. Key themes/keywords (max 5)
        3. Areas for improvement suggestions (max 3)
        
        Review: "${reviewText}"
        
        Respond in JSON format:
        {
          "sentiment": "positive|negative|neutral",
          "keywords": ["keyword1", "keyword2", ...],
          "improvements": ["improvement1", "improvement2", ...]
        }
      `;

      const result = await this.model.generateContent(analysisPrompt);
      const response = result.response.text();
      
      // Parse JSON response
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse);
      
    } catch (error) {
      console.error('Error analyzing review:', error);
      return {
        sentiment: 'neutral',
        keywords: [],
        improvements: []
      };
    }
  }

  /**
   * Build enhancement prompt with context
   */
  buildEnhancementPrompt(originalText, businessContext, template) {
    const basePrompt = template?.promptText || `
      You are a skilled content writer who helps customers express their experiences in a natural, human way that sounds authentic and genuine.
      
      CRITICAL REQUIREMENTS:
      - First, improve the user's original text: fix capitalization, grammar, and spelling naturally
      - Build the enhanced review around this improved text as the foundation
      - Make it sound like a real person wrote it - warm, personal, and conversational
      - Use natural speaking patterns that people actually use
      - Include personal elements: "I", "my experience", "I really", "I noticed"
      - Write like someone talking to a friend about their experience
      - Avoid corporate or overly polished language
      
      Human Writing Style:
      - Start personally: "I recently went to", "I had the chance to visit", "I stopped by"
      - Use natural expressions: "What struck me...", "I have to mention...", "The thing that stood out..."
      - Include genuine emotions: "I was really happy with...", "I was surprised by how...", "I felt like..."
      - Add relatable details that feel authentic and specific
      - Use everyday language and contractions (I'm, it's, they're, wasn't)
      - Vary sentence structure naturally - some short, some longer
      - End with honest recommendations from personal perspective
      
      Business Context:
      - Business Name: ${businessContext.businessName || 'the business'}
      - Business Type: ${businessContext.businessType || 'service provider'}
      - Industry: ${businessContext.industry || 'various services'}
      
      User's Original Words: "${originalText}"
      
      Transform this into a natural, human-sounding review that feels like a real customer sharing their genuine experience:
    `;

    return basePrompt;
  }

  /**
   * Get prompt template for specific category
   */
  async getPromptTemplate(category, businessId = null) {
    try {
      // First try to get business-specific template
      if (businessId) {
        const businessTemplate = await prisma.aIPromptTemplate.findFirst({
          where: {
            businessId,
            category,
            isActive: true
          }
        });
        if (businessTemplate) return businessTemplate;
      }

      // Fall back to default template
      const defaultTemplate = await prisma.aIPromptTemplate.findFirst({
        where: {
          businessId: null,
          category,
          isDefault: true,
          isActive: true
        }
      });

      return defaultTemplate;
    } catch (error) {
      console.error('Error getting prompt template:', error);
      return null;
    }
  }

  /**
   * Calculate confidence score for enhancement
   */
  calculateConfidence(original, enhanced) {
    // Simple confidence calculation based on:
    // - Length improvement
    // - Structural improvements
    // - Grammar corrections
    
    const originalWords = original.split(' ').length;
    const enhancedWords = enhanced.split(' ').length;
    
    let confidence = 0.7; // Base confidence
    
    // Bonus for reasonable length increase
    if (enhancedWords > originalWords && enhancedWords <= originalWords * 2) {
      confidence += 0.1;
    }
    
    // Bonus for capitalization and punctuation
    if (enhanced.includes('.') && enhanced[0] === enhanced[0].toUpperCase()) {
      confidence += 0.1;
    }
    
    // Cap confidence at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Estimate token usage for cost tracking
   */
  estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Record AI usage analytics
   */
  async recordUsage(data) {
    try {
      await prisma.aIUsageAnalytics.create({ data });
    } catch (error) {
      console.error('Error recording AI usage:', error);
    }
  }

  /**
   * Approve AI generated review
   */
  async approveReview(reviewId, approvedBy) {
    try {
      const aiGeneration = await prisma.aIReviewGeneration.update({
        where: { reviewId },
        data: {
          status: 'APPROVED',
          approvedBy,
          approvedAt: new Date()
        }
      });

      await prisma.review.update({
        where: { id: reviewId },
        data: { status: 'APPROVED' }
      });

      return aiGeneration;
    } catch (error) {
      console.error('Error approving review:', error);
      throw new Error('Failed to approve review');
    }
  }

  /**
   * Reject AI generated review
   */
  async rejectReview(reviewId, rejectionNote) {
    try {
      const aiGeneration = await prisma.aIReviewGeneration.update({
        where: { reviewId },
        data: {
          status: 'REJECTED',
          rejectionNote
        }
      });

      await prisma.review.update({
        where: { id: reviewId },
        data: { status: 'PENDING' }
      });

      return aiGeneration;
    } catch (error) {
      console.error('Error rejecting review:', error);
      throw new Error('Failed to reject review');
    }
  }

  /**
   * Regenerate review with different approach
   */
  async regenerateReview(reviewId, customPrompt = null) {
    try {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
          aiGeneration: true,
          business: true
        }
      });

      if (!review) {
        throw new Error('Review not found');
      }

      // Mark previous generation as regenerated
      if (review.aiGeneration) {
        await prisma.aIReviewGeneration.update({
          where: { reviewId },
          data: { status: 'REGENERATED' }
        });
      }

      // Generate new version
      const businessContext = {
        businessId: review.businessId,
        businessName: review.business.name,
        businessType: review.business.type
      };

      return await this.enhanceReview(reviewId, review.feedback, businessContext);
    } catch (error) {
      console.error('Error regenerating review:', error);
      throw new Error('Failed to regenerate review');
    }
  }

  /**
   * Get AI analytics for business
   */
  async getAIAnalytics(businessId, startDate, endDate) {
    try {
      const analytics = await prisma.aIUsageAnalytics.groupBy({
        by: ['operation'],
        where: {
          businessId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        },
        _sum: {
          tokensUsed: true,
          estimatedCost: true
        },
        _avg: {
          responseTime: true
        }
      });

      const successRate = await prisma.aIUsageAnalytics.groupBy({
        by: ['success'],
        where: {
          businessId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      });

      return {
        operationStats: analytics,
        successRate,
        totalUsage: analytics.reduce((sum, op) => sum + op._count.id, 0),
        totalCost: analytics.reduce((sum, op) => sum + (op._sum.estimatedCost || 0), 0)
      };
    } catch (error) {
      console.error('Error getting AI analytics:', error);
      throw new Error('Failed to get AI analytics');
    }
  }
}

module.exports = new AIService();