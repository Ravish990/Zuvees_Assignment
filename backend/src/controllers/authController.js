const jwt = require('jsonwebtoken');
const { verifyGoogleToken, checkApprovedEmail } = require('../middleware/auth');
const User = require('../models/User');

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        
        // Verify Google token
        const payload = await verifyGoogleToken(token);
        
        // Check if email is approved
        const role = await checkApprovedEmail(payload.email);
        
        // Find or create user
        let user = await User.findOne({ googleId: payload.sub });
        
        if (!user) {
            user = await User.create({
                email: payload.email,
                name: payload.name,
                googleId: payload.sub,
                role,
                isApproved: true
            });
        }
        
        // Generate JWT
        const jwtToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-googleId');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};