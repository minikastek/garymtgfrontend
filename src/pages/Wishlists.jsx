import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createWishlist, listWishlists } from '../api';
import Button from '../components/Button';
import { normalizeWishlistMetadata } from '../wishlistRules';

export default function Wishlists() {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    listWishlists()
      .then(({ wishlists: items }) => active && setWishlists(items))
      .catch((requestError) => active && setError(requestError.message || 'No pudimos cargar tus wishlists.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    const metadata = normalizeWishlistMetadata(name, description);
    if (!metadata.name || creating) return;
    setCreating(true);
    setError('');
    try {
      const { wishlist } = await createWishlist(metadata.name, metadata.description);
      setWishlists((items) => [wishlist, ...items]);
      setName('');
      setDescription('');
    } catch (requestError) {
      setError(requestError.message || 'No pudimos crear la wishlist.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-5 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-accent">Coleccion</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Mis wishlists</h1>
        <p className="mt-3 text-muted">Organiza las cartas que buscas y prepara futuros intercambios.</p>
      </header>

      <section className="mb-10 rounded-2xl border border-accent/20 bg-surface p-5 sm:p-6" aria-labelledby="new-wishlist-title">
        <h2 id="new-wishlist-title" className="text-xl font-bold text-white">Crear una wishlist</h2>
        <form className="mt-5 grid gap-4" onSubmit={handleCreate}>
          <label className="grid gap-2 font-semibold text-white">Nombre
            <input className="min-h-11 rounded-lg border border-white/15 bg-bg px-3 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} />
          </label>
          <label className="grid gap-2 font-semibold text-white">Descripcion <span className="font-normal text-muted">(opcional)</span>
            <textarea className="min-h-24 resize-y rounded-lg border border-white/15 bg-bg px-3 py-2 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={280} />
          </label>
          <Button type="submit" disabled={creating || !name.trim()} className="justify-self-start">{creating ? 'Creando...' : 'Crear wishlist'}</Button>
        </form>
      </section>

      {error && <p role="alert" className="mb-5 rounded-lg border border-danger/40 bg-danger/10 p-3 text-danger">{error}</p>}
      <section aria-labelledby="wishlist-list-title">
        <h2 id="wishlist-list-title" className="mb-4 text-2xl font-bold text-white">Cartas que estas buscando</h2>
        {loading ? <p className="text-muted">Cargando wishlists...</p> : wishlists.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-surface/60 p-8 text-center">
            <p className="font-semibold text-white">Todavia no tienes wishlists.</p>
            <p className="mt-2 text-muted">Crea la primera para registrar las cartas que necesitas.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlists.map((wishlist) => (
              <Link key={wishlist.id} to={`/wishlists/${wishlist.id}`} className="group rounded-2xl border border-white/10 bg-surface p-5 outline-none transition hover:-translate-y-0.5 hover:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                <h3 className="break-words text-lg font-bold text-white group-hover:text-accent">{wishlist.name}</h3>
                <p className="mt-2 line-clamp-3 min-h-[4.5rem] break-words text-sm text-muted">{wishlist.description || 'Sin descripcion'}</p>
                <p className="mt-4 text-sm font-semibold text-accent">{wishlist.cardCount || 0} cartas buscadas</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
