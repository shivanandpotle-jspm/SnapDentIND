import { Link } from 'react-router-dom';
import CheckoutStepper from '../components/CheckoutStepper';
import './Checkout.css';

export default function Shipping() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

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
                <input type="text" className="input-field" placeholder="John" required />
              </div>
              <div className="contact-field">
                <label className="sidebar-label">Last Name</label>
                <input type="text" className="input-field" placeholder="Doe" required />
              </div>
            </div>
            <div className="contact-field">
              <label className="sidebar-label">Street Address</label>
              <input type="text" className="input-field" placeholder="123 Main St" required />
            </div>
            <div className="checkout-form-row">
              <div className="contact-field">
                <label className="sidebar-label">City</label>
                <input type="text" className="input-field" placeholder="Mumbai" required />
              </div>
              <div className="contact-field">
                <label className="sidebar-label">Postal Code</label>
                <input type="text" className="input-field" placeholder="400001" required />
              </div>
            </div>
            <div className="checkout-form-row">
              <div className="contact-field">
                <label className="sidebar-label">State</label>
                <select className="input-field">
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                  <option>Karnataka</option>
                  <option>Tamil Nadu</option>
                </select>
              </div>
              <div className="contact-field">
                <label className="sidebar-label">Phone</label>
                <input type="tel" className="input-field" placeholder="+91 xxxxxxxxxx" required />
              </div>
            </div>
            <div className="checkout-actions">
              <Link to="/cart" className="btn btn-ghost">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                Back to Cart
              </Link>
              <Link to="/payment" className="btn btn-primary">Continue to Payment</Link>
            </div>
          </form>
        </div>

        <aside className="checkout-summary card-elevated">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-row"><span className="summary-label">Subtotal</span><span className="summary-value">$660.00</span></div>
          <div className="summary-row"><span className="summary-label">Shipping</span><span className="summary-value free-shipping-text">Free</span></div>
          <div className="summary-divider" />
          <div className="summary-row summary-total"><span>Total</span><span>$660.00</span></div>
        </aside>
      </div>
    </main>
  );
}
