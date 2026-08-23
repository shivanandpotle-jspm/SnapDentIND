import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CheckoutStepper from '../components/CheckoutStepper';
import { useStore, updateStore } from '../store';
import './Cart.css';

export default function Cart() {
  const store = useStore();
  const { products, cart } = store;

  // Initialize a mock cart if empty, just for demonstration purposes if needed, 
  // but let's use the actual cart from the store.
  
  // Compute enriched cart items (latest price and details from products list)
  const cartItems = useMemo(() => {
    return cart.map(cartItem => {
      const product = products.find(p => String(p.id) === String(cartItem.id));
      return product ? { ...product, qty: cartItem.qty } : null;
    }).filter(Boolean);
  }, [cart, products]);

  const updateQty = (id, delta) => {
    const updated = cart.map(item =>
      String(item.id) === String(id) ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    );
    updateStore('cart', updated);
  };

  const removeItem = (id) => {
    const updated = cart.filter(item => String(item.id) !== String(id));
    updateStore('cart', updated);
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

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
                <div key={item.id} className="cart-item-card card">
                  <Link to={`/shop`} className="cart-item-image-wrapper">
                    <img src={item.image} alt={item.name} />
                  </Link>
                  
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <div>
                        <span className="cart-item-category">{item.category}</span>
                        <Link to={`/shop`} className="cart-item-name">{item.name}</Link>
                        <p className="cart-item-meta">Material: {item.material}</p>
                      </div>
                      <span className="cart-item-price-unit">${item.price.toFixed(2)}</span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)} aria-label="Decrease quantity">
                          <span className="material-symbols-outlined">remove</span>
                        </button>
                        <span className="qty-display">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, 1)} aria-label="Increase quantity">
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>

                      <div className="cart-item-end">
                        <span className="cart-item-price-total">
                          ${(item.price * item.qty).toFixed(2)}
                        </span>
                        <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="Remove item">
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
              <span className="summary-value">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Estimated Shipping</span>
              <span className="summary-value">
                {shipping === 0 ? <span className="free-shipping-text">Free</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
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
