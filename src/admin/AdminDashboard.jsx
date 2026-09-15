import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { getDashboardStats } from '../api/admin';

export default function AdminDashboard() {
  const store = useStore();
  const { products } = store;
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    inStock: 0,
    outOfStock: 0,
    pendingOrders: 0,
    categories: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(data => {
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load dashboard stats', err);
      setLoading(false);
    });
  }, []);

  const statusBadge = (s) => {
    const map = { delivered: 'active', processing: 'info', shipped: 'primary', pending: 'warning', cancelled: 'danger' };
    return <span className={`admin-badge admin-badge--${map[s?.toLowerCase()] || 'inactive'}`} style={{ textTransform: 'capitalize' }}>{s}</span>;
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back — here's your store overview</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/products" className="admin-btn admin-btn--primary">
            <span className="material-symbols-outlined">add</span> Add Product
          </Link>
          <Link to="/admin/discounts" className="admin-btn admin-btn--secondary">
            <span className="material-symbols-outlined">sell</span> New Offer
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--primary">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__label">Total Products</div>
            <div className="admin-stat-card__value">{stats.totalProducts}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--info">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__label">Total Orders</div>
            <div className="admin-stat-card__value">{stats.totalOrders}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--success">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__label">Total Revenue</div>
            <div className="admin-stat-card__value">₹{stats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--success">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__label">In Stock</div>
            <div className="admin-stat-card__value">{stats.inStock}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--danger">
            <span className="material-symbols-outlined">error</span>
          </div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__label">Out of Stock</div>
            <div className="admin-stat-card__value">{stats.outOfStock}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--warning">
            <span className="material-symbols-outlined">sell</span>
          </div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__label">Pending Orders</div>
            <div className="admin-stat-card__value">{stats.pendingOrders}</div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <h3>Recent Orders</h3>
          <Link to="/admin/orders" className="admin-btn admin-btn--secondary admin-btn--sm">View All</Link>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o._id}>
                  <td style={{ fontWeight: 600 }}>{o.orderId}</td>
                  <td>{o.user?.name || 'Guest'}</td>
                  <td>₹{o.total.toLocaleString()}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td style={{ color: '#64748b' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Product List */}
      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <h3>Product Catalog Snapshot</h3>
          <Link to="/admin/products" className="admin-btn admin-btn--secondary admin-btn--sm">Manage Products</Link>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 6).map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-product-cell">
                      <img src={p.image} alt={p.name} className="admin-product-thumb" />
                      <div>
                        <div className="admin-product-cell__name">{p.name}</div>
                        <div className="admin-product-cell__sku">SKU-{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td style={{ fontWeight: 600 }}>₹{p.price.toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge ${p.inStock ? 'admin-badge--active' : 'admin-badge--danger'}`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
