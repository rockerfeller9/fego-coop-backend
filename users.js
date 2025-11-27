const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('./models/models'); // correct relative path
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

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
      username,
      email,
      password: hashed,
      fullName,
      membershipId,
      // Defaults expected by the dashboard
      isSynced: false,
      isAdmin: false,
      totalContributions: 0,
      currentLoanBalance: 0,
      investmentsInProjects: [],
      notifications: []
    });

    await user.save();
    return res.status(201).json({ message: 'User created', id: user._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      fullName: user.fullName,
      membershipId: user.membershipId,
      isSynced: !!user.isSynced,
      totalContributions: Number(user.totalContributions || 0),
      currentLoanBalance: Number(user.currentLoanBalance || 0),
      investmentsInProjects: Array.isArray(user.investmentsInProjects) ? user.investmentsInProjects : [],
      isAdmin: !!user.isAdmin
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    const notifications = (user && Array.isArray(user.notifications)) ? user.notifications : [];
    return res.json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;