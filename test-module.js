// Simple test to check module loading
import('./src/domain/ai/types/AITypes.ts')
  .then(module => {
    console.log('✅ AITypes module loaded successfully');
    console.log('Available exports:', Object.keys(module));
  })
  .catch(error => {
    console.error('❌ Failed to load AITypes module:', error);
  }); 