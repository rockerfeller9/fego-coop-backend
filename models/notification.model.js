// fego-coop-backend/models/notification.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    message: { type: String, required: true },
    type: { type: String, enum: ['Loan Status', 'New Project', 'General'], default: 'General' },
    isRead: { type: Boolean, default: false },
    link: { type: String } // Optional link to the relevant page (e.g., /dashboard/loans)
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;