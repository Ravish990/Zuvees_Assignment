const express = require('express');
const router = express.Router();
const passport = require('passport'); // Ensure passport is required
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController'); // If the other routes were moved to authController
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/check-email', authController.checkEmail);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/approved-emails', verifyToken, checkRole(['admin']), authController.addApprovedEmail);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect:'./login', session: false,failureMessage: true }), // Set session: false
    (req, res) => {
        // Successful authentication, create JWT and redirect
        const token = jwt.sign({ _id: req.user._id, email: req.user.email, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.redirect(`${process.env.FRONTEND_URL}/oauth/success?token=${token}`);
    }
);

  

module.exports = router;
