import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logos } from '../data/products';
import '../admin/Admin.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', path: '/vendor' },
  { section: 'Products' },
  { label: 'My Products', icon: 'inventory_2', path: '/vendor/products' },
  { label: 'Add Product', icon: 'add_circle', path: '/vendor/products/add' },
  { section: 'Account' },
  { label: 'Profile', icon: 'person', path: '/vendor/profile' },
];

export default function VendorLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isVendor, isAuthenticated, loading, user, logout } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) return null;

  if (!isAuthenticated || !isVendor) {
    return <Navigate to="/vendor/login" replace />;
  }

  const currentTitle = NAV_ITEMS.find(
    item => item.path && location.pathname === item.path
  )?.label || 'Vendor Panel';

  const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'V';

  return (
    <>
      <div className="admin-shell">
        <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
          <div className="admin-sidebar__brand">
            <img src={logos.main} alt="SnapDent" />
          </div>
          <div style={{ padding: '12px 16px 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--admin-text-muted)' }}>
            Vendor Panel
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
                  {item.label}
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

        <div
          className={`admin-sidebar-overlay ${sidebarOpen ? 'admin-sidebar-overlay--visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

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
                <Link to="/vendor">Vendor</Link>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                <span>{currentTitle}</span>
              </div>
            </div>
            <div className="admin-topbar__right">
              <Link to="/vendor/profile" className="admin-topbar__avatar" style={{ textDecoration: 'none' }}>{initials}</Link>
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
