import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../store';
import './Navbar.css';

export default function Navbar() {
  const store = useStore();
  const { cart, logos } = store;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartItemCount = cart.length;

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);



  const isActive = (path) => location.pathname === path;

  // Cart dropdown state removed

  return (
    <>
      <div className="navbar-wrapper">
        <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
          <div className="navbar__inner">
            <Link to="/" className="navbar__logo" aria-label="Snapdent India Home">
              <img src={logos.main} alt="Snapdent India" />
            </Link>

            <nav className="navbar__nav">
              <Link
                to="/"
                className={`navbar__link ${isActive('/') ? 'navbar__link--active' : 'nav-link-animated'}`}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className={`navbar__link ${isActive('/shop') ? 'navbar__link--active' : 'nav-link-animated'}`}
              >
                Shop
              </Link>

              <Link
                to="/about"
                className={`navbar__link ${isActive('/about') ? 'navbar__link--active' : 'nav-link-animated'}`}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className={`navbar__link ${isActive('/contact') ? 'navbar__link--active' : 'nav-link-animated'}`}
              >
                Contact Us
              </Link>
            </nav>

            <div className="navbar__actions">
              <div className="navbar__cart-wrapper">
                <Link
                  to="/cart"
                  className="navbar__icon-btn"
                  aria-label="Shopping Cart"
                  style={{ position: 'relative' }}
                >
                  <span className="material-symbols-outlined">shopping_cart_checkout</span>
                  {cartItemCount > 0 && (
                    <span className="navbar__cart-badge" style={{ position: 'absolute', top: -5, right: -5, background: 'var(--primary)', color: 'white', fontSize: 10, borderRadius: '50%', padding: '2px 6px', fontWeight: 'bold' }}>
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link
                    to="/profile"
                    className="navbar__icon-btn navbar__icon-btn--desktop"
                    aria-label="Account"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, width: 'auto', padding: '0 16px', borderRadius: '22px', textDecoration: 'none', color: 'inherit' }}
                  >
                    <span className="material-symbols-outlined">account_circle</span>
                    <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0]}</span>
                  </Link>
                  <button
                    className="navbar__icon-btn navbar__icon-btn--desktop"
                    aria-label="Logout"
                    title="Logout"
                    onClick={() => { logout(); navigate('/'); }}
                  >
                    <span className="material-symbols-outlined">logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="navbar__icon-btn navbar__icon-btn--desktop" aria-label="Account">
                  <span className="material-symbols-outlined">account_circle</span>
                </Link>
              )}
              <button
                className="navbar__hamburger"
                onClick={() => setMobileOpen(true)}
                aria-label="Open Menu"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'mobile-menu--open' : ''}`}>
        <div className="mobile-menu__header">
          <span className="mobile-menu__title">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="mobile-menu__close" aria-label="Close menu">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="mobile-menu__nav">
          <Link to="/" className="mobile-menu__link">Home</Link>
          <Link to="/shop" className="mobile-menu__link">Shop</Link>
          <Link to="/about" className="mobile-menu__link">About Us</Link>
          <Link to="/contact" className="mobile-menu__link">Contact Us</Link>
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="mobile-menu__link">My Cart</Link>
              <button className="mobile-menu__link" style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%', padding: 'inherit', font: 'inherit', color: 'inherit' }} onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-menu__link">Sign In</Link>
              <Link to="/signup" className="mobile-menu__link">Sign Up</Link>
            </>
          )}
        </nav>
      </div>

      {mobileOpen && <div className="mobile-menu__overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
