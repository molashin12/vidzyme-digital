import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { CloudUpload, VideoCall, Settings, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, onSnapshot } from 'firebase/firestore';
import { videoAPI } from '../../services/api';
import { storage, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import AuthTest from '../Debug/AuthTest';

function VideoGenerator() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productImage: null,
    prompt: '',
    aspectRatio: '16:9',
    duration: 8,
    videoCount: 1
  });
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState(null);
  const [jobStatus, setJobStatus] = useState('PENDING');

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, productImage: file });
      setError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });



  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const uploadImage = async (file) => {
    const imageId = uuidv4();
    const imageRef = ref(storage, `users/${currentUser.uid}/product-images/${imageId}`);
    
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    
    return { imageId, downloadURL };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== Video Generation Debug Info ===');
    console.log('Current User:', currentUser);
    console.log('User Profile:', userProfile);
    console.log('User UID:', currentUser?.uid);
    console.log('User Email:', currentUser?.email);
    
    if (!formData.productImage) {
      setError('Please upload a product image');
      return;
    }
    
    if (!formData.prompt.trim()) {
      setError('Please provide a prompt for video generation');
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to generate videos');
      console.error('Authentication Error: No current user found');
      return;
    }
    
    if (userProfile && userProfile.videosGenerated >= userProfile.monthlyLimit) {
      setError('You have reached your monthly video generation limit');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setFinalVideoUrl(null);
      setJobStatus('UPLOADING');
      setUploading(true);
      
      // Upload image to Firebase Storage
      const { imageId, downloadURL } = await uploadImage(formData.productImage);
      
      setUploading(false);
      setGenerating(true);
      setJobStatus('GENERATING');
      setShowProgressDialog(true);
      
      // Ensure user is authenticated before calling function
      console.log('Getting authentication token...');
      const idToken = await currentUser.getIdToken(true);
      console.log('ID Token obtained:', idToken ? 'Yes' : 'No');
      console.log('Token length:', idToken?.length);
      console.log('User authenticated, calling videoCreation...');
      
      // Call video creation API
      console.log('Making API request to backend...');
      
      const requestData = {
        imageUrl: downloadURL,
        userPrompt: formData.prompt,
        aspectRatio: formData.aspectRatio,
        duration: formData.duration,
        userId: currentUser.uid
      };
      console.log('Request data:', requestData);
      
      const result = await videoAPI.generateVideo(requestData);
      console.log('API call result:', result);
      
      if (result.success) {
        setFinalVideoUrl(result.finalVideoUrl);
        setSuccess('Video generated successfully!');
        setGenerating(false);
        setJobStatus('COMPLETED');
        setShowProgressDialog(false);
      } else {
        throw new Error(result.error || 'Video generation failed');
      }
      
    } catch (error) {
      console.error('Error creating video job:', error);
      let errorMessage = 'Failed to start video generation. Please try again.';
      
      if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Authentication error. Please log out and log back in.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'Permission denied. Please check your account status.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setUploading(false);
      setGenerating(false);
      setJobStatus('FAILED');
      setShowProgressDialog(false);
    }
  };

  const handleCloseProgressDialog = () => {
    setShowProgressDialog(false);
    if (!generating) {
      // Reset form after completion
      setFormData({
        productImage: null,
        prompt: '',
        aspectRatio: '16:9',
        duration: 8,
        videoCount: 1
      });
      setJobStatus('PENDING');
    }
  };

  const canGenerate = userProfile && userProfile.videosGenerated < userProfile.monthlyLimit;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <AuthTest />
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <VideoCall sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Generate UGC Video
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload your product image and let AI create engaging UGC-style videos
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {!canGenerate && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You have reached your monthly limit of {userProfile?.monthlyLimit || 10} videos. 
            Upgrade your plan to generate more videos.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Image Upload */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Product Image
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              {formData.productImage ? (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    {formData.productImage.name}
                  </Typography>
                  <Chip label="Image uploaded" color="success" size="small" />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Drag & drop your product image here, or click to select
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports JPG, PNG, WebP (max 10MB)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Prompt */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Video Prompt
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe how you want your product to be presented in the video. For example: 'Show this skincare product being applied by a young woman in a bright, modern bathroom setting with soft lighting.'"
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              disabled={uploading || generating}
            />
          </Box>

          {/* Video Configuration */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Settings sx={{ mr: 1 }} />
            Video Configuration
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Aspect Ratio</InputLabel>
                <Select
                  value={formData.aspectRatio}
                  label="Aspect Ratio"
                  onChange={(e) => handleInputChange('aspectRatio', e.target.value)}
                  disabled={uploading || generating}
                >
                  <MenuItem value="16:9">16:9 (Landscape)</MenuItem>
                  <MenuItem value="9:16">9:16 (Portrait/Stories)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Duration: {formData.duration} seconds
              </Typography>
              <Slider
                value={formData.duration}
                onChange={(e, value) => handleInputChange('duration', value)}
                min={8}
                max={64}
                step={8}
                marks={[
                  { value: 8, label: '8s' },
                  { value: 16, label: '16s' },
                  { value: 24, label: '24s' },
                  { value: 32, label: '32s' },
                  { value: 40, label: '40s' },
                  { value: 48, label: '48s' },
                  { value: 56, label: '56s' },
                  { value: 64, label: '64s' }
                ]}
                disabled={uploading || generating}
              />
            </Grid>
            

          </Grid>

          {/* Submit Button */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!canGenerate || uploading || generating || !formData.productImage || !formData.prompt.trim()}
              sx={{ px: 4, py: 1.5 }}
            >
              {uploading ? (
                <><CircularProgress size={20} sx={{ mr: 1 }} /> Uploading Image...</>
              ) : generating ? (
                <><CircularProgress size={20} sx={{ mr: 1 }} /> Generating Video...</>
              ) : (
                'Generate Video'
              )}
            </Button>
            
            {userProfile && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {userProfile.monthlyLimit - userProfile.videosGenerated} videos remaining this month
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Progress Dialog */}
      <Dialog
        open={showProgressDialog}
        onClose={jobStatus === 'COMPLETED' || jobStatus === 'FAILED' ? handleCloseProgressDialog : undefined}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={jobStatus !== 'COMPLETED' && jobStatus !== 'FAILED'}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          {finalVideoUrl ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
              Video Generated Successfully!
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
              Generation Failed
            </Box>
          ) : (
            'Generating Your Video'
          )}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {generating && !finalVideoUrl && !error && (
              <>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Creating your video with AI...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This may take a few minutes. Please don't close this window.
                </Typography>
              </>
            )}
            
            {finalVideoUrl && (
              <>
                <Typography variant="body1" gutterBottom>
                  Your video has been generated successfully!
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => window.open(finalVideoUrl, '_blank')}
                  sx={{ mt: 2, mr: 1 }}
                >
                  View Video
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/library')}
                  sx={{ mt: 2 }}
                >
                  Go to Library
                </Button>
              </>
            )}
            
            {error && (
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        {(finalVideoUrl || error) && (
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              onClick={handleCloseProgressDialog}
              variant="contained"
              size="large"
            >
              {finalVideoUrl ? 'Create Another Video' : 'Try Again'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Container>
  );
}

export default VideoGenerator;