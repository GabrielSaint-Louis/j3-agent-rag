import 'dotenv/config';
import { searchSimilar } from './pinecone.js';

export async function ragQuery(question) {
  const matches = await searchSimilar(question, 3);

  console.log('Contexte recupere :');
  matches.forEach(m => {
    console.log(`  [${m.score.toFixed(2)}] ${m.metadata.text.slice(0, 80)}...`);
  });

  const context = matches.map(m => m.metadata.text).join('\n\n');

  const messages = [
    {
      role: 'system',
      content: "Tu es un assistant qui repond uniquement a partir du contexte fourni. Si l'information n'est pas dans le contexte, dis-le clairement sans inventer."
    },
    {
      role: 'user',
      content: `Contexte:\n${context}\n\nQuestion: ${question}`
    }
  ];

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
    },
    body: JSON.stringify({ model: 'mistral-small-latest', messages })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mistral error ${response.status}: ${err}`);
  }
  const data = await response.json();
  const answer = data.choices[0].message.content;

  console.log('Reponse :', answer);
  return answer;
}
