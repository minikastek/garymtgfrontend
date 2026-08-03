import { useState } from 'react';
import { searchCards } from '../api';
import Button from './Button';
import CardTile from './CardTile';

export default function CardSearch({ onAdd, board = 'main', onBoardChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError('');
    try {
      const { cards } = await searchCards(query.trim());
      setResults(cards);
      if (!cards.length) setError('No se encontraron cartas.');
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[14px] border border-accent/20 bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-lg font-semibold">Buscar cartas</h2>
        <div className="flex rounded-lg border border-white/10 p-0.5">
          <button
            type="button"
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm ${board === 'main' ? 'bg-accent text-[#1a1405] font-semibold' : 'text-muted hover:text-white'}`}
            onClick={() => onBoardChange?.('main')}
          >
            Main
          </button>
          <button
            type="button"
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm ${board === 'sideboard' ? 'bg-accent text-[#1a1405] font-semibold' : 'text-muted hover:text-white'}`}
            onClick={() => onBoardChange?.('sideboard')}
          >
            Sideboard
          </button>
        </div>
      </div>

      <form className="mb-4 flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
        <input
          className="flex-1 rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45"
          placeholder="Ej: Lightning Bolt, Mountain…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={busy}>
          {busy ? 'Buscando…' : 'Buscar'}
        </Button>
      </form>

      <p className="mb-3 text-xs text-muted">
        Se añaden a <strong className="text-accent">{board === 'main' ? 'Main' : 'Sideboard'}</strong>
        . Tierras básicas sin límite; resto máx. 4 (main + side).
      </p>

      {error && <p className="mb-3 text-sm text-[#ffb4b4]">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {results.map((card) => (
          <CardTile
            key={card.id}
            card={card}
            showAdd
            onAdd={(c, qty) => onAdd?.(c, qty, board)}
          />
        ))}
      </div>
    </section>
  );
}
