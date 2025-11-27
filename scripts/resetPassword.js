import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = 'chukwunonsookoye9@gmail.com';
  const newPassword = '11144460';
  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found');
    process.exit(1);
  }
  user.password = newPassword; // relies on pre-save hook to hash
  await user.save();
  console.log('Password updated');
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });