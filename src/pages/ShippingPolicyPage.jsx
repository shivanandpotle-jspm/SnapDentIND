import React from 'react';
import './PolicyPage.css';

export default function ShippingPolicy() {
  return (
    <main className="policy-page container-max section-gap animate-fade-in-up">
      <div className="policy-header">
        <span className="policy-badge">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>local_shipping</span>
          Logistics & Delivery
        </span>
        <h1 className="policy-title">Shipping & Delivery Policy</h1>
        <div className="policy-updated">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
          Last updated: October 14, 2026
        </div>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Shipping Coverage</h2>
          <p>
            SnapDent India ships dental equipment, clinical instruments, and consumables across all major states and Union Territories throughout <strong>India</strong>. We deliver to thousands of PIN codes through our trusted third-party courier and express freight partners.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Processing & Dispatch Timelines</h2>
          <ul>
            <li>
              <strong>Order Processing:</strong> Standard in-stock orders are processed, quality-inspected, and packed within <strong>24 to 48 business hours</strong> of successful payment confirmation.
            </li>
            <li>
              <strong>Working Days:</strong> Orders are processed and dispatched Monday through Saturday, excluding national holidays and declared public holidays.
            </li>
            <li>
              <strong>Heavy or Specialized Equipment:</strong> High-value or heavy clinic installations (such as dental chairs, compressors, or autoclaves) may require special freight scheduling and can take an additional 2–3 business days for dispatch.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Delivery Timelines (Estimated)</h2>
          <p>Once dispatched from our fulfillment facility, estimated delivery times are as follows:</p>
          <ul>
            <li><strong>Metro Cities (Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata, Pune):</strong> 2 to 4 business days.</li>
            <li><strong>Tier 2 & Tier 3 Cities:</strong> 4 to 7 business days.</li>
            <li><strong>Remote / Northeast / Island Regions:</strong> 7 to 10 business days.</li>
          </ul>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            *Please note that delivery timelines are estimates and may occasionally be influenced by unforeseen weather disturbances, regional holidays, or logistical constraints outside our control.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. Shipping Charges</h2>
          <div className="policy-callout callout-info">
            <strong>Standard Shipping Rates:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li><strong>Orders Above ₹500:</strong> 100% FREE Standard Shipping.</li>
              <li><strong>Orders Below ₹500:</strong> Flat nominal shipping fee of ₹50 applied at checkout.</li>
            </ul>
          </div>
          <p>All shipping rates are transparently shown on the Cart and Checkout pages prior to payment confirmation.</p>
        </section>

        <section className="policy-section">
          <h2>5. Order Tracking</h2>
          <p>
            As soon as your package is dispatched, you will receive an automated shipping notification with:
          </p>
          <ul>
            <li>Courier Partner Name (e.g. Blue Dart, Delhivery, DTDC, India Post).</li>
            <li>Consignment Airway Bill (AWB) / Tracking Number.</li>
            <li>Direct tracking link to monitor your shipment in real-time.</li>
          </ul>
          <p>You can also track active orders anytime from your <a href="/profile" style={{ color: 'var(--primary)', fontWeight: 600 }}>My Orders</a> dashboard.</p>
        </section>

        <section className="policy-section">
          <h2>6. Damaged or Tampered Shipments</h2>
          <p>
            If you receive a package that appears visibly damaged, torn, or tampered with at the time of delivery:
          </p>
          <ul>
            <li>Please refuse to accept the package from the courier agent, or note the damage on the delivery acknowledgment slip.</li>
            <li>Take clear photographs or a short unboxing video of the condition.</li>
            <li>Notify our support team within <strong>48 hours</strong> at <a href="mailto:support@snapdent.in" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@snapdent.in</a> or WhatsApp at <strong>+91 96652 00527</strong> with your order ID. We will promptly arrange an express replacement.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
