import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../AuthContext';
import Button from '../components/Button';
import PageShell from '../components/PageShell';

export default function Login() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await login({ email, password });
      setSession(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell className="flex justify-center">
      <form
        className="flex w-full max-w-[400px] flex-col gap-4 rounded-[14px] border border-accent/25 bg-surface p-7"
        onSubmit={onSubmit}
      >
        <h1 className="m-0 text-2xl font-bold">Iniciar sesión</h1>
        {error && (
          <p className="m-0 rounded-lg bg-danger/15 px-3 py-2.5 text-sm text-[#ffb4b4]">{error}</p>
        )}
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Email
          <input
            type="email"
            className="rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Contraseña
          <input
            type="password"
            className="rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/45"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </Button>
        <p className="m-0 text-center text-sm text-muted">
          ¿No tenés cuenta? <Link to="/crear-cuenta">Crear cuenta</Link>
        </p>
      </form>
    </PageShell>
  );
}
