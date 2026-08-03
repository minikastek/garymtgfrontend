import { useState } from 'react';

export default function CardTile({
  card,
  quantity = 1,
  onQuantityChange,
  onAdd,
  showAdd = false,
  showQtyControls = false,
  onRemove,
}) {
  const [qty, setQty] = useState(quantity);
  const price =
    card.prices?.cardkingdom?.retail ??
    card.prices?.scryfallUsd ??
    null;

  function changeQty(next) {
    const n = Math.max(1, Math.min(4, next));
    setQty(n);
    onQuantityChange?.(n);
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-[12px] border border-accent/20 bg-surface">
      <div className="aspect-[5/7] bg-surface-2">
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-sm text-muted">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="m-0 text-sm font-semibold leading-snug text-white">{card.name}</h3>
          <p className="m-0 text-xs text-muted">
            {card.set} · #{card.collectorNumber} · {card.rarity}
          </p>
          {price != null && (
            <p className="m-0 mt-1 text-xs text-accent">
              ${Number(price).toFixed(2)}
            </p>
          )}
        </div>

        {showAdd && (
          <div className="mt-auto flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-white/10">
              <button
                type="button"
                className="cursor-pointer px-2 py-1 text-muted hover:text-white"
                onClick={() => changeQty(qty - 1)}
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm">{qty}</span>
              <button
                type="button"
                className="cursor-pointer px-2 py-1 text-muted hover:text-white"
                onClick={() => changeQty(qty + 1)}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="flex-1 cursor-pointer rounded-lg bg-accent px-2 py-1.5 text-sm font-semibold text-[#1a1405] hover:bg-accent-hover"
              onClick={() => onAdd?.(card, qty)}
            >
              Añadir
            </button>
          </div>
        )}

        {showQtyControls && (
          <div className="mt-auto flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-white/10">
              <button
                type="button"
                className="cursor-pointer px-2 py-1 text-muted hover:text-white"
                onClick={() => onQuantityChange?.(Math.max(0, quantity - 1))}
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm">{quantity}</span>
              <button
                type="button"
                className="cursor-pointer px-2 py-1 text-muted hover:text-white"
                onClick={() => onQuantityChange?.(Math.min(4, quantity + 1))}
              >
                +
              </button>
            </div>
            {onRemove && (
              <button
                type="button"
                className="cursor-pointer text-xs text-danger hover:underline"
                onClick={onRemove}
              >
                Quitar
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
