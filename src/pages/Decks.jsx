import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createDeck, deleteDeck, listDecks } from '../api';
import Button from '../components/Button';
import PageShell from '../components/PageShell';

function DeckListSkeleton() {
  return <div className="grid gap-3 sm:grid-cols-2" aria-label="Cargando decks">{[0, 1].map((item) => <div key={item} className="h-28 animate-pulse rounded-[12px] border border-accent/10 bg-surface" />)}</div>;
}

export default function Decks() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadDecks() {
    setLoading(true);
    setError('');
    try {
      const data = await listDecks();
      setDecks(data.decks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDecks(); }, []);

  async function onCreate(event) {
    event.preventDefault();
    const deckName = name.trim();
    if (!deckName || creating) return;
    setCreating(true);
    setError('');
    try {
      const { deck } = await createDeck(deckName);
      setName('');
      navigate(`/decks/${deck.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(deck) {
    if (deletingId || !confirm(`¿Eliminar "${deck.name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(deck.id);
    setError('');
    try {
      await deleteDeck(deck.id);
      setDecks((current) => current.filter((item) => item.id !== deck.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId('');
    }
  }

  return (
    <PageShell>
      <div className="mb-6 max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Construcción de mazos</p>
        <h1 className="mb-2 text-3xl font-bold">Mis decks</h1>
        <p className="text-muted">Main ≥ 60 · Sideboard ≤ 15 · máximo 4 copias. Las tierras básicas no tienen límite y los decks incompletos se pueden guardar.</p>
      </div>

      <form className="mb-8 flex flex-col gap-3 rounded-[14px] border border-accent/20 bg-surface p-4 sm:flex-row sm:items-end" onSubmit={onCreate}>
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-muted">
          Nombre del deck
          <input className="min-h-11 rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Mono Red Aggro" autoComplete="off" required />
        </label>
        <Button type="submit" disabled={creating || !name.trim()}>{creating ? 'Creando…' : 'Crear deck'}</Button>
      </form>

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-danger/40 bg-danger/10 p-4 text-sm text-[#ffb4b4]" role="alert">
          <span>{error}</span>
          {!deletingId && !creating && <Button type="button" variant="ghost" onClick={loadDecks}>Reintentar</Button>}
        </div>
      )}

      {loading ? <DeckListSkeleton /> : !decks.length ? (
        <section className="rounded-[14px] border border-dashed border-accent/30 bg-surface/70 px-6 py-10 text-center">
          <h2 className="mb-2 text-xl font-semibold">Tu primer deck empieza con un nombre</h2>
          <p className="mx-auto max-w-lg text-sm text-muted">Crealo arriba y después buscá cartas para el main o el sideboard. Podés volver a editarlo en cualquier momento.</p>
        </section>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {decks.map((deck) => {
            const legality = deck.legality;
            const deleting = deletingId === deck.id;
            return (
              <li key={deck.id} className="flex flex-col justify-between gap-4 rounded-[12px] border border-accent/20 bg-surface p-4">
                <div>
                  <Link to={`/decks/${deck.id}`} className="rounded text-lg font-semibold text-white hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">{deck.name}</Link>
                  <p className="mt-1 text-sm text-muted">Main {legality?.mainCount ?? 0}/{legality?.minMain ?? 60} · Sideboard {legality?.sideboardCount ?? 0}/{legality?.maxSideboard ?? 15}</p>
                  <p className={`mt-2 text-xs font-semibold ${legality?.legal ? 'text-emerald-400' : 'text-amber-300'}`}>{legality?.legal ? 'Deck legal' : legality?.messages?.[0] || 'Deck incompleto'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button as={Link} to={`/decks/${deck.id}`} variant="ghost">Editar</Button>
                  <Button type="button" variant="danger" disabled={Boolean(deletingId)} onClick={() => onDelete(deck)}>{deleting ? 'Eliminando…' : 'Eliminar'}</Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
