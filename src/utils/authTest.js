import { authAPI } from '../services/api';
import { auth } from '../config/firebase';

export const testAuthentication = async () => {
  console.log('=== Detailed Authentication Test ===');
  
  // Check current user
  const currentUser = auth.currentUser;
  console.log('Current User:', currentUser);
  console.log('User UID:', currentUser?.uid);
  console.log('User Email:', currentUser?.email);
  
  if (!currentUser) {
    console.error('No authenticated user found');
    return { success: false, error: 'No authenticated user' };
  }
  
  try {
    // Get fresh ID token
    console.log('Getting fresh ID token...');
    const idToken = await currentUser.getIdToken(true);
    console.log('ID Token obtained:', idToken ? 'Yes' : 'No');
    console.log('Token length:', idToken?.length);
    console.log('Token preview:', idToken?.substring(0, 50) + '...');
    
    // Test API call
    console.log('Testing auth API call...');
    
    console.log('Making API call...');
    const result = await authAPI.verifyToken();
    
    console.log('API call successful!');
    console.log('Result:', result);
    
    return { success: true, data: result };
    
  } catch (error) {
    console.error('Authentication test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Additional debugging info
    if (error.code === 'functions/unauthenticated') {
      console.log('\n=== Debugging Authentication Issue ===');
      console.log('This error suggests the function cannot verify the user\'s authentication.');
      console.log('Possible causes:');
      console.log('1. Token not being sent properly');
      console.log('2. Function region mismatch');
      console.log('3. Project configuration mismatch');
      console.log('4. Function deployment issue');
      
      // Check if we can get token manually
      try {
        const token = await currentUser.getIdToken();
        console.log('Manual token retrieval successful, length:', token.length);
      } catch (tokenError) {
        console.log('Manual token retrieval failed:', tokenError.message);
      }
    }
    
    return { success: false, error: error.message, code: error.code };
  }
};

export const testFunctionConnection = async () => {
  console.log('=== Testing API Connection ===');
  
  try {
    // Test if we can connect to the backend API
    const { healthAPI } = await import('../services/api');
    const healthResult = await healthAPI.checkHealth();
    console.log('API health check successful:', healthResult);
    
    return { success: true, data: healthResult };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, error: error.message };
  }
};