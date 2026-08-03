import { useState } from 'react';
import { searchCards } from '../api';
import Button from './Button';
import CardTile from './CardTile';

export default function CardSearch({ onAdd }) {
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
      <h2 className="mb-3 text-lg font-semibold">Buscar cartas</h2>
      <form className="mb-4 flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
        <input
          className="flex-1 rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45"
          placeholder="Ej: Lightning Bolt"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={busy}>
          {busy ? 'Buscando…' : 'Buscar'}
        </Button>
      </form>

      {error && <p className="mb-3 text-sm text-[#ffb4b4]">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {results.map((card) => (
          <CardTile key={card.id} card={card} showAdd onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}
