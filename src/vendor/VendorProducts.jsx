import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { getMyProducts } from '../api/vendor';
import { deleteProduct, bulkUploadProducts } from '../api/products';
import { useAuth } from '../context/AuthContext';

export default function VendorProducts() {
  const { hasPermission } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    getMyProducts('limit=200')
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [search, products]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const downloadTemplate = () => {
    const csvContent = 'name,category,subcategory,price,discountPrice,description,material,sku,stock,badge\nSample Drill,Restorative Dentistry,Burs,1200,,A high quality drill,Stainless Steel,SKU-DRILL-01,50,New\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'SnapDent_Products_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setIsUploading(true);
          const data = await bulkUploadProducts(results.data);
          
          if (data.success) {
            showToast(`Successfully uploaded ${data.count} products! Refreshing...`, 'success');
            setTimeout(() => window.location.reload(), 1500);
          }
        } catch (err) {
          showToast('Failed to bulk upload products.', 'error');
        } finally {
          setIsUploading(false);
          e.target.value = null; // reset input
        }
      },
      error: () => showToast('Error parsing CSV file', 'error')
    });
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await deleteProduct(product._id);
      setProducts(prev => prev.filter(p => p._id !== product._id));
      showToast('Product deleted');
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading products...</div>;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>My Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            className="admin-btn admin-btn--secondary" 
            onClick={downloadTemplate}
            title="Download CSV Template"
          >
            <span className="material-symbols-outlined">download</span> Template
          </button>
          
          <input 
            type="file" 
            accept=".csv" 
            id="csvUploadVendor" 
            style={{ display: 'none' }} 
            onChange={handleBulkUpload} 
            disabled={isUploading}
          />
          <label htmlFor="csvUploadVendor" className="admin-btn admin-btn--secondary" style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined">upload_file</span> 
            {isUploading ? 'Uploading...' : 'Bulk Upload'}
          </label>

          <Link to="/vendor/products/add" className="admin-btn admin-btn--primary">
            <span className="material-symbols-outlined">add</span> Add Product
          </Link>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>{filtered.length} products</span>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="admin-empty-state">
                    <span className="material-symbols-outlined">inventory_2</span>
                    <h3>No products yet</h3>
                    <p>Add your first product to get started</p>
                  </div>
                </td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={p.images?.[0]?.url || 'https://placehold.co/40x40/f1f5f9/64748b?text=P'} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 12 }}>{p.category}</span></td>
                    <td>₹{p.price?.toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${p.inStock ? 'active' : 'danger'}`}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {hasPermission('product:update') && (
                          <Link to={`/vendor/products/edit/${p._id}`} className="admin-btn admin-btn--secondary" style={{ padding: '6px 10px', fontSize: 12 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                          </Link>
                        )}
                        {hasPermission('product:delete') && (
                          <button onClick={() => handleDelete(p)} className="admin-btn admin-btn--secondary" style={{ padding: '6px 10px', fontSize: 12, color: 'var(--admin-danger)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <span className="material-symbols-outlined">check_circle</span>{toast.msg}
        </div>
      )}
    </>
  );
}
