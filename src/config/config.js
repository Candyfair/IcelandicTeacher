import 'dotenv/config';

// Server
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || '0.0.0.0';

// Ollama
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
export const MODEL_NAME = process.env.MODEL_NAME || 'llama3:8b';
export const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS) || 10000;

// Generation parameters
export const MODEL_PARAMETERS = {
  temperature: 0.2,
  top_p: 0.9,
  repeat_penalty: 1.1,
  num_predict: 1024,
};

// Verification / answer-checking — deterministic
export const VERIFICATION_PARAMETERS = {
  temperature: 0,
};
