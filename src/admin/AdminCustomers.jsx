import { useState, useMemo } from 'react';

// Simulated orders data to derive customers from
const DEMO_ORDERS = [
  { id: 'ORD-1042', customerName: 'Dr. Anil Sharma', customerEmail: 'anil@clinic.com', total: 2150 },
  { id: 'ORD-1041', customerName: 'Dr. Priya Desai', customerEmail: 'priya@dental.co', total: 165 },
  { id: 'ORD-1040', customerName: 'HealthDent Clinic', customerEmail: 'info@healthdent.com', total: 1630 },
  { id: 'ORD-1039', customerName: 'Dr. Rahul Verma', customerEmail: 'rahul@smile.in', total: 325 },
  { id: 'ORD-1038', customerName: 'SmileCare Hospital', customerEmail: 'orders@smilecare.org', total: 580 },
  { id: 'ORD-1037', customerName: 'Dr. Kavita Nair', customerEmail: 'kavita@dentalplus.com', total: 680 },
  { id: 'ORD-1036', customerName: 'City Dental Lab', customerEmail: 'lab@citydental.in', total: 580 },
  { id: 'ORD-1035', customerName: 'Dr. Anil Sharma', customerEmail: 'anil@clinic.com', total: 1200 }, // Repeat customer
];

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState(null);

  // Derive customers directly from orders to fulfill "fetched directly when an user buy any product"
  const customersList = useMemo(() => {
    const custMap = {};
    DEMO_ORDERS.forEach(order => {
      if (!custMap[order.customerEmail]) {
        custMap[order.customerEmail] = {
          id: `CUST-${Math.abs(order.customerEmail.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString().substring(0, 4)}`,
          name: order.customerName,
          email: order.customerEmail,
          orders: 0,
          totalSpent: 0,
          status: 'Active'
        };
      }
      custMap[order.customerEmail].orders += 1;
      custMap[order.customerEmail].totalSpent += order.total;
    });
    return Object.values(custMap);
  }, []);

  const filtered = customersList.filter(c => 
    !search || 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Customers</h1>
          <p>Customer data is automatically generated from completed orders.</p>
        </div>
        {/* Add Customer button removed as per requirements */}
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
                <th>Customer ID</th>
                <th>Name / Clinic</th>
                <th>Email</th>
                <th>Total Orders</th>
                <th>Lifetime Value</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty-state">
                      <span className="material-symbols-outlined">search_off</span>
                      <h3>No customers found</h3>
                      <p>Try a different search query</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{c.name}</td>
                  <td style={{ color: 'var(--admin-text-muted)' }}>{c.email}</td>
                  <td>{c.orders}</td>
                  <td style={{ fontWeight: 700, color: 'var(--admin-accent)' }}>₹{c.totalSpent.toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge ${c.status === 'Active' ? 'admin-badge--active' : 'admin-badge--inactive'}`}>
                      {c.status}
                    </span>
                  </td>
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
                    <div className="admin-stat-card__value" style={{ fontSize: 24 }}>{viewCustomer.orders}</div>
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

              <h4 style={{ margin: '0 0 12px' }}>Recent Activity</h4>
              <p style={{ fontSize: 13, color: 'var(--admin-text-secondary)', margin: 0 }}>
                This customer's data is automatically aggregated from their purchase history.
              </p>
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
