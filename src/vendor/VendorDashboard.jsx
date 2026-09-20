import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProducts } from '../api/vendor';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, inStock: 0, outOfStock: 0 });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProducts('limit=6')
      .then(data => {
        const products = data.products || [];
        setRecentProducts(products);
        const inStock = products.filter(p => p.inStock).length;
        setStats({
          total: data.total || products.length,
          inStock,
          outOfStock: (data.total || products.length) - inStock,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Welcome, {user?.name || 'Vendor'}</h1>
          <p>{user?.companyName ? `${user.companyName} — ` : ''}Manage your products</p>
        </div>
        <Link to="/vendor/products/add" className="admin-btn admin-btn--primary">
          <span className="material-symbols-outlined">add</span> Add Product
        </Link>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--primary">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__label">My Products</div>
            <div className="admin-stat-card__value">{stats.total}</div>
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
      </div>

      {recentProducts.length > 0 && (
        <div className="admin-form-card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Recent Products</h3>
            <Link to="/vendor/products" style={{ fontSize: 13, color: 'var(--admin-accent)', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.slice(0, 5).map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={p.images?.[0]?.url || 'https://placehold.co/40x40/f1f5f9/64748b?text=P'} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 12 }}>{p.category}</span></td>
                    <td>₹{p.price?.toFixed(2)}</td>
                    <td>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
