import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createBinder, listBinders } from '../api';
import { normalizeBinderMetadata } from '../binderRules';
import Button from '../components/Button';
import PageShell from '../components/PageShell';

function BinderListSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-label="Cargando binders">
      {[0, 1].map((item) => (
        <div key={item} className="h-32 animate-pulse rounded-[12px] bg-surface" />
      ))}
    </div>
  );
}

export default function Binders() {
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const [binders, setBinders] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadBinders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listBinders();
      setBinders(data.binders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBinders(); }, [loadBinders]);

  async function handleCreate(event) {
    event.preventDefault();
    const metadata = normalizeBinderMetadata(name, description);
    if (!metadata.name || creating) return;

    setCreating(true);
    setError('');
    try {
      const { binder } = await createBinder(metadata.name, metadata.description);
      navigate(`/binders/${binder.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <PageShell>
      <div className="mb-6 max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Tu colección disponible
        </p>
        <h1 ref={headingRef} tabIndex="-1" className="mb-2 rounded text-3xl font-bold focus-visible:outline-2 focus-visible:outline-accent">
          Mis binders
        </h1>
        <p className="text-muted">
          Organizá las impresiones que tenés disponibles y preparalas para futuras comparaciones de intercambio.
        </p>
      </div>

      <form className="mb-8 grid gap-3 rounded-[14px] border border-accent/20 bg-surface p-4 md:grid-cols-[1fr_2fr_auto] md:items-end" onSubmit={handleCreate}>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
          Nombre
          <input className="min-h-11 rounded-lg border border-white/10 bg-bg px-3 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Carpeta de intercambio" required />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
          Descripción <span className="font-normal">(opcional, {description.length}/280)</span>
          <input className="min-h-11 rounded-lg border border-white/10 bg-bg px-3 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45" value={description} maxLength={280} onChange={(event) => setDescription(event.target.value)} placeholder="Qué cartas guardás en este binder" />
        </label>
        <Button type="submit" disabled={creating || !name.trim()}>{creating ? 'Creando…' : 'Crear binder'}</Button>
      </form>

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-danger/40 bg-danger/10 p-4 text-sm text-[#ffb4b4]" role="alert">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={loadBinders}>Reintentar</Button>
        </div>
      )}

      {loading ? <BinderListSkeleton /> : !binders.length ? (
        <section className="rounded-[14px] border border-dashed border-accent/30 bg-surface/70 px-6 py-10 text-center">
          <h2 className="mb-2 text-xl font-semibold">Todavía no tenés binders</h2>
          <p className="mx-auto max-w-lg text-sm text-muted">Creá uno arriba para registrar tus primeras cartas disponibles.</p>
        </section>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {binders.map((binder) => (
            <li key={binder.id} className="flex flex-col justify-between gap-4 rounded-[12px] border border-accent/20 bg-surface p-4">
              <div>
                <Link to={`/binders/${binder.id}`} className="rounded text-lg font-semibold text-white hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">{binder.name}</Link>
                <p className="mt-1 text-sm text-muted">{binder.description || 'Sin descripción.'}</p>
                <p className="mt-3 text-xs font-semibold text-accent">{binder.cardCount || 0} carta{binder.cardCount === 1 ? '' : 's'}</p>
              </div>
              <Button as={Link} to={`/binders/${binder.id}`} variant="ghost">Abrir binder</Button>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
