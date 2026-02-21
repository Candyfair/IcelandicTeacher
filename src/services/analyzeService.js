import { generate, generateStream } from '../providers/provider.factory.js';
import { GRAMMAR_PARAMETERS, PEDAGOGY_PARAMETERS, VERIFICATION_PARAMETERS } from '../config/config.js';

// Prompt builders

// Phase 1 — morphological tokenization (factual, verifiable)
// Le prompt se termine par le début de la réponse attendue : le modèle continue directement
// sans préambule ni explication (prefill trick pour Ollama)
function buildGrammarPrompt(userInput, exerciseContext) {
  return `Tu es analyste morphologique islandais.

${exerciseContext}

Règles absolues :
- Zéro explication.
- Zéro commentaire.
- Zéro texte hors format.
- Une ligne par mot, format : mot | lemme | catégorie | cas | genre | nombre | temps | personne
- Valeur inconnue ou incertaine : INCERTAIN.
- Ne modifie jamais un nombre.

Phrase : "${userInput}"

TOKENS:
-`;
}

function buildGrammarCorrectionPrompt(userInput, exerciseContext, grammarAnalysis, errorReason) {
  return `Tu es analyste morphologique islandais. Corrige uniquement l'erreur ci-dessous.

${exerciseContext}

Erreur : ${errorReason}

Tokenisation incorrecte :
${grammarAnalysis}

Règles absolues :
- Zéro explication.
- Zéro commentaire.
- Zéro texte hors format.
- Une ligne par mot, format : mot | lemme | catégorie | cas | genre | nombre | temps | personne
- Valeur inconnue ou incertaine : INCERTAIN.
- Ne modifie jamais un nombre.

Phrase : "${userInput}"

TOKENS:
-`;
}

// Phase 2 — syntactic analysis built on the verified tokens
function buildPedagogyPrompt(userInput, tokenOutput, exerciseContext) {
  return `Tu es un professeur universitaire de langue islandaise. Tu analyses la structure syntaxique de la phrase suivante à partir des tokens fournis.

${exerciseContext}

Phrase à analyser : "${userInput}"

Tokens :
${tokenOutput}

Règles :
- Analyse uniquement la phrase ci-dessus.
- Ne change rien aux tokens.
- Ne rajoute aucun mot.
- Si incertain : INCERTAIN.

Format :

EXPLICATION GRAMMATICALE PÉDAGOGIQUE:
- Explication courte et règles de grammaire sous forme de paragraphe

SYNTAXE:
- verbe principal :
- sujet :
- compléments :
- type de phrase :
- ordre :

`;
}

function buildVerificationPrompt(userInput, exerciseContext, analysis) {
  return `You are a senior Icelandic linguistics reviewer.

Original exercise context: ${exerciseContext}
Student input: ${userInput}
Proposed grammar analysis:
"""
${analysis}
"""

Verify the analysis is linguistically accurate and complete.
If it is acceptable, respond with exactly: OK
If it contains a factual grammar error, respond with: ERREUR: <brief description>
No other output.`;
}

// Output sanitizers

// Grammaire : reconstruit le bloc TOKENS: proprement.
// - Si le modèle a ignoré le prefill et ajouté du texte avant : extrait depuis TOKENS:
// - Si le modèle a suivi le prefill (sortie = continuation après "TOKENS:\n-") : reconstitue le header
function extractGrammar(text) {
  const idx = text.indexOf('TOKENS:');
  if (idx !== -1) return text.slice(idx).trim();
  // Mode prefill : la sortie commence directement après le "-" terminal du prompt
  return `TOKENS:\n-${text}`;
}

// Pédagogie (streaming) : buffer les chunks jusqu'au premier marqueur de section,
// puis transmet normalement — élimine tout préambule sans bloquer le streaming
async function* stripPedagogyPreamble(stream) {
  const MARKER = 'EXPLICATION';
  const SAFETY_BUFFER = 500; // émet quand même si le marqueur n'arrive pas
  let buffer = '';
  let found = false;

  for await (const chunk of stream) {
    if (found) {
      yield chunk;
      continue;
    }
    buffer += chunk;
    const idx = buffer.indexOf(MARKER);
    if (idx !== -1) {
      found = true;
      yield buffer.slice(idx);
      buffer = '';
    } else if (buffer.length > SAFETY_BUFFER) {
      found = true;
      yield buffer;
      buffer = '';
    }
  }

  if (buffer) yield buffer;
}

// Verification pass (grammar only)
async function runVerification(userInput, exerciseContext, grammarAnalysis) {
  const prompt = buildVerificationPrompt(userInput, exerciseContext, grammarAnalysis);
  return await generate(prompt, VERIFICATION_PARAMETERS);
}

// Run grammar phase with verification + correction; returns the verified token list
async function runVerifiedGrammar(userInput, exerciseContext) {
  let grammarText = '';
  for await (const chunk of generateStream(buildGrammarPrompt(userInput, exerciseContext), GRAMMAR_PARAMETERS)) {
    grammarText += chunk;
  }

  const verification = await runVerification(userInput, exerciseContext, grammarText);
  if (verification.trim().startsWith('ERREUR:')) {
    const errorReason = verification.trim().slice('ERREUR:'.length).trim();
    const incorrect = grammarText;
    grammarText = '';
    for await (const chunk of generateStream(buildGrammarCorrectionPrompt(userInput, exerciseContext, incorrect, errorReason), GRAMMAR_PARAMETERS)) {
      grammarText += chunk;
    }
  }

  return extractGrammar(grammarText);
}

// Public streaming API — phase 1: grammar verified silently, phase 2: pedagogy streamed
export async function* analyzeStream(userInput, exerciseContext) {
  if (!userInput || !exerciseContext) {
    throw new Error('analyze requires both userInput and exerciseContext');
  }

  // Phase 1 — generate + verify grammar silently (nothing sent to client yet)
  const grammarText = await runVerifiedGrammar(userInput, exerciseContext);

  // Phase 2 — stream syntactic analysis built on the verified tokens (grammar used internally only)
  const pedagogyStream = generateStream(buildPedagogyPrompt(userInput, grammarText, exerciseContext), PEDAGOGY_PARAMETERS);
  for await (const chunk of stripPedagogyPreamble(pedagogyStream)) {
    yield { type: 'chunk', data: chunk };
  }

  yield { type: 'done' };
}

// Public API — phase 1: grammar (with verification), phase 2: pedagogy
export async function analyze(userInput, exerciseContext) {
  if (!userInput || !exerciseContext) {
    throw new Error('analyze requires both userInput and exerciseContext');
  }

  const grammarText = await runVerifiedGrammar(userInput, exerciseContext);
  const pedagogyText = await generate(buildPedagogyPrompt(userInput, grammarText, exerciseContext), PEDAGOGY_PARAMETERS);

  return pedagogyText;
}
