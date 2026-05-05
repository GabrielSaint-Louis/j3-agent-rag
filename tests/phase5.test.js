import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';

const PINECONE_AVAILABLE = process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_HOST;

describe('Phase 5 - Pinecone setup (integration)', { skip: !PINECONE_AVAILABLE && 'PINECONE_API_KEY requis' }, () => {
  test('getIndexInfo retourne les metadonnees de l\'index', async () => {
    const { getIndexInfo } = await import('../src/rag/pinecone.js');
    const info = await getIndexInfo();
    assert.ok(info.name, 'Doit avoir un nom');
    assert.ok(info.dimension === 1024, 'Dimension attendue : 1024');
    assert.ok(info.metric, 'Doit avoir une metrique');
    console.log('Index connecte :', info);
  });
});
