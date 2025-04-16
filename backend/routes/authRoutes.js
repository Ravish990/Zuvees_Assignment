const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const User = require('../models/User');
const ApprovedEmail = require('../models/ApprovedEmail');
const { verifyToken, checkRole } = require('../middleware/auth');

// Check if email is approved
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const approvedEmail = await ApprovedEmail.findOne({ 
      email,
      isActive: true
    });
    
    if (!approvedEmail) {
      return res.status(403).json({ 
        isApproved: false,
        message: 'Email not approved for access'
      });
    }
    
    res.json({ 
      isApproved: true,
      role: approvedEmail.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { displayName, address, phoneNumber } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (displayName) user.displayName = displayName;
    if (address) user.address = address;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    const updatedUser = await user.save();
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Add approved email
router.post('/approved-emails', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }
    
    // Check if email already exists
    const existingEmail = await ApprovedEmail.findOne({ email });
    
    if (existingEmail) {
      // Update existing record
      existingEmail.role = role;
      existingEmail.isActive = true;
      existingEmail.addedBy = req.user._id;
      await existingEmail.save();
      
      return res.json(existingEmail);
    }
    
    // Create new record
    const approvedEmail = new ApprovedEmail({
      email,
      role,
      addedBy: req.user._id
    });
    
    await approvedEmail.save();
    res.status(201).json(approvedEmail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;