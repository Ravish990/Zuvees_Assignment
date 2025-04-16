const admin = require('../config/firebase');
const User = require('../models/User');
const ApprovedEmail = require('../models/ApprovedEmail');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if email is approved
    const approvedEmail = await ApprovedEmail.findOne({ 
      email: decodedToken.email,
      isActive: true
    });
    
    if (!approvedEmail) {
      return res.status(403).json({ message: 'Email not approved for access.' });
    }
    
    // Find user or create if not exists
    let user = await User.findOne({ email: decodedToken.email });
    
    if (!user) {
      user = new User({
        email: decodedToken.email,
        displayName: decodedToken.name,
        googleId: decodedToken.uid,
        profilePicture: decodedToken.picture,
        role: approvedEmail.role
      });
      await user.save();
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    
    next();
  };
};