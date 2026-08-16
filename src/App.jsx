import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { useAuth } from './auth';
import Navbar from './components/Navbar';
import PageShell from './components/PageShell';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import Profile from './pages/Profile';
import Decks from './pages/Decks';
import DeckDetail from './pages/DeckDetail';
import Binders from './pages/Binders';
import BinderDetail from './pages/BinderDetail';
import Wishlists from './pages/Wishlists';
import WishlistDetail from './pages/WishlistDetail';
import Trade from './pages/Trade';
import NotFound from './pages/NotFound';
import Test from './pages/Test';

function PrivateRoute({ children }) {
  const { user, loading, sessionExpired } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <PageShell>
        <p role="status">Cargando…</p>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
          reason: sessionExpired ? 'expired' : undefined,
        }}
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/crear-cuenta" element={<CreateAccount />} />
          {import.meta.env.DEV && <Route path="/test" element={<Test />} />}
          <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/decks" element={<PrivateRoute><Decks /></PrivateRoute>} />
          <Route path="/decks/:id" element={<PrivateRoute><DeckDetail /></PrivateRoute>} />
          <Route path="/binders" element={<PrivateRoute><Binders /></PrivateRoute>} />
        <Route path="/binders/:id" element={<PrivateRoute><BinderDetail /></PrivateRoute>} />
        <Route path="/wishlists" element={<PrivateRoute><Wishlists /></PrivateRoute>} />
        <Route path="/wishlists/:id" element={<PrivateRoute><WishlistDetail /></PrivateRoute>} />
        <Route path="/trade" element={<PrivateRoute><Trade /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
