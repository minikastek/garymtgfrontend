import { useEffect, useState } from 'react';
import { getMe, SESSION_EXPIRED_EVENT } from './api';
import { AuthContext } from './auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    function onSessionExpired() {
      setUser(null);
      setSessionExpired(true);
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    getMe(token)
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  function setSession({ token, user }) {
    localStorage.setItem('token', token);
    setUser(user);
    setSessionExpired(false);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setSessionExpired(false);
  }

  return (
    <AuthContext.Provider value={{ user, loading, sessionExpired, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
