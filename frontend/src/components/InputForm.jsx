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

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputText.trim()) onSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isLoading}>
      {/* Input section */}
      <div className="input-group">
        <label htmlFor="grammar-input">{label}</label>
        <textarea
          ref={textareaRef}
          id="grammar-input"
          value={inputText}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          placeholder={placeholder}
          style={{ minHeight: 'unset', resize: 'none', overflow: 'hidden' }}
          required
        />
      </div>

      {/* Submit */}
      <button type="submit" disabled={isLoading || !inputText.trim()}>
        {isLoading ? loadingLabel : submitLabel}
      </button>
    </form>
  );
}
