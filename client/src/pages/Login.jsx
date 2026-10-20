import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';
import { useAuth } from '../AuthContext';

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'DiveDemo2026';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const { saveToken } = useAuth();
  const navigate = useNavigate();

  // Wraps a request in loading state. If it takes more than 3 seconds,
  // show a hint: the free Render server may be waking up.
  async function withLoading(task) {
    setError('');
    setLoading(true);
    const slowTimer = setTimeout(() => setSlow(true), 3000);
    try {
      await task();
    } catch {
      setError('Something went wrong');
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setLoading(false);
    }
  }

  async function logInWith(loginEmail, loginPassword) {
    const data = await login(loginEmail, loginPassword);
    if (data.token) {
      saveToken(data.token);
      navigate('/');
    } else {
      setError(data.error || 'Login failed');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    withLoading(async () => {
      if (mode === 'login') {
        await logInWith(email, password);
      } else {
        const data = await register(name, email, password);
        if (data.userId) {
          await logInWith(email, password);
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    });
  }

  function handleDemoLogin() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    withLoading(() => logInWith(DEMO_EMAIL, DEMO_PASSWORD));
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <span className="nav-dot" style={{ width: 12, height: 12 }} />
          Divelog
        </div>
        <div className="login-tabs">
          <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>Log in</button>
          <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => setMode('register')}>Register</button>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
          {mode === 'login' && (
            <button type="button" className="btn-demo" onClick={handleDemoLogin} disabled={loading}>
              Try the demo — no sign-up needed
            </button>
          )}
          {slow && <p className="login-hint">The free server is waking up. This can take up to a minute.</p>}
        </form>
      </div>
    </div>
  );
}
