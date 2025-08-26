import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  MoreVert,
  Download,
  Delete,
  Refresh,
  Search,
  FilterList,
  VideoLibrary as VideoLibraryIcon
} from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

function VideoLibrary() {
  const { currentUser } = useAuth();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = fetchVideos();
    
    // Cleanup function to unsubscribe from real-time listener
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  useEffect(() => {
    filterVideos();
  }, [videos, searchTerm, statusFilter]);

  function fetchVideos() {
    if (!currentUser) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'videoJobs'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      // Use real-time listener instead of one-time fetch
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const videoList = [];
        querySnapshot.forEach((doc) => {
          videoList.push({ id: doc.id, ...doc.data() });
        });
        
        setVideos(videoList);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching videos:', error);
        setLoading(false);
      });
      
      // Return cleanup function
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up video listener:', error);
      setLoading(false);
    }
  }

  function filterVideos() {
    let filtered = videos;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.prompt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(video => video.status === statusFilter);
    }
    
    setFilteredVideos(filtered);
  }

  const handleMenuOpen = (event, video) => {
    setAnchorEl(event.currentTarget);
    setSelectedVideo(video);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVideo(null);
  };

  const handleDownload = (video) => {
    if (video.finalVideoUrl) {
      const link = document.createElement('a');
      link.href = video.finalVideoUrl;
      link.download = `${video.prompt?.substring(0, 30) || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedVideo) return;

    try {
      setDeleting(true);
      
      // Delete video files from storage if they exist
      if (selectedVideo.finalVideoUrl) {
        try {
          const videoRef = ref(storage, selectedVideo.finalVideoUrl);
          await deleteObject(videoRef);
        } catch (error) {
          console.warn('Error deleting final video file:', error);
        }
      }
      
      // Delete thumbnail if it exists
      if (selectedVideo.thumbnailUrl) {
        try {
          const thumbnailRef = ref(storage, selectedVideo.thumbnailUrl);
          await deleteObject(thumbnailRef);
        } catch (error) {
          console.warn('Error deleting thumbnail file:', error);
        }
      }
      
      // Delete generated image if it exists
      if (selectedVideo.generatedImageUrl) {
        try {
          const imageRef = ref(storage, selectedVideo.generatedImageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Error deleting generated image file:', error);
        }
      }
      
      // Delete document from Firestore
      await deleteDoc(doc(db, 'videoJobs', selectedVideo.id));
      
      // Update local state
      setVideos(videos.filter(video => video.id !== selectedVideo.id));
      
      setDeleteDialogOpen(false);
      setSelectedVideo(null);
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PROCESSING': return 'warning';
      case 'ANALYZING_IMAGE': return 'info';
      case 'GENERATING_PROMPT': return 'info';
      case 'GENERATING_SCENES': return 'info';
      case 'GENERATING_IMAGE': return 'info';
      case 'GENERATING_VIDEOS': return 'warning';
      case 'MERGING_VIDEOS': return 'warning';
      case 'PENDING': return 'info';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Completed';
      case 'PROCESSING': return 'Processing';
      case 'ANALYZING_IMAGE': return 'Analyzing Image';
      case 'GENERATING_PROMPT': return 'Generating Prompt';
      case 'GENERATING_SCENES': return 'Planning Scenes';
      case 'GENERATING_IMAGE': return 'Creating Base Image';
      case 'GENERATING_VIDEOS': return 'Generating Videos';
      case 'MERGING_VIDEOS': return 'Merging Videos';
      case 'PENDING': return 'Pending';
      case 'FAILED': return 'Failed';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VideoLibraryIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1">
            Video Library
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchVideos}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="ANALYZING_IMAGE">Analyzing Image</MenuItem>
              <MenuItem value="GENERATING_PROMPT">Generating Prompt</MenuItem>
              <MenuItem value="GENERATING_SCENES">Planning Scenes</MenuItem>
              <MenuItem value="GENERATING_IMAGE">Creating Base Image</MenuItem>
              <MenuItem value="GENERATING_VIDEOS">Generating Videos</MenuItem>
              <MenuItem value="MERGING_VIDEOS">Merging Videos</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              {filteredVideos.length} of {videos.length} videos
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <VideoLibraryIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {videos.length === 0 ? 'No videos generated yet' : 'No videos match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {videos.length === 0 ? 'Start by generating your first video!' : 'Try adjusting your search or filter criteria'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredVideos.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {video.thumbnailUrl || video.generatedImageUrl ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={video.thumbnailUrl || video.generatedImageUrl}
                    alt={video.prompt?.substring(0, 50) || 'Video thumbnail'}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100'
                    }}
                  >
                    <VideoLibraryIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" noWrap sx={{ flexGrow: 1 }}>
                      {video.prompt?.substring(0, 40) || 'Video Generation Job'}
                      {video.prompt?.length > 40 && '...'}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, video)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Chip
                    label={getStatusText(video.status)}
                    color={getStatusColor(video.status)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  
                  {/* Progress bar for jobs in progress */}
                  {video.status !== 'COMPLETED' && video.status !== 'FAILED' && video.progress && (
                    <Box sx={{ mb: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={video.progress} 
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {video.progress}% complete
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {video.aspectRatio} • {video.duration}s
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {video.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                  </Typography>
                  
                  {video.prompt && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
                      "{video.prompt}"
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedVideo?.status === 'COMPLETED' && selectedVideo?.finalVideoUrl && (
          <MenuItem onClick={() => handleDownload(selectedVideo)}>
            <Download sx={{ mr: 1 }} />
            Download
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Video</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedVideo?.title || 'this video'}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default VideoLibrary;