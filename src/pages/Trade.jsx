import { useEffect, useState } from 'react';
import { compareTrade, listTradeBinders, listWishlists, searchTradeUsers } from '../api';
import Button from '../components/Button';
import PageShell from '../components/PageShell';
import { buildTradeComparisonPayload, getTradeSearchEmptyMessage } from '../tradeRules';

function UserAvatar({ user }) {
  if (user.avatar) {
    return <img src={user.avatar} alt="" className="h-11 w-11 rounded-full bg-surface-2 object-cover" />;
  }

  return (
    <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 font-bold text-accent">
      {user.username?.slice(0, 1).toUpperCase() || '?'}
    </span>
  );
}

export default function Trade() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [binders, setBinders] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [binderId, setBinderId] = useState('');
  const [wishlistId, setWishlistId] = useState('');
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingBinders, setLoadingBinders] = useState(false);
  const [loadingWishlists, setLoadingWishlists] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [binderError, setBinderError] = useState('');
  const [wishlistError, setWishlistError] = useState('');
  const [compareError, setCompareError] = useState('');

  useEffect(() => {
    let active = true;
    listWishlists()
      .then(({ wishlists: items }) => {
        if (active) setWishlists(items || []);
      })
      .catch((error) => {
        if (active) setWishlistError(error.message || 'No pudimos cargar tus wishlists.');
      })
      .finally(() => {
        if (active) setLoadingWishlists(false);
      });
    return () => { active = false; };
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (!normalizedQuery || searching) return;

    setSearching(true);
    setHasSearched(false);
    setSearchError('');
    setUsers([]);
    setSelectedUser(null);
    setBinders([]);
    setBinderId('');
    setResult(null);
    try {
      const data = await searchTradeUsers(normalizedQuery);
      setUsers(data.users || []);
      setHasSearched(true);
    } catch (error) {
      setSearchError(error.message || 'No pudimos buscar jugadores.');
    } finally {
      setSearching(false);
    }
  }

  async function selectUser(user) {
    setSelectedUser(user);
    setBinders([]);
    setBinderId('');
    setResult(null);
    setBinderError('');
    setCompareError('');
    setLoadingBinders(true);
    try {
      const data = await listTradeBinders(user.id);
      setBinders(data.binders || []);
    } catch (error) {
      setBinderError(error.message || 'No pudimos cargar los binders de este jugador.');
    } finally {
      setLoadingBinders(false);
    }
  }

  async function handleCompare(event) {
    event.preventDefault();
    const payload = buildTradeComparisonPayload({
      targetUserId: selectedUser?.id,
      binderId,
      wishlistId,
    });
    if (!payload || comparing) return;

    setComparing(true);
    setCompareError('');
    setResult(null);
    try {
      setResult(await compareTrade(payload));
    } catch (error) {
      setCompareError(error.message || 'No pudimos comparar estas colecciones.');
    } finally {
      setComparing(false);
    }
  }

  const canCompare = Boolean(buildTradeComparisonPayload({
    targetUserId: selectedUser?.id,
    binderId,
    wishlistId,
  }));
  const searchEmptyMessage = getTradeSearchEmptyMessage({
    hasSearched,
    query,
    resultCount: users.length,
  });

  return (
    <PageShell>
      <header className="mb-8 max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Intercambios</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Encontrá cartas para intercambiar</h1>
        <p className="mt-3 text-muted">Buscá otro jugador y compará uno de sus binders con tu wishlist. Las coincidencias se hacen por nombre, sin exigir la misma edición.</p>
      </header>

      <section className="rounded-2xl border border-accent/20 bg-surface p-5 sm:p-6" aria-labelledby="trade-search-title">
        <h2 id="trade-search-title" className="text-xl font-bold text-white">1. Buscar jugador</h2>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSearch}>
          <label className="flex flex-1 flex-col gap-2 font-semibold text-white">
            Nombre de usuario
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-11 rounded-lg border border-white/15 bg-bg px-3 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              placeholder="Ej: ariel"
              autoComplete="off"
            />
          </label>
          <Button type="submit" disabled={searching || !query.trim()}>{searching ? 'Buscando...' : 'Buscar'}</Button>
        </form>
        {searchError && <p role="alert" className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-danger">{searchError}</p>}
        {!searching && !searchError && searchEmptyMessage && (
          <p className="mt-4 text-muted">{searchEmptyMessage}</p>
        )}
        {users.length > 0 && (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Jugadores encontrados">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => selectUser(user)}
                  aria-pressed={selectedUser?.id === user.id}
                  className={`flex min-h-16 w-full items-center gap-3 rounded-xl border p-3 text-left outline-none transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selectedUser?.id === user.id ? 'border-accent bg-accent/10' : 'border-white/10 bg-bg hover:border-accent/50'}`}
                >
                  <UserAvatar user={user} />
                  <span className="min-w-0 truncate font-bold text-white">{user.username}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedUser && (
        <section className="mt-6 rounded-2xl border border-accent/20 bg-surface p-5 sm:p-6" aria-labelledby="trade-options-title">
          <h2 id="trade-options-title" className="text-xl font-bold text-white">2. Elegir colecciones</h2>
          <p className="mt-2 text-muted">Comparando con <strong className="text-white">{selectedUser.username}</strong>.</p>
          <form className="mt-5 grid gap-5" onSubmit={handleCompare}>
            <label className="grid gap-2 font-semibold text-white">
              Binder de {selectedUser.username}
              <select className="min-h-11 rounded-lg border border-white/15 bg-bg px-3 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" value={binderId} onChange={(event) => { setBinderId(event.target.value); setResult(null); }} disabled={loadingBinders || binders.length === 0}>
                <option value="">{loadingBinders ? 'Cargando binders...' : 'Seleccioná un binder'}</option>
                {binders.map((binder) => <option key={binder.id} value={binder.id}>{binder.name} ({binder.cardCount || 0} cartas)</option>)}
              </select>
            </label>
            {binderError && <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-danger">{binderError}</p>}
            {!loadingBinders && !binderError && binders.length === 0 && <p className="text-muted">Este jugador todavía no tiene binders públicos para comparar.</p>}

            <label className="grid gap-2 font-semibold text-white">
              Tu wishlist
              <select className="min-h-11 rounded-lg border border-white/15 bg-bg px-3 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/30" value={wishlistId} onChange={(event) => { setWishlistId(event.target.value); setResult(null); }} disabled={loadingWishlists || wishlists.length === 0}>
                <option value="">{loadingWishlists ? 'Cargando wishlists...' : 'Seleccioná una wishlist'}</option>
                {wishlists.map((wishlist) => <option key={wishlist.id} value={wishlist.id}>{wishlist.name} ({wishlist.cardCount || 0} cartas)</option>)}
              </select>
            </label>
            {wishlistError && <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-danger">{wishlistError}</p>}
            {!loadingWishlists && !wishlistError && wishlists.length === 0 && <p className="text-muted">Primero creá una wishlist con las cartas que estás buscando.</p>}

            <Button type="submit" disabled={!canCompare || comparing} className="justify-self-start">{comparing ? 'Comparando...' : 'Comparar cartas'}</Button>
          </form>
          {compareError && <p role="alert" className="mt-5 rounded-lg border border-danger/40 bg-danger/10 p-3 text-danger">{compareError}</p>}
        </section>
      )}

      {result && (
        <section className="mt-6" aria-labelledby="trade-results-title" aria-live="polite">
          <div className="mb-4">
            <p className="text-sm font-semibold text-accent">{result.matchCount} coincidencias</p>
            <h2 id="trade-results-title" className="text-2xl font-bold text-white">Cartas disponibles en {result.binder.name}</h2>
          </div>
          {result.matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-surface/60 p-8 text-center">
              <p className="font-semibold text-white">No hay coincidencias por ahora.</p>
              <p className="mt-2 text-muted">Probá con otro binder o una wishlist diferente.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.matches.map((match) => (
                <article key={match.name} className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
                  {match.binderPrintings[0]?.image && <img src={match.binderPrintings[0].image} alt={`Carta ${match.name}`} className="aspect-[5/3] w-full bg-bg object-cover object-top" loading="lazy" />}
                  <div className="p-5">
                    <h3 className="break-words text-lg font-bold text-white">{match.name}</h3>
                    <p className="mt-2 text-sm text-muted">Disponible: {match.binderQuantity} · Buscás: {match.wishlistQuantity}</p>
                    <p className="mt-3 text-xs text-muted">Edición disponible: {match.binderPrintings.map((printing) => printing.set || 'sin edición').join(', ')}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </PageShell>
  );
}
