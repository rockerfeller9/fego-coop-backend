const router = require('express').Router();
const axios = require('axios');
const auth = require('../middleware/auth.middleware');
const Contribution = require('../models/contribution.model');
const User = require('../models/user.model');

const PAYSTACK_BASE = 'https://api.paystack.co';

const getSecret = () => (process.env.PAYSTACK_SECRET_KEY || '').trim();

// @route   POST /api/paystack/initialize-payment
// @desc    Initialize a new payment with Paystack
// @access  Private
router.post('/initialize-payment', auth, async (req, res) => {
  const { amount, email, membershipId } = req.body;
  const userId = req.user.id;

  try {
    const secret = getSecret();
    if (!secret) return res.status(500).json({ msg: 'Missing Paystack secret key' });
    if (!secret.startsWith('sk_')) return res.status(500).json({ msg: 'Invalid Paystack secret key format' });
    if (!email || !membershipId) return res.status(400).json({ msg: 'Email and membershipId required' });
    if (!amount || amount < 100) return res.status(400).json({ msg: 'Invalid amount (min 100)' });

    const payload = {
      email,
      amount: Math.round(Number(amount) * 100),
      reference: `FEGO-${Date.now()}`,
      callback_url: 'http://localhost:5173/dashboard',
      metadata: { membershipId }
    };

    const psRes = await axios.post(`${PAYSTACK_BASE}/transaction/initialize`, payload, {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const data = psRes.data; // { status, message, data: { authorization_url, reference, ... } }
    if (data.status !== true || !data.data?.authorization_url) {
      return res.status(400).json({ msg: 'Paystack initialization failed', details: data.message });
    }

    await Contribution.create({
      userId,
      membershipId,
      amount,
      transactionRef: data.data.reference
    });

    return res.json({ url: data.data.authorization_url });
  } catch (err) {
    console.error('Init error:', err.response?.data || err.message);
    return res.status(500).json({
      msg: 'Server Error during payment initialization.',
      details: err.response?.data?.message || err.message
    });
  }
});

// @route   GET /api/paystack/verify-payment/:reference
// @desc    Verify a payment transaction
// @access  Private
router.get('/verify-payment/:reference', auth, async (req, res) => {
  const { reference } = req.params;
  try {
    const secret = getSecret();
    if (!secret) return res.status(500).json({ msg: 'Missing Paystack secret key' });

    const psRes = await axios.get(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
      timeout: 10000
    });

    const data = psRes.data;
    if (data.status !== true) return res.status(400).json({ msg: 'Verification failed', details: data.message });
    if (data.data.status !== 'success') return res.status(400).json({ msg: `Payment status: ${data.data.status}` });

    const contribution = await Contribution.findOne({ transactionRef: reference });
    if (!contribution) return res.status(404).json({ msg: 'Contribution record not found' });

    if (contribution.status === 'pending') {
      contribution.status = 'success';
      await contribution.save();
      await User.findByIdAndUpdate(contribution.userId, { $inc: { totalContributions: contribution.amount } });
      return res.json({ msg: 'Payment verified and contributions updated.' });
    }
    return res.json({ msg: 'Payment already processed.' });
  } catch (err) {
    console.error('Verify error:', err.response?.data || err.message);
    return res.status(500).json({
      msg: 'Server Error during payment verification.',
      details: err.response?.data?.message || err.message
    });
  }
});

module.exports = router;