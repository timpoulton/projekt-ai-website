import express from 'express';
import { logger } from '../Services/logger.js';

const router = express.Router();

router.get('/', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  res.json(logger.getRecentLogs(limit));
});

router.delete('/', (req, res) => {
  const result = logger.clearLogs();
  res.json(result);
});

export default router; 