import { Router } from 'express';
import { validate } from '../controllers/validationController.js';
import { analyzeText, analyzeTextStream } from '../controllers/analyzeController.js';
import { OLLAMA_BASE_URL } from '../config/config.js';

const router = Router();

// Health check — also probes Ollama connectivity
router.get('/health', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    res.json({ status: 'ok', ollama: response.ok ? 'running' : 'unreachable' });
  } catch {
    res.json({ status: 'ok', ollama: 'unreachable' });
  }
});

// Grammar endpoints
router.post('/validate', validate);
router.post('/analyze', analyzeText);
router.post('/analyze/stream', analyzeTextStream);

export default router;
