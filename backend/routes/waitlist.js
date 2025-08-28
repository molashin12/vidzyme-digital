const express = require('express');
const { getFirestore } = require('../config/firebase');
const { sendWaitlistConfirmationEmail } = require('../services/emailService');
const router = express.Router();

/**
 * Join waitlist endpoint
 * POST /api/waitlist/join
 */
router.post('/join', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getFirestore();
    const waitlistRef = db.collection('waitlist');

    // Check if email already exists
    const existingUser = await waitlistRef.where('email', '==', normalizedEmail).get();
    
    if (!existingUser.empty) {
      return res.status(409).json({
        success: false,
        message: 'This email is already on our waitlist! We\'ll notify you when we launch.'
      });
    }

    // Add to waitlist
    const waitlistData = {
      email: normalizedEmail,
      joinedAt: new Date(),
      status: 'active',
      source: 'website',
      notified: false
    };

    const docRef = await waitlistRef.add(waitlistData);

    // Send confirmation email
    try {
      await sendWaitlistConfirmationEmail(normalizedEmail);
      console.log(`✅ Confirmation email sent to: ${normalizedEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError.message);
      // Don't fail the request if email fails, but log it
    }

    res.status(201).json({
      success: true,
      message: 'Successfully joined the waitlist!',
      data: {
        id: docRef.id,
        email: normalizedEmail,
        joinedAt: waitlistData.joinedAt
      }
    });

  } catch (error) {
    console.error('❌ Waitlist join error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

/**
 * Get waitlist stats (admin only)
 * GET /api/waitlist/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getFirestore();
    const waitlistRef = db.collection('waitlist');
    
    const snapshot = await waitlistRef.get();
    const totalCount = snapshot.size;
    
    const activeCount = snapshot.docs.filter(doc => 
      doc.data().status === 'active'
    ).length;

    res.json({
      success: true,
      data: {
        total: totalCount,
        active: activeCount,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Waitlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch waitlist statistics'
    });
  }
});

/**
 * Check if email is on waitlist
 * GET /api/waitlist/check/:email
 */
router.get('/check/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();
    
    const db = getFirestore();
    const waitlistRef = db.collection('waitlist');
    const snapshot = await waitlistRef.where('email', '==', normalizedEmail).get();
    
    res.json({
      success: true,
      data: {
        isOnWaitlist: !snapshot.empty,
        email: normalizedEmail
      }
    });

  } catch (error) {
    console.error('❌ Waitlist check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check waitlist status'
    });
  }
});

module.exports = router;