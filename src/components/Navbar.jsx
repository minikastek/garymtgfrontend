import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import Button from './Button';

const menuLinkClass = ({ isActive }) =>
  `min-h-11 rounded-lg px-3 py-2.5 text-white outline-none transition-colors hover:bg-surface-2 hover:text-accent focus-visible:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isActive ? 'bg-surface-2 text-accent' : ''}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  function onMenuKeyDown(e) {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-accent/25 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-4">
          <Link to="/" className="rounded-md text-xl font-bold tracking-wide text-accent outline-none hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            GaryMTG
          </Link>
          {import.meta.env.DEV && (
            <NavLink
              to="/test"
              className={({ isActive }) => `rounded-md text-sm outline-none hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isActive ? 'text-accent' : 'text-muted'}`}
            >
              Test
            </NavLink>
          )}
        </div>

        <nav aria-label="Navegación principal" className="flex items-center">
          {user ? (
            <div className="relative" ref={menuRef} onKeyDown={onMenuKeyDown}>
              <button
                ref={triggerRef}
                type="button"
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-accent/30 bg-surface px-2.5 py-1.5 text-white outline-none hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="true"
                aria-controls="account-navigation"
              >
                <img src={user.avatar} alt="" className="h-8 w-8 rounded-full bg-surface-2 object-cover" />
                <span className="hidden max-w-[140px] truncate font-semibold sm:inline">{user.username}</span>
                <span aria-hidden="true" className="text-xs text-muted">{open ? '▲' : '▼'}</span>
              </button>

              {open && (
                <div
                  id="account-navigation"
                  aria-label="Cuenta"
                  className="absolute right-0 top-[calc(100%+0.45rem)] flex min-w-[190px] flex-col rounded-[10px] border border-accent/30 bg-surface p-1.5 shadow-xl shadow-black/35"
                >
                  <NavLink to="/perfil" className={menuLinkClass}>Mi perfil</NavLink>
                  <NavLink to="/decks" className={menuLinkClass}>Mis decks</NavLink>
                  <NavLink to="/binders" className={menuLinkClass}>Mis binders</NavLink>
                  <NavLink to="/wishlists" className={menuLinkClass}>Mis wishlists</NavLink>
                  <NavLink to="/trade" className={menuLinkClass}>Buscar intercambios</NavLink>
                  <button
                    type="button"
                    className="mt-1 min-h-11 cursor-pointer rounded-lg border-0 border-t border-white/5 bg-transparent px-3 py-2.5 text-left font-inherit text-danger outline-none hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
            <div className="flex items-center gap-2">
              <Button as={Link} to="/login" variant="ghost">Ingresar</Button>
              <Button as={Link} to="/crear-cuenta" className="hidden sm:inline-flex">Crear cuenta</Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
