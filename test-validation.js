async function testGibberishValidation() {
  try {
    console.log('Testing gibberish validation...');
    
    const response = await fetch('http://localhost:3001/api/ai/enhance-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalText: 'mmjihvc78;,\'[pkop-[;,',
        businessContext: {
          businessName: 'Test Business'
        }
      })
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (!response.ok && result.errors) {
      console.log('✅ Validation working! Errors:', result.errors);
    } else if (response.ok) {
      console.log('❌ Validation not working - gibberish was accepted');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Run test
testGibberishValidation();