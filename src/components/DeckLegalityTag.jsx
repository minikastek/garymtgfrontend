export default function DeckLegalityTag({ legality }) {
  if (!legality) return null;

  if (legality.legal) {
    return (
      <section className="mb-5 rounded-[12px] border border-emerald-500/40 bg-emerald-500/10 p-4" aria-label="Estado de legalidad">
        <p className="font-semibold text-emerald-300">Deck legal</p>
        <p className="mt-1 text-sm text-emerald-300/80">
          Main {legality.mainCount} · Sideboard {legality.sideboardCount}/{legality.maxSideboard}
        </p>
      </section>
    );
  }

  return (
    <section className="mb-5 rounded-[12px] border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-100" aria-label="Estado de legalidad">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-amber-200">Deck incompleto o no legal</p>
        <p className="text-xs text-amber-100/75">
          Main {legality.mainCount}/{legality.minMain} · Sideboard {legality.sideboardCount}/{legality.maxSideboard}
        </p>
      </div>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-100/80">
        {legality.messages.map((message) => <li key={message}>{message}</li>)}
      </ul>
      <p className="mt-3 text-xs text-amber-100/65">Podés seguir guardando el deck mientras lo completás.</p>
    </section>
  );
}
