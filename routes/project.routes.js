import express from 'express';

const router = express.Router();

// Example projects endpoints
router.get('/', (_req, res) => res.json([]));
router.post('/', (_req, res) => res.status(201).json({ message: 'Project created (stub)' }));

export default router;