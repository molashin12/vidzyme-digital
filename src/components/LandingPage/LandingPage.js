import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PlayArrow,
  Upload,
  VideoLibrary,
  AutoAwesome,
  Speed,
  TrendingUp,
  Security,
  CheckCircle,
  ExpandMore,
  Star,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <AutoAwesome />,
      title: 'AI-Powered Script Generation',
      description: 'Our AI analyzes your product and generates compelling, conversion-focused scripts tailored to your target audience.'
    },
    {
      icon: <VideoLibrary />,
      title: 'Dynamic Scene Generation',
      description: 'Automatically create diverse scenarios and settings that showcase your product in realistic, engaging contexts.'
    },
    {
      icon: <Speed />,
      title: 'Batch Video Creation',
      description: 'Generate multiple video variations simultaneously, perfect for A/B testing different approaches.'
    },
    {
      icon: <TrendingUp />,
      title: 'Google Veo 3 Integration',
      description: 'Leverage Google\'s most advanced video generation model for unprecedented realism and quality.'
    },
    {
      icon: <Security />,
      title: 'Authentic UGC Style',
      description: 'Create videos that look and feel like authentic user-generated content for higher engagement.'
    },
    {
      icon: <CheckCircle />,
      title: 'Professional Audio',
      description: 'Every video includes carefully crafted audio that enhances the viewing experience.'
    }
  ];

  const benefits = [
    {
      title: 'From Weeks to Minutes',
      description: 'What used to take weeks of planning, shooting, and editing now happens in minutes.',
      metric: '95% Time Savings'
    },
    {
      title: 'Slash Production Costs by 90%',
      description: 'Eliminate expensive video crews, equipment rentals, and editing services.',
      metric: '$15,000+ Saved Monthly'
    },
    {
      title: 'Create Unlimited Variations',
      description: 'Test different approaches, messages, and styles without additional production costs.',
      metric: '50+ Videos per Session'
    },
    {
      title: '3x More Engagement',
      description: 'UGC-style videos consistently outperform traditional advertising.',
      metric: '240% Engagement Increase'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Marketing Director at TechGear Pro',
      avatar: 'SC',
      rating: 5,
      text: 'VidZyme transformed our content strategy. We went from creating 2-3 videos per month to 50+ variations per week. Our engagement rates increased by 240%.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'E-commerce Manager at StyleForward',
      avatar: 'MR',
      rating: 5,
      text: 'The quality is incredible. Our customers can\'t tell the difference between VidZyme videos and professionally shot content, but we\'re saving $15,000 per month.'
    },
    {
      name: 'Jennifer Walsh',
      role: 'Growth Marketing Lead at FitnessPro',
      avatar: 'JW',
      rating: 5,
      text: 'Finally, a solution that scales with our needs. We can test dozens of creative approaches simultaneously and optimize based on real performance data.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for Small Businesses',
      features: [
        '25 videos/month',
        'Basic AI scripts',
        'Standard scenes',
        'Email support',
        'HD video quality'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$149',
      period: '/month',
      description: 'Ideal for Growing Companies',
      features: [
        '100 videos/month',
        'Advanced AI scripts',
        'Custom scenes',
        'Priority support',
        '4K video quality',
        'A/B testing tools'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Built for Large Organizations',
      features: [
        'Unlimited videos',
        'Custom AI training',
        'White-label options',
        'Dedicated account manager',
        'API access',
        'Custom integrations'
      ],
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'What types of products work best with VidZyme?',
      answer: 'VidZyme works with virtually any physical product. We\'ve seen excellent results with consumer electronics, fashion items, home goods, beauty products, and fitness equipment. The AI adapts to showcase each product\'s unique features and benefits.'
    },
    {
      question: 'How realistic are the generated videos?',
      answer: 'Our videos are powered by Google\'s Veo 3 model, the most advanced AI video generation technology available. The results are so realistic that viewers typically cannot distinguish them from traditionally produced UGC content.'
    },
    {
      question: 'Can I customize the scripts and scenes?',
      answer: 'Absolutely. While our AI can generate everything automatically, you have complete control to customize scripts, adjust scenes, modify settings, and fine-tune every aspect of your videos to match your brand voice and style.'
    },
    {
      question: 'What video formats and sizes are supported?',
      answer: 'VidZyme generates videos in all standard formats including MP4, MOV, and AVI, with resolution options from 720p to 4K. We provide optimized outputs for all major social media platforms including Instagram, TikTok, Facebook, and YouTube.'
    },
    {
      question: 'How long does it take to generate a video?',
      answer: 'Most videos are generated within 2-5 minutes, depending on complexity and current system load. Batch generations of multiple videos typically complete within 10-15 minutes regardless of quantity.'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#fefefe', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#071946',
              fontSize: '1.5rem'
            }}
          >
            VidZyme
          </Typography>
          
          {/* Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
            <Button 
              color="inherit" 
              sx={{ 
                color: '#666666',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: '#071946'
                }
              }}
            >
              Features
            </Button>
            <Button 
              color="inherit" 
              onClick={() => scrollToSection('how-it-works')}
              sx={{ 
                color: '#666666',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: '#071946'
                }
              }}
            >
              How It Works
            </Button>
            <Button 
              color="inherit" 
              onClick={() => scrollToSection('pricing')}
              sx={{ 
                color: '#666666',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: '#071946'
                }
              }}
            >
              Pricing
            </Button>
            <Button 
              color="inherit" 
              onClick={() => scrollToSection('reviews')}
              sx={{ 
                color: '#666666',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: '#071946'
                }
              }}
            >
              Reviews
            </Button>
          </Box>
          
          {/* Auth Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              sx={{ 
                color: '#666666',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: '#071946'
                }
              }}
            >
              Sign In
            </Button>
            <Button 
              variant="contained"
              onClick={handleGetStarted}
              sx={{
                bgcolor: '#286986',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#1e5a73'
                }
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #071946 0%, #286986 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 700,
                    color: 'white',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  VidZyme
                </Typography>
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 2,
                  lineHeight: 1.2,
                  color: 'white'
                }}
              >
                Transform Product Images into Viral UGC Videos with AI
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  mb: 4,
                  opacity: 0.9,
                  lineHeight: 1.5,
                  color: 'white'
                }}
              >
                Upload your product image, configure scripts and scenes, and let VidZyme's AI generate multiple professional UGC-style videos simultaneously. Powered by Google's advanced Veo 3 model.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    bgcolor: '#286986',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#1e5a73'
                    }
                  }}
                  endIcon={<ArrowForward />}
                >
                  Start Creating Videos Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: '#286986',
                      bgcolor: 'rgba(40, 105, 134, 0.1)'
                    }
                  }}
                  startIcon={<PlayArrow />}
                >
                  Watch 2-Minute Demo
                </Button>
              </Box>
              <Typography
                variant="body2"
                sx={{ mt: 3, opacity: 0.8 }}
              >
                ✓ No credit card required ✓ 3 free video generations ✓ Join 500+ brands
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 300, md: 400 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Animated product transformation visualization */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Typography variant="h6" sx={{ opacity: 0.7 }}>
                    Interactive Demo Placeholder
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Problem/Solution Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 700,
            mb: 3,
            color: '#071946'
          }}
        >
          The UGC Video Creation Challenge
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{
            mb: 6,
            color: '#666',
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Traditional video production is expensive, time-consuming, and requires constant content creation. 
          Hiring creators, managing shoots, and editing content can cost thousands while taking weeks to complete.
        </Typography>

        <Typography
          variant="h3"
          align="center"
          id="how-it-works"
          sx={{
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            fontWeight: 600,
            mb: 6,
            color: '#071946'
          }}
        >
          VidZyme Solves This in Three Simple Steps
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              step: '1',
              title: 'Upload Your Product Image',
              description: 'Simply drag and drop any product photo into our platform',
              icon: <Upload sx={{ fontSize: 40 }} />
            },
            {
              step: '2',
              title: 'Configure or Generate Content',
              description: 'Let AI create scripts and scenes, or customize your own',
              icon: <AutoAwesome sx={{ fontSize: 40 }} />
            },
            {
              step: '3',
              title: 'Generate Multiple Videos',
              description: 'Create dozens of variations instantly for A/B testing',
              icon: <VideoLibrary sx={{ fontSize: 40 }} />
            }
          ].map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  border: '2px solid #f1f4f9',
                  '&:hover': {
                    borderColor: '#286986',
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: '#286986',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  {step.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: '#071946' }}
                >
                  {step.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  {step.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box id="features" sx={{ bgcolor: '#f7fcfb', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3,
              color: '#071946'
            }}
          >
            Powerful Features That Set VidZyme Apart
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              mb: 6,
              color: '#666',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Cutting-edge AI technology meets intuitive design for unprecedented video creation capabilities.
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    border: activeFeature === index ? '2px solid #286986' : '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#286986',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ color: '#286986', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: '#071946' }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666' }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 700,
            mb: 6,
            color: '#071946'
          }}
        >
          Transform Your Marketing Results
        </Typography>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: '#286986',
                    mb: 1
                  }}
                >
                  {benefit.metric}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: '#071946'
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  {benefit.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Social Proof Section */}
      <Box id="reviews" sx={{ bgcolor: '#f1f4f9', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 6,
              color: '#071946'
            }}
          >
            Trusted by Leading Brands Worldwide
          </Typography>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#286986',
                        mr: 2
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    "{testimonial.text}"
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#286986' }}>
                  10,000+
                </Typography>
                <Typography variant="body1">Videos Generated</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#286986' }}>
                  500+
                </Typography>
                <Typography variant="body1">Satisfied Customers</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#286986' }}>
                  95%
                </Typography>
                <Typography variant="body1">Customer Satisfaction</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#286986' }}>
                  3x
                </Typography>
                <Typography variant="body1">Average Engagement Increase</Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Container id="pricing" maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 700,
            mb: 3,
            color: '#071946'
          }}
        >
          Choose Your VidZyme Plan
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{
            mb: 6,
            color: '#666',
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          Start with 3 free video generations - No credit card required
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {pricingPlans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  border: plan.popular ? '2px solid #286986' : '1px solid #e0e0e0',
                  position: 'relative',
                  '&:hover': {
                    borderColor: '#286986',
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: '#286986',
                      color: 'white'
                    }}
                  />
                )}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: '#071946',
                    textAlign: 'center'
                  }}
                >
                  {plan.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#666',
                    textAlign: 'center',
                    mb: 3
                  }}
                >
                  {plan.description}
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography
                    variant="h3"
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color: '#286986'
                    }}
                  >
                    {plan.price}
                  </Typography>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{ color: '#666' }}
                  >
                    {plan.period}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  {plan.features.map((feature, featureIndex) => (
                    <Box
                      key={featureIndex}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1
                      }}
                    >
                      <CheckCircle
                        sx={{
                          color: '#286986',
                          mr: 1,
                          fontSize: 20
                        }}
                      />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  variant={plan.popular ? 'contained' : 'outlined'}
                  fullWidth
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    mt: 'auto',
                    bgcolor: plan.popular ? '#286986' : 'transparent',
                    borderColor: '#286986',
                    color: plan.popular ? 'white' : '#286986',
                    '&:hover': {
                      bgcolor: plan.popular ? '#1e5a73' : 'rgba(40, 105, 134, 0.1)'
                    }
                  }}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ bgcolor: '#f7fcfb', py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 6,
              color: '#071946'
            }}
          >
            Frequently Asked Questions
          </Typography>

          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                mb: 2,
                border: '1px solid #e0e0e0',
                '&:before': {
                  display: 'none'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  bgcolor: 'white',
                  '&:hover': {
                    bgcolor: '#f1f4f9'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white' }}>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #071946 0%, #286986 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3
            }}
          >
            Ready to Transform Your Video Marketing?
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              mb: 4,
              opacity: 0.9,
              lineHeight: 1.6
            }}
          >
            Join hundreds of successful brands already using VidZyme to create engaging, 
            authentic video content that drives real results. Start your free trial today.
          </Typography>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                bgcolor: '#286986',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                mr: { xs: 0, sm: 2 },
                mb: { xs: 2, sm: 0 },
                '&:hover': {
                  bgcolor: '#1e5a73'
                }
              }}
              endIcon={<ArrowForward />}
            >
              Start Your Free Trial Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: 'white',
                borderColor: 'white',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                '&:hover': {
                  borderColor: '#286986',
                  bgcolor: 'rgba(40, 105, 134, 0.1)'
                }
              }}
            >
              Schedule a Demo
            </Button>
          </Box>
          <Typography
            variant="body1"
            align="center"
            sx={{ opacity: 0.8 }}
          >
            ✓ No credit card required ✓ 3 free video generations ✓ Cancel anytime ✓ 30-day money-back guarantee
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;