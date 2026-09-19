import { useState, useMemo, useEffect } from 'react';
import { useStore, loadStoreFromAPI } from '../store';
import { updateProduct } from '../api/products';

export default function AdminInventory() {
  const store = useStore();
  const backendProducts = store.products || [];
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Local state for stock values to allow typing without jitter
  const [stockMap, setStockMap] = useState({});

  useEffect(() => {
    if (backendProducts.length > 0) {
      const map = {};
      backendProducts.forEach(p => { map[p.id] = p.stock || 0; });
      setStockMap(map);
    }
  }, [backendProducts]);

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', cls: 'danger' };
    if (qty <= 5) return { label: 'Low Stock', cls: 'warning' };
    return { label: 'In Stock', cls: 'active' };
  };

  const inventory = useMemo(() => {
    let list = backendProducts.map(p => ({
      ...p,
      stock: stockMap[p.id] ?? p.stock ?? 0,
      stockStatus: getStockStatus(stockMap[p.id] ?? p.stock ?? 0)
    }));

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    if (filter === 'low') list = list.filter(p => p.stock > 0 && p.stock <= 5);
    if (filter === 'out') list = list.filter(p => p.stock === 0);
    if (filter === 'in') list = list.filter(p => p.stock > 5);

    return list;
  }, [search, filter, stockMap, backendProducts]);

  const syncStockToBackend = async (id, newStock) => {
    try {
      await updateProduct(id, { stock: newStock });
      showToast('Stock updated successfully', 'success');
      loadStoreFromAPI(); // Refresh store from backend
    } catch (err) {
      showToast('Failed to update stock', 'error');
    }
  };

  const adjustStock = (id, delta) => {
    const current = stockMap[id] ?? 0;
    const newStock = Math.max(0, current + delta);
    setStockMap(prev => ({ ...prev, [id]: newStock }));
    syncStockToBackend(id, newStock);
  };

  const setStockValue = (id, val) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0) {
      setStockMap(prev => ({ ...prev, [id]: n }));
    }
  };

  const handleStockBlur = (id) => {
    const newStock = stockMap[id] ?? 0;
    const p = backendProducts.find(x => x.id === id);
    if (p && p.stock !== newStock) {
      syncStockToBackend(id, newStock);
    }
  };

  const markInStock = (id) => {
    if ((stockMap[id] ?? 0) === 0) {
      setStockMap(prev => ({ ...prev, [id]: 10 }));
      syncStockToBackend(id, 10);
    }
  };

  const markOutOfStock = (id) => {
    setStockMap(prev => ({ ...prev, [id]: 0 }));
    syncStockToBackend(id, 0);
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const lowCount = backendProducts.filter(p => (stockMap[p.id] ?? p.stock ?? 0) > 0 && (stockMap[p.id] ?? p.stock ?? 0) <= 5).length;
  const outCount = backendProducts.filter(p => (stockMap[p.id] ?? p.stock ?? 0) === 0).length;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Track and manage stock levels across products</p>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--success">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__label">In Stock</div>
            <div className="admin-stat-card__value">{backendProducts.length - lowCount - outCount}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--warning">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__label">Low Stock</div>
            <div className="admin-stat-card__value">{lowCount}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--danger">
            <span className="material-symbols-outlined">cancel</span>
          </div>
          <div className="admin-stat-card__info">
            <div className="admin-stat-card__label">Out of Stock</div>
            <div className="admin-stat-card__value">{outCount}</div>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        {[
          { key: 'all', label: 'All Products' },
          { key: 'low', label: `Low Stock (${lowCount})` },
          { key: 'out', label: `Out of Stock (${outCount})` },
          { key: 'in', label: 'In Stock' }
        ].map(t => (
          <button key={t.key} className={`admin-tab ${filter === t.key ? 'admin-tab--active' : ''}`} onClick={() => setFilter(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>{inventory.length} items</span>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock Qty</th>
                <th>Adjust</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="admin-empty-state">
                    <span className="material-symbols-outlined">inventory</span>
                    <h3>No items match</h3>
                    <p>Adjust your filter or search</p>
                  </div>
                </td></tr>
              ) : inventory.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-product-cell">
                      <img src={p.image} alt={p.name} className="admin-product-thumb" />
                      <div>
                        <div className="admin-product-cell__name">{p.name}</div>
                        <div className="admin-product-cell__sku">{p.sku || `SKU-${p.id}`}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>
                    <input
                      type="number"
                      className="admin-form-input"
                      style={{ width: 80, textAlign: 'center', padding: '6px 8px', fontSize: 14, fontWeight: 700 }}
                      value={p.stock}
                      onChange={e => setStockValue(p.id, e.target.value)}
                      onBlur={() => handleStockBlur(p.id)}
                      min={0}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="admin-btn admin-btn--icon" title="-5" onClick={() => adjustStock(p.id, -5)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
                      </button>
                      <button className="admin-btn admin-btn--icon" title="+5" onClick={() => adjustStock(p.id, 5)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${p.stockStatus.cls}`}>
                      {p.stockStatus.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {p.stock === 0 ? (
                        <button className="admin-btn admin-btn--success admin-btn--sm" onClick={() => markInStock(p.id)}>
                          Mark In Stock
                        </button>
                      ) : (
                        <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => markOutOfStock(p.id)}>
                          Mark OOS
                        </button>
                      )}
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
