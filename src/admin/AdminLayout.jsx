import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVendors } from '../api/vendor';
import { logos } from '../data/products';
import './Admin.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', path: '/admin' },
  { section: 'Catalog' },
  { label: 'Products', icon: 'inventory_2', path: '/admin/products' },
  { label: 'Inventory', icon: 'warehouse', path: '/admin/inventory' },
  { label: 'Discounts & Offers', icon: 'sell', path: '/admin/discounts' },
  { section: 'Sales & Users' },
  { label: 'Orders', icon: 'receipt_long', path: '/admin/orders' },
  { label: 'Customers', icon: 'group', path: '/admin/customers' },
  { label: 'Vendors', icon: 'storefront', path: '/admin/vendors' },
  { label: 'Messages', icon: 'inbox', path: '/admin/messages' },
  { section: 'System' },
  { label: 'Categories', icon: 'category', path: '/admin/categories' },
  { label: 'Settings', icon: 'settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const { isAdmin, isAuthenticated, loading, logout } = useAuth();
  
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    getVendors('status=pending')
      .then(res => {
        if (res?.counts?.pending !== undefined) {
          setPendingCount(res.counts.pending);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  if (loading) return null;

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const currentTitle = NAV_ITEMS.find(
    item => item.path && location.pathname === item.path
  )?.label || 'Admin';

  return (
    <>
      <div className="admin-shell">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <img src={logos.main} alt="SnapDent" />
        </div>
        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item, i) =>
            item.section ? (
              <div key={i} className="admin-sidebar__section-label">{item.section}</div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-sidebar__link ${location.pathname === item.path ? 'admin-sidebar__link--active' : ''}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.path === '/admin/vendors' && pendingCount > 0 && (
                  <span className="admin-sidebar__badge">{pendingCount}</span>
                )}
              </Link>
            )
          )}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--admin-border-light)' }}>
          <button
            className="admin-sidebar__link"
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'admin-sidebar-overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              className="admin-topbar__hamburger"
              onClick={() => setSidebarOpen(prev => !prev)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="admin-topbar__breadcrumb">
              <Link to="/admin">Admin</Link>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
              <span>{currentTitle}</span>
            </div>
          </div>
          <div className="admin-topbar__right">
            <button className="admin-topbar__icon-btn" title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link to="/admin/profile" className="admin-topbar__avatar" style={{ textDecoration: 'none' }}>AD</Link>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
        </div>
      </div>
    </>
  );
}
