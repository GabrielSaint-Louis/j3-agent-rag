import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { simpleChunk } from '../src/rag/embed.js';
import { upsertChunks } from '../src/rag/pinecone.js';

if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_HOST) {
  console.error('PINECONE_API_KEY et PINECONE_INDEX_HOST sont requis dans .env');
  process.exit(1);
}

const text = readFileSync('./corpus/nodejs.txt', 'utf-8');
const chunks = simpleChunk(text, 30);

console.log(`Indexation de ${chunks.length} chunks dans Pinecone...`);

const result = await upsertChunks(chunks);
console.log(`Indexe : ${result.upsertedCount} vecteurs`);
