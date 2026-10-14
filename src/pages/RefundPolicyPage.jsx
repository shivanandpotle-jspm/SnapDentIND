import React from 'react';
import './PolicyPage.css';

export default function RefundPolicy() {
  return (
    <main className="policy-page container-max section-gap animate-fade-in-up">
      <div className="policy-header">
        <span className="policy-badge">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assignment_return</span>
          Customer Assurance
        </span>
        <h1 className="policy-title">Cancellation & Refund Policy</h1>
        <div className="policy-updated">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
          Last updated: October 14, 2026
        </div>
      </div>

      <div className="policy-security-banner">
        <span className="material-symbols-outlined banner-icon">currency_rupee</span>
        <div>
          <h4>Transparent Razorpay Refund Processing</h4>
          <p>
            All approved refunds are initiated through <strong>Razorpay</strong> and credited directly back to your original source of payment (Bank / Card / UPI) within <strong>5 to 7 working days</strong>.
          </p>
        </div>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Overview</h2>
          <p>
            At <strong>SnapDent India</strong>, customer satisfaction, clinical reliability, and surgical precision are at the core of our operations. We understand that circumstances may arise where you need to cancel an order or return a dental product. This policy outlines our cancellation windows, return criteria, and refund processing procedures.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Order Cancellation Policy</h2>
          <ul>
            <li>
              <strong>Cancellation Before Dispatch:</strong> You may cancel an order free of charge at any time before it has been dispatched from our fulfillment warehouse. To cancel, please contact customer support immediately at <a href="mailto:support@snapdent.in" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@snapdent.in</a> or WhatsApp <strong>+91 96652 00527</strong> with your Order ID.
            </li>
            <li>
              <strong>Cancellation After Dispatch:</strong> Once an order has been handed over to the courier partner and an AWB tracking number has been generated, it cannot be canceled in transit. You may refuse delivery upon arrival, or accept and initiate a return request in accordance with our return guidelines below.
            </li>
            <li>
              <strong>Cancellation by SnapDent India:</strong> We reserve the right to cancel an order due to stock unavailability, pricing errors, or inability to service the designated PIN code. In such cases, 100% of the paid amount will be refunded immediately.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Return Window & Eligibility</h2>
          <p>
            We offer a <strong>7-Day Return & Replacement Policy</strong> from the date of confirmed delivery.
          </p>
          <div className="policy-callout callout-warning">
            <strong>Important Clinical Hygiene & Sterility Notice:</strong>
            Because dental supplies, surgical instruments, and rotary files are clinical medical devices, items must be in their original, unadulterated manufacturer packaging with tamper-evident seals intact.
          </div>
          <p><strong>A product is eligible for return or replacement if:</strong></p>
          <ul>
            <li>It was received in a physically damaged or broken condition.</li>
            <li>It has manufacturing defects or operational malfunction upon first inspection.</li>
            <li>The wrong item, incorrect specification, or wrong size was delivered compared to your invoice.</li>
            <li>The package is unopened, unused, and has all original tags, manuals, and accessories intact.</li>
          </ul>

          <h3>Non-Returnable Items:</h3>
          <ul>
            <li>Sterile clinical consumables, suture needles, and surgical packs once the primary sterile blister seal is breached.</li>
            <li>Chemical bonding agents, dental composites, or cements with broken inner seals.</li>
            <li>Custom fabricated prosthetic components or personalized clinic orders.</li>
            <li>Items returned past the 7-day return window.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. How to Initiate a Return</h2>
          <ol>
            <li>
              <strong>Submit a Request:</strong> Within 7 days of delivery, email <a href="mailto:support@snapdent.in" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@snapdent.in</a> or message WhatsApp <strong>+91 96652 00527</strong> with your <strong>Order ID</strong>, description of the issue, and clear photographs/unboxing video of the product and outer packaging.
            </li>
            <li>
              <strong>Return Verification:</strong> Our quality assurance team will review your request within 24 to 48 business hours.
            </li>
            <li>
              <strong>Reverse Pickup:</strong> Upon approval, we will schedule a reverse pickup through our logistics partners at no extra cost to you. If reverse pickup is unavailable in your area, you may courier it to our fulfillment address, and we will reimburse reasonable freight costs.
            </li>
          </ol>
        </section>

        <section className="policy-section">
          <h2>5. Refund Mode & Timelines via Razorpay</h2>
          <p>
            Once the returned item is received at our inspection facility and passes quality checks, the refund is approved immediately.
          </p>
          <ul>
            <li>
              <strong>Refund Method:</strong> Refunds are processed directly back to the <strong>original payment method</strong> used at checkout via the <strong>Razorpay payment gateway</strong>.
            </li>
            <li>
              <strong>Turnaround Time:</strong>
              <ul>
                <li><strong>UPI (Google Pay, PhonePe, Paytm):</strong> 2 to 4 business days.</li>
                <li><strong>Net Banking & Debit/Credit Cards:</strong> 5 to 7 business days (depending on your issuing bank's clearing cycle).</li>
              </ul>
            </li>
            <li>
              <strong>Full Refund:</strong> If an item was damaged, defective, or incorrectly sent, you will receive a full 100% refund including original shipping charges.
            </li>
            <li>
              <strong>No Cash Refunds:</strong> For compliance and accounting integrity, cash refunds are strictly not supported.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. Contact for Cancellations & Returns</h2>
          <p>For immediate support with returns, replacements, or refund status tracking, please reach out to our dedicated support desk:</p>
          
          <div className="policy-officer-card">
            <p><strong>SnapDent India Customer Care</strong></p>
            <p><strong>Email:</strong> <a href="mailto:support@snapdent.in" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@snapdent.in</a></p>
            <p><strong>Phone / WhatsApp:</strong> +91 96652 00527</p>
            <p><strong>Hours:</strong> Monday – Saturday: 10:00 AM – 6:30 PM IST</p>
            <p><strong>Address:</strong> Mumbai, Maharashtra, India</p>
          </div>
        </section>
      </div>
    </main>
  );
}
