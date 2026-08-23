import { Link } from 'react-router-dom';
import CheckoutStepper from '../components/CheckoutStepper';
import './Checkout.css';

export default function OrderSuccess() {
  const orderNumber = `SD-${Date.now().toString().slice(-8)}`;

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
            <strong>{orderNumber}</strong>
          </div>
          <div className="order-detail-row">
            <span>Estimated Delivery</span>
            <strong>3-5 Business Days</strong>
          </div>
          <div className="order-detail-row">
            <span>Total Paid</span>
            <strong>$660.00</strong>
          </div>
        </div>

        <div className="order-success-actions">
          <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
          <Link to="/" className="btn btn-secondary">Go Home</Link>
        </div>
      </div>
    </main>
  );
}
