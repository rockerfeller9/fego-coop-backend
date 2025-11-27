import express from 'express';
import auth from '../middleware/auth.js';
import Contribution from '../models/contribution.model.js';

const router = express.Router();

// GET user contributions
router.get('/', auth, async (req, res) => {
  const list = await Contribution.find({ userId: req.user.id })
    .sort({ createdAt: -1 });
  res.json(list);
});

export default router;