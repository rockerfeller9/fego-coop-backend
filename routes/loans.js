const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Loan = require('../models/Loan');

// @route   POST api/loans/apply
// @desc    Apply for a loan
// @access  Private
router.post('/apply', auth, async (req, res) => {
  const { membershipId, amountRequested, purpose, repaymentPeriod } = req.body;

  try {
    const newLoan = new Loan({
      membershipId,
      amountRequested,
      purpose,
      repaymentPeriod,
      user: req.user.id,
    });

    await newLoan.save();
    res.status(201).json({ msg: 'Loan application submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/loans
// @desc    Get all loans for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id });
    res.json(loans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;