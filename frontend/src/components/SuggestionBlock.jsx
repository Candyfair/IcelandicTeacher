export default function SuggestionBlock({ suggestion, onConfirm, onCancel, isLoading }) {
  return (
    <div role="alert" aria-live="polite">
      {/* Suggestion display */}
      <p>Your answer needs a correction:</p>
      <blockquote>{suggestion}</blockquote>

      {/* Decision actions */}
      <button type="button" onClick={onConfirm} disabled={isLoading}>
        {isLoading ? 'Analysing…' : 'Analyse this suggestion'}
      </button>
      <button type="button" onClick={onCancel} disabled={isLoading} data-variant="secondary">
        Cancel
      </button>
    </div>
  );
}
