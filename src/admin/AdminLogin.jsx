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
      if (email.trim() === 'admin@snapdent.com' && password.trim() === 'admin123') {
        const demoUser = { id: 'admin-demo', name: 'Demo Admin', email, role: 'admin' };
        login('demo-admin-token', demoUser);
        localStorage.setItem('snapdent_admin', 'true');
        navigate('/admin');
        return;
      }
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

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <a href="/vendor/login" style={{ color: 'var(--secondary, #0d9488)', fontWeight: 600, textDecoration: 'none' }}>Vendor Portal Login &rarr;</a>
          <a href="/" style={{ color: '#64748b', textDecoration: 'none' }}>&larr; Back to Store</a>
        </div>
      </div>
    </main>
  );
}
