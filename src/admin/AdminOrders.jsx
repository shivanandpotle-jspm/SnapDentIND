import { useState, useEffect } from 'react';
import { useStore, updateStore } from '../store';
import { products } from '../data/products';

const DEMO_ORDERS = [
  { id: 'ORD-1042', customer: 'Dr. Anil Sharma', email: 'anil@clinic.com', items: [{ ...products[0], qty: 2 }, { ...products[1], qty: 1 }], total: 2150, status: 'Completed', date: '2026-08-22', address: 'Mumbai, MH' },
  { id: 'ORD-1041', customer: 'Dr. Priya Desai', email: 'priya@dental.co', items: [{ ...products[5], qty: 3 }], total: 165, status: 'Processing', date: '2026-08-22', address: 'Delhi, DL' },
  { id: 'ORD-1040', customer: 'HealthDent Clinic', email: 'info@healthdent.com', items: [{ ...products[10], qty: 1 }, { ...products[8], qty: 1 }], total: 1630, status: 'Shipped', date: '2026-08-21', address: 'Bangalore, KA' },
  { id: 'ORD-1039', customer: 'Dr. Rahul Verma', email: 'rahul@smile.in', items: [{ ...products[2], qty: 5 }], total: 325, status: 'Pending', date: '2026-08-21', address: 'Chennai, TN' },
  { id: 'ORD-1038', customer: 'SmileCare Hospital', email: 'orders@smilecare.org', items: [{ ...products[3], qty: 2 }, { ...products[7], qty: 1 }], total: 580, status: 'Completed', date: '2026-08-20', address: 'Pune, MH' },
  { id: 'ORD-1037', customer: 'Dr. Kavita Nair', email: 'kavita@dentalplus.com', items: [{ ...products[12], qty: 1 }], total: 680, status: 'Cancelled', date: '2026-08-19', address: 'Hyderabad, TS' },
  { id: 'ORD-1036', customer: 'City Dental Lab', email: 'lab@citydental.in', items: [{ ...products[15], qty: 4 }], total: 580, status: 'Completed', date: '2026-08-18', address: 'Ahmedabad, GJ' },
];

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

export default function AdminOrders() {
  const store = useStore();
  
  // Initialize from store.orders; if empty, use DEMO_ORDERS and populate store
  useEffect(() => {
    if (store.orders.length === 0) {
      updateStore('orders', DEMO_ORDERS);
    }
  }, []);

  const orders = store.orders.length > 0 ? store.orders : DEMO_ORDERS;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewOrder, setViewOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    updateStore('orders', updatedOrders);
    if (viewOrder?.id === orderId) setViewOrder(prev => ({ ...prev, status: newStatus }));
    showToast(`Order ${orderId} → ${newStatus}`, 'success');
  };

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const statusCls = (s) => {
    const m = { Completed: 'active', Processing: 'info', Shipped: 'primary', Pending: 'warning', Cancelled: 'danger' };
    return m[s] || 'inactive';
  };

  // Order Detail View
  if (viewOrder) {
    return (
      <>
        <div className="admin-page-header">
          <div>
            <h1>Order {viewOrder.id}</h1>
            <p>Placed on {viewOrder.date} by {viewOrder.customer}</p>
          </div>
          <button className="admin-btn admin-btn--secondary" onClick={() => setViewOrder(null)}>
            <span className="material-symbols-outlined">arrow_back</span> Back to Orders
          </button>
        </div>

        <div className="admin-grid-layout">
          <div>
            <div className="admin-form-card">
              <h3>Order Items</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {viewOrder.items.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <div className="admin-product-cell">
                            <img src={item.image} alt={item.name} className="admin-product-thumb" />
                            <div className="admin-product-cell__name">{item.name}</div>
                          </div>
                        </td>
                        <td>{item.qty}</td>
                        <td>₹{item.price.toLocaleString()}</td>
                        <td style={{ fontWeight: 700 }}>₹{(item.price * item.qty).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign: 'right', padding: '16px 16px 0', fontSize: 18, fontWeight: 700 }}>
                Total: ₹{viewOrder.total.toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <div className="admin-form-card">
              <h3>Order Status</h3>
              <div style={{ marginBottom: 16 }}>
                <span className={`admin-badge admin-badge--${statusCls(viewOrder.status)}`} style={{ fontSize: 14, padding: '6px 14px' }}>
                  {viewOrder.status}
                </span>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Update Status</label>
                <select className="admin-form-select" value={viewOrder.status} onChange={e => updateStatus(viewOrder.id, e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="admin-form-card">
              <h3>Customer</h3>
              <div style={{ fontSize: 14 }}>
                <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{viewOrder.customer}</p>
                <p style={{ color: '#64748b', margin: '0 0 4px' }}>{viewOrder.email}</p>
                <p style={{ color: '#64748b', margin: 0 }}>{viewOrder.address}</p>
              </div>
            </div>

            <div className="admin-form-card">
              <h3>Order Info</h3>
              <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Order ID</span><strong>{viewOrder.id}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Date</span><strong>{viewOrder.date}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Items</span><strong>{viewOrder.items.length}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Total</span><strong>₹{viewOrder.total.toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {toast && <div className={`admin-toast admin-toast--${toast.type}`}><span className="material-symbols-outlined">check_circle</span>{toast.msg}</div>}
      </>
    );
  }

  // Orders List View
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p>View and manage customer orders</p>
        </div>
      </div>

      <div className="admin-tabs">
        {['All', ...STATUS_OPTIONS].map(s => (
          <button key={s} className={`admin-tab ${statusFilter === s ? 'admin-tab--active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s} {s !== 'All' && `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>{filtered.length} orders</span>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="admin-empty-state">
                    <span className="material-symbols-outlined">receipt_long</span>
                    <h3>No orders found</h3>
                    <p>Try a different search or filter</p>
                  </div>
                </td></tr>
              ) : filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700 }}>{o.id}</td>
                  <td>
                    <div>{o.customer}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{o.email}</div>
                  </td>
                  <td>{o.items.length} items</td>
                  <td style={{ fontWeight: 600 }}>₹{o.total.toLocaleString()}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{o.date}</td>
                  <td>
                    <select
                      className="admin-form-select"
                      style={{ width: 'auto', padding: '4px 8px', fontSize: 12, height: 30, fontWeight: 600 }}
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => setViewOrder(o)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className={`admin-toast admin-toast--${toast.type}`}><span className="material-symbols-outlined">check_circle</span>{toast.msg}</div>}
    </>
  );
}
