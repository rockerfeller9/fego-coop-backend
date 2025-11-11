const express = require('express');
const router = require('express').Router();
const crypto = require('crypto');
const Contribution = require('../models/contribution.model');
const User = require('../models/user.model');

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const secret = (process.env.PAYSTACK_SECRET_KEY || '').trim();
  const hash = crypto.createHmac('sha512', secret).update(req.body).digest('hex');
  if (hash !== signature) return res.status(400).send('Invalid signature');

  try {
    const event = JSON.parse(req.body.toString());
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const contribution = await Contribution.findOne({ transactionRef: reference });
      console.log('Contribution doc:', contribution);
      if (contribution && contribution.status === 'pending') {
        contribution.status = 'success';
        await contribution.save();
        await User.findByIdAndUpdate(
          contribution.userId,
          { $inc: { totalContributions: contribution.amount } }
        );
        console.log('Webhook applied contribution for ref', reference);
      }
    }
    res.sendStatus(200);
  } catch (e) {
    console.error('Webhook error:', e);
    res.sendStatus(500);
  }
});

module.exports = router;