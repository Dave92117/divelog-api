import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logbook from './pages/Logbook';
import LogDive from './pages/LogDive';
import DiveDetail from './pages/DiveDetail';
import Nav from './components/Nav';
import './index.css';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();
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