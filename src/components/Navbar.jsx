import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import './Navbar.css';

export default function Navbar() {
  const store = useStore();
  const { cart, logos } = store;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

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

  // Cart dropdown state
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);

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
                <button
                  className="navbar__icon-btn"
                  aria-label="Shopping Cart"
                  onClick={() => setCartDropdownOpen(prev => !prev)}
                  style={{ position: 'relative' }}
                >
                  <span className="material-symbols-outlined">shopping_cart_checkout</span>
                  {cartItemCount > 0 && (
                    <span className="navbar__cart-badge" style={{ position: 'absolute', top: -5, right: -5, background: 'var(--primary)', color: 'white', fontSize: 10, borderRadius: '50%', padding: '2px 6px', fontWeight: 'bold' }}>
                      {cartItemCount}
                    </span>
                  )}
                </button>
                {cartDropdownOpen && (
                  <div className="navbar__cart-dropdown">
                    <p>{cartItemCount > 0 ? `You have ${cartItemCount} items.` : 'Your cart is empty.'}</p>
                    <Link to="/cart" onClick={() => setCartDropdownOpen(false)}>View Cart</Link>
                  </div>
                )}
              </div>
              <Link to="/login" className="navbar__icon-btn navbar__icon-btn--desktop" aria-label="Account">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
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
        </nav>
      </div>

      {mobileOpen && <div className="mobile-menu__overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
