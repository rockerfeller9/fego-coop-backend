// fego-coop-backend/routes/loan.routes.js

const router = require('express').Router();
const Loan = require('../models/loans.model'); // fixed path
const auth = require('../middleware/auth.middleware'); // Secure this route!
const User = require('../models/user.model');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// @route   POST /api/loans/apply
// @desc    Submit a new loan application
// @access  Private (Requires authentication token)
router.route('/apply').post(auth, async (req, res) => {
  try {
    const { amountRequested, purpose, repaymentPeriod } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const loan = await Loan.create({
      userId: user._id,
      membershipId: user.membershipId,
      amountRequested,
      purpose,
      repaymentPeriod
    });

    res.json({ msg: 'Loan application submitted', loan });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Loan application failed' });
  }
});

// @route   GET /api/loans/my-loans
// @desc    Get all loans for the current user
// @access  Private (Requires authentication token)
router.get('/my-loans', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user.id }).sort({ applicationDate: -1 });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch loans' });
  }
});

// @route   PATCH /api/loans/:id/status
// @desc    Update the status of a loan
// @access  Private (Requires authentication token)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    // ensure requester is admin (adapt to your auth payload)
    // const requester = await User.findById(req.user.id).select('isAdmin');
    // if (!requester?.isAdmin) return res.status(403).json({ msg: 'Admins only' });

    const { status, adminNotes, amountApproved } = req.body || {};
    const allowed = ['Pending', 'Approved', 'Rejected', 'Paid'];
    if (!allowed.includes(status)) return res.status(400).json({ msg: 'Invalid status' });

    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ msg: 'Loan not found' });

    const prevStatus = loan.status;

    // Update status fields
    loan.status = status;
    if (adminNotes !== undefined) loan.adminNotes = adminNotes;
    if (status === 'Approved' && !loan.approvedDate) loan.approvedDate = new Date();
    if (status === 'Paid') loan.paidDate = new Date();

    // Persist loan changes first
    await loan.save();

    // Adjust user's currentLoanBalance
    if (status === 'Approved' && prevStatus !== 'Approved') {
      const incAmt = Number(amountApproved ?? loan.amountRequested) || 0;
      if (incAmt > 0) {
        await User.findByIdAndUpdate(loan.userId, { $inc: { currentLoanBalance: incAmt } });
      }
    } else if (status === 'Paid' && prevStatus === 'Approved') {
      const decAmt = Number(loan.amountRequested) || 0;
      if (decAmt > 0) {
        await User.findByIdAndUpdate(loan.userId, { $inc: { currentLoanBalance: -decAmt } });
      }
    }

    const updated = await Loan.findById(req.params.id);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Failed to update status' });
  }
});

module.exports = router;
