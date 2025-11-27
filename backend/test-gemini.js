const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  try {
    console.log('Testing Gemini 2.5 Flash model...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    
    const testPrompt = `
      You are an expert content writer helping customers improve their reviews. 
      Your task is to enhance the following customer feedback while maintaining its authenticity and key message.
      
      Guidelines:
      - Keep the original sentiment and meaning intact
      - Improve grammar, clarity, and professionalism  
      - Make it more detailed and helpful for other customers
      - Maintain the customer's voice and tone
      - Add relevant context when appropriate
      - Keep it genuine and believable
      - Make it SEO-friendly with natural keywords
      
      Business Context:
      - Business Name: Test Restaurant
      - Business Type: Restaurant
      
      Original Review: "This place is really good. I liked the food and service."
      
      Please provide an enhanced version that is professional, detailed, and authentic while preserving the customer's original intent and sentiment. Make it suitable for Google Reviews:
    `;
    
    const result = await model.generateContent(testPrompt);
    const enhancedText = result.response.text();
    
    console.log('✅ Success! Enhanced review:');
    console.log(enhancedText);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGemini();