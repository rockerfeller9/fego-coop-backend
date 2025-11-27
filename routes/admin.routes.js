import express from 'express';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import User from '../models/models.js';

const router = express.Router();

// GET pending (unverified) users
router.get('/users/pending', auth, admin, async (_req, res) => {
  const pending = await User.find({ isSynced: false })
    .select('fullName membershipId email createdAt');
  res.json(pending);
});

// PATCH verify a user
router.patch('/users/:id/verify', auth, admin, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { isSynced: true } },
    { new: true }
  ).select('fullName membershipId isSynced');
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// PATCH admin self-verify
router.patch('/self-verify', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { isSynced: true } },
      { new: true }
    ).select('fullName membershipId isSynced');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    console.error('Self verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST bulk approve users
router.post('/users/bulk-verify', auth, admin, async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Provide array of user IDs' });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds }, isSynced: false },
      { $set: { isSynced: true } }
    );

    res.json({ message: 'Bulk verification complete', modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('Bulk verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
