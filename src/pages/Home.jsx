import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import Button from '../components/Button';
import PageShell from '../components/PageShell';

export default function Home() {
  const { user } = useAuth();

  return (
    <PageShell>
      <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.6rem)] font-bold">Bienvenido a GaryMTG</h1>
      <p className="mb-6 max-w-xl leading-relaxed text-muted">
        {user
          ? `Hola, ${user.username}. Gestioná tus decks y binders desde el menú.`
          : 'Coleccioná, armá decks y organizá tus binders de Magic: The Gathering.'}
      </p>
      {!user && (
        <div className="flex flex-wrap gap-3">
          <Button as={Link} to="/crear-cuenta" variant="primary">
            Empezar
          </Button>
          <Button as={Link} to="/login" variant="ghost">
            Ya tengo cuenta
          </Button>
        </div>
      )}
    </PageShell>
  );
}
