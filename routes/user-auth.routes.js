// fego-coop-backend/routes/user-auth.routes.js

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/models.js'; // adjust path if different
import auth from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    let { username, email, password, fullName, membershipId } = req.body;
    if (!username || !email || !password || !fullName || !membershipId)
      return res.status(400).json({ error: 'Missing fields' });

    email = email.trim().toLowerCase();
    username = username.trim();
    membershipId = membershipId.trim();

    const existing = await User.findOne({
      $or: [{ username }, { email }, { membershipId }]
    });
    if (existing) {
      return res.status(409).json({
        error: 'User exists',
        conflict: {
          usernameMatch: existing.username === username,
          emailMatch: existing.email === email,
          membershipIdMatch: existing.membershipId === membershipId
        }
      });
    }

    if (password.length < 6)
      return res.status(400).json({ error: 'Password too short' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
      fullName,
      membershipId,
      isSynced: true,  // Auto-verify all users
      isAdmin: false,
      totalContributions: 0,
      currentLoanBalance: 0,
      investmentsInProjects: [],
      notifications: []
    });

    return res.status(201).json({ id: user._id });
  } catch (e) {
    console.error('REGISTER ERROR:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, email, username, password } = req.body;
    if (!password) return res.status(400).json({ error: 'Missing password' });

    const rawId = (usernameOrEmail || email || username || '').trim();
    if (!rawId) return res.status(400).json({ error: 'Missing identifier' });

    const idLower = rawId.toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: idLower },
        { username: rawId } // keep username exact if you prefer
      ]
    }).collation({ locale: 'en', strength: 2 }); // case-insensitive for email

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Profile for dashboard
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({
    fullName: user.fullName,
    membershipId: user.membershipId,
    isSynced: !!user.isSynced,
    totalContributions: Number(user.totalContributions || 0),
    currentLoanBalance: Number(user.currentLoanBalance || 0),
    investmentsInProjects: Array.isArray(user.investmentsInProjects) ? user.investmentsInProjects : [],
    isAdmin: !!user.isAdmin
  });
});

// Notifications
router.get('/notifications', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('notifications');
  res.json(user?.notifications || []);
});

export default router;
