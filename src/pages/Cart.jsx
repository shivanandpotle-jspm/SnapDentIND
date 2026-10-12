import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutStepper from '../components/CheckoutStepper';
import { useAuth } from '../context/AuthContext';
import { getCart, updateCartItem, removeFromCart } from '../api/cart';
import { updateStore, useStore } from '../store';
import './Cart.css';

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const store = useStore();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const appliedDiscount = store.appliedDiscount;
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    const found = store.discounts?.find(d => d.code === promoCode.toUpperCase() && d.status === 'Active');
    if (found) {
      updateStore('appliedDiscount', found);
      setPromoError('');
    } else {
      updateStore('appliedDiscount', null);
      setPromoError('Invalid or expired promo code');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const data = await getCart();
        setCartItems(data.cart);
        updateStore('cart', data.cart);
      } catch (err) {
        setError(err.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [isAuthenticated]);

  const updateQty = async (cartItemId, delta) => {
    const item = cartItems.find(i => String(i.cartItemId) === String(cartItemId));
    if (!item) return;
    const newQty = Math.max(1, item.qty + delta);
    
    // Optimistic update
    setCartItems(prev => prev.map(i => String(i.cartItemId) === String(cartItemId) ? { ...i, qty: newQty } : i));
    
    try {
      const data = await updateCartItem(cartItemId, newQty);
      setCartItems(data.cart);
      updateStore('cart', data.cart);
    } catch (err) {
      // Revert on error (could implement full rollback, but just fetching again is safer)
      const data = await getCart();
      setCartItems(data.cart);
    }
  };

  const removeItem = async (cartItemId) => {
    // Optimistic update
    setCartItems(prev => prev.filter(i => String(i.cartItemId) !== String(cartItemId)));
    
    try {
      const data = await removeFromCart(cartItemId);
      setCartItems(data.cart);
      updateStore('cart', data.cart);
    } catch (err) {
      const data = await getCart();
      setCartItems(data.cart);
    }
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = cartItems.length === 0 ? 0 : (subtotal > 500 ? 0 : 50);

  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = subtotal * (appliedDiscount.value / 100);
    } else {
      discountAmount = appliedDiscount.value;
    }
  }

  const total = Math.max(0, subtotal - discountAmount) + shipping;

  if (!isAuthenticated) {
    return (
      <main className="cart-page container-max section-gap animate-fade-in-up">
        <div className="cart-empty card-elevated" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: 600, margin: '0 auto' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#94a3b8', marginBottom: 24 }}>lock</span>
          <h3>Please Sign In</h3>
          <p style={{ color: '#64748b', marginBottom: 24 }}>You need to be logged in to view and manage your cart.</p>
          <Link to="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="cart-page container-max section-gap">
        <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading cart...</div>
      </main>
    );
  }

  return (
    <main className="cart-page container-max section-gap animate-fade-in-up">
      <CheckoutStepper current={0} />

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items-section">
          <div className="cart-header">
            <h1 className="cart-title">Your Cart</h1>
            <span className="cart-count">{cartItems.length} items</span>
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty card-elevated">
              <div className="cart-empty-icon">
                <span className="material-symbols-outlined">remove_shopping_cart</span>
              </div>
              <h3>Your cart is feeling light</h3>
              <p>Explore our premium dental components to fill it up.</p>
              <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Explore Products</Link>
            </div>
          ) : (
            <div className="cart-item-list">
              {cartItems.map(item => (
                <div key={item.cartItemId} className="cart-item-card card">
                  <Link to={`/shop`} className="cart-item-image-wrapper">
                    <img src={item.image} alt={item.name} />
                  </Link>
                  
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <div>
                        <span className="cart-item-category">{item.category}</span>
                        <Link to={`/shop`} className="cart-item-name">{item.name}</Link>
                        {item.variant && <p className="cart-item-meta" style={{ color: 'var(--primary)', fontWeight: 600 }}>Option: {item.variant}</p>}
                        <p className="cart-item-meta">Material: {item.material}</p>
                      </div>
                      <span className="cart-item-price-unit">₹{item.price.toFixed(2)}</span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQty(item.cartItemId, -1)} aria-label="Decrease quantity">
                          <span className="material-symbols-outlined">remove</span>
                        </button>
                        <span className="qty-display">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.cartItemId, 1)} aria-label="Increase quantity">
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>

                      <div className="cart-item-end">
                        <span className="cart-item-price-total">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </span>
                        <button className="remove-btn" onClick={() => removeItem(item.cartItemId)} aria-label="Remove item">
                          <span className="material-symbols-outlined">delete_outline</span>
                          <span className="remove-text">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="cart-summary-section">
          <div className="cart-summary-card card-elevated">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Estimated Shipping</span>
              <span className="summary-value">
                {shipping === 0 ? <span className="free-shipping-text">Free</span> : `₹${shipping.toFixed(2)}`}
              </span>
            </div>

            {appliedDiscount && (
              <div className="summary-row" style={{ color: 'var(--primary)' }}>
                <span className="summary-label">Discount ({appliedDiscount.code})</span>
                <span className="summary-value">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={promoCode} 
                  onChange={e => setPromoCode(e.target.value)} 
                  placeholder="Promo Code" 
                  className="input-field"
                  style={{ textTransform: 'uppercase', height: '40px', flex: 1 }}
                />
                <button className="btn btn-outline" onClick={handleApplyPromo} style={{ height: '40px', padding: '0 16px' }}>Apply</button>
              </div>
              {promoError && <p style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>{promoError}</p>}
            </div>

            {shipping === 0 && subtotal > 0 && (
              <div className="shipping-promo">
                <div className="shipping-promo-icon">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <p>You have unlocked <strong>free shipping!</strong></p>
              </div>
            )}

            <div className="summary-actions">
              <Link to="/shipping" className="btn btn-primary btn-block">
                Proceed to Checkout
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <div className="secure-checkout">
                <span className="material-symbols-outlined">lock</span>
                Secure Encrypted Checkout
              </div>
            </div>
          </div>
          
          <Link to="/shop" className="continue-shopping-link">
            <span className="material-symbols-outlined">keyboard_backspace</span>
            Continue Shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
