const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/user.model');

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('Missing MONGO_URI in .env');
      process.exit(1);
    }

    const email = process.argv[2];
    if (!email) {
      console.log('Usage: node scripts/make-admin.js user@example.com');
      process.exit(1);
    }

    await mongoose.connect(uri);
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    if (user.isAdmin) {
      console.log(`User ${email} is already admin.`);
      process.exit(0);
    }

    user.isAdmin = true;
    await user.save();
    console.log(`User ${email} is now admin.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();