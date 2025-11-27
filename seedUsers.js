require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const adminExists = await User.findOne({ role:'admin' });
    if (!adminExists) {
      const adminPass = await bcrypt.hash('AdminPass123!', 10);
      await User.create({
        name:'System Admin',
        email:'admin@fego.coop',
        password:adminPass,
        role:'admin'
      });
      console.log('Admin created: admin@fego.coop / AdminPass123!');
    }
    const members = [
      { name:'Member One', email:'member1@fego.coop' },
      { name:'Member Two', email:'member2@fego.coop' }
    ];
    for (const m of members) {
      const exists = await User.findOne({ email:m.email });
      if (!exists) {
        const pass = await bcrypt.hash('MemberPass123!', 10);
        await User.create({ ...m, password:pass, role:'member' });
        console.log('Created member:', m.email);
      }
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();