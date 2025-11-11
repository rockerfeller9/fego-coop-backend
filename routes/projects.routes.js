const router = require('express').Router();

// Minimal placeholder endpoints
router.get('/', async (_req, res) => {
  res.json({ projects: [] });
});

module.exports = router;