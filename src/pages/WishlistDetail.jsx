import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addCardToWishlist, deleteWishlist, getWishlist, updateWishlist } from '../api';
import Button from '../components/Button';
import CardSearch from '../components/CardSearch';
import CardTile from '../components/CardTile';
import { countWishlistCards, normalizeWishlistMetadata, removeWishlistCard, setWishlistCardQuantity } from '../wishlistRules';

export default function WishlistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState(false);
  const mutationRef = useRef(false);
  const searchHeadingRef = useRef(null);

  useEffect(() => {
    let active = true;
    getWishlist(id).then(({ wishlist: item }) => {
      if (!active) return;
      setWishlist(item);
      setName(item.name);
      setDescription(item.description || '');
    }).catch((requestError) => active && setError(requestError.message || 'No pudimos cargar la wishlist.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  async function commit(operation, successMessage) {
    if (mutationRef.current) return;
    mutationRef.current = true;
    setError('');
    setNotice('');
    try {
      const { wishlist: updated } = await operation();
      setWishlist(updated);
      setName(updated.name);
      setDescription(updated.description || '');
      if (successMessage) setNotice(successMessage);
    } catch (requestError) {
      setError(requestError.message || 'No pudimos guardar el cambio. Intenta nuevamente.');
    } finally {
      mutationRef.current = false;
    }
  }

  function handleMetadataSave(event) {
    event.preventDefault();
    const metadata = normalizeWishlistMetadata(name, description);
    if (!metadata.name) return setError('La wishlist necesita un nombre.');
    commit(() => updateWishlist(id, metadata), 'Datos de la wishlist guardados.');
  }

  function handleAdd(card, quantity = 1) {
    commit(() => addCardToWishlist(id, card, quantity), `${card.name} fue agregada a la wishlist.`);
  }

  function handleQuantity(cardId, quantity) {
    commit(() => updateWishlist(id, { cards: setWishlistCardQuantity(wishlist.cards, cardId, quantity) }));
  }

  function handleRemove(cardId) {
    commit(() => updateWishlist(id, { cards: removeWishlistCard(wishlist.cards, cardId) }), 'Carta eliminada de la wishlist.');
    requestAnimationFrame(() => searchHeadingRef.current?.focus());
  }

  async function handleDelete() {
    if (deleting || !window.confirm('Eliminar esta wishlist de forma permanente?')) return;
    setDeleting(true);
    setError('');
    try {
      await deleteWishlist(id);
      navigate('/wishlists', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'No pudimos eliminar la wishlist.');
      setDeleting(false);
    }
  }

  if (loading) return <main className="mx-auto w-full max-w-[1100px] px-4 py-12 text-muted sm:px-5">Cargando wishlist...</main>;
  if (!wishlist) return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-12 sm:px-5">
      <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-danger">{error || 'Wishlist no encontrada.'}</p>
      <Button as={Link} to="/wishlists" variant="ghost" className="mt-5">Volver a wishlists</Button>
    </main>
  );

  return (
    <main className="mx-auto w-full max-w-[1100px] overflow-x-hidden px-4 py-8 sm:px-5 sm:py-12">
      <Link to="/wishlists" className="rounded text-sm font-semibold text-accent outline-none hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Volver a mis wishlists</Link>
      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <header className="mb-7">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Wishlist</p>
            <h1 className="mt-2 break-words text-3xl font-bold text-white sm:text-4xl">{wishlist.name}</h1>
            <p className="mt-3 text-muted">{countWishlistCards(wishlist.cards)} copias buscadas</p>
          </header>
          {error && <p role="alert" className="mb-5 rounded-lg border border-danger/40 bg-danger/10 p-3 text-danger">{error}</p>}
          {notice && <p role="status" className="mb-5 rounded-lg border border-accent/30 bg-accent/10 p-3 text-white">{notice}</p>}
          <section aria-labelledby="wanted-cards-title">
            <h2 id="wanted-cards-title" className="text-2xl font-bold text-white">Cartas buscadas</h2>
            {wishlist.cards.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-surface/60 p-7 text-center text-muted">Busca una carta para empezar esta wishlist.</div> : (
              <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {wishlist.cards.map((card) => <CardTile key={card.id} card={card} maxCopies={999} onQuantityChange={(quantity) => handleQuantity(card.id, quantity)} onRemove={() => handleRemove(card.id)} removeLabel="Quitar de la wishlist" />)}
              </div>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-accent/20 bg-surface p-5" aria-labelledby="wishlist-data-title">
            <h2 id="wishlist-data-title" className="text-xl font-bold text-white">Datos de la wishlist</h2>
            <form className="mt-4 grid gap-4" onSubmit={handleMetadataSave}>
              <label className="grid gap-2 text-sm font-semibold text-white">Nombre<input className="min-h-11 min-w-0 rounded-lg border border-white/15 bg-bg px-3 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} /></label>
              <label className="grid gap-2 text-sm font-semibold text-white">Descripcion<textarea className="min-h-24 min-w-0 resize-y rounded-lg border border-white/15 bg-bg px-3 py-2 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={280} /></label>
              <Button type="submit">Guardar datos</Button>
            </form>
          </section>
          <section className="min-w-0 rounded-2xl border border-accent/20 bg-surface p-5" aria-labelledby="wishlist-search-title">
            <h2 id="wishlist-search-title" ref={searchHeadingRef} tabIndex="-1" className="text-xl font-bold text-white outline-none">Agregar cartas</h2>
            <div className="mt-4 min-w-0"><CardSearch onAdd={handleAdd} collectionLabel="wishlist" showBoardSelector={false} /></div>
          </section>
          <section className="rounded-2xl border border-danger/30 bg-danger/5 p-5" aria-labelledby="delete-wishlist-title">
            <h2 id="delete-wishlist-title" className="font-bold text-white">Zona de peligro</h2>
            <p className="mt-2 text-sm text-muted">Esta accion no se puede deshacer.</p>
            <Button type="button" variant="danger" className="mt-4" disabled={deleting} onClick={handleDelete}>{deleting ? 'Eliminando...' : 'Eliminar wishlist'}</Button>
          </section>
        </aside>
      </div>
    </main>
  );
}
