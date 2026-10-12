export default function AdminProfile() {
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Admin Profile</h1>
          <p>Manage your account settings and security</p>
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-form-card animate-fade-in-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--admin-accent-container), var(--admin-blue))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700' }}>
              AD
            </div>
            <div>
              <h3 style={{ margin: 0, padding: 0, border: 'none' }}>Admin User</h3>
              <p style={{ margin: '4px 0 0', color: 'var(--admin-text-muted)', fontSize: '14px' }}>admin@snapdent.in</p>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Full Name</label>
            <input type="text" className="admin-form-input" defaultValue="Admin User" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Email Address</label>
            <input type="email" className="admin-form-input" defaultValue="admin@snapdent.in" />
          </div>
          <button className="admin-btn admin-btn--primary">Update Profile</button>
        </div>

        <div className="admin-form-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3>Change Password</h3>
          <div className="admin-form-group">
            <label className="admin-form-label">Current Password</label>
            <input type="password" className="admin-form-input" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">New Password</label>
            <input type="password" className="admin-form-input" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Confirm New Password</label>
            <input type="password" className="admin-form-input" />
          </div>
          <button className="admin-btn admin-btn--secondary">Change Password</button>
        </div>
      </div>
    </>
  );
}
