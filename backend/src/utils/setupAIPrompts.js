const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDefaultPrompts() {
  console.log('🔄 Creating default AI prompt templates...');

  try {
    // Review Enhancement Template
    const enhancementTemplate = await prisma.aIPromptTemplate.upsert({
      where: {
        id: 'default-review-enhancement'
      },
      update: {},
      create: {
        id: 'default-review-enhancement',
        name: 'Default Review Enhancement',
        description: 'Standard template for enhancing customer reviews',
        category: 'REVIEW_ENHANCEMENT',
        isDefault: true,
        isActive: true,
        promptText: `You are an expert content writer helping businesses improve customer reviews. 
Your task is to enhance the following customer feedback while maintaining its authenticity and key message.

Guidelines:
- Keep the original sentiment and meaning intact
- Improve grammar, clarity, and professionalism  
- Make it more detailed and helpful for other customers
- Maintain the customer's voice and tone
- Add relevant context when appropriate
- Keep it genuine and believable
- Ensure the enhanced version sounds natural and authentic

Business Context:
- Business Name: {{businessName}}
- Business Type: {{businessType}}
- Industry: {{industry}}

Original Review: "{{originalText}}"

Please provide an enhanced version that is professional, detailed, and authentic while preserving the customer's original intent and sentiment:`,
        variables: JSON.stringify([
          'businessName',
          'businessType', 
          'industry',
          'originalText'
        ])
      }
    });

    // Sentiment Analysis Template
    const sentimentTemplate = await prisma.aIPromptTemplate.upsert({
      where: {
        id: 'default-sentiment-analysis'
      },
      update: {},
      create: {
        id: 'default-sentiment-analysis',
        name: 'Default Sentiment Analysis',
        description: 'Template for analyzing review sentiment and extracting insights',
        category: 'SENTIMENT_ANALYSIS',
        isDefault: true,
        isActive: true,
        promptText: `Analyze the following customer review and provide detailed insights:

Review: "{{reviewText}}"

Please provide your analysis in the following JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0-1.0,
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "themes": ["theme1", "theme2"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"]
}

Focus on:
- Overall sentiment and emotional tone
- Key themes and topics mentioned
- Specific strengths highlighted by the customer
- Areas for potential improvement
- Important keywords for business insights`,
        variables: JSON.stringify([
          'reviewText'
        ])
      }
    });

    // Keyword Extraction Template  
    const keywordTemplate = await prisma.aIPromptTemplate.upsert({
      where: {
        id: 'default-keyword-extraction'
      },
      update: {},
      create: {
        id: 'default-keyword-extraction',
        name: 'Default Keyword Extraction',
        description: 'Template for extracting important keywords and phrases from reviews',
        category: 'KEYWORD_EXTRACTION',
        isDefault: true,
        isActive: true,
        promptText: `Extract important keywords and phrases from the following customer review:

Review: "{{reviewText}}"
Business Type: {{businessType}}

Please identify:
1. Service/Product Keywords - specific services or products mentioned
2. Quality Keywords - words describing quality, performance, or experience
3. Emotion Keywords - words expressing feelings or emotions
4. Action Keywords - words describing actions or processes
5. Comparison Keywords - words comparing to competitors or expectations

Respond in JSON format:
{
  "serviceKeywords": ["keyword1", "keyword2"],
  "qualityKeywords": ["keyword1", "keyword2"], 
  "emotionKeywords": ["keyword1", "keyword2"],
  "actionKeywords": ["keyword1", "keyword2"],
  "comparisonKeywords": ["keyword1", "keyword2"],
  "overallThemes": ["theme1", "theme2"]
}`,
        variables: JSON.stringify([
          'reviewText',
          'businessType'
        ])
      }
    });

    console.log('✅ Default AI prompt templates created successfully');
    console.log(`- Enhancement Template: ${enhancementTemplate.id}`);
    console.log(`- Sentiment Template: ${sentimentTemplate.id}`);
    console.log(`- Keyword Template: ${keywordTemplate.id}`);

  } catch (error) {
    console.error('❌ Error creating default prompt templates:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createDefaultPrompts()
    .then(() => {
      console.log('🎉 Prompt templates setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to setup prompt templates:', error);
      process.exit(1);
    });
}

module.exports = { createDefaultPrompts };