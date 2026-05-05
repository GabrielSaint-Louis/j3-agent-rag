import 'dotenv/config';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL = 'mistral-small-latest';
const MAX_ITERATIONS = 10;

export async function runAgent(tools, toolFunctions, messages) {
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    const callStart = Date.now();

    const response = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({ model: MODEL, messages, tools, tool_choice: 'auto' })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Mistral API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    console.log(`[Agent] Tour ${iterations} — ${data.usage?.total_tokens ?? '?'} tokens, ${Date.now() - callStart}ms`);

    messages.push(choice.message);

    if (choice.finish_reason === 'stop') {
      return choice.message.content;
    }

    if (choice.finish_reason === 'tool_calls') {
      const results = await Promise.all(
        choice.message.tool_calls.map(async (toolCall) => {
          const fn = toolFunctions[toolCall.function.name];
          if (!fn) {
            return { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify({ error: `Outil inconnu : ${toolCall.function.name}` }) };
          }
          const args = JSON.parse(toolCall.function.arguments);
          const result = await fn(args);
          console.log(`  -> ${toolCall.function.name}(${JSON.stringify(args)}) : ${JSON.stringify(result).slice(0, 120)}`);
          return { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) };
        })
      );
      messages.push(...results);
    }
  }

  return '[Agent] Limite de tours atteinte sans reponse finale.';
}

const SYSTEM_PROMPT = {
  role: 'system',
  content: "Tu es un assistant utile et concis. Tu utilises les outils disponibles quand necessaire. Quand tu utilises la websearch ou le corpus prive, cite tes sources. Si on te demande de faire quelque chose de dangereux ou destructif, refuse poliment."
};

const conversationHistory = [SYSTEM_PROMPT];

export async function chatWithAgent(userMessage, tools, toolFunctions) {
  conversationHistory.push({ role: 'user', content: userMessage });
  const answer = await runAgent(tools, toolFunctions, conversationHistory);
  return answer;
}

export function resetHistory() {
  conversationHistory.length = 0;
  conversationHistory.push(SYSTEM_PROMPT);
}
