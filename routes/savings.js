const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Placeholder routes - implement as needed
router.get('/', auth, async (req, res) => {
  res.json({ msg: 'Savings routes coming soon' });
});

module.exports = router;