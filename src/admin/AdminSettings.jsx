import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore, updateStore } from '../store';

export default function AdminSettings() {
  const store = useStore();
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState(store.settings);

  useEffect(() => {
    setSettings(store.settings);
  }, [store.settings]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      updateStore('settings', settings);
      setIsSaving(false);
      setToast({ msg: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    }, 600);
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Settings</h1>
          <p>Configure platform preferences and rules</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="admin-tabs">
        <button className="admin-tab admin-tab--active">General</button>
        <button className="admin-tab">Payment Gateways</button>
        <button className="admin-tab">Shipping Methods</button>
        <button className="admin-tab">Notifications</button>
      </div>

      <div className="admin-form-card animate-fade-in-up">
        <h3>Store Information</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Store Name</label>
            <input 
              type="text" 
              className="admin-form-input" 
              value={settings.storeName} 
              onChange={e => setSettings({...settings, storeName: e.target.value})}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Contact Email</label>
            <input 
              type="email" 
              className="admin-form-input" 
              value={settings.email} 
              onChange={e => setSettings({...settings, email: e.target.value})}
            />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Phone Number</label>
            <input 
              type="text" 
              className="admin-form-input" 
              value={settings.phone} 
              onChange={e => setSettings({...settings, phone: e.target.value})}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Currency</label>
            <select 
              className="admin-form-select"
              value={settings.currency}
              onChange={e => setSettings({...settings, currency: e.target.value})}
            >
              <option>INR (₹)</option>
              <option>INR (₹)</option>
            </select>
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Low Stock Threshold (Alert limit)</label>
            <input 
              type="number" 
              className="admin-form-input" 
              value={settings.lowStockThreshold || 10} 
              onChange={e => setSettings({...settings, lowStockThreshold: Number(e.target.value)})}
            />
          </div>
        </div>
      </div>

      <div className="admin-form-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3>Tax & Legal</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Default GST Rate (%)</label>
            <input 
              type="number" 
              className="admin-form-input" 
              value={settings.gstRate} 
              onChange={e => setSettings({...settings, gstRate: e.target.value})}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Company GSTIN</label>
            <input 
              type="text" 
              className="admin-form-input" 
              value={settings.gstin} 
              onChange={e => setSettings({...settings, gstin: e.target.value})}
            />
          </div>
        </div>
      </div>

      {toast && createPortal(
        <div className={`admin-toast admin-toast--${toast.type}`}><span className="material-symbols-outlined">check_circle</span>{toast.msg}</div>,
        document.body
      )}
    </>
  );
}
