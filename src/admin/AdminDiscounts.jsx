import { useState } from 'react';
import { categoryTree } from '../data/products';

const DEMO_DISCOUNTS = [
  { id: 1, name: 'Summer Sale', type: 'percentage', value: 15, startDate: '2026-08-01', endDate: '2026-08-31', category: 'All', status: 'Active', code: 'SUMMER15' },
  { id: 2, name: 'Implant Bundle Deal', type: 'fixed', value: 200, startDate: '2026-08-15', endDate: '2026-09-15', category: 'Implantology', status: 'Active', code: 'IMPLANT200' },
  { id: 3, name: 'New Customer Offer', type: 'percentage', value: 10, startDate: '2026-07-01', endDate: '2026-07-31', category: 'All', status: 'Expired', code: 'WELCOME10' },
];

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState(DEMO_DISCOUNTS);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const emptyForm = { name: '', type: 'percentage', value: '', startDate: '', endDate: '', category: 'All', code: '' };
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const openAdd = () => { setEditId(null); setForm(emptyForm); setFormErrors({}); setShowForm(true); };
  const openEdit = (d) => {
    setEditId(d.id);
    setForm({ name: d.name, type: d.type, value: String(d.value), startDate: d.startDate, endDate: d.endDate, category: d.category, code: d.code });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.value || Number(form.value) <= 0) e.value = 'Valid value required';
    if (!form.startDate) e.startDate = 'Required';
    if (!form.endDate) e.endDate = 'Required';
    if (!form.code.trim()) e.code = 'Required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (editId) {
      setDiscounts(prev => prev.map(d => d.id === editId ? { ...d, ...form, value: Number(form.value), status: 'Active' } : d));
    } else {
      setDiscounts(prev => [...prev, { id: Date.now(), ...form, value: Number(form.value), status: 'Active' }]);
    }
    showToast(editId ? 'Discount updated!' : 'Discount created!', 'success');
    setShowForm(false);
  };

  const toggleStatus = (id) => {
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'Active' ? 'Disabled' : 'Active' } : d));
  };

  const handleDelete = () => {
    setDiscounts(prev => prev.filter(d => d.id !== deleteTarget.id));
    showToast('Discount deleted', 'success');
    setDeleteTarget(null);
  };

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  if (showForm) {
    const previewPrice = 1000;
    const discountedPrice = form.type === 'percentage'
      ? previewPrice * (1 - (Number(form.value) || 0) / 100)
      : previewPrice - (Number(form.value) || 0);

    return (
      <>
        <div className="admin-page-header">
          <div>
            <h1>{editId ? 'Edit Discount' : 'Create Discount'}</h1>
            <p>{editId ? 'Update offer details' : 'Set up a new discount or offer'}</p>
          </div>
          <button className="admin-btn admin-btn--secondary" onClick={() => setShowForm(false)}>
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="admin-grid-layout">
            <div>
              <div className="admin-form-card">
                <h3>Discount Details</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Offer Name <span>*</span></label>
                  <input className={`admin-form-input ${formErrors.name ? 'admin-form-input--error' : ''}`} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale" />
                  {formErrors.name && <div className="admin-form-error">{formErrors.name}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Coupon Code <span>*</span></label>
                  <input className={`admin-form-input ${formErrors.code ? 'admin-form-input--error' : ''}`} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER15" style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }} />
                  {formErrors.code && <div className="admin-form-error">{formErrors.code}</div>}
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Discount Type</label>
                    <select className="admin-form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Value <span>*</span></label>
                    <input className={`admin-form-input ${formErrors.value ? 'admin-form-input--error' : ''}`} type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percentage' ? '15' : '200'} />
                    {formErrors.value && <div className="admin-form-error">{formErrors.value}</div>}
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Start Date <span>*</span></label>
                    <input className={`admin-form-input ${formErrors.startDate ? 'admin-form-input--error' : ''}`} type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">End Date <span>*</span></label>
                    <input className={`admin-form-input ${formErrors.endDate ? 'admin-form-input--error' : ''}`} type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Applicable Category</label>
                  <select className="admin-form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="All">All Categories</option>
                    {categoryTree.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="admin-btn admin-btn--primary">
                  <span className="material-symbols-outlined">{editId ? 'save' : 'add'}</span>
                  {editId ? 'Update Discount' : 'Create Discount'}
                </button>
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>

            <div className="admin-form-card">
              <h3>Preview</h3>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Sample product ₹{previewPrice}</div>
                <div style={{ fontSize: 14, textDecoration: 'line-through', color: '#94a3b8' }}>₹{previewPrice}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--admin-accent)' }}>₹{Math.max(0, discountedPrice).toFixed(0)}</div>
                <div style={{ marginTop: 8 }}>
                  <span className="admin-badge admin-badge--primary" style={{ fontSize: 13 }}>
                    {form.type === 'percentage' ? `${form.value || 0}% OFF` : `₹${form.value || 0} OFF`}
                  </span>
                </div>
                {form.code && (
                  <div style={{ marginTop: 16, padding: '10px 16px', background: '#f8fafc', borderRadius: 8, border: '2px dashed var(--admin-border)', fontWeight: 700, letterSpacing: '0.15em', fontSize: 16 }}>
                    {form.code}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
        {toast && <div className={`admin-toast admin-toast--${toast.type}`}><span className="material-symbols-outlined">check_circle</span>{toast.msg}</div>}
      </>
    );
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Discounts & Offers</h1>
          <p>Manage promotional discounts and coupon codes</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>
          <span className="material-symbols-outlined">add</span> Create Discount
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <h3>All Discounts ({discounts.length})</h3>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Duration</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td><code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontWeight: 700, fontSize: 12 }}>{d.code}</code></td>
                  <td>{d.type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                  <td style={{ fontWeight: 600 }}>{d.type === 'percentage' ? `${d.value}%` : `₹${d.value}`}</td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{d.startDate} → {d.endDate}</td>
                  <td>{d.category}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${d.status === 'Active' ? 'active' : d.status === 'Expired' ? 'danger' : 'inactive'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className={`admin-toggle ${d.status === 'Active' ? 'admin-toggle--on' : ''}`} onClick={() => toggleStatus(d.id)} title="Enable/Disable" style={{ marginRight: 4 }} />
                      <button className="admin-btn admin-btn--icon" title="Edit" onClick={() => openEdit(d)}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button className="admin-btn admin-btn--icon-danger" title="Delete" onClick={() => setDeleteTarget(d)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header"><h3>Delete Discount</h3></div>
            <div className="admin-modal__body"><p>Delete <strong>"{deleteTarget.name}"</strong>? This cannot be undone.</p></div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="admin-btn admin-btn--danger" onClick={handleDelete}>
                <span className="material-symbols-outlined">delete</span> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`admin-toast admin-toast--${toast.type}`}><span className="material-symbols-outlined">check_circle</span>{toast.msg}</div>}
    </>
  );
}
