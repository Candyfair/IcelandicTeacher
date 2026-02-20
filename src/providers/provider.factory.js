// Active provider is selected via PROVIDER env var (default: ollama)
const PROVIDER = process.env.PROVIDER || 'ollama';

const providers = {
  ollama: () => import('./localOllamaProvider.js'),
  // anthropic: () => import('./anthropic.provider.js'),
  // openai:    () => import('./openai.provider.js'),
};

if (!providers[PROVIDER]) {
  throw new Error(`Unknown provider: "${PROVIDER}". Available: ${Object.keys(providers).join(', ')}`);
}

const { generate, generateStream } = await providers[PROVIDER]();

export { generate, generateStream };
