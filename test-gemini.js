require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  const models = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  
  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Enhance this text: "Good service"');
      const response = result.response;
      const text = response.text();
      console.log(`✅ ${modelName} works!`);
      console.log(`Response: ${text.substring(0, 100)}...`);
      break;
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}`);
    }
  }
}

testModels().catch(console.error);