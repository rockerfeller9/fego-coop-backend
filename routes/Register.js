import express from 'express';
const router = express.Router();

// TODO: implement registration
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router;