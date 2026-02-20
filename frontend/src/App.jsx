import { useState } from 'react';
import { useGrammarAnalysis } from './hooks/useGrammarAnalysis.js';
import InputForm from './components/InputForm.jsx';
import ResultBlock from './components/ResultBlock.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { fr } from './locales/fr.js';
import { en } from './locales/en.js';

const LOCALES = { fr, en };
const BASE_CONTEXT = 'Icelandic grammar analysis — translate naturally then analyse word by word.';

export default function App() {
  // Theme
  const [theme, setTheme] = useState('light');
  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }

  // Language — default French
  const [lang, setLang] = useState('fr');
  function toggleLang() {
    setLang((l) => (l === 'fr' ? 'en' : 'fr'));
  }
  const t = LOCALES[lang];

  // Language directive is embedded in context — flows through to AI prompt
  const exerciseContext = `${BASE_CONTEXT} ${t.aiInstruction}`;

  // Grammar flow
  const {
    inputText,
    setInputText,
    analysis,
    isLoading,
    error,
    handleSubmit,
  } = useGrammarAnalysis(exerciseContext);

  return (
    <div
      data-theme={theme}
      style={{ maxWidth: '720px', margin: '0 auto', padding: '1rem' }}
    >
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t.title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Language toggle */}
          <button type="button" onClick={toggleLang} aria-label={`Switch to ${t.langToggle}`}>
            {t.langToggle}
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {/* Input */}
      <main>
        <InputForm
          inputText={inputText}
          onChange={setInputText}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          t={t}
        />

        {/* Loader — visible uniquement avant le 1er token */}
        {isLoading && !analysis && <div className="loader" aria-label={t.submitting} />}

        {/* Error state */}
        {error && (
          <p role="alert" style={{ color: 'red' }}>
            {error}
          </p>
        )}

        {/* Analysis result */}
        {analysis && <ResultBlock analysis={analysis} t={t} />}
      </main>
    </div>
  );
}
