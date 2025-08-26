import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

export async function ollamaChat(messages, options = {}) {
  const res = await axios.post(`${OLLAMA_URL}/api/chat`, {
    model: MODEL,
    messages,
    options: { temperature: 0.2, ...options }
  });
  return res.data;
}
