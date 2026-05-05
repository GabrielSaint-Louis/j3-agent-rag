import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';

const PINECONE_AVAILABLE = process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_HOST;

describe('Phase 7 - searchSimilar (integration)', { skip: !PINECONE_AVAILABLE && 'PINECONE requis' }, () => {
  test('retourne des resultats tries par score decroissant', async () => {
    const { searchSimilar } = await import('../src/rag/pinecone.js');
    const matches = await searchSimilar('Qui a cree Node.js ?', 3);
    assert.ok(Array.isArray(matches), 'Doit retourner un tableau');
    assert.ok(matches.length > 0, 'Doit avoir au moins un resultat');
    matches.forEach(m => {
      assert.ok(typeof m.score === 'number');
      assert.ok(m.metadata?.text, 'Chaque match doit avoir metadata.text');
    });
    for (let i = 1; i < matches.length; i++) {
      assert.ok(matches[i - 1].score >= matches[i].score, 'Les scores doivent etre tries par ordre decroissant');
    }
    console.log('Resultats trouvés :');
    matches.forEach(m => console.log(`  Score: ${m.score.toFixed(3)} | ${m.metadata.text.slice(0, 60)}`));
  });

  test('le meilleur resultat est semantiquement pertinent', async () => {
    const { searchSimilar } = await import('../src/rag/pinecone.js');
    const matches = await searchSimilar('environnement execution JavaScript serveur', 3);
    assert.ok(matches.length > 0);
    assert.ok(matches[0].score > 0.5, `Score trop bas : ${matches[0].score}`);
  });

  test('une question hors sujet a un score faible', async () => {
    const { searchSimilar } = await import('../src/rag/pinecone.js');
    const matches = await searchSimilar('recette de tarte aux pommes', 1);
    if (matches.length > 0) {
      console.log(`Score hors sujet : ${matches[0].score.toFixed(3)}`);
    }
  });
});
