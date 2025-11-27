import express from 'express';
import { auth } from '../middleware/auth.js';
import Repayment from '../models/Repayment.js';

const router = express.Router();

// Get user repayments
router.get('/', auth, async (req, res) => {
  try {
    const repayments = await Repayment.find({ user: req.user.userId })
      .populate('loan')
      .sort({ createdAt: -1 });
    res.json(repayments);
  } catch (err) {
    console.error('Get repayments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single repayment
router.get('/:id', auth, async (req, res) => {
  try {
    const repayment = await Repayment.findOne({ 
      _id: req.params.id, 
      user: req.user.userId 
    }).populate('loan');
    
    if (!repayment) {
      return res.status(404).json({ message: 'Repayment not found' });
    }
    
    res.json(repayment);
  } catch (err) {
    console.error('Get repayment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;