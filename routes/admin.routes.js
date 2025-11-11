// fego-coop-backend/routes/admin.routes.js
const router = require('express').Router();
const Loan = require('../models/loans.model');
const User = require('../models/user.model');
const auth = require('../middleware/auth.middleware');
const { createNotification } = require('../utilities/notification.utility');

// Admin guard
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ msg: 'Admin only' });
  next();
};

// List loans (Admin)
router.get('/loans', auth, adminOnly, async (req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch loans' });
  }
});

// Approve loan
router.patch('/loans/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ msg: 'Loan not found' });

    loan.status = 'Approved';
    loan.approvedDate = new Date();
    await loan.save();

    await User.findByIdAndUpdate(loan.userId, { $inc: { currentLoanBalance: loan.amountRequested } });

    await createNotification(
      loan.userId,
      `Your loan application for NGN ${loan.amountRequested} was Approved.`,
      'Loan Status',
      '/dashboard'
    );

    res.json({ msg: 'Loan approved', loan });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Failed to approve loan' });
  }
});

// Reject loan
router.patch('/loans/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ msg: 'Loan not found' });

    loan.status = 'Rejected';
    await loan.save();

    await createNotification(
      loan.userId,
      `Your loan application for NGN ${loan.amountRequested} was Rejected.`,
      'Loan Status',
      '/dashboard'
    );

    res.json({ msg: 'Loan rejected', loan });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Failed to reject loan' });
  }
});

module.exports = router;
