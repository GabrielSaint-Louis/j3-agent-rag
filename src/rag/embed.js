import 'dotenv/config';

export async function getEmbedding(text) {
  const response = await fetch('https://api.mistral.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
    },
    body: JSON.stringify({ model: 'mistral-embed', input: text })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mistral embeddings error ${response.status}: ${err}`);
  }
  const data = await response.json();
  return data.data[0].embedding;
}

export function simpleChunk(text, maxWords = 50) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    const chunk = words.slice(i, i + maxWords).join(' ');
    if (chunk.trim()) chunks.push(chunk);
  }
  return chunks;
}
