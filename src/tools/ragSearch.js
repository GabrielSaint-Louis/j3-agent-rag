import { getEmbedding } from '../rag/embed.js';
import { searchSimilar } from '../rag/pinecone.js';

export const ragTool = {
  type: 'function',
  function: {
    name: 'rag_search',
    description: 'Cherche des informations dans la base de documents internes indexee. Utiliser pour des questions sur le contenu du corpus prive, la documentation interne, ou quand web_search ne retourne pas de resultats pertinents.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'La requete de recherche semantique'
        }
      },
      required: ['query']
    }
  }
};

export async function rag_search({ query }) {
  const matches = await searchSimilar(query, 3);
  return matches.map(m => ({ score: m.score, text: m.metadata.text }));
}
