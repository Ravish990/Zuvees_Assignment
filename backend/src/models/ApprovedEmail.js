const mongoose = require('mongoose');

const approvedEmailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'rider'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ApprovedEmail', approvedEmailSchema);