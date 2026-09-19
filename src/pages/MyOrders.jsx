import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders, verifyPayment } from '../api/orders';
import './MyOrders.css';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STEP_ICONS = {
  pending: 'hourglass_top',
  confirmed: 'check_circle',
  processing: 'settings',
  shipped: 'local_shipping',
  delivered: 'inventory_2',
};

export default function MyOrders() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);

  const [razorpayKeyId, setRazorpayKeyId] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    getMyOrders()
      .then(data => {
        setOrders(data.orders);
        if (data.razorpayKeyId) setRazorpayKeyId(data.razorpayKeyId);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const handleRetryPayment = async (order) => {
    try {
      const resLoaded = await loadRazorpay();
      if (!resLoaded) {
        alert('Razorpay SDK failed to load. Are you offline?');
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount: Math.round(order.total * 100),
        currency: 'INR',
        name: 'SnapDent India',
        description: 'Retry Order Payment',
        order_id: order.razorpayOrderId,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.orderId
            });
            // Update local state
            const updated = { ...order, status: 'confirmed', paymentStatus: 'paid' };
            setOrders(orders.map(o => o._id === order._id ? updated : o));
            setViewOrder(updated);
            alert('Payment Successful!');
          } catch (err) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: order.shippingAddress?.phone
        },
        theme: { color: '#E31E24' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        alert(response.error.description || 'Payment failed.');
      });
      paymentObject.open();

    } catch (err) {
      alert('Failed to initialize payment.');
    }
  };

  const statusCls = (s) => {
    const m = { delivered: 'active', processing: 'info', shipped: 'primary', pending: 'warning', cancelled: 'danger', confirmed: 'confirmed' };
    return m[s] || 'inactive';
  };

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);

  const getStepIndex = (status) => {
    const idx = ORDER_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  // ─── Loading State ──────────────────────
  if (loading) {
    return (
      <main className="my-orders-page container-max section-gap">
        <div className="orders-loading">
          <div className="orders-loading-spinner" />
          <p>Loading your orders...</p>
        </div>
      </main>
    );
  }

  // ─── Order Detail View ──────────────────
  if (viewOrder) {
    const currentStep = getStepIndex(viewOrder.status);

    return (
      <main className="my-orders-page container-max section-gap">
        <div className="order-detail-page">
          <button className="btn-back" onClick={() => setViewOrder(null)}>
            <span className="material-symbols-outlined">arrow_back</span> Back to Orders
          </button>

          <div className="detail-top-bar">
            <div>
              <h2>Order #{viewOrder.orderId}</h2>
              <span className="order-date-text">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
                Placed on {new Date(viewOrder.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {viewOrder.status === 'pending' && viewOrder.paymentMethod !== 'cod' && viewOrder.razorpayOrderId && (
                <button className="btn btn-primary" onClick={() => handleRetryPayment(viewOrder)} style={{ padding: '8px 16px', fontSize: '14px', height: 'auto' }}>
                  Complete Payment
                </button>
              )}
              <span className={`status-badge status-${statusCls(viewOrder.status)}`}>{viewOrder.status}</span>
            </div>
          </div>

          {/* Order Timeline */}
          {viewOrder.status !== 'cancelled' && (
            <div className="order-timeline">
              {ORDER_STEPS.map((step, i) => (
                <div key={step} style={{ display: 'contents' }}>
                  <div className={`timeline-step ${i < currentStep ? 'completed' : ''} ${i === currentStep ? 'active' : ''}`}>
                    <div className="timeline-icon">
                      <span className="material-symbols-outlined">
                        {i < currentStep ? 'check' : STEP_ICONS[step]}
                      </span>
                    </div>
                    <span className="timeline-label">{step}</span>
                  </div>
                  {i < ORDER_STEPS.length - 1 && (
                    <div className={`timeline-connector ${i < currentStep ? 'completed' : ''}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="detail-grid">
            {/* Left — Items */}
            <div className="detail-card">
              <h3>
                <span className="material-symbols-outlined">shopping_bag</span>
                Items Ordered ({viewOrder.items.length})
              </h3>
              <div className="detail-items-list">
                {viewOrder.items.map((item, idx) => (
                  <div key={idx} className="detail-item">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="detail-item-img" />
                      : <div className="detail-item-img" style={{ background: '#f1f5f9' }} />
                    }
                    <div className="detail-item-info">
                      <h4>{item.name}</h4>
                      {item.variant && <p className="detail-item-qty" style={{ color: 'var(--primary)' }}>Option: {item.variant}</p>}
                      <p className="detail-item-qty">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                    </div>
                    <span className="detail-item-price">₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Summary + Address */}
            <div>
              <div className="detail-card" style={{ marginBottom: 24 }}>
                <h3>
                  <span className="material-symbols-outlined">receipt</span>
                  Order Summary
                </h3>
                <div className="detail-summary-row"><span>Subtotal</span><span>₹{viewOrder.subtotal.toLocaleString()}</span></div>
                <div className="detail-summary-row"><span>Shipping</span><span>{viewOrder.shipping === 0 ? 'Free' : `₹${viewOrder.shipping.toLocaleString()}`}</span></div>
                <div className="detail-summary-row total"><span>Total</span><span>₹{viewOrder.total.toLocaleString()}</span></div>

                <div className="detail-payment">
                  <h4><span className="material-symbols-outlined">credit_card</span> Payment</h4>
                  <div className="payment-method-tag">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {viewOrder.paymentMethod === 'cod' ? 'payments' : 'credit_card'}
                    </span>
                    {viewOrder.paymentMethod}
                  </div>
                </div>
              </div>

              {viewOrder.shippingAddress && (
                <div className="detail-card">
                  <h3>
                    <span className="material-symbols-outlined">location_on</span>
                    Shipping Address
                  </h3>
                  <p style={{ color: 'var(--on-surface)', fontWeight: 600, marginBottom: 4 }}>
                    {viewOrder.shippingAddress.firstName} {viewOrder.shippingAddress.lastName}
                  </p>
                  <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7, margin: 0 }}>
                    {viewOrder.shippingAddress.street}<br />
                    {viewOrder.shippingAddress.city}, {viewOrder.shippingAddress.state} {viewOrder.shippingAddress.postalCode}<br />
                    Phone: {viewOrder.shippingAddress.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── Orders List View ───────────────────
  return (
    <main className="my-orders-page container-max section-gap animate-fade-in-up">
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="profile-hero-inner">
          <div className="profile-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div className="profile-info">
            <h1>{user?.name || 'Customer'}</h1>
            <p>{user?.email}</p>
          </div>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{orders.length}</span>
              <span className="profile-stat-label">Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="orders-section-header">
        <h2>
          <span className="material-symbols-outlined">history</span>
          Order History
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here.</p>
          <Link to="/shop" className="btn btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="order-cards">
          {orders.map(order => (
            <div key={order._id} className="order-card" onClick={() => setViewOrder(order)}>
              <div className="order-card-inner">
                <div className="order-card-left">
                  <div className="order-card-images">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <img key={idx} src={item.image} alt={item.name} />
                    ))}
                    {order.items.length > 3 && <div className="img-more">+{order.items.length - 3}</div>}
                  </div>
                  <div className="order-card-meta">
                    <span className="order-card-id">
                      #{order.orderId}
                      <span className={`status-badge status-${statusCls(order.status)}`}>{order.status}</span>
                    </span>
                    <span className="order-card-date">
                      <span className="material-symbols-outlined">schedule</span>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="order-card-items-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="order-card-right">
                  <span className="order-card-total">₹{order.total.toLocaleString()}</span>
                  <div className="order-card-arrow">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
