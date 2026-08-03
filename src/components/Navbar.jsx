import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Button from './Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-accent/25 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex items-center gap-5">
          <Link to="/" className="text-xl font-bold tracking-wide text-accent hover:text-accent-hover">
            GaryMTG
          </Link>
          <Link to="/test" className="text-sm text-muted hover:text-accent">
            Test
          </Link>
        </div>

        <nav className="flex items-center">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2.5 rounded-full border border-accent/30 bg-surface px-2.5 py-1.5 text-white hover:border-accent"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
              >
                <img src={user.avatar} alt="" className="h-8 w-8 rounded-full bg-surface-2 object-cover" />
                <span className="max-w-[140px] truncate font-semibold">{user.username}</span>
                <span className="text-xs text-muted">{open ? '▴' : '▾'}</span>
              </button>

              {open && (
                <div className="absolute right-0 top-[calc(100%+0.45rem)] flex min-w-[180px] flex-col rounded-[10px] border border-accent/30 bg-surface p-1.5 shadow-xl shadow-black/35">
                  <NavLink
                    to="/perfil"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-white hover:bg-surface-2 hover:text-accent"
                  >
                    Mi perfil
                  </NavLink>
                  <NavLink
                    to="/decks"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-white hover:bg-surface-2 hover:text-accent"
                  >
                    Mis decks
                  </NavLink>
                  <NavLink
                    to="/binders"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-white hover:bg-surface-2 hover:text-accent"
                  >
                    Mis Binders
                  </NavLink>
                  <button
                    type="button"
                    className="mt-1 cursor-pointer rounded-lg border-0 border-t border-white/5 bg-transparent px-3 py-2.5 text-left font-inherit text-danger hover:bg-surface-2"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button as={Link} to="/login" variant="ghost">
                Logearse
              </Button>
              <Button as={Link} to="/crear-cuenta" variant="primary">
                Crear cuenta
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
