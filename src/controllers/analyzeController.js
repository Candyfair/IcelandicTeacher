import { analyze, analyzeStream } from '../services/analyzeService.js';

export async function analyzeText(req, res, next) {
  try {
    const { text, exerciseContext } = req.body;

    const result = await analyze(text, exerciseContext);

    res.json({ analysis: result });
  } catch (err) {
    next(err);
  }
}

export async function analyzeTextStream(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { text, exerciseContext } = req.body;

    for await (const event of analyzeStream(text, exerciseContext)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: 'error', data: err.message })}\n\n`);
  } finally {
    res.end();
  }
}
