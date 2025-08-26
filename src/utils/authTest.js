import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../config/firebase';

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
    
    // Test function call
    console.log('Testing getUserStats function call...');
    const getUserStats = httpsCallable(functions, 'getUserStats');
    
    console.log('Function instance created, making call...');
    const result = await getUserStats();
    
    console.log('Function call successful!');
    console.log('Result:', result.data);
    
    return { success: true, data: result.data };
    
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
  console.log('=== Testing Function Connection ===');
  
  try {
    // Test if we can create the function reference
    const getUserStats = httpsCallable(functions, 'getUserStats');
    console.log('Function reference created successfully');
    
    // Check functions configuration
    console.log('Functions app:', functions.app.name);
    console.log('Functions region:', functions._region);
    
    return { success: true };
  } catch (error) {
    console.error('Function connection test failed:', error);
    return { success: false, error: error.message };
  }
};