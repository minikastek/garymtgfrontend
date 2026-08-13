import { useEffect, useState } from 'react';
import { isBasicLand } from '../deckRules';

const controlClass = 'min-h-11 min-w-11 cursor-pointer rounded text-muted hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45';

export default function CardTile({ card, quantity = 1, onQuantityChange, onAdd, showAdd = false, showQtyControls = false, onRemove, onMove, board = 'main', pending = false, maxCopies }) {
  const max = maxCopies ?? (isBasicLand(card) ? 99 : 4);
  const [qty, setQty] = useState(quantity);
  const [acting, setActing] = useState(false);
  const disabled = pending || acting;

  useEffect(() => setQty(quantity), [quantity]);

  const price = card.prices?.cardkingdom?.retail ?? card.prices?.scryfallUsd ?? null;

  async function runAction(action) {
    if (disabled) return;
    setActing(true);
    try {
      await action?.();
    } finally {
      setActing(false);
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-[12px] border border-accent/20 bg-surface">
      <div className="aspect-[5/7] bg-surface-2">
        {card.image ? <img src={card.image} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center p-3 text-center text-sm text-muted">Sin imagen</div>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div>
          <h3 className="m-0 text-sm font-semibold leading-snug text-white">{card.name}</h3>
          <p className="m-0 text-xs text-muted">{card.set} · #{card.collectorNumber} · {card.rarity}</p>
          {price != null && <p className="mt-1 text-xs text-accent">${Number(price).toFixed(2)}</p>}
        </div>

        {showAdd && (
          <div className="mt-auto flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border border-white/10">
              <button type="button" className={controlClass} disabled={disabled || qty <= 1} aria-label={`Reducir cantidad de ${card.name}`} onClick={() => setQty((value) => Math.max(1, value - 1))}>−</button>
              <output className="min-w-8 text-center text-sm" aria-label={`Cantidad: ${qty}`}>{qty}</output>
              <button type="button" className={controlClass} disabled={disabled || qty >= max} aria-label={`Aumentar cantidad de ${card.name}`} onClick={() => setQty((value) => Math.min(max, value + 1))}>+</button>
            </div>
            <button type="button" className="min-h-11 cursor-pointer rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-[#1a1405] hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-55" disabled={disabled} onClick={() => runAction(() => onAdd?.(card, qty))}>{acting ? 'Agregando…' : 'Agregar'}</button>
          </div>
        )}

        {showQtyControls && (
          <div className="mt-auto flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border border-white/10">
              <button type="button" className={controlClass} disabled={disabled || quantity <= 1} aria-label={`Reducir cantidad de ${card.name}`} onClick={() => runAction(() => onQuantityChange?.(quantity - 1))}>−</button>
              <output className="min-w-8 text-center text-sm" aria-label={`Cantidad: ${quantity}`}>{quantity}</output>
              <button type="button" className={controlClass} disabled={disabled || quantity >= max} aria-label={`Aumentar cantidad de ${card.name}`} onClick={() => runAction(() => onQuantityChange?.(quantity + 1))}>+</button>
            </div>
            <button type="button" className="min-h-11 cursor-pointer rounded-lg border border-white/10 px-2 py-2 text-xs text-muted hover:border-accent/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45" disabled={disabled} onClick={() => runAction(onMove)}>Mover a {board === 'main' ? 'sideboard' : 'main'}</button>
            <button type="button" className="min-h-11 cursor-pointer rounded-lg px-2 py-2 text-xs text-danger hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-45" disabled={disabled} onClick={() => runAction(onRemove)}>{acting ? 'Guardando…' : 'Quitar del deck'}</button>
          </div>
        )}
      </div>
    </article>
  );
}
