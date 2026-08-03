import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createDeck, listDecks, deleteDeck } from '../api';
import Button from '../components/Button';
import PageShell from '../components/PageShell';

export default function Decks() {
  const [decks, setDecks] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const data = await listDecks();
    setDecks(data.decks);
  }

  useEffect(() => {
    refresh()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await createDeck(name.trim());
      setName('');
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!confirm('¿Borrar este deck?')) return;
    try {
      await deleteDeck(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PageShell>
      <h1 className="mb-2 text-3xl font-bold">Mis decks</h1>
      <p className="mb-6 text-muted">Creá un deck y añadí hasta 4 copias por carta (Standard).</p>

      <form
        className="mb-8 flex flex-col gap-2 rounded-[14px] border border-accent/20 bg-surface p-4 sm:flex-row sm:items-end"
        onSubmit={onCreate}
      >
        <label className="flex flex-1 flex-col gap-1.5 text-sm text-muted">
          Nombre del deck
          <input
            className="rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Mono Red Aggro"
            required
          />
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? 'Creando…' : 'Crear deck'}
        </Button>
      </form>

      {error && <p className="mb-4 text-sm text-[#ffb4b4]">{error}</p>}
      {loading && <p className="text-muted">Cargando…</p>}

      {!loading && !decks.length && (
        <p className="text-muted">Todavía no tenés decks. Creá el primero arriba.</p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {decks.map((deck) => {
          const total = deck.cards.reduce((s, c) => s + c.quantity, 0);
          return (
            <li
              key={deck.id}
              className="flex items-center justify-between gap-3 rounded-[12px] border border-accent/20 bg-surface p-4"
            >
              <div>
                <Link to={`/decks/${deck.id}`} className="text-lg font-semibold text-white hover:text-accent">
                  {deck.name}
                </Link>
                <p className="m-0 text-sm text-muted">{total} cartas</p>
              </div>
              <div className="flex gap-2">
                <Button as={Link} to={`/decks/${deck.id}`} variant="ghost">
                  Abrir
                </Button>
                <Button type="button" variant="danger" onClick={() => onDelete(deck.id)}>
                  Borrar
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
