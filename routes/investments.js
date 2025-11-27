import express from 'express';
import { auth } from '../middleware/auth.js';
import Investment from '../models/Investment.js';

const router = express.Router();

// Create investment
router.post('/', auth, async (req, res) => {
  try {
    const { projectName, amount, duration, expectedReturn } = req.body;

    const investment = new Investment({
      user: req.user.userId,
      projectName,
      amount,
      duration,
      expectedReturn
    });

    await investment.save();
    res.status(201).json(investment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user investments
router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(investments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;