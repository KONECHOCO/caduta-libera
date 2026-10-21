// Genera migliaia di domande in tutte le lingue e verifica che ognuna abbia 10 opzioni diverse,
// una sola risposta esatta e nessun testo mancante.
import { generateQuestion, LANGS } from '../js/questions.js';

let errors = 0;
for (const lang of LANGS) {
  const seen = new Set();
  for (let i = 0; i < 3000; i++) {
    const q = generateQuestion(lang);
    seen.add(q.sig);
    const correct = q.options.filter(o => o.isCorrect).length;
    const texts = new Set(q.options.map(o => o.text));
    const missing = q.options.some(o => !o.text || !o.detail || /undefined|\{/.test(o.text + o.detail));
    if (q.options.length !== 10 || correct !== 1 || texts.size !== 10 || missing || !q.question || q.question.includes('{')) {
      errors++;
      if (errors <= 5) console.log(lang, JSON.stringify(q, null, 1));
    }
  }
  console.log(`${lang}: ${seen.size} risposte esatte diverse`);
}
console.log(errors ? `✗ ${errors} domande non valide` : '✓ tutte le domande sono valide');
process.exit(errors ? 1 : 0);
