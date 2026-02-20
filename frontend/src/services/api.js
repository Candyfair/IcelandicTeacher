const BASE_URL = '/api';

// Shared fetch wrapper
async function post(endpoint, body) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

// Public API
export function validateText(text, exerciseContext) {
  return post('/validate', { text, exerciseContext });
}

export async function analyzeText(text, exerciseContext, onChunk, onReset) {
  const response = await fetch(`${BASE_URL}/analyze/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, exerciseContext }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const event = JSON.parse(line.slice(6));
      if (event.type === 'chunk') onChunk(event.data);
      if (event.type === 'reset') onReset();
      if (event.type === 'error') throw new Error(event.data);
      if (event.type === 'done') return;
    }
  }
}
