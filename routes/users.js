const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/models'); // path must be correct

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, membershipId } = req.body;
    if (!username || !email || !password || !fullName || !membershipId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await User.findOne({
      $or: [{ username }, { email }, { membershipId }]
    });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      username, email, password: hashed, fullName, membershipId
    });
    await user.save();
    return res.status(201).json({ message: 'User created', id: user._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;