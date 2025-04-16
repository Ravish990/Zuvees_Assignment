const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String },
    displayName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    profilePicture: { type: String },
    role: { type: String, enum: ['user', 'admin', 'rider'], default: 'user' },
    address: { type: String },
    phoneNumber: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
