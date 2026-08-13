import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageShell from '../components/PageShell';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageShell className="flex min-h-[60vh] items-center">
      <section className="max-w-xl rounded-[14px] border border-accent/25 bg-surface p-6 sm:p-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Error 404</p>
        <h1 className="m-0 text-3xl font-bold">No encontramos esta página</h1>
        <p className="mb-6 mt-3 leading-relaxed text-muted">
          Es posible que el enlace haya cambiado o que la dirección no exista.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button as={Link} to="/">
            Ir al inicio
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Volver atrás
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
