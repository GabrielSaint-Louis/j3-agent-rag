export const calculateTool = {
  type: 'function',
  function: {
    name: 'calculate',
    description: 'Evalue une expression mathematique et retourne le resultat numerique. A utiliser pour tout calcul arithmetique : additions, soustractions, multiplications, divisions, puissances.',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: "L'expression a evaluer, ex: '2 ** 32' ou '(15 * 4) / 3'"
        }
      },
      required: ['expression']
    }
  }
};

const SAFE_EXPRESSION = /^[0-9+\-*/().\s]+$/;

export function calculate({ expression }) {
  if (!SAFE_EXPRESSION.test(expression)) {
    return { error: `Expression non autorisee : seuls les caracteres mathematiques sont acceptes` };
  }
  try {
    const result = Function('"use strict"; return (' + expression + ')')();
    if (typeof result !== 'number' || !isFinite(result)) {
      return { error: 'Le resultat n\'est pas un nombre fini' };
    }
    return { result };
  } catch (err) {
    return { error: `Expression invalide : ${err.message}` };
  }
}
