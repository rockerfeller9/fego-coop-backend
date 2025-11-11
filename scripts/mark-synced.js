const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/user.model');

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) { console.error('Missing MONGO_URI'); process.exit(1); }

    const membershipId = process.argv[2];
    if (!membershipId) {
      console.log('Usage: node scripts/mark-synced.js <MEMBERSHIP_ID>');
      process.exit(1);
    }

    await mongoose.connect(uri);
    const user = await User.findOneAndUpdate(
      { membershipId },
      { $set: { isSynced: true } },
      { new: true }
    );
    if (!user) {
      console.log('User not found for membershipId:', membershipId);
      process.exit(1);
    }
    console.log(`User ${user.membershipId} synced:`, user.isSynced);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();