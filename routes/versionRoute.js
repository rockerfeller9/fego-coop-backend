import express from 'express';
const router = express.Router();

router.get('/version', (_req, res) => {
  res.json({
    commit: process.env.COMMIT_HASH || 'unknown',
    time: process.env.COMMIT_TIME || 'unknown',
    env: process.env.NODE_ENV || 'development'
  });
});

export default router;