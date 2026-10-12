import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutStepper from '../components/CheckoutStepper';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../api/cart';
import { useStore } from '../store';
import './Checkout.css';

export default function Shipping() {
  const store = useStore();
  const appliedDiscount = store.appliedDiscount;
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
    state: 'Maharashtra',
    phone: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const saved = localStorage.getItem('snapdent_shipping');
    if (saved) {
      setFormData(JSON.parse(saved));
    }

    getCart().then(data => {
      if (data.cart.length === 0) {
        navigate('/cart');
      } else {
        setCartItems(data.cart);
      }
      setLoading(false);
    }).catch(() => {
      navigate('/cart');
    });
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('snapdent_shipping', JSON.stringify(formData));
    navigate('/payment');
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = subtotal * (appliedDiscount.value / 100);
    } else {
      discountAmount = appliedDiscount.value;
    }
  }

  const total = Math.max(0, subtotal - discountAmount) + shipping;

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading checkout...</div>;

  return (
    <main className="checkout-page container-max section-gap animate-fade-in-up">
      <CheckoutStepper current={1} />

      <div className="checkout-layout">
        <div className="checkout-form-wrap card-elevated">
          <h2 className="checkout-title">Shipping Address</h2>
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-form-row">
              <div className="contact-field">
                <label className="sidebar-label">First Name</label>
                <input type="text" className="input-field" placeholder="John" required 
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="contact-field">
                <label className="sidebar-label">Last Name</label>
                <input type="text" className="input-field" placeholder="Doe" required 
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
            <div className="contact-field">
              <label className="sidebar-label">Street Address</label>
              <input type="text" className="input-field" placeholder="123 Main St" required 
                value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
            </div>
            <div className="checkout-form-row">
              <div className="contact-field">
                <label className="sidebar-label">City</label>
                <input type="text" className="input-field" placeholder="Mumbai" required 
                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="contact-field">
                <label className="sidebar-label">Postal Code</label>
                <input type="text" className="input-field" placeholder="400001" required 
                  value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />
              </div>
            </div>
            <div className="checkout-form-row">
              <div className="contact-field">
                <label className="sidebar-label">State</label>
                <select className="input-field" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                  <option>Karnataka</option>
                  <option>Tamil Nadu</option>
                </select>
              </div>
              <div className="contact-field">
                <label className="sidebar-label">Phone</label>
                <input type="tel" className="input-field" placeholder="+91 xxxxxxxxxx" required 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="checkout-actions">
              <Link to="/cart" className="btn btn-ghost">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                Back to Cart
              </Link>
              <button type="submit" className="btn btn-primary">Continue to Payment</button>
            </div>
          </form>
        </div>

        <aside className="checkout-summary card-elevated">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-row"><span className="summary-label">Subtotal</span><span className="summary-value">₹{subtotal.toFixed(2)}</span></div>
          {appliedDiscount && (
            <div className="summary-row" style={{ color: 'var(--primary)' }}>
              <span className="summary-label">Discount ({appliedDiscount.code})</span>
              <span className="summary-value">-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row"><span className="summary-label">Shipping</span><span className="summary-value">
            {shipping === 0 ? <span className="free-shipping-text">Free</span> : `₹${shipping.toFixed(2)}`}
          </span></div>
          <div className="summary-divider" />
          <div className="summary-row summary-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
        </aside>
      </div>
    </main>
  );
}
