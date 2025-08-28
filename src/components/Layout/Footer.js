import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#071946',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img 
                src="/assets/vidzyme-new-logo.png" 
                alt="VidZyme Logo" 
                style={{ 
                  height: '32px', 
                  width: 'auto',
                  filter: 'brightness(0) invert(1)' // Make logo white
                }} 
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.3rem',
                  ml: 1
                }}
              >
                VidZyme
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
              AI-powered UGC video generation platform. Create professional videos 
              from text prompts, images, and media inputs with advanced AI technology.
            </Typography>
          </Grid>

          {/* Product Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="#features"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline'
                  }
                }}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline'
                  }
                }}
              >
                How It Works
              </Link>
              <Link
                href="#pricing"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline'
                  }
                }}
              >
                Pricing
              </Link>
            </Box>
          </Grid>

          {/* Company Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="mailto:info@vidzyme.digital"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline'
                  }
                }}
              >
                Contact Us
              </Link>
              <Link
                href="mailto:support@vidzyme.digital"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline'
                  }
                }}
              >
                Support
              </Link>
            </Box>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component={RouterLink}
                to="/terms"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline'
                  }
                }}
              >
                Terms of Service
              </Link>
              <Link
                component={RouterLink}
                to="/privacy"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline'
                  }
                }}
              >
                Privacy Policy
              </Link>
              <Link
                component={RouterLink}
                to="/cookies"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline'
                  }
                }}
              >
                Cookie Policy
              </Link>
              <Link
                component={RouterLink}
                to="/acceptable-use"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline'
                  }
                }}
              >
                Acceptable Use
              </Link>
              <Link
                component={RouterLink}
                to="/dmca"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline'
                  }
                }}
              >
                DMCA Policy
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Email: info@vidzyme.digital
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Support: support@vidzyme.digital
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} VidZyme, Inc. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              component={RouterLink}
              to="/terms"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'white',
                  textDecoration: 'underline'
                }
              }}
            >
              Terms
            </Link>
            <Link
              component={RouterLink}
              to="/privacy"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'white',
                  textDecoration: 'underline'
                }
              }}
            >
              Privacy
            </Link>
            <Link
              component={RouterLink}
              to="/cookies"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'white',
                  textDecoration: 'underline'
                }
              }}
            >
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;