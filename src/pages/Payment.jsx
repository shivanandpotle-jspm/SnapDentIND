import { Link, useNavigate } from 'react-router-dom';
import CheckoutStepper from '../components/CheckoutStepper';
import { useStore, updateStore } from '../store';
import './Checkout.css';

export default function Payment() {
  const navigate = useNavigate();
  const store = useStore();
  const { cart, products, orders } = store;

  const cartItems = cart.map(cartItem => {
    const product = products.find(p => String(p.id) === String(cartItem.id));
    return product ? { ...product, qty: cartItem.qty } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    const newOrder = {
      id: `SD-${Date.now().toString().slice(-8)}`,
      customer: 'John Doe',
      items: cartItems.length,
      total: total,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
    
    updateStore('orders', [newOrder, ...orders]);
    updateStore('cart', []);
    navigate('/order-success');
  };

  return (
    <main className="checkout-page container-max section-gap animate-fade-in-up">
      <CheckoutStepper current={2} />

      <div className="checkout-layout">
        <div className="checkout-form-wrap card-elevated">
          <h2 className="checkout-title">Payment Method</h2>

          <div className="payment-methods">
            {[
              { id: 'card', label: 'Credit / Debit Card', icon: 'credit_card' },
              { id: 'upi', label: 'UPI Payment', icon: 'qr_code_2' },
              { id: 'netbanking', label: 'Net Banking', icon: 'account_balance' },
              { id: 'cod', label: 'Cash on Delivery', icon: 'payments' },
            ].map(m => (
              <label key={m.id} className="payment-method card">
                <input type="radio" name="payment" defaultChecked={m.id === 'card'} />
                <span className="material-symbols-outlined payment-method-icon">{m.icon}</span>
                <span className="payment-method-label">{m.label}</span>
              </label>
            ))}
          </div>

          <div className="payment-card-fields">
            <div className="contact-field">
              <label className="sidebar-label">Card Number</label>
              <input type="text" className="input-field" placeholder="4242 4242 4242 4242" />
            </div>
            <div className="checkout-form-row">
              <div className="contact-field">
                <label className="sidebar-label">Expiry</label>
                <input type="text" className="input-field" placeholder="MM/YY" />
              </div>
              <div className="contact-field">
                <label className="sidebar-label">CVV</label>
                <input type="text" className="input-field" placeholder="123" />
              </div>
            </div>
          </div>

          <div className="checkout-actions">
            <Link to="/shipping" className="btn btn-ghost">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              Back to Shipping
            </Link>
            <button onClick={handlePlaceOrder} className="btn btn-primary" disabled={cartItems.length === 0}>Place Order</button>
          </div>
        </div>

        <aside className="checkout-summary card-elevated">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-row"><span className="summary-label">Subtotal</span><span className="summary-value">${subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span className="summary-label">Shipping</span><span className="summary-value free-shipping-text">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="summary-divider" />
          <div className="summary-row summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </aside>
      </div>
    </main>
  );
}
