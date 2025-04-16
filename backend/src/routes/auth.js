const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      user = new User({
        email,
        name,
        googleId,
        isApproved: false // New users need approval
      });
      await user.save();
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval' });
    }

    // Generate JWT token
    const authToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

module.exports = router;