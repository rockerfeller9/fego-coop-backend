// fego-coop-backend/models/user.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // Core Identification and Authentication
    username: {
        type: String,
        required: true,
        unique: true, // Ensures no two members have the same username/ID
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: { // We will store a HASHED password here, never plain text
        type: String,
        required: true,
        minlength: 6
    },
    // Cooperative Specific Fields (Metadata)
    fullName: { type: String, required: true },
    membershipId: { type: String, required: true, unique: true },
    
    // Financial Tracking Fields (These will likely link to separate collections later, but we start here)
    totalContributions: { type: Number, default: 0 },
    currentLoanBalance: { type: Number, default: 0 },
    investmentsInProjects: [{ 
        projectId: { type: String },
        amount: { type: Number },
        date: { type: Date, default: Date.now }
    }],

    // System fields
    isAdmin: { type: Boolean, default: false },

}, {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
});

const User = mongoose.model('User', userSchema);

module.exports = User;
