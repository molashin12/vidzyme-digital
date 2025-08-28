const express = require('express');
const { verifyIdToken, getAuth } = require('../config/firebase');
const router = express.Router();

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'No authorization token provided',
          status: 401
        }
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      error: {
        message: 'Invalid or expired token',
        status: 401
      }
    });
  }
};

// Verify token endpoint
router.post('/verify', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'Token is valid',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      emailVerified: req.user.email_verified
    }
  });
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userRecord = await getAuth().getUser(req.user.uid);
    res.status(200).json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch user profile',
        status: 500
      }
    });
  }
});

module.exports = router;
module.exports.verifyToken = verifyToken;