import { useEffect, useRef } from 'react';

export default function InputForm({ inputText, onChange, onSubmit, isLoading, t = {} }) {
  const label       = t.inputLabel       || 'Your sentence';
  const placeholder = t.inputPlaceholder || 'Type your Icelandic sentence here…';
  const submitLabel = t.submitButton     || 'Analyse';
  const loadingLabel = t.submitting      || 'Analysing…';

  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [inputText]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading}>
      {/* Input section */}
      <label htmlFor="grammar-input">{label}</label>
      <textarea
        ref={textareaRef}
        id="grammar-input"
        value={inputText}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        rows={1}
        placeholder={placeholder}
        style={{ minHeight: 'unset', resize: 'none', overflow: 'hidden' }}
        required
      />

      {/* Submit */}
      <button type="submit" disabled={isLoading || !inputText.trim()}>
        {isLoading ? loadingLabel : submitLabel}
      </button>
    </form>
  );
}
