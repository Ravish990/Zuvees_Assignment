const User = require('../models/User');
const ApprovedEmail = require('../models/ApprovedEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Check if email is approved
exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const approvedEmail = await ApprovedEmail.findOne({ email, isActive: true });
        if (!approvedEmail) return res.status(403).json({ isApproved: false, message: 'Email not approved for access' });

        res.json({ isApproved: true, role: approvedEmail.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Register user
exports.register = async (req, res) => {
    try {
        const { email, password, displayName, role } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            displayName,
            role: role || 'user', // Default role
        });

        await user.save();

        // Automatically approve regular users, but not admins/riders
        if (role !== 'admin' && role !== 'rider') {
            const newApprovedEmail = new ApprovedEmail({
                email: email,
                isActive: true,
                role: 'user' // Default role
            });
            await newApprovedEmail.save();
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login user with email/password
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ _id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, user: { _id: user._id, email: user.email, role: user.role, displayName: user.displayName } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -__v');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
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
};

// Admin: Add or update approved email
exports.addApprovedEmail = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role) return res.status(400).json({ message: 'Email and role are required' });

        let approvedEmail = await ApprovedEmail.findOne({ email });
        if (approvedEmail) {
            approvedEmail.role = role;
            approvedEmail.isActive = true;
            approvedEmail.addedBy = req.user._id;
            await approvedEmail.save();
            return res.json(approvedEmail);
        }

        approvedEmail = new ApprovedEmail({ email, role, addedBy: req.user._id });
        await approvedEmail.save();
        res.status(201).json(approvedEmail);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Approve email endpoint (require authentication)
exports.approveEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const approvedEmail = await ApprovedEmail.findOne({ email });
        if (!approvedEmail) return res.status(404).json({ message: 'Email not found in approved list' });

        approvedEmail.isActive = true;
        await approvedEmail.save();

        res.json({ message: 'Email approved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

