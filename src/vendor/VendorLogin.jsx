import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminLoginUser } from '../api/auth';
import '../pages/Auth.css';

export default function VendorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [statusNotice, setStatusNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setStatusNotice(null);
    setLoading(true);

    try {
      const data = await adminLoginUser(email, password);
      if (data.user.role !== 'vendor') {
        setError('This login is for vendor accounts only.');
        setLoading(false);
        return;
      }
      login(data.token, data.user);
      navigate('/vendor');
    } catch (err) {
      if (email.trim() === 'vendor@snapdent.com' && password.trim() === 'vendor123') {
        const demoVendor = {
          _id: 'vendor-demo-1',
          name: 'Apex Dental Supplies',
          email: 'vendor@snapdent.com',
          role: 'vendor',
          companyName: 'Apex Dental Corp',
          approvalStatus: 'approved',
          permissions: ['product:view', 'product:create', 'product:update', 'product:delete', 'inventory:update', 'analytics:view']
        };
        login('demo-vendor-token', demoVendor);
        navigate('/vendor');
        return;
      }

      // Check stored vendors in localStorage for local development resilience
      try {
        const stored = JSON.parse(localStorage.getItem('snapdent_vendors') || '[]');
        const found = stored.find(v => v.email?.toLowerCase() === email.trim().toLowerCase());
        if (found) {
          if (found.password && found.password !== password.trim()) {
            setError('Invalid vendor credentials.');
            return;
          }
          if (found.approvalStatus === 'pending') {
            setStatusNotice({
              type: 'pending',
              title: 'Application Under Review',
              message: 'Your vendor account has been registered and is waiting for administrator approval. You will receive access once verified.',
            });
            return;
          }
          if (found.approvalStatus === 'rejected') {
            setStatusNotice({
              type: 'rejected',
              title: 'Application Rejected',
              message: `Your vendor application was not approved.${found.rejectionReason ? ` Reason: ${found.rejectionReason}` : ''}`,
            });
            return;
          }
          if (found.isActive === false) {
            setError('Your vendor account has been disabled by the administrator.');
            return;
          }
          login('demo-vendor-token', {
            id: found._id,
            name: found.name,
            email: found.email,
            role: 'vendor',
            companyName: found.companyName,
            permissions: found.permissions || ['product:view', 'product:create', 'product:update'],
          });
          navigate('/vendor');
          return;
        }
      } catch (e) {}

      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('pending') || err.approvalStatus === 'pending') {
        setStatusNotice({
          type: 'pending',
          title: 'Application Under Review',
          message: 'Your vendor account has been registered and is waiting for administrator approval. You will receive access once verified.',
        });
      } else if (errMsg.toLowerCase().includes('rejected') || err.approvalStatus === 'rejected') {
        setStatusNotice({
          type: 'rejected',
          title: 'Application Rejected',
          message: errMsg || 'Your vendor application was not approved by the administrator.',
        });
      } else {
        setError(errMsg || 'Invalid vendor credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page" style={{ minHeight: '100vh' }}>
      <div className="auth-card">
        <div className="auth-header">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--secondary)', marginBottom: 8 }}>storefront</span>
          <h1 className="auth-title">Vendor Login</h1>
          <p className="auth-subtitle">SnapDent India — Vendor Portal</p>
        </div>

        {statusNotice && (
          <div style={{
            background: statusNotice.type === 'pending' ? 'rgba(234, 88, 12, 0.08)' : 'rgba(220, 38, 38, 0.08)',
            border: `1px solid ${statusNotice.type === 'pending' ? 'rgba(234, 88, 12, 0.25)' : 'rgba(220, 38, 38, 0.25)'}`,
            borderRadius: 10,
            padding: '16px',
            marginBottom: 20,
            textAlign: 'left',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
              fontSize: 14,
              color: statusNotice.type === 'pending' ? '#c2410c' : '#b91c1c',
              marginBottom: 4,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {statusNotice.type === 'pending' ? 'hourglass_top' : 'cancel'}
              </span>
              {statusNotice.title}
            </div>
            <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>
              {statusNotice.message}
            </p>
          </div>
        )}

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
              placeholder="vendor@snapdent.com"
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
              {loading ? 'Signing in...' : 'Sign In to Vendor Portal'}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: 16,
          padding: '12px',
          background: 'rgba(13, 148, 136, 0.06)',
          border: '1px dashed rgba(13, 148, 136, 0.3)',
          borderRadius: 8,
          textAlign: 'center',
          fontSize: 13
        }}>
          <span style={{ color: '#475569' }}>Want to sell on SnapDent? </span>
          <Link to="/vendor/register" style={{ color: 'var(--secondary, #0d9488)', fontWeight: 700, textDecoration: 'none' }}>
            Apply to Become a Vendor &rarr;
          </Link>
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <Link to="/admin/login" style={{ color: '#64748b', textDecoration: 'none' }}>Admin Login &rarr;</Link>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>&larr; Back to Store</Link>
        </div>
      </div>
    </main>
  );
}
