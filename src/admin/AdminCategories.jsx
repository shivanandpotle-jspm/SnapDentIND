import { useState } from 'react';
import { categoryTree } from '../data/products';

export default function AdminCategories() {
  const [categories, setCategories] = useState(
    categoryTree.map((c, i) => ({ ...c, id: i + 1, description: `High-quality ${c.name.toLowerCase()} for dental professionals.` }))
  );
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({ name: '', parent: 'None (Top Level)', description: '' });

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', parent: 'None (Top Level)', description: '' });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditId(cat.id);
    setForm({ name: cat.name, parent: 'None (Top Level)', description: cat.description || '' });
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editId) {
      setCategories(prev => prev.map(c => c.id === editId ? { ...c, name: form.name, description: form.description } : c));
      showToast('Category updated successfully!', 'success');
    } else {
      setCategories(prev => [...prev, { 
        id: Date.now(), 
        name: form.name, 
        sub: [], 
        description: form.description 
      }]);
      showToast('New category added!', 'success');
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Category removed', 'success');
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Categories</h1>
          <p>Organize your product catalog structure</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>
          <span className="material-symbols-outlined">add_circle</span> New Category
        </button>
      </div>

      <div className="admin-form-row">
        <div className="admin-table-wrap animate-fade-in-up">
          <div className="admin-table-toolbar">
            <h3>Category Hierarchy</h3>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Subcategories</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--admin-blue)' }}>folder</span>
                      {cat.name}
                    </td>
                    <td style={{ color: 'var(--admin-text-muted)' }}>
                      {cat.sub?.length || 0} subcategories
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button className="admin-btn admin-btn--icon" title="Edit" onClick={() => openEdit(cat)}>
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className="admin-btn admin-btn--icon-danger" title="Delete" onClick={() => handleDelete(cat.id)}>
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

        {showForm && (
          <form className="admin-form-card animate-fade-in-up" onSubmit={handleSave} style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--admin-border-light)' }}>
              <h3 style={{ margin: 0, padding: 0, border: 'none' }}>{editId ? 'Edit Category' : 'New Category'}</h3>
              <button type="button" className="admin-btn admin-btn--icon" onClick={() => setShowForm(false)} style={{ border: 'none', background: 'transparent' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Category Name <span>*</span></label>
              <input 
                type="text" 
                className="admin-form-input" 
                placeholder="e.g. Instruments" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Parent Category</label>
              <select className="admin-form-select" value={form.parent} onChange={e => setForm({...form, parent: e.target.value})}>
                <option>None (Top Level)</option>
                {categories.filter(c => c.id !== editId).map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Description</label>
              <textarea 
                className="admin-form-textarea" 
                placeholder="Category description..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              ></textarea>
            </div>
            <button type="submit" className="admin-btn admin-btn--primary" style={{ width: '100%' }}>
              {editId ? 'Save Changes' : 'Create Category'}
            </button>
          </form>
        )}
      </div>
      
      {toast && <div className={`admin-toast admin-toast--${toast.type}`}><span className="material-symbols-outlined">check_circle</span>{toast.msg}</div>}
    </>
  );
}
