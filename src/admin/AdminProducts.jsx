import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore, updateStore } from '../store';
import Papa from 'papaparse';
import { createProduct, updateProduct, deleteProduct, bulkUploadProducts } from '../api/products';
import { upload } from '../api/client';
import { loadStoreFromAPI } from '../store';

export default function AdminProducts() {
  const store = useStore();
  const products = store.products;
  const categoryTree = store.categories;
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [productList, setProductList] = useState(products);

  useEffect(() => {
    // Force refresh the store from API to ensure we have the latest vendor products
    loadStoreFromAPI();
  }, []);

  useEffect(() => {
    setProductList(products);
  }, [products]);

  // Form state
  const emptyForm = {
    name: '', category: '', subcategory: '', price: '', discountPrice: '',
    description: '', material: '', sku: '', stock: '50', status: 'Active',
    badge: '', featured: false, visible: true, image: '', images: []
  };
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let list = [...productList];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    if (catFilter !== 'All') {
      list = list.filter(p => p.category === catFilter);
    }
    return list;
  }, [search, catFilter, productList]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm, sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, images: [] });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    const pImages = (p.images && p.images.length > 0)
      ? p.images.map(img => (typeof img === 'string' ? img : img.url)).filter(Boolean)
      : (p.image ? [p.image] : []);

    setForm({
      name: p.name, category: p.category, subcategory: p.subcategory || '',
      price: String(p.price), discountPrice: p.discountPrice ? String(p.discountPrice) : '', description: p.description,
      material: p.material || '', sku: `SKU-${p.id}`, stock: String(p.stock ?? 50),
      status: p.inStock ? 'Active' : 'Out of Stock', badge: p.badge || '',
      featured: !!p.badge, visible: true,
      image: pImages[0] || p.image || '',
      images: pImages,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm() || saving) return;

    setSaving(true);
    const prodPrice = Number(form.price) || 0;
    const prodDiscountPrice = form.discountPrice ? Number(form.discountPrice) : undefined;
    const prodStock = Number(form.stock) || 50;
    const prodImages = (form.images && form.images.length > 0)
      ? form.images.map(url => ({ url }))
      : (form.image ? [{ url: form.image }] : [{ url: `https://placehold.co/400x400/f8fafc/1A3673?text=${encodeURIComponent(form.name)}` }]);
    const primaryImage = prodImages[0]?.url || form.image || '';

    const payload = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      price: prodPrice,
      discountPrice: prodDiscountPrice,
      description: form.description,
      material: form.material,
      stock: prodStock,
      badge: form.badge || '',
      isFeatured: form.featured,
      image: primaryImage,
      images: prodImages,
    };

    try {
      if (editId) {
        await updateProduct(editId, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await createProduct(payload);
        showToast('Product added successfully!', 'success');
      }
      setShowForm(false);
      await loadStoreFromAPI();
    } catch (err) {
      showToast((editId ? 'Failed to update product: ' : 'Failed to add product: ') + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteTarget.id);
      showToast(`Product "${deleteTarget.name}" deleted`, 'success');
      await loadStoreFromAPI();
    } catch (err) {
      showToast('Failed to delete product: ' + err.message, 'error');
    }
    setDeleteTarget(null);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
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
          const currentImages = prev.images || [];
          const updated = [...currentImages, ...uploadedUrls];
          return {
            ...prev,
            images: updated,
            image: updated[0] || '',
          };
        });
        showToast(`Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} successfully!`, 'success');
      } else {
        showToast('Image upload failed', 'error');
      }
    } catch (err) {
      showToast('Error uploading image: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImageAt = (indexToRemove) => {
    setForm(prev => {
      const currentImages = prev.images || [];
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updated,
        image: updated[0] || '',
      };
    });
  };

  const setAsCoverImage = (indexToCover) => {
    setForm(prev => {
      const currentImages = prev.images || [];
      const target = currentImages[indexToCover];
      const rest = currentImages.filter((_, idx) => idx !== indexToCover);
      const reordered = [target, ...rest];
      return {
        ...prev,
        images: reordered,
        image: target,
      };
    });
    showToast('Cover photo updated', 'success');
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
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
            // Optimistically reload to see changes (or we could fetch again)
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

  const catOptions = categoryTree.map(c => c.name);
  const subOptions = categoryTree.find(c => c.name === form.category)?.items || [];

  // Product Form
  if (showForm) {
    return (
      <>
        <div className="admin-page-header">
          <div>
            <h1>{editId ? 'Edit Product' : 'Add New Product'}</h1>
            <p>{editId ? 'Update product details below' : 'Fill in the product information'}</p>
          </div>
          <button className="admin-btn admin-btn--secondary" onClick={() => setShowForm(false)}>
            <span className="material-symbols-outlined">arrow_back</span> Back to List
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="admin-grid-layout">
            <div>
              <div className="admin-form-card">
                <h3>Basic Information</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Product Name <span>*</span></label>
                  <input className={`admin-form-input ${formErrors.name ? 'admin-form-input--error' : ''}`} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. NiTi Rotary File System" />
                  {formErrors.name && <div className="admin-form-error">{formErrors.name}</div>}
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category <span>*</span></label>
                    <select className={`admin-form-select ${formErrors.category ? 'admin-form-input--error' : ''}`} value={form.category} onChange={e => setForm({ ...form, category: e.target.value, subcategory: '' })}>
                      <option value="">Select category</option>
                      {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.category && <div className="admin-form-error">{formErrors.category}</div>}
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Subcategory</label>
                    <select className="admin-form-select" value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })}>
                      <option value="">Select subcategory</option>
                      {subOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Description <span>*</span></label>
                  <textarea className={`admin-form-textarea ${formErrors.description ? 'admin-form-input--error' : ''}`} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." />
                  {formErrors.description && <div className="admin-form-error">{formErrors.description}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Material</label>
                  <input className="admin-form-input" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} placeholder="e.g. Stainless Steel" />
                </div>
              </div>

              <div className="admin-form-card">
                <h3>Pricing & Inventory</h3>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Price (₹) <span>*</span></label>
                    <input className={`admin-form-input ${formErrors.price ? 'admin-form-input--error' : ''}`} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                    {formErrors.price && <div className="admin-form-error">{formErrors.price}</div>}
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Discount Price (₹)</label>
                    <input className="admin-form-input" type="number" value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })} placeholder="Leave empty if none" />
                    <div className="admin-form-hint">Optional — shows as sale price</div>
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">SKU</label>
                    <input className="admin-form-input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Stock Quantity</label>
                    <input className="admin-form-input" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="admin-form-card">
                <h3>Status & Visibility</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Product Status</label>
                  <select className="admin-form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Badge</label>
                  <select className="admin-form-select" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })}>
                    <option value="">None</option>
                    <option value="New">New</option>
                    <option value="Popular">Popular</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Premium">Premium</option>
                    <option value="Top Rated">Top Rated</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <label className="admin-form-label" style={{ margin: 0 }}>Featured Product</label>
                  <button type="button" className={`admin-toggle ${form.featured ? 'admin-toggle--on' : ''}`} onClick={() => setForm({ ...form, featured: !form.featured })} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <label className="admin-form-label" style={{ margin: 0 }}>Visible in Shop</label>
                  <button type="button" className={`admin-toggle ${form.visible ? 'admin-toggle--on' : ''}`} onClick={() => setForm({ ...form, visible: !form.visible })} />
                </div>
              </div>

              <div className="admin-form-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>Product Photos ({form.images?.length || (form.image ? 1 : 0)})</h3>
                  {form.images?.length > 1 && (
                    <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                      First photo is Cover
                    </span>
                  )}
                </div>

                <div className="admin-form-group">
                  <input 
                    type="file" 
                    id="productImageUpload"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload} 
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="productImageUpload" style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: form.images?.length > 0 ? '20px 16px' : '32px 16px',
                    border: '2px dashed var(--admin-border)', borderRadius: '12px',
                    cursor: isUploading ? 'not-allowed' : 'pointer', background: '#f8fafc',
                    transition: 'all 0.2s', textAlign: 'center'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: isUploading ? 'var(--primary)' : 'var(--admin-text-light)', marginBottom: 8 }}>
                      {isUploading ? 'sync' : 'add_photo_alternate'}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text)', marginBottom: 4, fontSize: 14 }}>
                      {isUploading ? 'Uploading to Cloudinary...' : form.images?.length > 0 ? '+ Add More Photos' : 'Click to upload photos'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--admin-text-light)' }}>
                      Select one or multiple photos (PNG, JPG, WEBP)
                    </span>
                  </label>
                </div>

                {/* Uploaded Photos Grid */}
                {form.images && form.images.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                    gap: 12,
                    marginTop: 16
                  }}>
                    {form.images.map((imgUrl, idx) => (
                      <div key={idx} style={{
                        position: 'relative',
                        borderRadius: 8,
                        border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--admin-border)',
                        overflow: 'hidden',
                        background: '#f8fafc',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                      }}>
                        <img 
                          src={imgUrl} 
                          alt={`Photo ${idx + 1}`} 
                          style={{ width: '100%', height: 95, objectFit: 'contain', display: 'block', background: 'white' }} 
                        />
                        {idx === 0 ? (
                          <span style={{
                            position: 'absolute', top: 4, left: 4,
                            background: 'var(--primary)', color: 'white',
                            fontSize: 10, fontWeight: 700, padding: '2px 6px',
                            borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5
                          }}>
                            Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAsCoverImage(idx)}
                            title="Set as Main Cover Photo"
                            style={{
                              position: 'absolute', top: 4, left: 4,
                              background: 'rgba(15, 23, 42, 0.75)', color: 'white',
                              border: 'none', borderRadius: 4, fontSize: 10,
                              padding: '2px 6px', cursor: 'pointer', fontWeight: 600
                            }}
                          >
                            Make Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeImageAt(idx)}
                          title="Remove Photo"
                          style={{
                            position: 'absolute', top: 4, right: 4,
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.9)', color: 'white',
                            border: 'none', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', padding: 0
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
                        </button>

                        <div style={{
                          padding: '4px 6px', fontSize: 11, color: '#64748b',
                          textAlign: 'center', background: '#f1f5f9', borderTop: '1px solid #e2e8f0'
                        }}>
                          Photo {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {form.images && form.images.length > 0 && (
                  <button 
                    type="button" 
                    className="admin-btn admin-btn--secondary" 
                    style={{ marginTop: 14, width: '100%', fontSize: 13 }}
                    onClick={() => setForm(prev => ({ ...prev, images: [], image: '' }))}
                  >
                    Remove All Photos
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="admin-btn admin-btn--primary" style={{ flex: 1 }} disabled={saving}>
                  <span className="material-symbols-outlined">{saving ? 'sync' : editId ? 'save' : 'add'}</span>
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
              </div>
            </div>
          </div>
        </form>
        {toast && createPortal(
          <div className={`admin-toast admin-toast--${toast.type}`}><span className="material-symbols-outlined">check_circle</span>{toast.msg}</div>,
          document.body
        )}
      </>
    );
  }

  // Product List View
  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
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
            id="csvUpload" 
            style={{ display: 'none' }} 
            onChange={handleBulkUpload} 
            disabled={isUploading}
          />
          <label htmlFor="csvUpload" className="admin-btn admin-btn--secondary" style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined">upload_file</span> 
            {isUploading ? 'Uploading...' : 'Bulk Upload'}
          </label>

          <button className="admin-btn admin-btn--primary" onClick={openAdd}>
            <span className="material-symbols-outlined">add</span> Add Product
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select className="admin-form-select" style={{ width: 'auto', height: 36, fontSize: 13 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span style={{ fontSize: 13, color: '#64748b' }}>{filtered.length} products</span>
          </div>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Vendor</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="admin-empty-state">
                    <span className="material-symbols-outlined">search_off</span>
                    <h3>No products found</h3>
                    <p>Try a different search or filter</p>
                  </div>
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-product-cell">
                      <img src={p.image} alt={p.name} className="admin-product-thumb" />
                      <div>
                        <div className="admin-product-cell__name">{p.name}</div>
                        <div className="admin-product-cell__sku">SKU-{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td style={{ fontWeight: 600 }}>₹{p.price.toLocaleString()}</td>
                  <td>
                    {p.vendor ? (
                      <span style={{ fontSize: 13, background: 'var(--admin-bg)', padding: '2px 8px', borderRadius: 4 }}>
                        {p.vendor.companyName || p.vendor.name}
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, background: 'var(--admin-accent-light)', color: 'var(--admin-accent)', padding: '2px 8px', borderRadius: 4 }}>
                        Admin
                      </span>
                    )}
                  </td>
                  <td>50</td>
                  <td>
                    <span className={`admin-badge ${p.inStock ? 'admin-badge--active' : 'admin-badge--danger'}`}>
                      {p.inStock ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="admin-btn admin-btn--icon" title="Edit" onClick={() => openEdit(p)}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button className="admin-btn admin-btn--icon-danger" title="Delete" onClick={() => setDeleteTarget(p)}>
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && createPortal(
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>Delete Product</h3>
              <button className="admin-btn admin-btn--icon" onClick={() => setDeleteTarget(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal__body">
              <p style={{ fontSize: 14, color: '#64748b' }}>
                Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="admin-btn admin-btn--danger" onClick={handleDelete}>
                <span className="material-symbols-outlined">delete</span> Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && createPortal(
        <div className={`admin-toast admin-toast--${toast.type}`}><span className="material-symbols-outlined">check_circle</span>{toast.msg}</div>,
        document.body
      )}
    </>
  );
}
