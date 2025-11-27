import express from 'express';
import auth from '../middleware/auth.js';
const router = express.Router();

// Placeholder loan endpoints
router.post('/', auth, (req, res) => { res.json({ message: 'Create loan - stub' }); });
router.get('/', auth, (req, res) => { res.json([]); });

export default router;