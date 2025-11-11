// fego-coop-backend/utilities/notification.utility.js
const Notification = require('../models/notification.model');

const createNotification = async (userId, message, type, link) => {
    try {
        const notification = new Notification({
            userId,
            message,
            type,
            link
        });
        await notification.save();
        console.log(`Notification created for user ${userId}`);
    } catch (err) {
        console.error("Error creating notification:", err);
    }
};

module.exports = { createNotification };