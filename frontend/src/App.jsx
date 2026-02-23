import { useState } from 'react';
import { useGrammarAnalysis } from './hooks/useGrammarAnalysis.js';
import InputForm from './components/InputForm.jsx';
import ResultBlock from './components/ResultBlock.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { fr } from './locales/fr.js';
import { en } from './locales/en.js';
import titleFR from './assets/title-fr.svg';
import titleEN from './assets/title-en.svg';
import teacher from './assets/teacher.svg';

const LOCALES = { fr, en };
const BASE_CONTEXT = 'Icelandic grammar analysis — translate naturally then analyse word by word.';

export default function App() {
  // Theme — persisted in localStorage
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ?? 'light'
  );
  document.documentElement.dataset.theme = theme;
  function toggleTheme() {
    setTheme((t) => {
      const next = t === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
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
    <div className="app-wrapper">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="options-wrapper" style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Language toggle */}
            <button type="button" onClick={toggleLang} aria-label={`Switch to ${t.langToggle}`}>
              {t.langToggle}
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

        <div className="header-wrapper">
          <img src={lang === 'fr' ? titleFR : titleEN} style={{height: 145 }} alt={t.title} />
          <img src={teacher} alt="teacher" />
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
