import { generate } from '../providers/provider.factory.js';
import { VERIFICATION_PARAMETERS } from '../config/config.js';

// Prompt construction — conservative bias: prefer VALID when uncertain
function buildValidationPrompt(userAnswer, exerciseContext) {
  return `You are a careful Icelandic grammar checker.

Exercise context: ${exerciseContext}
Student answer: ${userAnswer}

Rules:
- Only respond INVALID if there is a clear, unambiguous grammatical error.
- Do not flag stylistic variations, dialectal forms, or alternative valid constructions.
- Icelandic allows many valid forms — do not over-correct.
- When in doubt, respond VALID.

Respond using EXACTLY one of these two formats — no extra text, no explanation:

VALID

or

INVALID
Suggestion: <corrected Icelandic sentence>`;
}

// Confirmation prompt — independent second opinion on INVALID results
function buildConfirmationPrompt(userAnswer, exerciseContext) {
  return `You are a senior Icelandic linguistics expert reviewing a flagged student answer.

Exercise context: ${exerciseContext}
Answer flagged as incorrect: "${userAnswer}"

Is this answer genuinely and unambiguously grammatically wrong in Icelandic?
Many valid forms exist — only confirm if you are certain.

Respond with exactly one word: CONFIRM or REJECT
No other text.`;
}

// Response parsing
function parseValidationResponse(raw) {
  const trimmed = raw.trim();

  if (/^VALID$/i.test(trimmed)) {
    return { valid: true };
  }

  const invalidMatch = trimmed.match(/^INVALID\s*\nSuggestion:\s*(.+)$/is);
  if (invalidMatch) {
    return { valid: false, suggestion: invalidMatch[1].trim() };
  }

  throw new Error(`Unparseable validation response from model: "${trimmed}"`);
}

// Public API — double-pass: INVALID is only returned if a second model call confirms it
export async function validateAnswer(userAnswer, exerciseContext) {
  if (!userAnswer || !exerciseContext) {
    throw new Error('validateAnswer requires both userAnswer and exerciseContext');
  }

  const firstPass = await generate(
    buildValidationPrompt(userAnswer, exerciseContext),
    VERIFICATION_PARAMETERS
  );

  const firstResult = parseValidationResponse(firstPass);

  // Fast path — no confirmation needed
  if (firstResult.valid) {
    return firstResult;
  }

  // Confirmation pass — prevent hallucinated INVALID responses
  const confirmation = await generate(
    buildConfirmationPrompt(userAnswer, exerciseContext),
    VERIFICATION_PARAMETERS
  );

  if (/^CONFIRM$/i.test(confirmation.trim())) {
    return firstResult;
  }

  // Confirmation rejected — treat as valid
  return { valid: true };
}
