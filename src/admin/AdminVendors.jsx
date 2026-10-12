import { useState, useEffect } from 'react';
import { getVendors, createVendor, updateVendor, updateVendorPermissions, approveVendor, rejectVendor } from '../api/vendor';

const ALL_PERMISSIONS = [
  { id: 'product:view', label: 'View Products', desc: 'Can view assigned product catalog' },
  { id: 'product:create', label: 'Add Products', desc: 'Can create new products in catalog' },
  { id: 'product:update', label: 'Edit Products', desc: 'Can update product details & prices' },
  { id: 'product:delete', label: 'Delete Products', desc: 'Can delete assigned products' },
  { id: 'inventory:update', label: 'Manage Stock', desc: 'Can update stock levels' },
  { id: 'analytics:view', label: 'View Analytics', desc: 'Can view own sales & product metrics' },
];

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [toast, setToast] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reviewingVendor, setReviewingVendor] = useState(null);
  const [rejectingVendor, setRejectingVendor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Direct create form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    phone: '',
    businessCategory: 'Dental Equipment & Machinery',
    taxId: '',
    permissions: ['product:view', 'product:create', 'product:update'],
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeTab !== 'all') params.set('status', activeTab);

      const res = await getVendors(params.toString());
      if (res.success) {
        setVendors(res.vendors || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load vendors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [search, activeTab]);

  // Handle direct creation by admin
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.companyName) {
      showToast('Name, Company, Email, and Password are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createVendor(formData);
      if (res.success) {
        showToast('Vendor account created and approved successfully!');
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          companyName: '',
          phone: '',
          businessCategory: 'Dental Equipment & Machinery',
          taxId: '',
          permissions: ['product:view', 'product:create', 'product:update'],
        });
        loadVendors();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create vendor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open review modal
  const openReviewModal = (vendor) => {
    setReviewingVendor(vendor);
    setSelectedPermissions(vendor.permissions?.length ? [...vendor.permissions] : ['product:view', 'product:create', 'product:update']);
  };

  // Handle approve
  const handleApprove = async () => {
    if (!reviewingVendor) return;
    setSubmitting(true);
    try {
      const res = await approveVendor(reviewingVendor._id, selectedPermissions);
      if (res.success) {
        showToast(`Vendor "${reviewingVendor.companyName || reviewingVendor.name}" approved!`);
        setReviewingVendor(null);
        loadVendors();
      }
    } catch (err) {
      showToast(err.message || 'Failed to approve vendor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reject
  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!rejectingVendor) return;
    setSubmitting(true);
    try {
      const res = await rejectVendor(rejectingVendor._id, rejectReason);
      if (res.success) {
        showToast(`Vendor application rejected.`);
        setRejectingVendor(null);
        setReviewingVendor(null);
        setRejectReason('');
        loadVendors();
      }
    } catch (err) {
      showToast(err.message || 'Failed to reject vendor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (vendor) => {
    const nextStatus = !vendor.isActive;
    try {
      const res = await updateVendor(vendor._id, { isActive: nextStatus });
      if (res.success) {
        showToast(`Vendor ${nextStatus ? 'activated' : 'deactivated'}`);
        setVendors(prev => prev.map(v => v._id === vendor._id ? { ...v, isActive: nextStatus } : v));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update vendor status', 'error');
    }
  };

  return (
    <>
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          <span className="material-symbols-outlined">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}

      <div className="admin-page-header">
        <div>
          <h1>Vendor Management & Approvals</h1>
          <p>Review self-registered supplier applications, manage permissions, and approve platform access</p>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="material-symbols-outlined">person_add</span>
          Add Vendor Directly
        </button>
      </div>

      {/* TABS */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'pending' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>hourglass_top</span>
          Pending Review
          {counts.pending > 0 && (
            <span className="admin-tab__badge admin-tab__badge--warning">{counts.pending}</span>
          )}
        </button>
        <button
          className={`admin-tab ${activeTab === 'approved' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
          Approved Vendors
          <span className="admin-tab__badge admin-tab__badge--neutral">{counts.approved}</span>
        </button>
        <button
          className={`admin-tab ${activeTab === 'rejected' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cancel</span>
          Rejected Applications
          {counts.rejected > 0 && (
            <span className="admin-tab__badge admin-tab__badge--neutral">{counts.rejected}</span>
          )}
        </button>
        <button
          className={`admin-tab ${activeTab === 'all' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Accounts
          <span className="admin-tab__badge admin-tab__badge--neutral">{counts.total}</span>
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <div className="admin-table-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search by vendor name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Showing {vendors.length} {vendors.length === 1 ? 'vendor' : 'vendors'}
          </span>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vendor / Contact</th>
                <th>Company & Specialization</th>
                <th>Approval Status</th>
                <th>Products</th>
                <th>Access Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                      Loading vendor list...
                    </div>
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty-state">
                      <span className="material-symbols-outlined">
                        {activeTab === 'pending' ? 'task_alt' : 'storefront'}
                      </span>
                      <h3>
                        {activeTab === 'pending'
                          ? 'No Pending Applications'
                          : activeTab === 'rejected'
                          ? 'No Rejected Applications'
                          : 'No Vendors Found'}
                      </h3>
                      <p>
                        {activeTab === 'pending'
                          ? 'All supplier requests have been reviewed and processed.'
                          : 'You can create a vendor account directly or suppliers can register online.'}
                      </p>
                      {activeTab !== 'pending' && (
                        <button
                          className="admin-btn admin-btn--primary"
                          onClick={() => setShowCreateModal(true)}
                        >
                          <span className="material-symbols-outlined">person_add</span>
                          Add Vendor Directly
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => {
                  const status = vendor.approvalStatus || 'approved';
                  return (
                    <tr key={vendor._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: status === 'pending' ? 'rgba(234, 88, 12, 0.12)' : 'rgba(26,54,115,0.08)',
                            color: status === 'pending' ? '#ea580c' : '#1A3673',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                            flexShrink: 0
                          }}>
                            {vendor.name ? vendor.name[0].toUpperCase() : 'V'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{vendor.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{vendor.email}</div>
                            {vendor.phone && <div style={{ fontSize: 11, color: '#94a3b8' }}>{vendor.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong style={{ fontSize: 13, color: '#1e293b' }}>{vendor.companyName || '—'}</strong>
                          {vendor.businessCategory && (
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{vendor.businessCategory}</div>
                          )}
                          {vendor.taxId && (
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>GST: {vendor.taxId}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        {status === 'pending' ? (
                          <span className="admin-badge admin-badge--pending">
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>hourglass_top</span>
                            Pending Review
                          </span>
                        ) : status === 'rejected' ? (
                          <div>
                            <span className="admin-badge admin-badge--rejected">
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cancel</span>
                              Rejected
                            </span>
                            {vendor.rejectionReason && (
                              <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, maxWidth: 180 }} title={vendor.rejectionReason}>
                                Reason: {vendor.rejectionReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="admin-badge admin-badge--approved">
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                            Approved
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="admin-badge admin-badge--neutral">
                          {vendor.productCount || 0} products
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${vendor.isActive ? 'active' : 'inactive'}`}>
                          {vendor.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          {status === 'pending' ? (
                            <button
                              className="admin-btn admin-btn--primary admin-btn--sm"
                              onClick={() => openReviewModal(vendor)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>rate_review</span>
                              Review Request
                            </button>
                          ) : (
                            <>
                              <button
                                className="admin-btn admin-btn--secondary admin-btn--sm"
                                onClick={() => openReviewModal(vendor)}
                                title="View & Edit Permissions"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>manage_accounts</span>
                                Manage
                              </button>
                              <button
                                className={`admin-btn ${vendor.isActive ? 'admin-btn--danger' : 'admin-btn--secondary'} admin-btn--sm`}
                                onClick={() => handleToggleStatus(vendor)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                  {vendor.isActive ? 'block' : 'check'}
                                </span>
                                {vendor.isActive ? 'Suspend' : 'Activate'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW APPLICATION MODAL */}
      {reviewingVendor && (
        <div className="admin-modal-overlay" onClick={() => setReviewingVendor(null)}>
          <div className="admin-modal admin-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 24 }}>
                  verified_user
                </span>
                <h2>Vendor Application: {reviewingVendor.companyName || reviewingVendor.name}</h2>
              </div>
              <button className="admin-modal__close" onClick={() => setReviewingVendor(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="admin-modal__body">
              {/* Applicant Profile Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '18px 20px',
                marginBottom: 20
              }}>
                <div className="admin-grid-2" style={{ gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Contact Person</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{reviewingVendor.name}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Company / Brand</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{reviewingVendor.companyName || '—'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Email Address</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{reviewingVendor.email}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Phone / WhatsApp</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{reviewingVendor.phone || 'Not provided'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Specialization</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{reviewingVendor.businessCategory || 'General Supplies'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Tax ID / GSTIN</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{reviewingVendor.taxId || 'Not provided'}</div>
                  </div>
                </div>

                {reviewingVendor.businessDescription && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Applicant Notes / Portfolio</span>
                    <p style={{ fontSize: 13, color: '#334155', margin: '4px 0 0', lineHeight: 1.5 }}>
                      {reviewingVendor.businessDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Assign Permissions */}
              <div style={{ marginBottom: 12 }}>
                <label className="admin-form-label" style={{ marginBottom: 10 }}>
                  Assign Vendor Capabilities & Permissions
                </label>
                <div className="admin-grid-2" style={{ gap: 10 }}>
                  {ALL_PERMISSIONS.map(p => {
                    const checked = selectedPermissions.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          background: checked ? 'rgba(26,54,115,0.04)' : '#fff',
                          border: `1px solid ${checked ? '#1A3673' : '#e2e8f0'}`,
                          borderRadius: 8,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, p.id]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(x => x !== p.id));
                            }
                          }}
                          style={{ marginTop: 3 }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{p.label}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{p.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="admin-modal__footer">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setReviewingVendor(null)}
              >
                Cancel
              </button>

              {reviewingVendor.approvalStatus === 'pending' ? (
                <>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    onClick={() => {
                      setRejectingVendor(reviewingVendor);
                      setRejectReason('');
                    }}
                    disabled={submitting}
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Reject Application
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    onClick={handleApprove}
                    disabled={submitting}
                  >
                    <span className="material-symbols-outlined">verified</span>
                    {submitting ? 'Approving...' : 'Approve & Activate Vendor'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={async () => {
                    setSubmitting(true);
                    try {
                      await updateVendorPermissions(reviewingVendor._id, selectedPermissions);
                      showToast('Vendor permissions updated!');
                      setReviewingVendor(null);
                      loadVendors();
                    } catch (err) {
                      showToast(err.message || 'Failed to save permissions', 'error');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                >
                  <span className="material-symbols-outlined">save</span>
                  Save Permissions
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectingVendor && (
        <div className="admin-modal-overlay" style={{ zIndex: 1100 }} onClick={() => setRejectingVendor(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2 style={{ color: '#dc2626' }}>Reject Vendor Application</h2>
              <button className="admin-modal__close" onClick={() => setRejectingVendor(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleRejectConfirm}>
              <div className="admin-modal__body">
                <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
                  Are you sure you want to reject the application from <strong>{rejectingVendor.companyName || rejectingVendor.name}</strong>?
                </p>
                <div className="admin-form-group">
                  <label className="admin-form-label">Rejection Reason (Visible to Applicant)</label>
                  <textarea
                    className="admin-form-textarea"
                    rows={3}
                    placeholder="e.g. Incomplete business verification, unauthorized product brand, or unverified contact details..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setRejectingVendor(null)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--danger"
                  disabled={submitting}
                >
                  <span className="material-symbols-outlined">block</span>
                  {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECT CREATE VENDOR MODAL */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal admin-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Add Vendor Account Directly</h2>
              <button className="admin-modal__close" onClick={() => setShowCreateModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="admin-modal__body">
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Contact Person Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Company / Brand Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. Apex Dental Instruments"
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Email Address *</label>
                    <input
                      type="email"
                      className="admin-form-input"
                      required
                      placeholder="vendor@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="admin-form-input"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Specialization</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Endodontics"
                      value={formData.businessCategory}
                      onChange={e => setFormData({ ...formData, businessCategory: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Account Password *</label>
                    <input
                      type="password"
                      className="admin-form-input"
                      required
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ marginBottom: 10 }}>
                    Assigned Catalog Permissions
                  </label>
                  <div className="admin-grid-2" style={{ gap: 10 }}>
                    {ALL_PERMISSIONS.map(p => {
                      const checked = formData.permissions.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            padding: '8px 10px',
                            background: checked ? 'rgba(26,54,115,0.04)' : '#f8fafc',
                            border: `1px solid ${checked ? '#1A3673' : '#e2e8f0'}`,
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              if (e.target.checked) {
                                setFormData({ ...formData, permissions: [...formData.permissions, p.id] });
                              } else {
                                setFormData({ ...formData, permissions: formData.permissions.filter(x => x !== p.id) });
                              }
                            }}
                            style={{ marginTop: 2 }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.label}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{p.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <span className="material-symbols-outlined">check</span>
                  {submitting ? 'Creating...' : 'Create & Approve Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
