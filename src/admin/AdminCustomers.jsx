import { useState, useEffect } from 'react';
import { getCustomers } from '../api/admin';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data.customers);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => 
    !search || 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading customers...</div>;
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Customers</h1>
          <p>Customer data is automatically generated from orders.</p>
        </div>
      </div>

      <div className="admin-table-wrap animate-fade-in-up">
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <span className="material-symbols-outlined">search</span>
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>{filtered.length} customers</span>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name / Clinic</th>
                <th>Email</th>
                <th>Total Orders</th>
                <th>Lifetime Value</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty-state">
                      <span className="material-symbols-outlined">search_off</span>
                      <h3>No customers found</h3>
                      <p>Try a different search query</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{c.name}</td>
                  <td style={{ color: 'var(--admin-text-muted)' }}>{c.email}</td>
                  <td>{c.orderCount}</td>
                  <td style={{ fontWeight: 700, color: 'var(--admin-accent)' }}>₹{c.totalSpent.toLocaleString()}</td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="admin-btn admin-btn--icon" title="View details" onClick={() => setViewCustomer(c)}>
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {viewCustomer && (
        <div className="admin-modal-overlay" onClick={() => setViewCustomer(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>Customer Profile</h3>
              <button className="admin-btn admin-btn--icon" onClick={() => setViewCustomer(null)} style={{ border: 'none', background: 'transparent' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal__body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div className="admin-topbar__avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
                  {viewCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{viewCustomer.name}</h2>
                  <p style={{ margin: 0, color: 'var(--admin-text-muted)' }}>{viewCustomer.email}</p>
                </div>
              </div>
              
              <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
                <div className="admin-stat-card" style={{ padding: 16 }}>
                  <div className="admin-stat-card__info">
                    <div className="admin-stat-card__label">Total Orders</div>
                    <div className="admin-stat-card__value" style={{ fontSize: 24 }}>{viewCustomer.orderCount}</div>
                  </div>
                </div>
                <div className="admin-stat-card" style={{ padding: 16 }}>
                  <div className="admin-stat-card__info">
                    <div className="admin-stat-card__label">Lifetime Value</div>
                    <div className="admin-stat-card__value" style={{ fontSize: 24, color: 'var(--admin-accent)' }}>
                      ₹{viewCustomer.totalSpent.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 12px' }}>Account Info</h4>
              <div style={{ fontSize: 13, color: 'var(--admin-text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Member Since</span>
                  <strong>{new Date(viewCustomer.createdAt).toLocaleDateString()}</strong>
                </div>
                {viewCustomer.lastOrder && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Last Order</span>
                    <strong>{new Date(viewCustomer.lastOrder).toLocaleDateString()}</strong>
                  </div>
                )}
                {viewCustomer.phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Phone</span>
                    <strong>{viewCustomer.phone}</strong>
                  </div>
                )}
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--primary" onClick={() => setViewCustomer(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
