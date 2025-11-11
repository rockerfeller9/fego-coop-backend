const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const paystack = require('../utils/paystack');
const User = require('../models/user.model');

// Init a transaction
router.post('/initialize', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ msg: 'Amount required' });

    const user = await User.findById(req.user.id).select('email membershipId');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Paystack expects amount in kobo (NGN * 100)
    const initRes = await paystack.post('/transaction/initialize', {
      email: user.email,
      amount: Number(amount) * 100,
      metadata: { membershipId: user.membershipId }
    });

    res.json(initRes.data);
  } catch (e) {
    console.error(e.response?.data || e);
    res.status(500).json({ msg: 'Paystack init failed' });
  }
});

// Verify a transaction
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const { reference } = req.params;
    const verifyRes = await paystack.get(`/transaction/verify/${reference}`);
    res.json(verifyRes.data);
  } catch (e) {
    console.error(e.response?.data || e);
    res.status(500).json({ msg: 'Paystack verify failed' });
  }
});

module.exports = router;