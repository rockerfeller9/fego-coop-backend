const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/user.model');

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) { console.error('Missing MONGO_URI'); process.exit(1); }
    await mongoose.connect(uri);
    const users = await User.find(
      {},
      { _id: 1, email: 1, username: 1, fullName: 1, membershipId: 1, isAdmin: 1, isSynced: 1 }
    ).lean();
    console.table(users);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();