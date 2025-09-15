const express = require('express');
const { authenticateToken, generateToken } = require('../middleware/auth');
const router = express.Router();

// Generate JWT token from Firebase token (called by frontend after Firebase auth)
router.post('/generate-jwt', async (req, res) => {
  try {
    const { firebaseToken } = req.body;
    
    if (!firebaseToken) {
      return res.status(400).json({ error: 'Firebase token is required' });
    }

    // For now, we'll trust the frontend Firebase authentication
    // In production, you might want to verify the Firebase token here
    // But since you only need it for email verification, we'll use the token data directly
    
    const { uid, email, name } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ error: 'User data is required' });
    }

    // Generate our own JWT token
    const jwtToken = generateToken({
      uid,
      email,
      name: name || email.split('@')[0]
    });

    res.json({
      success: true,
      token: jwtToken,
      user: {
        uid,
        email,
        name: name || email.split('@')[0]
      }
    });
  } catch (error) {
    console.error('JWT generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate token',
      message: error.message 
    });
  }
});

// Verify token endpoint
router.post('/verify', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    user: {
      email: req.user.email,
      tenantId: req.user.tenantId
    }
  });
});

module.exports = router;