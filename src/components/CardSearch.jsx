import { useState } from 'react';
import { searchCards } from '../api';
import Button from './Button';
import CardTile from './CardTile';

export default function CardSearch({ onAdd, board = 'main', onBoardChange, pending = false }) {
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery || busy) return;
    setBusy(true);
    setError('');
    setSearchedQuery(nextQuery);
    try {
      const { cards } = await searchCards(nextQuery);
      setResults(cards || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[14px] border border-accent/20 bg-surface p-4" aria-labelledby="card-search-title">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="card-search-title" className="m-0 text-lg font-semibold">Buscar cartas</h2>
          <p className="mt-1 text-xs text-muted">Elegí el destino antes de agregar una carta.</p>
        </div>
        <fieldset className="flex rounded-lg border border-white/10 p-0.5" disabled={pending}>
          <legend className="sr-only">Sección de destino</legend>
          {['main', 'sideboard'].map((option) => (
            <button
              key={option}
              type="button"
              className={`min-h-11 cursor-pointer rounded-md px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${board === option ? 'bg-accent font-semibold text-[#1a1405]' : 'text-muted hover:text-white'}`}
              aria-pressed={board === option}
              onClick={() => onBoardChange?.(option)}
            >
              {option === 'main' ? 'Main' : 'Sideboard'}
            </button>
          ))}
        </fieldset>
      </div>

      <form className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={onSubmit}>
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-muted">
          Nombre de la carta
          <input
            className="min-h-11 rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45"
            placeholder="Ej: Lightning Bolt o Mountain"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </label>
        <Button type="submit" disabled={busy || !query.trim()}>{busy ? 'Buscando…' : 'Buscar'}</Button>
      </form>

      <p className="mb-4 text-xs text-muted">Las tierras básicas no tienen límite; el resto admite hasta 4 copias entre main y sideboard.</p>
      {error && <p className="mb-3 text-sm text-[#ffb4b4]" role="alert">{error}</p>}
      {!busy && !error && searchedQuery && !results.length && (
        <p className="mb-3 rounded-lg border border-white/10 p-3 text-sm text-muted" role="status">
          No encontramos cartas para “{searchedQuery}”. Probá con otro nombre.
        </p>
      )}
      {results.length > 0 && <p className="mb-3 text-xs text-muted" role="status">{results.length} resultado{results.length === 1 ? '' : 's'} para “{searchedQuery}”.</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {results.map((card) => (
          <CardTile key={card.id} card={card} showAdd pending={pending} onAdd={(selected, quantity) => onAdd?.(selected, quantity, board)} />
        ))}
      </div>
    </section>
  );
}
