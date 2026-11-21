import { useState, useEffect } from 'react';
import { useStore, updateStore, loadStoreFromAPI } from '../store';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';

const PRESET_ICONS = [
  { label: 'Medical', icon: 'medical_services' },
  { label: 'Dental Chair', icon: 'chair' },
  { label: 'Instruments', icon: 'handyman' },
  { label: 'Biotech', icon: 'biotech' },
  { label: 'Health', icon: 'health_and_safety' },
  { label: 'Dentistry', icon: 'dentistry' },
  { label: 'Inventory', icon: 'inventory_2' },
  { label: 'Category', icon: 'category' },
  { label: 'Tools', icon: 'construction' },
  { label: 'Devices', icon: 'precision_manufacturing' },
];

const PRESET_COLORS = [
  '#E31E24', '#1A3673', '#0D9488', '#7C3AED',
  '#EA580C', '#2563EB', '#059669', '#D97706',
  '#475569', '#DB2777'
];

export default function AdminCategories() {
  const store = useStore();
  const categories = store.categories || [];
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const emptyForm = {
    name: '',
    icon: 'medical_services',
    color: '#1A3673',
    description: '',
    items: [],
  };
  const [form, setForm] = useState(emptyForm);
  const [subInput, setSubInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      if (res?.categories) {
        updateStore('categories', res.categories);
      }
    } catch (err) {
      console.warn('Categories API fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setSubInput('');
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditId(cat.id || cat._id);
    setForm({
      name: cat.name || '',
      icon: cat.icon || 'medical_services',
      color: cat.color || '#1A3673',
      description: cat.description || '',
      items: Array.isArray(cat.items) ? [...cat.items] : [],
    });
    setSubInput('');
    setFormErrors({});
    setShowForm(true);
  };

  const handleAddSubcategory = () => {
    const trimmed = subInput.trim();
    if (!trimmed) return;
    if (form.items.includes(trimmed)) {
      showToast('Subcategory already added', 'error');
      return;
    }
    setForm(prev => ({
      ...prev,
      items: [...prev.items, trimmed]
    }));
    setSubInput('');
  };

  const handleRemoveSubcategory = (indexToRemove) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== indexToRemove)
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        name: form.name.trim(),
        icon: form.icon,
        color: form.color,
        description: form.description.trim(),
        items: form.items,
      };

      if (editId) {
        await updateCategory(editId, payload);
        showToast('Category updated successfully!', 'success');
      } else {
        await createCategory(payload);
        showToast('Category created successfully!', 'success');
      }

      setShowForm(false);
      await loadStoreFromAPI();
    } catch (err) {
      showToast(err.message || 'Error saving category', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id || deleteTarget._id);
      showToast(`Category "${deleteTarget.name}" deleted successfully`, 'success');
      setDeleteTarget(null);
      await loadStoreFromAPI();
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
    (c.items && c.items.some(i => i.toLowerCase().includes(search.toLowerCase())))
  );

  // Full-page edit/create view styled consistently with the admin design system
  if (showForm) {
    return (
      <>
        <div className="admin-page-header">
          <div>
            <h1>{editId ? 'Edit Category' : 'Create New Category'}</h1>
            <p>{editId ? 'Update category name, subcategories, icon, and branding color' : 'Add a new product category and define its subcategories'}</p>
          </div>
          <button className="admin-btn admin-btn--secondary" onClick={() => setShowForm(false)}>
            <span className="material-symbols-outlined">arrow_back</span> Back to Categories
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="admin-grid-layout">
            {/* Left Column: Form Details */}
            <div>
              <div className="admin-form-card">
                <h3>Basic Information</h3>

                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Category Name <span>*</span>
                  </label>
                  <input
                    type="text"
                    className={`admin-form-input ${formErrors.name ? 'admin-form-input--error' : ''}`}
                    placeholder="e.g. Implant Surgical Accessories, Endodontics"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                  {formErrors.name && <div className="admin-form-error">{formErrors.name}</div>}
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    className="admin-form-textarea"
                    placeholder="Brief description of the dental equipment or instruments in this category..."
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Subcategories Chip Builder */}
              <div className="admin-form-card">
                <h3>Subcategories ({form.items.length})</h3>
                <p className="admin-form-hint" style={{ marginTop: -16, marginBottom: 16 }}>
                  Subcategories appear in product dropdowns and sidebar catalog filters.
                </p>

                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Type subcategory name (e.g. Implant drills, Torque wrenches)..."
                    value={subInput}
                    onChange={e => setSubInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    onClick={handleAddSubcategory}
                  >
                    <span className="material-symbols-outlined">add</span> Add
                  </button>
                </div>

                {/* Subcategory Chips */}
                {form.items.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: 8, color: 'var(--admin-text-secondary)', fontSize: 13 }}>
                    No subcategories added yet. Type a name above and click Add or press Enter.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {form.items.map((sub, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          background: 'white',
                          border: '1px solid var(--admin-border-light)',
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--admin-text)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        {sub}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategory(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: 14,
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: 2
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Icon & Color Branding */}
            <div>
              <div className="admin-form-card">
                <h3>Visual Styling</h3>

                <div className="admin-form-group">
                  <label className="admin-form-label">Material Symbols Icon</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={form.icon}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    placeholder="e.g. medical_services, chair, handyman"
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {PRESET_ICONS.map(item => (
                      <button
                        key={item.icon}
                        type="button"
                        onClick={() => setForm({ ...form, icon: item.icon })}
                        className="admin-btn admin-btn--secondary"
                        style={{
                          height: 32,
                          padding: '0 10px',
                          fontSize: 12,
                          background: form.icon === item.icon ? 'rgba(26, 54, 115, 0.12)' : 'var(--surface-container-low)',
                          borderColor: form.icon === item.icon ? 'var(--admin-blue)' : 'transparent',
                          color: form.icon === item.icon ? 'var(--admin-blue)' : 'var(--admin-text)'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Theme Color Accent</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <input
                      type="color"
                      value={form.color}
                      onChange={e => setForm({ ...form, color: e.target.value })}
                      style={{
                        width: 44,
                        height: 44,
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        padding: 0,
                        background: 'none'
                      }}
                    />
                    <input
                      type="text"
                      className="admin-form-input"
                      value={form.color}
                      onChange={e => setForm({ ...form, color: e.target.value })}
                      style={{ fontFamily: 'monospace', maxWidth: 120 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: c,
                          border: form.color.toLowerCase() === c.toLowerCase() ? '3px solid #0f172a' : '2px solid white',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Category Card Preview */}
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--admin-border-light)' }}>
                  <label className="admin-form-label">Card Live Preview</label>
                  <div style={{
                    padding: 20,
                    borderRadius: 14,
                    background: 'white',
                    border: '1px solid var(--admin-border-light)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16
                  }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: form.color || '#1A3673',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                        {form.icon || 'category'}
                      </span>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--admin-text)' }}>
                        {form.name || 'Category Name'}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--admin-text-secondary)' }}>
                        {form.items.length} subcategories • {form.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--admin-border-light)' }}>
                  <button type="submit" className="admin-btn admin-btn--primary" style={{ flex: 1 }}>
                    <span className="material-symbols-outlined">{editId ? 'save' : 'check'}</span>
                    {editId ? 'Save Changes' : 'Create Category'}
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
          <h1>Product Categories</h1>
          <p>Organize categories and subcategories synced across the website and product forms</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>
          <span className="material-symbols-outlined">add_circle</span> New Category
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>All Categories ({categories.length})</h3>
          <div style={{ position: 'relative', width: 280 }}>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Search categories & subcategories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ height: 40, paddingLeft: 38 }}
            />
            <span
              className="material-symbols-outlined"
              style={{ position: 'absolute', left: 12, top: 11, fontSize: 18, color: '#94a3b8' }}
            >
              search
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            Loading categories from database...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 12 }}>
              category
            </span>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>No categories found.</p>
            <p style={{ margin: '4px 0 16px 0', fontSize: 13 }}>Click below to create your first category.</p>
            <button className="admin-btn admin-btn--primary" onClick={openAdd}>
              <span className="material-symbols-outlined">add</span> Create Category
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Icon</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Subcategories ({filteredCategories.reduce((acc, c) => acc + (c.items?.length || 0), 0)})</th>
                  <th style={{ textAlign: 'right', width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.id || cat._id}>
                    <td>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: cat.color || '#1A3673',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                          {cat.icon || 'category'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--admin-text)' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                        {cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}
                      </div>
                    </td>
                    <td style={{ color: 'var(--admin-text-secondary)', fontSize: 13, maxWidth: 280 }}>
                      {cat.description || '—'}
                    </td>
                    <td>
                      {cat.items && cat.items.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 360 }}>
                          {cat.items.slice(0, 4).map((sub, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                background: 'var(--surface-container-low)',
                                borderRadius: 12,
                                color: 'var(--admin-text)',
                                fontWeight: 500
                              }}
                            >
                              {sub}
                            </span>
                          ))}
                          {cat.items.length > 4 && (
                            <span style={{ fontSize: 11, padding: '2px 6px', color: 'var(--admin-text-muted)' }}>
                              +{cat.items.length - 4} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>None</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          className="admin-btn admin-btn--icon"
                          title="Edit Category"
                          onClick={() => openEdit(cat)}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          className="admin-btn admin-btn--icon-danger"
                          title="Delete Category"
                          onClick={() => setDeleteTarget(cat)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 440 }}>
            <div className="admin-modal__header">
              <h2>Delete Category</h2>
              <button className="admin-modal__close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="admin-modal__body" style={{ textAlign: 'center', padding: '28px 24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--admin-danger)', marginBottom: 12 }}>
                warning
              </span>
              <p style={{ fontSize: 15, margin: 0, color: 'var(--admin-text)' }}>
                Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?
              </p>
              <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginTop: 8 }}>
                Any subcategories in this category will also be removed. Products assigned to this category will not be deleted.
              </p>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn--danger" onClick={handleDelete}>
                Delete Category
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
