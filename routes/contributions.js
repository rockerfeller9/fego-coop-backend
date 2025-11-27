import express from 'express';
import { auth } from '../middleware/auth.js';
import Contribution from '../models/Contribution.js';
import User from '../models/User.js';
import { initializePayment, verifyPayment } from '../utils/paystack.js';

const router = express.Router();

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
  try {
    console.log('Initialize payment request:', req.body);
    const { amount, type } = req.body;
    
    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum contribution is ₦100' });
    }

    if (!type || !['monthly', 'voluntary'].includes(type)) {
      return res.status(400).json({ message: 'Invalid contribution type' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reference = `CONT${Date.now()}`;

    // Create pending contribution
    const contribution = new Contribution({
      user: req.user.userId,
      amount,
      type,
      reference,
      status: 'pending'
    });

    await contribution.save();
    console.log('Contribution created:', contribution);

    // Initialize Paystack payment
    const paymentData = await initializePayment(
      user.email,
      amount,
      reference,
      {
        contributionId: contribution._id.toString(),
        userId: user._id.toString(),
        type
      }
    );

    console.log('Paystack response:', paymentData);

    if (!paymentData.status) {
      return res.status(400).json({ message: 'Payment initialization failed' });
    }

    res.status(200).json({
      authorizationUrl: paymentData.data.authorization_url,
      accessCode: paymentData.data.access_code,
      reference: paymentData.data.reference
    });
  } catch (err) {
    console.error('Initialize payment error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Verify payment
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const { reference } = req.params;
    console.log('Verifying payment:', reference);

    // Verify payment with Paystack
    const verification = await verifyPayment(reference);
    console.log('Verification response:', verification);

    if (!verification.status || verification.data.status !== 'success') {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update contribution status
    const contribution = await Contribution.findOne({ reference });
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    contribution.status = 'completed';
    await contribution.save();

    // Update user's total savings
    await User.findByIdAndUpdate(contribution.user, {
      $inc: { totalSavings: contribution.amount }
    });

    res.json({
      success: true,
      contribution,
      message: 'Payment verified successfully'
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user contributions
router.get('/', auth, async (req, res) => {
  try {
    const contributions = await Contribution.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(contributions);
  } catch (err) {
    console.error('Get contributions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;