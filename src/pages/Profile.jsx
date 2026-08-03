import { useAuth } from '../AuthContext';
import PageShell from '../components/PageShell';

export default function Profile() {
  const { user } = useAuth();
  if (!user) {
    return (
      <PageShell>
        <p>Necesitás iniciar sesión.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h1 className="mb-4 text-3xl font-bold">Mi perfil</h1>
      <div className="mt-4 flex items-center gap-4 rounded-[10px] border border-accent/20 bg-surface p-5">
        <img src={user.avatar} alt="" className="h-[72px] w-[72px] rounded-full bg-surface-2" />
        <div>
          <p className="m-0 text-lg font-semibold text-white">{user.username}</p>
          <p className="m-0 text-muted">{user.email}</p>
        </div>
      </div>
    </PageShell>
  );
}
