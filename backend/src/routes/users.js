const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Admin only routes
router.use(authenticateToken, requireRole(['admin']));

// Get all riders
router.get('/riders', async (req, res) => {
    try {
        const riders = await User.find({ role: 'rider' }).select('-googleId');
        res.json(riders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-googleId');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;