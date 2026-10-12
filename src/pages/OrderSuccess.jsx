import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CheckoutStepper from '../components/CheckoutStepper';
import { getOrder } from '../api/orders';
import './Checkout.css';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/shop');
      return;
    }

    getOrder(orderId).then(data => {
      setOrder(data.order);
      setLoading(false);
    }).catch(() => {
      navigate('/shop');
    });
  }, [orderId, navigate]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading your order...</div>;
  if (!order) return null;

  return (
    <main className="checkout-page container-max section-gap">
      <CheckoutStepper current={3} />

      <div className="order-success-card card-elevated animate-scale-in">
        <div className="order-success-icon">
          <span className="material-symbols-outlined">check_circle</span>
        </div>
        <h1 className="order-success-title">Order Confirmed!</h1>
        <p className="order-success-subtitle">Thank you for your purchase. Your order has been placed successfully.</p>

        <div className="order-details">
          <div className="order-detail-row">
            <span>Order Number</span>
            <strong>{order.orderId}</strong>
          </div>
          <div className="order-detail-row">
            <span>Estimated Delivery</span>
            <strong>3-5 Business Days</strong>
          </div>
          <div className="order-detail-row">
            <span>Total Paid</span>
            <strong>₹{order.total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="order-success-actions" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => {
            const token = localStorage.getItem('snapdent_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            fetch(`${apiUrl}/orders/${order._id}/invoice`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.blob())
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Invoice-${order.orderId}.pdf`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            })
            .catch(err => alert('Failed to download invoice'));
          }} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, cursor: 'pointer', border: 'none' }}>
            <span className="material-symbols-outlined">download</span>
            Download Invoice
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/shop" className="btn btn-secondary" style={{ flex: 1 }}>Continue Shopping</Link>
            <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>Go Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
