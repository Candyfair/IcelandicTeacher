import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ResultBlock({ analysis, t = {} }) {
  const title = t.analysisTitle || 'Analysis';

  return (
    <section aria-label="Grammar analysis result">
      <h2>{title}</h2>

      {/* Scrollable markdown-rendered output */}
      <div role="region" aria-live="polite" style={{ overflowY: 'auto', maxHeight: '500px' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {analysis}
        </ReactMarkdown>
      </div>
    </section>
  );
}
