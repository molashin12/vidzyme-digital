import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import VideoGenerator from './components/VideoGenerator/VideoGenerator';
import VideoLibrary from './components/VideoLibrary/VideoLibrary';
import Navbar from './components/Layout/Navbar';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#071946',
      light: '#286986',
      dark: '#051234',
    },
    secondary: {
      main: '#286986',
      light: '#3a7a9a',
      dark: '#1e5a73',
    },
    background: {
      default: '#fefefe',
      paper: '#ffffff',
    },
    text: {
      primary: '#071946',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(7, 25, 70, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return !currentUser ? children : <Navigate to="/dashboard" />;
}

function LandingRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route 
                path="/" 
                element={
                  <LandingRoute>
                    <LandingPage />
                  </LandingRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <Dashboard />
                    </>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/generate" 
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <VideoGenerator />
                    </>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/library" 
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <VideoLibrary />
                    </>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;