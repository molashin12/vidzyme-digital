import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Box, Typography, Paper, Alert } from '@mui/material';
import { auth } from '../../config/firebase';
import { testAuthentication, testFunctionConnection } from '../../utils/authTest';

function AuthTest() {
  const { currentUser, userProfile } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAuthTest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // First test function connection
      const connectionTest = await testFunctionConnection();
      console.log('Connection test result:', connectionTest);
      
      // Then test authentication
      const authTest = await testAuthentication();
      console.log('Auth test result:', authTest);
      
      setTestResult({
        connection: connectionTest,
        authentication: authTest,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    try {
      // Quick test login with demo credentials
      const { login } = useAuth();
      await login('test@vidzyme.com', 'testpassword123');
      console.log('Quick login successful');
    } catch (error) {
      console.error('Quick login failed:', error);
    }
  };

  const renderTestResult = () => {
    if (!testResult) return null;

    if (testResult.error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6">Test Failed</Typography>
          <Typography>{testResult.error}</Typography>
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        {testResult.connection && (
          <Alert 
            severity={testResult.connection.success ? "success" : "error"} 
            sx={{ mb: 1 }}
          >
            <Typography variant="h6">Function Connection</Typography>
            <Typography>
              {testResult.connection.success 
                ? "✅ Functions are properly connected" 
                : `❌ Connection failed: ${testResult.connection.error}`
              }
            </Typography>
          </Alert>
        )}
        
        {testResult.authentication && (
          <Alert 
            severity={testResult.authentication.success ? "success" : "error"}
            sx={{ mb: 1 }}
          >
            <Typography variant="h6">Authentication Test</Typography>
            <Typography>
              {testResult.authentication.success 
                ? "✅ Authentication successful! Function call worked." 
                : `❌ Authentication failed: ${testResult.authentication.error}`
              }
            </Typography>
            {testResult.authentication.code && (
              <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                Error Code: {testResult.authentication.code}
              </Typography>
            )}
          </Alert>
        )}
        
        <Typography variant="caption" color="text.secondary">
          Test completed at: {new Date(testResult.timestamp).toLocaleString()}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Authentication Debug Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          Current User: {currentUser ? 'Logged in' : 'Not logged in'}
        </Typography>
        <Typography variant="body2">
          User Email: {currentUser?.email || 'N/A'}
        </Typography>
        <Typography variant="body2">
          User UID: {currentUser?.uid || 'N/A'}
        </Typography>
        <Typography variant="body2">
          User Email: {currentUser?.email || 'N/A'}
        </Typography>
        <Typography variant="body2">
          User UID: {currentUser?.uid || 'N/A'}
        </Typography>
        <Typography variant="body2">
          User Profile: {userProfile ? 'Loaded' : 'Not loaded'}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={runAuthTest}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </Button>
        
        {!currentUser && (
          <Button 
            variant="outlined" 
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </Button>
        )}
        
        <Button 
          variant="outlined" 
          onClick={() => {
            console.log('Current auth state:');
            console.log('- currentUser:', currentUser);
            console.log('- userProfile:', userProfile);
            console.log('- Firebase auth instance:', auth);
          }}
        >
          Log Auth State
        </Button>
      </Box>
      
      {renderTestResult()}
    </Paper>
  );
}

export default AuthTest;