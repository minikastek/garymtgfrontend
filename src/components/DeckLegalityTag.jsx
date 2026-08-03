export default function DeckLegalityTag({ legality }) {
  if (!legality) return null;

  if (legality.legal) {
    return (
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-sm font-semibold text-emerald-300">
        Legal
        <span className="font-normal text-emerald-300/80">
          Main {legality.mainCount} · Side {legality.sideboardCount}/{legality.maxSideboard}
        </span>
      </div>
    );
  }

  const bits = [];
  if (legality.mainNeeded > 0) {
    bits.push(`Faltan ${legality.mainNeeded} en el main`);
  }
  if (legality.sideboardOver > 0) {
    bits.push(`Sideboard +${legality.sideboardOver} de más`);
  }
  if (legality.copyViolations?.length) {
    bits.push(`${legality.copyViolations.length} exceso de copias`);
  }

  return (
    <div className="mb-4 rounded-[12px] border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-100">
      <div className="font-semibold text-amber-200">No legal · {bits.join(' · ')}</div>
      <div className="mt-1 text-amber-100/75">
        Main {legality.mainCount}/{legality.minMain}
        {legality.mainNeeded > 0 ? ` (faltan ${legality.mainNeeded})` : ''}
        {' · '}
        Side {legality.sideboardCount}/{legality.maxSideboard}
      </div>
      {legality.messages?.length > 0 && (
        <ul className="mt-2 m-0 list-disc pl-5 text-xs text-amber-100/70">
          {legality.messages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
