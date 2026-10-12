import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';

export default function VendorProfile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = { name };
      if (password) payload.password = password;

      const res = await updateProfile(payload);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('snapdent_user', JSON.stringify(res.user));
        showToast('Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="admin-page-header">
        <div>
          <h1>Vendor Account Profile</h1>
          <p>View your credentials, company details, and assigned platform permissions</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Account Info Card */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1A3673, #0d9488)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'V'}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{user?.name}</h2>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{user?.email}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                <span className="admin-badge admin-badge--neutral">
                  Role: Vendor
                </span>
                <span className="admin-badge admin-badge--approved">
                  Active Account
                </span>
              </div>
            </div>
          </div>

          <div className="admin-grid-2" style={{ paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Company / Brand</span>
              <strong style={{ fontSize: 14 }}>{user?.companyName || 'Not specified'}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Account Type</span>
              <strong style={{ fontSize: 14 }}>Product Vendor (Restricted)</strong>
            </div>
          </div>
        </div>

        {/* Assigned Permissions Card */}
        <div className="admin-form-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Assigned Permissions</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            These permissions were assigned to your account by the platform administrator:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(user?.permissions || ['product:create', 'product:view', 'product:update']).map(perm => (
              <span
                key={perm}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: '#f1f5f9',
                  color: '#1e293b',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#0d9488' }}>check_circle</span>
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Update Profile Form */}
        <div className="admin-form-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Update Profile & Security</h3>
          <form onSubmit={handleSave}>
            <div className="admin-form-group">
              <label className="admin-form-label">Contact Person Name</label>
              <input
                type="text"
                className="admin-form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="admin-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">New Password (Optional)</label>
                <input
                  type="password"
                  className="admin-form-input"
                  placeholder="Leave blank to keep unchanged"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="admin-form-input"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                <span className="material-symbols-outlined">save</span>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
