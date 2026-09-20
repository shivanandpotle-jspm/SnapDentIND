import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerVendor } from '../api/vendor';
import '../pages/Auth.css';

const BUSINESS_CATEGORIES = [
  'Dental Equipment & Machinery',
  'Surgical & Restorative Instruments',
  'Dental Consumables & Materials',
  'Endodontic Solutions',
  'Orthodontic Supplies',
  'Prosthodontics & CAD/CAM',
  'Sterilization & Hygiene',
  'Other Dental Specialties',
];

export default function VendorRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    businessCategory: BUSINESS_CATEGORIES[0],
    taxId: '',
    password: '',
    confirmPassword: '',
    businessDescription: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerVendor({
        name: formData.name.trim(),
        companyName: formData.companyName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        businessCategory: formData.businessCategory,
        taxId: formData.taxId.trim(),
        password: formData.password,
        businessDescription: formData.businessDescription.trim(),
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="auth-page" style={{ minHeight: '100vh', padding: '40px 16px' }}>
        <div className="auth-card" style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40 }}>verified</span>
          </div>

          <h1 className="auth-title" style={{ fontSize: 24, marginBottom: 8 }}>Application Submitted</h1>
          <p className="auth-subtitle" style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
            Thank you for applying to become a registered supplier on SnapDent India. Your account request has been routed to our administration team for verification.
          </p>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '20px',
            textAlign: 'left',
            marginBottom: 24,
            fontSize: 13,
            color: '#334155',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Company:</span>
              <strong>{formData.companyName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Contact Email:</span>
              <strong>{formData.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Review Status:</span>
              <span style={{
                background: 'rgba(234, 88, 12, 0.1)',
                color: '#ea580c',
                padding: '2px 8px',
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: 12
              }}>
                Pending Administrator Approval
              </span>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
            Once the administrator approves your application and assigns your catalog permissions, you can log in directly at the Vendor Portal.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/vendor/login" className="btn btn-primary" style={{ padding: '0 24px', height: 44, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Go to Vendor Login
            </Link>
            <Link to="/" className="btn btn-secondary" style={{ padding: '0 24px', height: 44, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Back to Store
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page" style={{ minHeight: '100vh', padding: '40px 16px' }}>
      <div className="auth-card" style={{ maxWidth: 640 }}>
        <div className="auth-header">
          <span className="material-symbols-outlined" style={{ fontSize: 44, color: 'var(--secondary, #0d9488)', marginBottom: 8 }}>
            store
          </span>
          <h1 className="auth-title">Apply as a Vendor</h1>
          <p className="auth-subtitle">Join SnapDent India to list and manage your clinical dental products</p>
        </div>

        {error && (
          <div className="auth-field-group" style={{
            background: 'rgba(220,38,38,0.08)',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            fontWeight: 600,
            border: '1px solid rgba(220,38,38,0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-grid-row">
            <div className="auth-field-group">
              <label className="auth-label">Primary Contact Name *</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Dr. / Mr. / Ms."
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Company / Brand Name *</label>
              <input
                className="auth-input"
                type="text"
                placeholder="e.g. Apex Dental Solutions"
                required
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
          </div>

          <div className="auth-grid-row">
            <div className="auth-field-group">
              <label className="auth-label">Official Email Address *</label>
              <input
                className="auth-input"
                type="email"
                placeholder="vendor@company.com"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Phone / WhatsApp Number</label>
              <input
                className="auth-input"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="auth-grid-row">
            <div className="auth-field-group">
              <label className="auth-label">Product Category Specialization</label>
              <select
                className="auth-input"
                style={{ height: 48 }}
                value={formData.businessCategory}
                onChange={e => setFormData({ ...formData, businessCategory: e.target.value })}
              >
                {BUSINESS_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="auth-field-group">
              <label className="auth-label">GSTIN / Tax ID / Registration No.</label>
              <input
                className="auth-input"
                type="text"
                placeholder="GSTIN or Trade License"
                value={formData.taxId}
                onChange={e => setFormData({ ...formData, taxId: e.target.value })}
              />
            </div>
          </div>

          <div className="auth-grid-row">
            <div className="auth-field-group">
              <label className="auth-label">Account Password *</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Min. 6 characters"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Confirm Password *</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Repeat password"
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Business Overview / Notes for Administrator</label>
            <textarea
              className="auth-input"
              rows={3}
              style={{ height: 'auto', padding: '12px 16px', resize: 'vertical' }}
              placeholder="Tell us about your dental products, distribution experience, and brand portfolio..."
              value={formData.businessDescription}
              onChange={e => setFormData({ ...formData, businessDescription: e.target.value })}
            />
          </div>

          <div className="auth-field-group" style={{ marginTop: 8 }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: 50 }}
              disabled={loading}
            >
              <span className="material-symbols-outlined" style={{ marginRight: 8 }}>send</span>
              {loading ? 'Submitting Application...' : 'Submit Vendor Application'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <Link to="/vendor/login" style={{ color: 'var(--secondary, #0d9488)', fontWeight: 600, textDecoration: 'none' }}>
            Already have an account? Sign In &rarr;
          </Link>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>
            &larr; Back to Store
          </Link>
        </div>
      </div>
    </main>
  );
}
