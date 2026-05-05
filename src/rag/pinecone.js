import 'dotenv/config';
import { getEmbedding } from './embed.js';

function pineconeHeaders() {
  return {
    'Api-Key': process.env.PINECONE_API_KEY,
    'Content-Type': 'application/json'
  };
}

export async function getIndexInfo() {
  const name = process.env.PINECONE_INDEX_NAME;
  const response = await fetch(`https://api.pinecone.io/indexes/${name}`, {
    headers: { 'Api-Key': process.env.PINECONE_API_KEY }
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Pinecone getIndexInfo error ${response.status}: ${err}`);
  }
  const data = await response.json();
  return {
    name: data.name,
    dimension: data.dimension,
    metric: data.metric,
    status: data.status,
    host: data.host
  };
}

export async function upsertChunks(chunks) {
  const vectors = await Promise.all(
    chunks.map(async (chunk, i) => ({
      id: `chunk-${i}`,
      values: await getEmbedding(chunk),
      metadata: { text: chunk }
    }))
  );

  const response = await fetch(`${process.env.PINECONE_INDEX_HOST}/vectors/upsert`, {
    method: 'POST',
    headers: pineconeHeaders(),
    body: JSON.stringify({ vectors })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Pinecone upsert error ${response.status}: ${err}`);
  }
  const data = await response.json();
  return { upsertedCount: data.upsertedCount };
}

export async function searchSimilar(question, topK = 3) {
  const vector = await getEmbedding(question);
  const response = await fetch(`${process.env.PINECONE_INDEX_HOST}/query`, {
    method: 'POST',
    headers: pineconeHeaders(),
    body: JSON.stringify({ vector, topK, includeMetadata: true })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Pinecone query error ${response.status}: ${err}`);
  }
  const data = await response.json();
  return data.matches;
}
