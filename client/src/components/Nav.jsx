import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Nav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="nav">
      <div className="nav-brand">
        <span className="nav-dot" />
        Divelog
      </div>
      <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        Dashboard
      </NavLink>
      <NavLink to="/logbook" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        Logbook
      </NavLink>
      <NavLink to="/log" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        Log a dive
      </NavLink>
      <div className="nav-right">
        <button className="btn-ghost" onClick={handleLogout}>Log out</button>
      </div>
    </nav>
  );
}