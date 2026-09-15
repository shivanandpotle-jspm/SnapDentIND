import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminLoginUser } from '../api/auth';
import '../pages/Auth.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await adminLoginUser(email, password);
      login(data.token, data.user);
      localStorage.setItem('snapdent_admin', 'true');
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page" style={{ minHeight: '100vh' }}>
      <div className="auth-card">
        <div className="auth-header">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', marginBottom: 8 }}>admin_panel_settings</span>
          <h1 className="auth-title">Admin Login</h1>
          <p className="auth-subtitle">SnapDent India — Secure Access</p>
        </div>

        {error && (
          <div className="auth-field-group" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', fontWeight: 600, border: '1px solid rgba(220,38,38,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field-group">
            <label className="auth-label">Email Address</label>
            <input
              className="auth-input"
              type="email"
              placeholder="admin@snapdent.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field-group">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="auth-field-group">
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', marginTop: '10px' }} disabled={loading}>
              <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>login</span>
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </div>
        </form>

        <p className="auth-footer-text">
          Demo: admin@snapdent.com / admin123
        </p>
      </div>
    </main>
  );
}
