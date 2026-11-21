import { useState, useEffect } from 'react';
import { useStore, updateStore, loadStoreFromAPI } from '../store';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../api/banners';
import { upload } from '../api/client';

export default function AdminBanners() {
  const store = useStore();
  const banners = store.banners || [];
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const emptyForm = {
    tag: 'FEATURED INNOVATION',
    title: '',
    description: '',
    buttonText: 'DISCOVER MORE',
    link: '/shop',
    image: '',
    status: 'Active',
    order: 0,
  };
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    getBanners().then(res => {
      if (res?.banners) {
        updateStore('banners', res.banners);
      }
    }).catch(() => {});
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditId(b.id);
    setForm({
      tag: b.tag || 'FEATURED INNOVATION',
      title: b.title || '',
      description: b.description || '',
      buttonText: b.buttonText || 'DISCOVER MORE',
      link: b.link || '/shop',
      image: b.image || '',
      status: b.status || 'Active',
      order: b.order || 0,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Headline title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.image.trim()) e.image = 'Banner image is required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const data = await upload('/upload', formData);
      if (data && data.url) {
        setForm(prev => ({ ...prev, image: data.url }));
        showToast('Image uploaded to Cloudinary successfully!', 'success');
      } else {
        showToast(data?.error || 'Upload failed', 'error');
      }
    } catch (err) {
      showToast('Image upload failed: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editId) {
        const { banner } = await updateBanner(editId, form);
        const updated = banners.map(b => (b.id === editId ? banner : b));
        updateStore('banners', updated);
        showToast('Banner updated successfully!', 'success');
      } else {
        const { banner } = await createBanner(form);
        const updated = [banner, ...banners];
        updateStore('banners', updated);
        showToast('Banner published successfully!', 'success');
      }
      setShowForm(false);
      loadStoreFromAPI();
    } catch (err) {
      showToast(err.message || 'Error saving banner', 'error');
    }
  };

  const toggleStatus = async (banner) => {
    try {
      const newStatus = banner.status === 'Active' ? 'Disabled' : 'Active';
      const { banner: updatedBanner } = await updateBanner(banner.id, { status: newStatus });
      const updated = banners.map(b => (b.id === banner.id ? updatedBanner : b));
      updateStore('banners', updated);
      showToast(`Banner marked as ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Error updating status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget.id);
      const updated = banners.filter(b => b.id !== deleteTarget.id);
      updateStore('banners', updated);
      showToast('Banner deleted successfully', 'success');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete banner', 'error');
    }
  };

  // Full page edit/create form matching AdminProducts & AdminDiscounts design
  if (showForm) {
    return (
      <>
        <div className="admin-page-header">
          <div>
            <h1>{editId ? 'Edit Promo Banner' : 'Add New Promo Banner'}</h1>
            <p>{editId ? 'Modify banner content, CTA, and visual asset' : 'Configure a promotional banner to highlight on the homepage'}</p>
          </div>
          <button className="admin-btn admin-btn--secondary" onClick={() => setShowForm(false)}>
            <span className="material-symbols-outlined">arrow_back</span> Back to Banners
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="admin-grid-layout">
            {/* Left Column: Form Details */}
            <div>
              <div className="admin-form-card">
                <h3>Banner Content</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Badge / Tag Label <span>*</span>
                  </label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. FEATURED INNOVATION, SPECIAL PROMO"
                    value={form.tag}
                    onChange={e => setForm({ ...form, tag: e.target.value })}
                  />
                  <div className="admin-form-hint">Small red pill displayed above the headline</div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Headline Title <span>*</span>
                  </label>
                  <input
                    type="text"
                    className={`admin-form-input ${formErrors.title ? 'admin-form-input--error' : ''}`}
                    placeholder="e.g. Anatomic Healing Abutment"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                  {formErrors.title && <div className="admin-form-error">{formErrors.title}</div>}
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Description <span>*</span>
                  </label>
                  <textarea
                    className={`admin-form-textarea ${formErrors.description ? 'admin-form-input--error' : ''}`}
                    placeholder="Detailed description of product benefits, clinical outcomes, or promotional offer..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                  {formErrors.description && <div className="admin-form-error">{formErrors.description}</div>}
                </div>
              </div>

              <div className="admin-form-card">
                <h3>Call to Action & Placement</h3>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Button Text</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. DISCOVER MORE"
                      value={form.buttonText}
                      onChange={e => setForm({ ...form, buttonText: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Destination Link</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. /shop or /product/slug"
                      value={form.link}
                      onChange={e => setForm({ ...form, link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Status</label>
                    <select
                      className="admin-form-select"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Active">Active (Visible on Homepage)</option>
                      <option value="Disabled">Disabled (Hidden)</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Display Order</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      placeholder="0"
                      value={form.order}
                      onChange={e => setForm({ ...form, order: Number(e.target.value) || 0 })}
                    />
                    <div className="admin-form-hint">Lower numbers display first</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Media Upload & Live Visual Preview */}
            <div>
              <div className="admin-form-card">
                <h3>Banner Visual (Cloudinary)</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Upload Product Image</label>
                  <label
                    className="admin-btn admin-btn--secondary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      height: 48,
                      marginBottom: 12
                    }}
                  >
                    <span className="material-symbols-outlined">cloud_upload</span>
                    {isUploading ? 'Uploading to Cloudinary...' : 'Upload Image File'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>

                  <label className="admin-form-label">Or Image URL</label>
                  <input
                    type="text"
                    className={`admin-form-input ${formErrors.image ? 'admin-form-input--error' : ''}`}
                    placeholder="https://res.cloudinary.com/..."
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                  />
                  {formErrors.image && <div className="admin-form-error">{formErrors.image}</div>}
                </div>
              </div>

              {/* Exact Homepage Preview Card */}
              <div className="admin-form-card">
                <h3>Live Homepage Preview</h3>
                <div style={{
                  background: 'linear-gradient(135deg, #f0f4f9 0%, #e2e8f0 100%)',
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: 'var(--admin-accent)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase'
                    }}>
                      {form.tag || 'FEATURED INNOVATION'}
                    </span>
                    <span className={`admin-badge ${form.status === 'Active' ? 'admin-badge--success' : 'admin-badge--secondary'}`}>
                      {form.status}
                    </span>
                  </div>

                  <h4 style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: 'var(--admin-blue)',
                    lineHeight: 1.25
                  }}>
                    {form.title || 'Anatomic Healing Abutment'}
                  </h4>

                  <p style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--admin-text-secondary)',
                    lineHeight: 1.5
                  }}>
                    {form.description || 'Create a natural gum contour, support inter-dental papilla formation, and improve aesthetic outcomes with our precision-engineered anatomic healing abutments.'}
                  </p>

                  <div style={{
                    height: 140,
                    background: 'white',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    {form.image ? (
                      <img
                        src={form.image}
                        alt="Preview"
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 36, display: 'block', marginBottom: 4 }}>
                          image
                        </span>
                        Image Preview
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      className="admin-btn admin-btn--primary"
                      style={{ pointerEvents: 'none', height: 40, padding: '0 20px', fontSize: 13, fontWeight: 700 }}
                    >
                      {form.buttonText || 'DISCOVER MORE'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--admin-border-light)' }}>
                  <button type="submit" className="admin-btn admin-btn--primary" style={{ flex: 1 }}>
                    <span className="material-symbols-outlined">{editId ? 'save' : 'publish'}</span>
                    {editId ? 'Save Changes' : 'Publish Banner'}
                  </button>
                  <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {toast && (
          <div className={`admin-toast admin-toast--${toast.type}`}>
            <span className="material-symbols-outlined">
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            {toast.msg}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Special Offers & Promos</h1>
          <p>Manage promotional showcase banners displayed on the homepage</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>
          <span className="material-symbols-outlined">add_photo_alternate</span> Add Promo Banner
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>All Promotional Banners ({banners.length})</h3>
        </div>

        {banners.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#cbd5e1', marginBottom: 12 }}>
              ad_units
            </span>
            <h3 style={{ margin: '0 0 6px 0', fontSize: 18, color: 'var(--admin-text)' }}>No Promo Banners Configured</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: 14 }}>
              The homepage is currently displaying the default system banner. Add a custom banner below.
            </p>
            <button className="admin-btn admin-btn--primary" onClick={openAdd}>
              <span className="material-symbols-outlined">add</span> Create First Banner
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 24,
            padding: 24
          }}>
            {banners.map(banner => (
              <div
                key={banner.id}
                className="admin-form-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  border: '1px solid var(--admin-border-light)'
                }}
              >
                {/* Visual Header */}
                <div style={{
                  height: 180,
                  background: 'var(--surface-container-low)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16
                }}>
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt={banner.title}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#94a3b8' }}>
                      image
                    </span>
                  )}
                  <span
                    className={`admin-badge ${banner.status === 'Active' ? 'admin-badge--success' : 'admin-badge--secondary'}`}
                    style={{ position: 'absolute', top: 12, right: 12 }}
                  >
                    {banner.status}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'var(--admin-accent)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}>
                    {banner.tag || 'FEATURED INNOVATION'}
                  </span>

                  <h3 style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--admin-text)',
                    border: 'none',
                    padding: 0
                  }}>
                    {banner.title}
                  </h3>

                  <p style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--admin-text-secondary)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {banner.description}
                  </p>

                  <div style={{
                    marginTop: 'auto',
                    paddingTop: 12,
                    borderTop: '1px solid var(--admin-border-light)',
                    fontSize: 12,
                    color: 'var(--admin-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>link</span>
                    <span>{banner.buttonText || 'DISCOVER MORE'}</span> → <code style={{ color: 'var(--admin-blue)' }}>{banner.link || '/shop'}</code>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                      style={{ flex: 1 }}
                      onClick={() => toggleStatus(banner)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {banner.status === 'Active' ? 'visibility_off' : 'visibility'}
                      </span>
                      {banner.status === 'Active' ? 'Hide' : 'Show'}
                    </button>
                    <button
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                      onClick={() => openEdit(banner)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span> Edit
                    </button>
                    <button
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      onClick={() => setDeleteTarget(banner)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 440 }}>
            <div className="admin-modal__header">
              <h2>Confirm Deletion</h2>
              <button className="admin-modal__close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="admin-modal__body" style={{ textAlign: 'center', padding: '28px 24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--admin-danger)', marginBottom: 12 }}>
                warning
              </span>
              <p style={{ fontSize: 15, margin: 0, color: 'var(--admin-text)' }}>
                Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>?
              </p>
              <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginTop: 8 }}>
                This promo banner will immediately be removed from the homepage.
              </p>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn--danger" onClick={handleDelete}>
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <span className="material-symbols-outlined">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}
    </>
  );
}
