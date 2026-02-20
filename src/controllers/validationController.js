import { validateAnswer } from '../services/validationService.js';

export async function validate(req, res, next) {
  try {
    const { text, exerciseContext } = req.body;

    const result = await validateAnswer(text, exerciseContext);

    res.json(result);
  } catch (err) {
    next(err);
  }
}
