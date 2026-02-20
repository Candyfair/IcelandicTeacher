import { generate, generateStream } from '../providers/provider.factory.js';
import { VERIFICATION_PARAMETERS } from '../config/config.js';

// Prompt builders
function buildAnalysisPrompt(userInput, exerciseContext) {
  return `Tu es un professeur d’islandais expert. Ton rôle est d’analyser les phrases de manière rigoureuse et pédagogique.

Exercise context: ${exerciseContext}
Icelandic sentence: ${userInput}

Pour chaque phrase fournie :
1. Analyse mot par mot
2. Explique la conjugaison
3. Explique de manière pédagogique et structurée
4. Traduction naturelle complète
5. Donne deux exemples supplémentaires : une phrase similaire, et une autre avec variation grammaticale

Sois rigoureux et précis.
`;
}

function buildCorrectionPrompt(userInput, exerciseContext, analysis, errorReason) {
  return `Tu es un professeur d'islandais expert. Une première analyse a été produite mais contient une erreur.

Exercise context: ${exerciseContext}
Icelandic sentence: ${userInput}

Première analyse (incorrecte) :
"""
${analysis}
"""

Erreur détectée : ${errorReason}

Corrige cette erreur et produis une analyse complète et rigoureuse :
1. Analyse mot par mot
2. Explique la conjugaison
3. Explique de manière pédagogique et structurée
4. Traduction naturelle complète
5. Donne deux exemples supplémentaires : une phrase similaire, et une autre avec variation grammaticale
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

// Core generation pass
async function runAnalysis(userInput, exerciseContext) {
  const prompt = buildAnalysisPrompt(userInput, exerciseContext);
  return await generate(prompt);
}

// Verification pass
async function runVerification(userInput, exerciseContext, analysis) {
  const prompt = buildVerificationPrompt(userInput, exerciseContext, analysis);
  return await generate(prompt, VERIFICATION_PARAMETERS);
}

// Public streaming API — streams tokens, verifies after completion, corrects if needed
export async function* analyzeStream(userInput, exerciseContext) {
  if (!userInput || !exerciseContext) {
    throw new Error('analyze requires both userInput and exerciseContext');
  }

  let fullAnalysis = '';
  for await (const chunk of generateStream(buildAnalysisPrompt(userInput, exerciseContext))) {
    fullAnalysis += chunk;
    yield { type: 'chunk', data: chunk };
  }

  const verification = await runVerification(userInput, exerciseContext, fullAnalysis);

  if (verification.trim().startsWith('ERREUR:')) {
    yield { type: 'reset' };
    const errorReason = verification.trim().slice('ERREUR:'.length).trim();
    const correctionPrompt = buildCorrectionPrompt(userInput, exerciseContext, fullAnalysis, errorReason);
    for await (const chunk of generateStream(correctionPrompt)) {
      yield { type: 'chunk', data: chunk };
    }
  }

  yield { type: 'done' };
}

// Public API — single retry on verification failure
export async function analyze(userInput, exerciseContext) {
  if (!userInput || !exerciseContext) {
    throw new Error('analyze requires both userInput and exerciseContext');
  }

  let analysis = await runAnalysis(userInput, exerciseContext);

  const verification = await runVerification(userInput, exerciseContext, analysis);

  if (verification.trim().startsWith('ERREUR:')) {
    const errorReason = verification.trim().slice('ERREUR:'.length).trim();
    const correctionPrompt = buildCorrectionPrompt(userInput, exerciseContext, analysis, errorReason);
    analysis = await generate(correctionPrompt);
  }

  return analysis;
}
