import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip
} from '@mui/material';
import {
  AccountCircle,
  VideoLibrary,
  Add,
  Dashboard,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleClose();
  };

  const isActive = (path) => location.pathname === path;

  if (!currentUser) {
    return (
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: 'white', 
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Toolbar>
          <Box 
            sx={{ 
              flexGrow: 1, 
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <img 
              src="/assets/vidzyme-new-logo.png" 
              alt="VidZyme Logo" 
              style={{ 
                height: '40px', 
                width: 'auto'
              }} 
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                color: '#071946',
                fontSize: '1.5rem'
              }}
            >
              VidZyme
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer'
          }}
          onClick={() => navigate('/dashboard')}
        >
          <img 
            src="/assets/vidzyme-new-logo.png" 
            alt="VidZyme Logo" 
            style={{ 
              height: '40px', 
              width: 'auto'
            }} 
          />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              color: '#071946',
              fontSize: '1.5rem'
            }}
          >
            VidZyme
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
          <Button
            startIcon={<Dashboard />}
            onClick={() => navigate('/dashboard')}
            sx={{ 
              mr: 2,
              color: isActive('/dashboard') ? '#286986' : '#666',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(40, 105, 134, 0.1)',
                color: '#286986'
              }
            }}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<Add />}
            onClick={() => navigate('/generate')}
            sx={{ 
              mr: 2,
              color: isActive('/generate') ? '#286986' : '#666',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(40, 105, 134, 0.1)',
                color: '#286986'
              }
            }}
          >
            Generate
          </Button>
          <Button
            startIcon={<VideoLibrary />}
            onClick={() => navigate('/library')}
            sx={{ 
              color: isActive('/library') ? '#286986' : '#666',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(40, 105, 134, 0.1)',
                color: '#286986'
              }
            }}
          >
            Library
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {userProfile && (
            <Chip
              label={`${userProfile.videosGenerated || 0}/${userProfile.monthlyLimit || 10} videos`}
              size="small"
              sx={{ 
                mr: 2,
                bgcolor: userProfile.videosGenerated >= userProfile.monthlyLimit ? '#ff5252' : '#286986',
                color: 'white',
                fontWeight: 600
              }}
            />
          )}
          
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            sx={{ color: '#071946' }}
          >
            {currentUser.photoURL ? (
              <Avatar 
                src={currentUser.photoURL} 
                sx={{ 
                  width: 32, 
                  height: 32,
                  border: '2px solid #286986'
                }} 
              />
            ) : (
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: '#286986',
                  color: 'white'
                }}
              >
                <AccountCircle />
              </Avatar>
            )}
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {currentUser.displayName || currentUser.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;