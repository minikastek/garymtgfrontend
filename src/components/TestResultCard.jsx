export default function TestResultCard({ title, status, body }) {
  const tone =
    status === 'ok'
      ? 'border-emerald-500/40 bg-emerald-500/10'
      : status === 'error'
        ? 'border-danger/40 bg-danger/10'
        : 'border-accent/25 bg-surface';

  return (
    <article className={`rounded-[14px] border p-4 ${tone}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="m-0 text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs uppercase tracking-wide text-muted">
          {status || 'idle'}
        </span>
      </div>
      <pre className="m-0 overflow-x-auto rounded-lg bg-bg/70 p-3 text-xs text-muted whitespace-pre-wrap">
        {body || 'Sin respuesta todavía.'}
      </pre>
    </article>
  );
}
