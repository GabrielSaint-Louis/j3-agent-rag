import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import { runAgent, resetHistory } from '../src/agent.js';
import { calculateTool, calculate } from '../src/tools/calculate.js';
import { weatherTool, get_weather } from '../src/tools/weather.js';
import { searchTool, web_search } from '../src/tools/webSearch.js';

const PINECONE_AVAILABLE = process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_HOST;

async function buildAllTools() {
  const tools = [calculateTool, weatherTool, searchTool];
  const fns = { calculate, get_weather, web_search };

  if (PINECONE_AVAILABLE) {
    const { ragTool, rag_search } = await import('../src/tools/ragSearch.js');
    tools.push(ragTool);
    fns.rag_search = rag_search;
  }
  return { tools, fns };
}

describe('Phase 9 - agent hybride 4 outils (E2E)', () => {
  test('choisit calculate pour un calcul', async () => {
    const { tools, fns } = await buildAllTools();
    const messages = [{ role: 'user', content: 'Combien font 2 a la puissance 10 ?' }];
    const answer = await runAgent(tools, fns, messages);
    assert.ok(answer.includes('1024'), `Attendu 1024 dans : "${answer}"`);
  });

  test('choisit get_weather pour la meteo', async () => {
    const { tools, fns } = await buildAllTools();
    const messages = [{ role: 'user', content: 'Quel temps fait-il a Tokyo ?' }];
    const answer = await runAgent(tools, fns, messages);
    assert.ok(typeof answer === 'string' && answer.length > 0);
    assert.ok(
      answer.toLowerCase().includes('tokyo') || answer.toLowerCase().includes('°c') || answer.toLowerCase().includes('temp'),
      `La reponse doit parler de meteo : "${answer.slice(0, 100)}"`
    );
  });

  test('repond directement sans outil pour une blague', async () => {
    const { tools, fns } = await buildAllTools();
    const messages = [{ role: 'user', content: 'Raconte une blague courte.' }];
    const answer = await runAgent(tools, fns, messages);
    assert.ok(typeof answer === 'string' && answer.length > 10);
  });

  test('choisit rag_search pour le corpus prive', { skip: !PINECONE_AVAILABLE && 'PINECONE requis' }, async () => {
    const { tools, fns } = await buildAllTools();
    const messages = [{ role: 'user', content: 'D\'apres le corpus prive, qui a cree Node.js ?' }];
    const answer = await runAgent(tools, fns, messages);
    assert.ok(typeof answer === 'string' && answer.length > 0);
    console.log('Reponse RAG :', answer.slice(0, 150));
  });
});
