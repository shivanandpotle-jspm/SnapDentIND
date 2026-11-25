import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProduct, createProduct, updateProduct } from '../api/products';
import { upload } from '../api/client';

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
    images: [],
  });

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
          const pImages = (p.images && p.images.length > 0)
            ? p.images.map(img => (typeof img === 'string' ? img : img.url)).filter(Boolean)
            : (p.image ? [p.image] : []);

          setForm({
            name: p.name || '',
            category: p.category || CATEGORIES[0],
            subcategory: p.subcategory || '',
            price: p.price ?? '',
            discountPrice: p.discountPrice ?? '',
            stock: p.stock ?? '50',
            description: p.description || '',
            material: p.material || '',
            image: pImages[0] || p.image || '',
            images: pImages,
          });
        })
        .catch(err => setError(err.message || 'Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const data = await upload('/upload', formData);
        if (data && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setForm(prev => {
          const combined = [...(prev.images || []), ...uploadedUrls];
          return {
            ...prev,
            images: combined,
            image: combined[0] || '',
          };
        });
      } else {
        throw new Error('No images uploaded');
      }
    } catch (err) {
      setError(err.message || 'Image upload failed. You can also paste an image URL.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImageAt = (indexToRemove) => {
    setForm(prev => {
      const current = prev.images || [];
      const updated = current.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updated,
        image: updated[0] || '',
      };
    });
  };

  const setAsCover = (indexToCover) => {
    setForm(prev => {
      const current = prev.images || [];
      const target = current[indexToCover];
      const rest = current.filter((_, idx) => idx !== indexToCover);
      const reordered = [target, ...rest];
      return {
        ...prev,
        images: reordered,
        image: target,
      };
    });
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

    const prodImages = (form.images && form.images.length > 0)
      ? form.images.map(url => ({ url }))
      : (form.image ? [{ url: form.image }] : [{ url: `https://placehold.co/400x400/f8fafc/1A3673?text=${encodeURIComponent(form.name)}` }]);

    const payload = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock) || 0,
      description: form.description,
      material: form.material,
      image: prodImages[0]?.url || form.image,
      images: prodImages,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="admin-form-label" style={{ margin: 0 }}>Product Photos ({form.images?.length || (form.image ? 1 : 0)})</label>
              {form.images?.length > 1 && (
                <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>First photo is Cover</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                style={{ fontSize: 13 }}
              />
              {uploading && <span style={{ fontSize: 12, color: '#64748b' }}>Uploading photos...</span>}
            </div>

            {form.images && form.images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10, marginTop: 12 }}>
                {form.images.map((imgUrl, idx) => (
                  <div key={idx} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: idx === 0 ? '2px solid #2563eb' : '1px solid #cbd5e1' }}>
                    <img src={imgUrl} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: 80, objectFit: 'contain', background: '#f8fafc', display: 'block' }} />
                    {idx === 0 ? (
                      <span style={{ position: 'absolute', top: 2, left: 2, background: '#2563eb', color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 3 }}>
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAsCover(idx)}
                        style={{ position: 'absolute', top: 2, left: 2, background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', fontSize: 9, padding: '1px 4px', borderRadius: 3, cursor: 'pointer' }}
                      >
                        Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: 'red', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
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
