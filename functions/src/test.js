const { createVideo } = require('./orchestration');

// Test the rebuilt pipeline
async function testPipeline() {
  console.log('Testing the rebuilt video creation pipeline...');
  
  try {
    const testInput = {
      imageUrl: 'https://example.com/test-image.jpg',
      userPrompt: 'Create a casual UGC video showcasing this product',
      videoStyle: 'social',
      duration: 10,
      aspectRatio: '9:16',
      quality: 'standard',
      userId: 'test-user-123',
      enableFrameContinuity: true
    };
    
    console.log('Input:', JSON.stringify(testInput, null, 2));
    
    // Test individual components first
    console.log('\n=== Testing Individual Components ===');
    
    // Test image analysis
    const { analyzeImage } = require('./imageAnalysis');
    console.log('✓ Image analysis module loaded');
    
    // Test prompt generation
    const { generatePrompts, generateImagePrompt } = require('./promptGeneration');
    console.log('✓ Prompt generation module loaded');
    
    // Test video prompt generation
    const { generateVideoPrompts } = require('./videoPromptGeneration');
    console.log('✓ Video prompt generation module loaded');
    
    // Test image generation
    const { generateImages } = require('./imageGeneration');
    console.log('✓ Image generation module loaded');
    
    // Test video generation
    const { generateVideos } = require('./videoGeneration');
    console.log('✓ Video generation module loaded');
    
    // Test orchestration
    console.log('✓ Orchestration module loaded');
    
    console.log('\n=== All modules loaded successfully! ===');
    console.log('\nPipeline structure verification complete.');
    console.log('\nNote: Full end-to-end testing requires valid API keys and image URLs.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testPipeline().then(() => {
  console.log('\n✅ Pipeline test completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Pipeline test failed:', error);
  process.exit(1);
});