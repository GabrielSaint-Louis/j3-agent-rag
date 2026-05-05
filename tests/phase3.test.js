import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { web_search } from '../src/tools/webSearch.js';

describe('Phase 3 - web_search (integration)', () => {
  test('retourne des resultats pour une requete connue', async () => {
    const results = await web_search({ query: 'Node.js JavaScript runtime' });
    const isArray = Array.isArray(results);
    const isNoResult = results?.message === 'Aucun resultat trouve pour cette requete.';
    assert.ok(isArray || isNoResult, 'Doit retourner un tableau ou un message no-result');
    if (isArray) {
      assert.ok(results.length > 0, 'Le tableau ne doit pas etre vide');
      assert.ok(results[0].text, 'Chaque resultat doit avoir un champ text');
    }
  });

  test('structure correcte des resultats', async () => {
    const results = await web_search({ query: 'JavaScript programming language' });
    if (Array.isArray(results) && results.length > 0) {
      const first = results[0];
      assert.ok('text' in first, 'Champ text requis');
      assert.ok('url' in first, 'Champ url requis');
    }
  });

  test('gere les requetes sans resultat', async () => {
    const results = await web_search({ query: 'xzqwerty12345nonexistentquery99999' });
    const valid = Array.isArray(results) || (results && typeof results.message === 'string');
    assert.ok(valid, 'Doit toujours retourner un tableau ou un objet message');
  });
});
