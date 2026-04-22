import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logbook from './pages/Logbook';
import LogDive from './pages/LogDive';
import DiveDetail from './pages/DiveDetail';
import Nav from './components/Nav';
import { useEffect, useState } from 'react';
import './index.css';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/')
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--bg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600 }}>
          <span className="nav-dot" style={{ width: 10, height: 10 }} />
          Divelog
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Starting up, please wait a moment...</p>
      </div>
    );
  }

  return (
    <>
      {isLoggedIn && <Nav />}
      <div className="page-wrap">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/logbook" element={<PrivateRoute><Logbook /></PrivateRoute>} />
          <Route path="/log" element={<PrivateRoute><LogDive /></PrivateRoute>} />
          <Route path="/dives/:id" element={<PrivateRoute><DiveDetail /></PrivateRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}