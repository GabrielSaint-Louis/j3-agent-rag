import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import { simpleChunk } from '../src/rag/embed.js';

const MISTRAL_AVAILABLE = !!process.env.MISTRAL_API_KEY;
const PINECONE_AVAILABLE = process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_HOST;

describe('Phase 6 - embed et upsert (unit + integration)', () => {
  describe('simpleChunk (unit)', () => {
    test('decouper un texte en chunks de 3 mots', () => {
      const text = 'un deux trois quatre cinq six sept';
      const chunks = simpleChunk(text, 3);
      assert.equal(chunks.length, 3);
      assert.equal(chunks[0], 'un deux trois');
      assert.equal(chunks[1], 'quatre cinq six');
      assert.equal(chunks[2], 'sept');
    });

    test('ignorer les espaces multiples', () => {
      const text = 'un  deux   trois';
      const chunks = simpleChunk(text, 10);
      assert.equal(chunks.length, 1);
      assert.equal(chunks[0], 'un deux trois');
    });

    test('retourner un tableau vide pour texte vide', () => {
      const chunks = simpleChunk('', 10);
      assert.equal(chunks.length, 0);
    });

    test('respecter la taille maxWords', () => {
      const words = Array.from({ length: 100 }, (_, i) => `mot${i}`);
      const text = words.join(' ');
      const chunks = simpleChunk(text, 10);
      assert.equal(chunks.length, 10);
      chunks.forEach(chunk => {
        const count = chunk.split(' ').length;
        assert.ok(count <= 10, `Chunk trop long : ${count} mots`);
      });
    });
  });

  describe('getEmbedding (integration)', { skip: !MISTRAL_AVAILABLE && 'MISTRAL_API_KEY requis' }, () => {
    test('retourne un vecteur de 1024 dimensions', async () => {
      const { getEmbedding } = await import('../src/rag/embed.js');
      const embedding = await getEmbedding('Le chat est sur le tapis');
      assert.equal(embedding.length, 1024);
      assert.ok(typeof embedding[0] === 'number');
      console.log('Premiers nombres :', embedding.slice(0, 3));
    });

    test('deux textes similaires ont des embeddings proches', async () => {
      const { getEmbedding } = await import('../src/rag/embed.js');
      const [e1, e2, e3] = await Promise.all([
        getEmbedding('Le chat dort sur le canape'),
        getEmbedding('Le felin se repose sur le sofa'),
        getEmbedding('La bourse de Tokyo baisse fortement')
      ]);

      const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
      const norm = a => Math.sqrt(a.reduce((s, x) => s + x * x, 0));
      const cosine = (a, b) => dot(a, b) / (norm(a) * norm(b));

      const simSimilar = cosine(e1, e2);
      const simDistant = cosine(e1, e3);
      console.log(`Similarite chat/felin : ${simSimilar.toFixed(3)}`);
      console.log(`Similarite chat/bourse : ${simDistant.toFixed(3)}`);
      assert.ok(simSimilar > simDistant, 'Les textes semantiquement proches doivent avoir une similarite plus elevee');
    });
  });

  describe('upsertChunks (integration)', { skip: !PINECONE_AVAILABLE && 'PINECONE requis' }, () => {
    test('upsert de chunks dans Pinecone', async () => {
      const { upsertChunks } = await import('../src/rag/pinecone.js');
      const chunks = ['Node.js est cree par Ryan Dahl en 2009.', 'V8 est le moteur JavaScript de Chrome.'];
      const result = await upsertChunks(chunks);
      assert.ok(result.upsertedCount >= 0);
      console.log('Upserted :', result.upsertedCount);
    });
  });
});
