import { Router } from 'express';
import { validate } from '../controllers/validationController.js';
import { analyzeText, analyzeTextStream } from '../controllers/analyzeController.js';

const router = Router();

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Grammar endpoints
router.post('/validate', validate);
router.post('/analyze', analyzeText);
router.post('/analyze/stream', analyzeTextStream);

export default router;
