import { useState } from 'react';
import { analyzeText } from '../services/api.js';

export function useGrammarAnalysis(exerciseContext) {
  // State
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis]   = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  // Submit → analyze directly
  async function handleSubmit() {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setAnalysis(null);
    setError(null);

    try {
      await analyzeText(
        inputText,
        exerciseContext,
        (chunk) => setAnalysis((prev) => (prev ?? '') + chunk),
        () => setAnalysis(null),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Full reset
  function reset() {
    setInputText('');
    setAnalysis(null);
    setError(null);
  }

  return {
    inputText,
    setInputText,
    analysis,
    isLoading,
    error,
    handleSubmit,
    reset,
  };
}
