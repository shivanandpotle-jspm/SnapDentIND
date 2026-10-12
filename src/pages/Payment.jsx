import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutStepper from '../components/CheckoutStepper';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../api/cart';
import { createOrder, verifyPayment } from '../api/orders';
import { useStore } from '../store';
import './Checkout.css';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Payment() {
  const store = useStore();
  const appliedDiscount = store.appliedDiscount;
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const saved = localStorage.getItem('snapdent_shipping');
    if (!saved) {
      navigate('/shipping');
      return;
    }
    setShippingAddress(JSON.parse(saved));

    getCart().then(data => {
      if (data.cart.length === 0) {
        navigate('/cart');
      } else {
        setCartItems(data.cart);
      }
      setLoading(false);
    }).catch(() => navigate('/cart'));
  }, [isAuthenticated, navigate]);

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

  const handlePlaceOrder = async () => {
    setError('');
    setProcessing(true);

    try {
      const items = cartItems.map(i => ({ product: i.id, qty: i.qty }));
      const res = await createOrder({ 
        items, 
        shippingAddress, 
        paymentMethod,
        discountAmount,
        discountCode: appliedDiscount?.code
      });

      if (paymentMethod === 'cod') {
        navigate('/order-success', { state: { orderId: res.order._id } });
        return;
      }

      if (!res.razorpayOrder) {
        throw new Error('Razorpay configuration missing on server');
      }

      const resLoaded = await loadRazorpay();
      if (!resLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you offline?');
      }

      const options = {
        key: res.razorpayKeyId,
        amount: res.razorpayOrder.amount,
        currency: 'INR',
        name: 'SnapDent India',
        description: 'Order Payment',
        order_id: res.razorpayOrder.id,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: res.order.orderId
            });
            navigate('/order-success', { state: { orderId: res.order._id } });
          } catch (err) {
            setError('Payment verification failed.');
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: shippingAddress?.phone
        },
        theme: {
          color: '#E31E24'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        setError(response.error.description || 'Payment failed.');
        setProcessing(false);
      });
      paymentObject.open();

    } catch (err) {
      setError(err.message || 'Failed to place order');
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading payment...</div>;

  return (
    <main className="checkout-page container-max section-gap animate-fade-in-up">
      <CheckoutStepper current={2} />

      <div className="checkout-layout">
        <div className="checkout-form-wrap card-elevated">
          <h2 className="checkout-title">Payment Method</h2>

          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}

          <div className="payment-methods">
            {[
              { id: 'card', label: 'Credit / Debit Card (Razorpay)', icon: 'credit_card' },
              { id: 'upi', label: 'UPI Payment', icon: 'qr_code_2' },
              { id: 'netbanking', label: 'Net Banking', icon: 'account_balance' },
              { id: 'cod', label: 'Cash on Delivery', icon: 'payments' },
            ].map(m => (
              <label key={m.id} className="payment-method card">
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === m.id} 
                  onChange={() => setPaymentMethod(m.id)} 
                />
                <span className="material-symbols-outlined payment-method-icon">{m.icon}</span>
                <span className="payment-method-label">{m.label}</span>
              </label>
            ))}
          </div>

          <div className="checkout-actions" style={{ marginTop: 32 }}>
            <Link to="/shipping" className="btn btn-ghost" disabled={processing}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              Back to Shipping
            </Link>
            <button onClick={handlePlaceOrder} className="btn btn-primary" disabled={processing || cartItems.length === 0}>
              {processing ? 'Processing...' : 'Place Order securely'}
            </button>
          </div>
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
          <div className="summary-row"><span className="summary-label">Shipping</span><span className="summary-value free-shipping-text">{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span></div>
          <div className="summary-divider" />
          <div className="summary-row summary-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
        </aside>
      </div>
    </main>
  );
}
