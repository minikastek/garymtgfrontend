import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addCardToDeck, deleteDeck, getDeck, removeCardFromDeck, updateCardQuantity, updateDeck } from '../api';
import { useAuth } from '../auth';
import Button from '../components/Button';
import CardSearch from '../components/CardSearch';
import CardTile from '../components/CardTile';
import DeckLegalityTag from '../components/DeckLegalityTag';
import PageShell from '../components/PageShell';
import { evaluateDeckLegality, moveCardBetweenBoards } from '../deckRules';

function DeckDetailSkeleton() {
  return <PageShell><div className="animate-pulse" aria-label="Cargando deck"><div className="mb-4 h-5 w-24 rounded bg-surface-2" /><div className="mb-3 h-12 max-w-xl rounded bg-surface" /><div className="mb-8 h-24 rounded-[14px] bg-surface" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="aspect-[5/7] rounded-[12px] bg-surface" />)}</div></div></PageShell>;
}

function BoardSection({ title, cards, count, hint, board, pending, onQty, onRemove, onMove }) {
  const headingRef = useRef(null);
  async function removeAndRecoverFocus(cardId) {
    const removed = await onRemove(cardId, board);
    if (removed) headingRef.current?.focus();
  }
  return (
    <section className="mb-8" aria-labelledby={`${board}-heading`}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={`${board}-heading`} ref={headingRef} tabIndex="-1" className="m-0 rounded text-xl font-semibold focus-visible:outline-2 focus-visible:outline-accent">{title}</h2>
        <span className="text-sm text-muted">{count} cartas · {hint}</span>
      </div>
      {!cards.length ? <p className="rounded-[12px] border border-dashed border-white/10 p-4 text-sm text-muted">No hay cartas en {title.toLowerCase()}.</p> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {cards.map((card) => <CardTile key={`${board}-${card.id}`} card={card} quantity={card.quantity} showQtyControls pending={pending} board={board} onQuantityChange={(quantity) => onQty(card.id, quantity, board)} onRemove={() => removeAndRecoverFocus(card.id)} onMove={() => onMove(card.id, board)} />)}
        </div>
      )}
    </section>
  );
}

export default function DeckDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deck, setDeck] = useState(null);
  const [name, setName] = useState('');
  const [board, setBoard] = useState('main');
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState('');
  const mutationLockRef = useRef(false);

  const loadDeck = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDeck(id);
      setDeck(response.deck);
      setName(response.deck.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDeck(); }, [loadDeck]);

  const main = useMemo(() => deck?.main || [], [deck?.main]);
  const sideboard = useMemo(() => deck?.sideboard || [], [deck?.sideboard]);
  const legality = useMemo(() => evaluateDeckLegality(main, sideboard, deck?.legality), [deck?.legality, main, sideboard]);
  const nameDirty = Boolean(deck) && name.trim() !== deck.name;

  async function mutate(label, operation, successMessage) {
    if (mutationLockRef.current) return false;
    mutationLockRef.current = true;
    setPending(label);
    setError('');
    setSavedMessage('');
    try {
      const { deck: confirmedDeck } = await operation();
      setDeck(confirmedDeck);
      setSavedMessage(successMessage);
      return true;
    } catch (err) {
      setError(`${err.message} No se aplicaron cambios.`);
      return false;
    } finally {
      mutationLockRef.current = false;
      setPending('');
    }
  }

  async function handleRename(event) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) return setError('El nombre del deck es obligatorio.');
    if (!nameDirty) return;
    const saved = await mutate('rename', () => updateDeck(id, { name: nextName }), 'Nombre guardado.');
    if (saved) setName(nextName);
  }

  const handleAdd = (card, quantity, target) => mutate(`add-${card.id}`, () => addCardToDeck(id, card, quantity, target), `${card.name} se agregó a ${target === 'sideboard' ? 'sideboard' : 'main'}.`);
  const handleQuantity = (cardId, quantity, target) => mutate(`quantity-${target}-${cardId}`, () => updateCardQuantity(id, cardId, quantity, target), 'Cantidad actualizada.');
  const handleRemove = (cardId, target) => mutate(`remove-${target}-${cardId}`, () => removeCardFromDeck(id, cardId, target), 'Carta eliminada del deck.');
  const handleMove = (cardId, source) => {
    const next = moveCardBetweenBoards(main, sideboard, cardId, source);
    return mutate(`move-${source}-${cardId}`, () => updateDeck(id, next), `Carta movida a ${source === 'main' ? 'sideboard' : 'main'}.`);
  };

  async function handleDelete() {
    if (mutationLockRef.current || !confirm(`¿Eliminar "${deck.name}"? Esta acción no se puede deshacer.`)) return;
    mutationLockRef.current = true;
    setPending('delete');
    setError('');
    try {
      await deleteDeck(id);
      navigate('/decks');
    } catch (err) {
      setError(err.message);
      mutationLockRef.current = false;
      setPending('');
    }
  }

  if (loading) return <DeckDetailSkeleton />;
  if (!deck) return <PageShell><section className="max-w-xl rounded-[14px] border border-danger/35 bg-danger/10 p-6"><h1 className="mb-2 text-2xl font-bold">No pudimos abrir este deck</h1><p className="mb-5 text-[#ffb4b4]" role="alert">{error || 'Deck no encontrado.'}</p><div className="flex flex-wrap gap-2"><Button type="button" onClick={loadDeck}>Reintentar</Button><Button as={Link} to="/decks" variant="ghost">Volver a mis decks</Button></div></section></PageShell>;

  return (
    <PageShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/decks" className="rounded text-sm text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">← Mis decks</Link>
        <Button type="button" variant="danger" onClick={handleDelete} disabled={Boolean(pending)}>{pending === 'delete' ? 'Eliminando…' : 'Eliminar deck'}</Button>
      </div>

      <form className="mb-4 flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-end" onSubmit={handleRename}>
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-muted">Nombre del deck<input className="min-h-11 w-full rounded-lg border border-white/10 bg-surface px-3 py-2.5 text-xl font-bold text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45" value={name} onChange={(event) => { setName(event.target.value); setSavedMessage(''); }} required /></label>
        <Button type="submit" disabled={Boolean(pending) || !nameDirty || !name.trim()}>{pending === 'rename' ? 'Guardando…' : nameDirty ? 'Guardar nombre' : 'Nombre guardado'}</Button>
      </form>

      <p className="mb-4 text-sm text-muted">Asociado a <span className="text-accent">{user?.username || 'tu cuenta'}</span>. Los cambios de cartas se guardan cuando el servidor los confirma.</p>
      <DeckLegalityTag legality={legality} />
      <div className="mb-5 min-h-6" aria-live="polite">{savedMessage && <p className="text-sm text-emerald-400" role="status">{savedMessage}</p>}{error && <p className="text-sm text-[#ffb4b4]" role="alert">{error}</p>}</div>
      <div className="mb-8"><CardSearch onAdd={handleAdd} board={board} onBoardChange={setBoard} pending={Boolean(pending)} /></div>
      <BoardSection title="Main" board="main" cards={main} count={legality.mainCount} hint="mínimo 60" pending={Boolean(pending)} onQty={handleQuantity} onRemove={handleRemove} onMove={handleMove} />
      <BoardSection title="Sideboard" board="sideboard" cards={sideboard} count={legality.sideboardCount} hint="máximo 15" pending={Boolean(pending)} onQty={handleQuantity} onRemove={handleRemove} onMove={handleMove} />
    </PageShell>
  );
}
