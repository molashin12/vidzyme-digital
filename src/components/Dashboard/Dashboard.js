import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Alert
} from '@mui/material';
import {
  Add,
  VideoLibrary,
  TrendingUp,
  Schedule,
  CheckCircle
} from '@mui/icons-material';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [recentVideos, setRecentVideos] = useState([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
    pendingVideos: 0,
    completedVideos: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecentVideos();
    fetchStats();
  }, [currentUser]);

  async function fetchRecentVideos() {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'videoJobs'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const videos = [];
      querySnapshot.forEach((doc) => {
        videos.push({ id: doc.id, ...doc.data() });
      });
      
      setRecentVideos(videos);
    } catch (error) {
      console.error('Error fetching recent videos:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check your account access.');
      } else if (error.code === 'unavailable') {
        setError('Service temporarily unavailable. Please try again later.');
      } else if (error.code === 'failed-precondition') {
        setError('Database index missing. Please contact support.');
      } else {
        setError('Failed to load recent videos. Please refresh the page.');
      }
    }
  }

  async function fetchStats() {
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'videoJobs'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let totalVideos = 0;
      let pendingVideos = 0;
      let completedVideos = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalVideos++;
        
        if (data.status === 'pending' || data.status === 'processing') {
          pendingVideos++;
        } else if (data.status === 'completed') {
          completedVideos++;
        }
      });
      
      setStats({ totalVideos, pendingVideos, completedVideos });
    } catch (error) {
      console.error('Error fetching stats:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'permission-denied') {
        setError('Permission denied. Unable to load statistics.');
      } else if (error.code === 'unavailable') {
        setError('Service temporarily unavailable. Statistics may be outdated.');
      } else {
        setError('Failed to load statistics. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'pending': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const usagePercentage = userProfile ? 
    (userProfile.videosGenerated / userProfile.monthlyLimit) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            color: '#071946',
            fontWeight: 700,
            mb: 2
          }}
        >
          Welcome back, {currentUser?.displayName || 'User'}!
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#666',
            fontWeight: 400,
            lineHeight: 1.6
          }}
        >
          Transform your product images into engaging UGC videos with VidZyme's AI-powered automation.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              border: '2px solid transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                border: '2px solid #286986',
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(40, 105, 134, 0.15)'
              }
            }} 
            onClick={() => navigate('/generate')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Add sx={{ fontSize: 48, color: '#286986', mb: 2 }} />
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ color: '#071946', fontWeight: 600 }}
              >
                Generate New Video
              </Typography>
              <Typography variant="body2" color="#666" sx={{ mb: 3 }}>
                Upload a product image and create engaging UGC videos
              </Typography>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: '#286986',
                  '&:hover': { bgcolor: '#1e5a73' },
                  fontWeight: 600,
                  px: 3
                }}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%', 
              cursor: 'pointer',
              border: '2px solid transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                border: '2px solid #F4A261',
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(244, 162, 97, 0.15)'
              }
            }} 
            onClick={() => navigate('/library')}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <VideoLibrary sx={{ fontSize: 48, color: '#F4A261', mb: 2 }} />
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ color: '#071946', fontWeight: 600 }}
              >
                Video Library
              </Typography>
              <Typography variant="body2" color="#666" sx={{ mb: 3 }}>
                View and manage all your generated videos
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ 
                  borderColor: '#F4A261',
                  color: '#F4A261',
                  '&:hover': { 
                    borderColor: '#e8956b',
                    bgcolor: 'rgba(244, 162, 97, 0.1)'
                  },
                  fontWeight: 600,
                  px: 3
                }}
              >
                View Library
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Usage Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ color: '#286986', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#071946', fontWeight: 600 }}>
                  Total Videos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#286986', fontWeight: 700 }}>
                {stats.totalVideos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ color: '#F4A261', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#071946', fontWeight: 600 }}>
                  Processing
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#F4A261', fontWeight: 700 }}>
                {stats.pendingVideos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ color: '#2E8B57', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#071946', fontWeight: 600 }}>
                  Completed
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#2E8B57', fontWeight: 700 }}>
                {stats.completedVideos}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Usage */}
      {userProfile && (
        <Paper sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0' }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ color: '#071946', fontWeight: 600 }}
          >
            Monthly Usage
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ mr: 2, color: '#666' }}>
              {userProfile.videosGenerated || 0} / {userProfile.monthlyLimit || 10} videos used
            </Typography>
            <Chip 
              label={userProfile.subscription || 'Free'} 
              size="small" 
              sx={{
                bgcolor: '#286986',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(usagePercentage, 100)} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: '#f0f0f0',
              '& .MuiLinearProgress-bar': {
                bgcolor: usagePercentage >= 100 ? '#ff5252' : '#286986'
              }
            }}
          />
          {usagePercentage >= 100 && (
            <Typography variant="body2" sx={{ mt: 1, color: '#ff5252' }}>
              You've reached your monthly limit. Upgrade to generate more videos.
            </Typography>
          )}
        </Paper>
      )}

      {/* Recent Videos */}
      <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h6"
            sx={{ color: '#071946', fontWeight: 600 }}
          >
            Recent Videos
          </Typography>
          <Button 
            onClick={() => navigate('/library')}
            sx={{
              color: '#286986',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(40, 105, 134, 0.1)'
              }
            }}
          >
            View All
          </Button>
        </Box>
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : recentVideos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
              No videos generated yet. Create your first video to get started!
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/generate')}
              sx={{
                bgcolor: '#286986',
                '&:hover': { bgcolor: '#1e5a73' },
                fontWeight: 600,
                px: 3
              }}
            >
              Generate Video
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {recentVideos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video.id}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography 
                      variant="subtitle1" 
                      gutterBottom 
                      noWrap
                      sx={{ color: '#071946', fontWeight: 600 }}
                    >
                      {video.title || 'Untitled Video'}
                    </Typography>
                    <Chip 
                      label={video.status} 
                      size="small" 
                      sx={{ 
                        mb: 1,
                        bgcolor: video.status === 'completed' ? '#2E8B57' : 
                                video.status === 'processing' ? '#F4A261' :
                                video.status === 'pending' ? '#286986' : '#ff5252',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {video.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard;