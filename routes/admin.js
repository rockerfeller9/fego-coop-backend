const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Loan = require('../models/Loan');

// @route   GET api/admin/loans
// @desc    Get all pending loans
// @access  Private/Admin
router.get('/loans', auth, async (req, res) => {
  try {
    // Check if user is admin
    const User = require('../models/user.model');
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const loans = await Loan.find({ status: 'pending' }).populate('user', 'email fullName');
    res.json(loans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/admin/loans/:id/approve
// @desc    Approve a loan
// @access  Private/Admin
router.patch('/loans/:id/approve', auth, async (req, res) => {
  try {
    const User = require('../models/user.model');
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    loan.status = 'approved';
    await loan.save();

    res.json({ msg: 'Loan approved', loan });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/admin/loans/:id/reject
// @desc    Reject a loan
// @access  Private/Admin
router.patch('/loans/:id/reject', auth, async (req, res) => {
  try {
    const User = require('../models/user.model');
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    loan.status = 'rejected';
    await loan.save();

    res.json({ msg: 'Loan rejected', loan });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;