import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProduct, createProduct, updateProduct } from '../api/products';

const CATEGORIES = [
  'Equipment',
  'Instruments',
  'Materials',
  'Endodontics',
  'Orthodontics',
  'Prosthodontics',
  'Sterilization',
  'Disposables',
];

export default function VendorProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [form, setForm] = useState({
    name: '',
    category: CATEGORIES[0],
    subcategory: '',
    price: '',
    discountPrice: '',
    stock: '50',
    description: '',
    material: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getProduct(id)
        .then(res => {
          const p = res.product || res;
          setForm({
            name: p.name || '',
            category: p.category || CATEGORIES[0],
            subcategory: p.subcategory || '',
            price: p.price ?? '',
            discountPrice: p.discountPrice ?? '',
            stock: p.stock ?? '50',
            description: p.description || '',
            material: p.material || '',
            image: p.images?.[0]?.url || p.image || '',
          });
        })
        .catch(err => setError(err.message || 'Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('snapdent_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setForm(prev => ({ ...prev, image: data.url }));
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (err) {
      setError(err.message || 'Image upload failed. You can also paste an image URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.price || !form.description) {
      setError('Product Name, Price, and Description are required.');
      return;
    }

    if (isEdit && !hasPermission('product:update')) {
      setError('You do not have permission to edit products.');
      return;
    }
    if (!isEdit && !hasPermission('product:create')) {
      setError('You do not have permission to add new products.');
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock) || 0,
      description: form.description,
      material: form.material,
      images: form.image ? [{ url: form.image }] : [{ url: `https://placehold.co/400x400/f8fafc/1A3673?text=${encodeURIComponent(form.name)}` }],
    };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/vendor/products');
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading product details...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="admin-page-header">
        <div>
          <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p>{isEdit ? 'Update your product listing' : 'Create a new listing in your catalog'}</p>
        </div>
        <Link to="/vendor/products" className="admin-btn admin-btn--secondary">
          <span className="material-symbols-outlined">arrow_back</span> Back to Products
        </Link>
      </div>

      {error && (
        <div style={{
          background: 'rgba(220,38,38,0.08)',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '20px',
          fontWeight: 600,
          border: '1px solid rgba(220,38,38,0.2)'
        }}>
          {error}
        </div>
      )}

      <div className="admin-form-card" style={{ padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Product Title *</label>
            <input
              type="text"
              className="admin-form-input"
              required
              placeholder="e.g. Premium Dental Composite Syringe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Category *</label>
              <select
                className="admin-form-select"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Subcategory</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. Restorative"
                value={form.subcategory}
                onChange={e => setForm({ ...form, subcategory: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-grid-3">
            <div className="admin-form-group">
              <label className="admin-form-label">Price (₹) *</label>
              <input
                type="number"
                className="admin-form-input"
                required
                min="0"
                step="any"
                placeholder="1499"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Discount Price (₹)</label>
              <input
                type="number"
                className="admin-form-input"
                min="0"
                step="any"
                placeholder="Optional"
                value={form.discountPrice}
                onChange={e => setForm({ ...form, discountPrice: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Stock Quantity</label>
              <input
                type="number"
                className="admin-form-input"
                min="0"
                placeholder="50"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Material / Composition</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Hybrid Microfilled Resin / Medical Grade Steel"
              value={form.material}
              onChange={e => setForm({ ...form, material: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Description *</label>
            <textarea
              className="admin-form-textarea"
              rows={4}
              required
              placeholder="Detailed description, indications, and clinical advantages..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Product Image</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ fontSize: 13 }}
              />
              {uploading && <span style={{ fontSize: 12, color: '#64748b' }}>Uploading to storage...</span>}
            </div>
            <input
              type="url"
              className="admin-form-input"
              placeholder="Or enter image URL: https://..."
              value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })}
            />
            {form.image && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={form.image}
                  alt="Preview"
                  style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <Link to="/vendor/products" className="admin-btn admin-btn--secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={saving || uploading}
            >
              <span className="material-symbols-outlined">save</span>
              {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
