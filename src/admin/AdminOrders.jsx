import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus as updateOrderStatusApi } from '../api/orders';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewOrder, setViewOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      const mappedOrders = data.orders.map(o => ({
        id: o.orderId,
        _id: o._id,
        customer: o.user?.name || o.shippingAddress?.firstName + ' ' + o.shippingAddress?.lastName,
        email: o.user?.email || 'N/A',
        items: o.items,
        total: o.total,
        status: o.status,
        date: new Date(o.createdAt).toLocaleDateString(),
        address: o.shippingAddress ? `${o.shippingAddress.city}, ${o.shippingAddress.state}` : 'N/A'
      }));
      setOrders(mappedOrders);
    } catch (err) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId, newStatus) => {
    try {
      const orderToUpdate = orders.find(o => o.id === orderId);
      await updateOrderStatusApi(orderToUpdate._id, newStatus.toLowerCase());
      
      const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus.toLowerCase() } : o);
      setOrders(updatedOrders);
      if (viewOrder?.id === orderId) setViewOrder(prev => ({ ...prev, status: newStatus.toLowerCase() }));
      showToast(`Order ${orderId} → ${newStatus}`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const statusCls = (s) => {
    const m = { delivered: 'active', processing: 'info', shipped: 'primary', pending: 'warning', cancelled: 'danger' };
    return m[s] || 'inactive';
  };

  const getStatusStyle = (s) => {
    switch (s) {
      case 'pending': return { backgroundColor: '#fffbeb', color: '#b45309' }; // faint amber
      case 'processing': return { backgroundColor: '#eff6ff', color: '#1d4ed8' }; // faint blue
      case 'shipped': return { backgroundColor: '#f5f3ff', color: '#6d28d9' }; // faint purple
      case 'delivered': return { backgroundColor: '#f0fdf4', color: '#15803d' }; // faint green
      case 'cancelled': return { backgroundColor: '#fef2f2', color: '#b91c1c' }; // faint red
      default: return { backgroundColor: '#f8fafc', color: '#334155' };
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading orders...</div>;
  }

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

        <div className="admin-grid-layout" style={{ alignItems: 'start' }}>
          <div>
            <div className="admin-form-card">
              <h3>Order Items</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.items.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <div className="admin-product-cell">
                            {item.image ? <img src={item.image} alt={item.name} className="admin-product-thumb" /> : <div className="admin-product-thumb" style={{ background: '#eee' }} />}
                            <div>
                              <div className="admin-product-cell__name">{item.name}</div>
                              {item.variant && <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 2, fontWeight: 600 }}>Option: {item.variant}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right' }}>₹{item.price.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, textAlign: 'right' }}>₹{(item.price * item.qty).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign: 'right', padding: '16px 24px 0', fontSize: 18, fontWeight: 700, borderTop: '1px solid var(--admin-border-light)', marginTop: '16px' }}>
                Total: ₹{viewOrder.total.toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <div className="admin-form-card">
              <h3>Order Status</h3>
              <div style={{ marginBottom: 16 }}>
                <span className={`admin-badge admin-badge--${statusCls(viewOrder.status)}`} style={{ fontSize: 14, padding: '6px 14px', textTransform: 'capitalize' }}>
                  {viewOrder.status}
                </span>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Update Status</label>
                <select className="admin-form-select" value={viewOrder.status} onChange={e => updateStatus(viewOrder.id, e.target.value)} style={{ textTransform: 'capitalize', fontWeight: 600, ...getStatusStyle(viewOrder.status) }}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s} style={getStatusStyle(s)}>{s}</option>)}
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
          <button key={s} className={`admin-tab ${statusFilter.toLowerCase() === s.toLowerCase() ? 'admin-tab--active' : ''}`} onClick={() => setStatusFilter(s)} style={{ textTransform: 'capitalize' }}>
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
                      style={{ width: 'auto', padding: '4px 8px', fontSize: 12, height: 30, fontWeight: 700, textTransform: 'capitalize', border: 'none', ...getStatusStyle(o.status) }}
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ fontWeight: 600, ...getStatusStyle(s) }}>{s}</option>)}
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
