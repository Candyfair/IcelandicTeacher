import 'dotenv/config';

// Server
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || '0.0.0.0';

// Ollama
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
export const MODEL_NAME = process.env.MODEL_NAME || 'llama3:8b';
export const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS) || 10000;

// Phase 1 — morphological tokenization (deterministic, output borné)
export const GRAMMAR_PARAMETERS = {
  temperature: 0,
  top_p: 1,
  num_predict: 400,
  repeat_penalty: 1.05
};

// Phase 2 — syntactic / pedagogical analysis
export const PEDAGOGY_PARAMETERS = {
  temperature: 0.15,
  top_p: 1,
  repeat_penalty: 1.05,
  num_predict: 800
};

// Verification / answer-checking — deterministic
export const VERIFICATION_PARAMETERS = {
  temperature: 0,
  top_p: 1,
  repeat_penalty: 1.05,
  num_predict: 200,
};
