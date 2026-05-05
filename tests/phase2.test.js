import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { get_weather } from '../src/tools/weather.js';

describe('Phase 2 - get_weather (integration)', () => {
  test('retourne les donnees meteo pour Paris', async () => {
    const result = await get_weather({ city: 'Paris' });
    assert.ok(!result.error, `Erreur inattendue : ${result.error}`);
    assert.ok(result.city === 'Paris');
    assert.ok(typeof result.temperature_c === 'string' || typeof result.temperature_c === 'number');
    assert.ok(result.description);
    assert.ok(result.humidity);
    assert.ok(result.wind_kmph);
  });

  test('retourne un resultat ou une erreur pour une chaine absurde', async () => {
    const result = await get_weather({ city: 'CetteVilleNexistePas12345' });
    // wttr.in tente de deviner une ville; on accepte erreur OU donnees
    const isValid = result.error || (result.temperature_c !== undefined);
    assert.ok(isValid, 'Doit retourner soit une erreur soit des donnees');
  });

  test('retourne temperature et feels_like', async () => {
    const result = await get_weather({ city: 'London' });
    if (!result.error) {
      assert.ok('temperature_c' in result);
      assert.ok('feels_like_c' in result);
    }
  });
});
