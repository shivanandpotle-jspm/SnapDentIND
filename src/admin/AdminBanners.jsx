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
    if (!form.title.trim()) e.title = 'Title is required';
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
        showToast('Banner created and published successfully!', 'success');
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

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Special Offers & Promos Banners</h1>
          <p>Create, customize, and manage homepage promotional banners</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>
          <span className="material-symbols-outlined">add_photo_alternate</span> Add Promo Banner
        </button>
      </div>

      {/* Form Modal / View */}
      {showForm && (
        <div className="admin-modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="admin-modal" style={{
            background: 'white', borderRadius: 16, width: '100%', maxWidth: 860,
            maxHeight: '90vh', overflowY: 'auto', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
              <h2 style={{ fontSize: 20, margin: 0, color: 'var(--primary)' }}>
                {editId ? 'Edit Promo Banner' : 'Create New Promo Banner'}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Left Column: Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Tag / Badge Label</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. FEATURED INNOVATION, SPECIAL PROMO"
                      value={form.tag}
                      onChange={e => setForm({ ...form, tag: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Banner Headline *</label>
                    <input
                      type="text"
                      className={`admin-input ${formErrors.title ? 'admin-input--error' : ''}`}
                      placeholder="e.g. Anatomic Healing Abutment"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                    />
                    {formErrors.title && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{formErrors.title}</div>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Description / Subtitle *</label>
                    <textarea
                      className={`admin-input ${formErrors.description ? 'admin-input--error' : ''}`}
                      rows={4}
                      placeholder="Explain the offer, innovation, or clinical advantages..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                    {formErrors.description && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{formErrors.description}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Button Text</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. DISCOVER MORE"
                        value={form.buttonText}
                        onChange={e => setForm({ ...form, buttonText: e.target.value })}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Button Link</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. /shop or /product/slug"
                        value={form.link}
                        onChange={e => setForm({ ...form, link: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Status</label>
                    <select
                      className="admin-select"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Active">Active (Visible on Home)</option>
                      <option value="Disabled">Disabled (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Image Upload & Live Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Banner Image *</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                      <label
                        className="admin-btn admin-btn--secondary"
                        style={{ cursor: isUploading ? 'not-allowed' : 'pointer', margin: 0 }}
                      >
                        <span className="material-symbols-outlined">cloud_upload</span>
                        {isUploading ? 'Uploading...' : 'Upload Image (Cloudinary)'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      className={`admin-input ${formErrors.image ? 'admin-input--error' : ''}`}
                      placeholder="Or paste direct image URL here..."
                      value={form.image}
                      onChange={e => setForm({ ...form, image: e.target.value })}
                    />
                    {formErrors.image && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{formErrors.image}</div>}
                  </div>

                  {/* Live Mini Preview */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#f8fafc' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>
                      Live Preview
                    </div>
                    <div style={{
                      background: '#f0f4f9',
                      borderRadius: 12,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#dc2626', letterSpacing: '0.1em' }}>
                          {form.tag || 'FEATURED INNOVATION'}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                          background: form.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                          color: form.status === 'Active' ? '#166534' : '#64748b'
                        }}>
                          {form.status}
                        </span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: 16, color: '#1e3a8a', fontWeight: 700 }}>
                        {form.title || 'Banner Title Headline'}
                      </h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                        {form.description || 'Banner promotional description will display here.'}
                      </p>
                      {form.image && (
                        <div style={{ textAlign: 'center', margin: '8px 0' }}>
                          <img
                            src={form.image}
                            alt="Preview"
                            style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
                          />
                        </div>
                      )}
                      <div>
                        <span style={{
                          display: 'inline-block',
                          background: '#dc2626',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '6px 14px',
                          borderRadius: 6,
                          letterSpacing: '0.05em'
                        }}>
                          {form.buttonText || 'DISCOVER MORE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  <span className="material-symbols-outlined">{editId ? 'save' : 'check'}</span>
                  {editId ? 'Save Changes' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="admin-modal" style={{ background: 'white', borderRadius: 16, maxWidth: 440, padding: 24, textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#dc2626', marginBottom: 12 }}>
              delete_forever
            </span>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>Delete Banner?</h3>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px 0' }}>
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>? It will be permanently removed from the homepage.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button className="admin-btn admin-btn--secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn--danger" style={{ background: '#dc2626', color: 'white' }} onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banners List / Grid */}
      <div className="admin-table-wrap">
        <div className="admin-table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Configured Banners ({banners.length})</h3>
        </div>

        {banners.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 12 }}>
              ad_units
            </span>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>No promotional banners added yet.</p>
            <p style={{ margin: '4px 0 16px 0', fontSize: 13 }}>Click below to create your first homepage banner.</p>
            <button className="admin-btn admin-btn--primary" onClick={openAdd}>
              <span className="material-symbols-outlined">add</span> Create Banner
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20, padding: 20 }}>
            {banners.map(banner => (
              <div
                key={banner.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}
              >
                {/* Banner Image Preview */}
                <div style={{
                  height: 180,
                  background: '#f1f5f9',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt={banner.title}
                      style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#94a3b8' }}>
                      image
                    </span>
                  )}
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 99,
                    background: banner.status === 'Active' ? '#22c55e' : '#64748b',
                    color: 'white'
                  }}>
                    {banner.status}
                  </span>
                </div>

                {/* Banner Content */}
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', letterSpacing: '0.08em' }}>
                    {banner.tag || 'FEATURED INNOVATION'}
                  </span>
                  <h4 style={{ margin: 0, fontSize: 17, color: '#0f172a', fontWeight: 700 }}>
                    {banner.title}
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: 13,
                    color: '#64748b',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {banner.description}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      Button: <strong>{banner.buttonText || 'DISCOVER MORE'}</strong> → <span style={{ color: '#2563eb' }}>{banner.link || '/shop'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      className="admin-btn admin-btn--secondary"
                      style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                      onClick={() => toggleStatus(banner)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        {banner.status === 'Active' ? 'visibility_off' : 'visibility'}
                      </span>
                      {banner.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      className="admin-btn admin-btn--secondary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => openEdit(banner)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span> Edit
                    </button>
                    <button
                      className="admin-btn admin-btn--danger"
                      style={{ padding: '6px 12px', fontSize: 12, color: '#dc2626' }}
                      onClick={() => setDeleteTarget(banner)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`} style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1200,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white', padding: '12px 20px', borderRadius: 8,
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }}>
          <span className="material-symbols-outlined">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}
    </>
  );
}
