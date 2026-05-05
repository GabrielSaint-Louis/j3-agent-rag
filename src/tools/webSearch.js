export const searchTool = {
  type: 'function',
  function: {
    name: 'web_search',
    description: "Recherche des informations recentes sur le web. Utiliser pour des faits actuels, des evenements recents, des prix, des donnees en temps reel, ou quand on n'est pas certain d'une information.",
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'La requete de recherche, en anglais pour de meilleurs resultats'
        }
      },
      required: ['query']
    }
  }
};

export async function web_search({ query }) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (educational project)' }
  });
  const data = await response.json();

  if (data.Answer) {
    return [{ text: data.Answer, url: '' }];
  }

  const direct = (data.Results ?? []).filter(t => t.Text).slice(0, 3).map(t => ({ text: t.Text, url: t.FirstURL }));
  if (direct.length > 0) return direct;

  const topics = (data.RelatedTopics ?? []).filter(t => t.Text).slice(0, 5).map(t => ({ text: t.Text, url: t.FirstURL }));
  if (topics.length > 0) return topics;

  if (data.AbstractText) {
    return [{ text: data.AbstractText, url: data.AbstractURL }];
  }

  return { message: 'Aucun resultat trouve pour cette requete.' };
}
