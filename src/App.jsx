import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import PageShell from './components/PageShell';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import Profile from './pages/Profile';
import Decks from './pages/Decks';
import DeckDetail from './pages/DeckDetail';
import Binders from './pages/Binders';
import Test from './pages/Test';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <PageShell>
        <p>Cargando…</p>
      </PageShell>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
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
          <Route path="/test" element={<Test />} />
          <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/decks" element={<PrivateRoute><Decks /></PrivateRoute>} />
          <Route path="/decks/:id" element={<PrivateRoute><DeckDetail /></PrivateRoute>} />
          <Route path="/binders" element={<PrivateRoute><Binders /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
