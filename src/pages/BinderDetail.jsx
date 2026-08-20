import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addCardToBinder, deleteBinder, getBinder, updateBinder } from '../api';
import {
  countBinderCards,
  normalizeBinderMetadata,
  removeBinderCard,
  setBinderCardQuantity,
} from '../binderRules';
import Button from '../components/Button';
import CardSearch from '../components/CardSearch';
import CardTile from '../components/CardTile';
import PageShell from '../components/PageShell';

function BinderSkeleton() {
  return <PageShell><div className="animate-pulse" aria-label="Cargando binder"><div className="mb-4 h-5 w-28 rounded bg-surface-2" /><div className="mb-3 h-12 max-w-xl rounded bg-surface" /><div className="mb-8 h-28 rounded-[14px] bg-surface" /></div></PageShell>;
}

export default function BinderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentsHeadingRef = useRef(null);
  const mutationLockRef = useRef(false);
  const [binder, setBinder] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tradeEnabled, setTradeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const loadBinder = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getBinder(id);
      setBinder(response.binder);
      setName(response.binder.name);
      setDescription(response.binder.description || '');
      setTradeEnabled(Boolean(response.binder.tradeEnabled));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadBinder(); }, [loadBinder]);

  const metadata = normalizeBinderMetadata(name, description);
  const metadataDirty = Boolean(binder) && (
    metadata.name !== binder.name
    || metadata.description !== binder.description
    || tradeEnabled !== Boolean(binder.tradeEnabled)
  );

  async function mutate(label, operation, successMessage) {
    if (mutationLockRef.current) return false;
    mutationLockRef.current = true;
    setPending(label);
    setError('');
    setStatus('');
    try {
      const { binder: confirmedBinder } = await operation();
      setBinder(confirmedBinder);
      setStatus(successMessage);
      return confirmedBinder;
    } catch (err) {
      setError(`${err.message} No se aplicaron cambios.`);
      return false;
    } finally {
      mutationLockRef.current = false;
      setPending('');
    }
  }

  async function handleMetadata(event) {
    event.preventDefault();
    if (!metadata.name) return setError('El nombre del binder es obligatorio.');
    const saved = await mutate(
      'metadata',
      () => updateBinder(id, { ...metadata, tradeEnabled }),
      'Datos del binder guardados.',
    );
    if (saved) {
      setName(saved.name);
      setDescription(saved.description || '');
      setTradeEnabled(Boolean(saved.tradeEnabled));
    } else {
      setTradeEnabled(Boolean(binder.tradeEnabled));
    }
  }

  const handleAdd = (card, quantity) => mutate(`add-${card.id}`, () => addCardToBinder(id, card, quantity), `${card.name} se agregó al binder.`);
  const handleQuantity = (cardId, quantity) => {
    const cards = setBinderCardQuantity(binder.cards, cardId, quantity);
    return mutate(`quantity-${cardId}`, () => updateBinder(id, { cards }), 'Cantidad actualizada.');
  };
  const handleRemove = async (cardId) => {
    const cards = removeBinderCard(binder.cards, cardId);
    const removed = await mutate(`remove-${cardId}`, () => updateBinder(id, { cards }), 'Carta eliminada del binder.');
    if (removed) contentsHeadingRef.current?.focus();
  };

  async function handleDelete() {
    if (mutationLockRef.current || !confirm(`¿Eliminar "${binder.name}"? Esta acción no se puede deshacer.`)) return;
    mutationLockRef.current = true;
    setPending('delete');
    setError('');
    try {
      await deleteBinder(id);
      navigate('/binders');
    } catch (err) {
      mutationLockRef.current = false;
      setPending('');
      setError(err.message);
    }
  }

  if (loading) return <BinderSkeleton />;
  if (!binder) return <PageShell><section className="max-w-xl rounded-[14px] border border-danger/35 bg-danger/10 p-6"><h1 className="mb-2 text-2xl font-bold">No pudimos abrir este binder</h1><p className="mb-5 text-[#ffb4b4]" role="alert">{error || 'Binder no encontrado.'}</p><div className="flex flex-wrap gap-2"><Button type="button" onClick={loadBinder}>Reintentar</Button><Button as={Link} to="/binders" variant="ghost">Volver a mis binders</Button></div></section></PageShell>;

  return (
    <PageShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/binders" className="rounded text-sm text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">← Mis binders</Link>
        <Button type="button" variant="danger" disabled={Boolean(pending)} onClick={handleDelete}>{pending === 'delete' ? 'Eliminando…' : 'Eliminar binder'}</Button>
      </div>

      <form className="mb-6 grid min-w-0 max-w-3xl gap-3 rounded-[14px] border border-accent/20 bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" onSubmit={handleMetadata}>
        <div className="grid min-w-0 gap-3">
          <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-muted">Nombre<input className="min-h-11 min-w-0 rounded-lg border border-white/10 bg-bg px-3 text-xl font-bold text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45" value={name} onChange={(event) => { setName(event.target.value); setStatus(''); }} required /></label>
          <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-muted">Descripción <span className="font-normal">(opcional, {description.length}/280)</span><textarea className="min-h-24 min-w-0 resize-y rounded-lg border border-white/10 bg-bg p-3 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45" value={description} maxLength={280} onChange={(event) => { setDescription(event.target.value); setStatus(''); }} /></label>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-bg p-3 text-sm text-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/45">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-accent" checked={tradeEnabled} disabled={Boolean(pending)} onChange={(event) => { setTradeEnabled(event.target.checked); setStatus(''); }} />
            <span><span className="block font-semibold">Disponible para intercambios</span><span className="mt-1 block font-normal text-muted">Otros jugadores podrán encontrar este binder y usar sus cartas para preparar propuestas.</span></span>
          </label>
        </div>
        <Button type="submit" disabled={Boolean(pending) || !metadataDirty || !metadata.name}>{pending === 'metadata' ? 'Guardando…' : metadataDirty ? 'Guardar datos' : 'Datos guardados'}</Button>
      </form>

      <div className="mb-5 min-h-6" aria-live="polite">{status && <p className="text-sm text-emerald-400" role="status">{status}</p>}{error && <p className="text-sm text-[#ffb4b4]" role="alert">{error}</p>}</div>
      <div className="mb-8"><CardSearch onAdd={handleAdd} pending={Boolean(pending)} collectionLabel="binder" /></div>

      <section aria-labelledby="binder-contents-heading">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="binder-contents-heading" ref={contentsHeadingRef} tabIndex="-1" className="rounded text-xl font-semibold focus-visible:outline-2 focus-visible:outline-accent">Cartas del binder</h2>
          <span className="text-sm text-muted">{countBinderCards(binder.cards)} cartas · {binder.cards.length} {binder.cards.length === 1 ? 'impresión' : 'impresiones'}</span>
        </div>
        {!binder.cards.length ? <p className="rounded-[12px] border border-dashed border-white/10 p-5 text-sm text-muted">Este binder está vacío. Buscá una carta arriba para agregar la primera impresión.</p> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {binder.cards.map((card) => <CardTile key={card.id} card={card} quantity={card.quantity} showQtyControls pending={Boolean(pending)} maxCopies={999} removeLabel="Quitar del binder" onQuantityChange={(quantity) => handleQuantity(card.id, quantity)} onRemove={() => handleRemove(card.id)} />)}
          </div>
        )}
      </section>
    </PageShell>
  );
}
