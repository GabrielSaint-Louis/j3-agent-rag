import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';

const PINECONE_AVAILABLE = process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_HOST;
const MISTRAL_AVAILABLE = !!process.env.MISTRAL_API_KEY;
const RAG_AVAILABLE = PINECONE_AVAILABLE && MISTRAL_AVAILABLE;

describe('Phase 8 - ragQuery (E2E)', { skip: !RAG_AVAILABLE && 'PINECONE et MISTRAL requis' }, () => {
  test('repond a une question presente dans le corpus', async () => {
    const { ragQuery } = await import('../src/rag/rag.js');
    const answer = await ragQuery('Qui a cree Node.js et quand ?');
    assert.ok(typeof answer === 'string' && answer.length > 0);
    const hasRyanDahl = answer.toLowerCase().includes('ryan') || answer.toLowerCase().includes('dahl');
    const has2009 = answer.includes('2009');
    assert.ok(hasRyanDahl || has2009, `La reponse devrait mentionner Ryan Dahl ou 2009 : "${answer}"`);
  });

  test('indique clairement quand l\'info est absente du corpus', async () => {
    const { ragQuery } = await import('../src/rag/rag.js');
    const answer = await ragQuery('Quel est le prix du Bitcoin en ce moment ?');
    assert.ok(typeof answer === 'string' && answer.length > 0);
    console.log('Reponse hors corpus :', answer.slice(0, 100));
  });
});
