import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../src/tools/calculate.js';

describe('Phase 1 - calculate (unit)', () => {
  test('addition simple', () => {
    const { result } = calculate({ expression: '2 + 2' });
    assert.equal(result, 4);
  });

  test('multiplication', () => {
    const { result } = calculate({ expression: '15 * 24' });
    assert.equal(result, 360);
  });

  test('puissance 2**32', () => {
    const { result } = calculate({ expression: '2 ** 32' });
    assert.equal(result, 4294967296);
  });

  test('expression complexe', () => {
    const { result } = calculate({ expression: '(15 * 4) / 3' });
    assert.equal(result, 20);
  });

  test('conversion Fahrenheit', () => {
    const { result } = calculate({ expression: '(12 * 9 / 5) + 32' });
    assert.equal(result, 53.6);
  });

  test('rejette injection de code', () => {
    const res = calculate({ expression: 'process.exit(1)' });
    assert.ok(res.error, 'Doit retourner une erreur');
  });

  test('rejette les lettres arbitraires', () => {
    const res = calculate({ expression: 'alert("xss")' });
    assert.ok(res.error);
  });

  test('rejette les slashes de chemin', () => {
    const res = calculate({ expression: '/etc/passwd' });
    assert.ok(res.error);
  });

  test('retourne error sur expression invalide', () => {
    const res = calculate({ expression: '2 + + +' });
    assert.ok(res.error);
  });
});
