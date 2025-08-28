import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, #286986 0%, #1e5a73 100%)',
  color: 'white',
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: theme.spacing(1),
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: 'white',
    position: 'relative',
    transform: 'none',
    fontSize: '1rem',
    marginBottom: theme.spacing(1),
    '&.Mui-focused': {
      color: 'white',
    },
    '&.MuiInputLabel-shrink': {
      transform: 'none',
    },
  },
  '& .MuiInputLabel-outlined': {
    transform: 'none',
    position: 'relative',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #286986 30%, #1e5a73 90%)',
  border: 0,
  borderRadius: theme.spacing(1),
  boxShadow: '0 3px 5px 2px rgba(40, 105, 134, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  '&:hover': {
    background: 'linear-gradient(45deg, #1e5a73 30%, #0f3d52 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 2px rgba(30, 90, 115, .3)',
  },
  '&:disabled': {
    background: 'rgba(255,255,255,0.3)',
    color: 'rgba(255,255,255,0.7)',
  },
}));

const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/waitlist/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <StyledPaper>
          <CheckCircleIcon sx={{ fontSize: 60, mb: 2, color: '#4CAF50' }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            You're on the list! 🎉
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Thank you for joining our waitlist!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            We've sent a confirmation email to your inbox. You'll be among the first to know when VidZyme launches!
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setSuccess(false)}
            sx={{ 
              mt: 3, 
              color: 'white', 
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Join Another Email
          </Button>
        </StyledPaper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <StyledPaper>
        <EmailIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Join the VidZyme Waitlist
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
          Be the first to transform your images into viral videos
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
          Get early access to VidZyme and turn your product photos into professional UGC videos in seconds!
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              mb: 1,
              fontWeight: 500,
              fontSize: '1rem'
            }}
          >
            Enter your email address
          </Typography>
          <StyledTextField
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            placeholder="your@email.com"
          />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
              {error}
            </Alert>
          )}
          
          <StyledButton
            type="submit"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Joining Waitlist...' : 'Join Waitlist'}
          </StyledButton>
        </Box>
        
        <Typography variant="caption" sx={{ mt: 3, opacity: 0.7, display: 'block' }}>
          We respect your privacy. No spam, just updates about VidZyme.
        </Typography>
      </StyledPaper>
    </Container>
  );
};

export default WaitlistForm;