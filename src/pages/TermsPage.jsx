import React from 'react';
import './PolicyPage.css';

export default function TermsOfService() {
  return (
    <main className="policy-page container-max section-gap animate-fade-in-up">
      <div className="policy-header">
        <span className="policy-badge">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>gavel</span>
          Legal & Merchant Terms
        </span>
        <h1 className="policy-title">Terms & Conditions</h1>
        <div className="policy-updated">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
          Last updated: October 14, 2026
        </div>
      </div>

      <div className="policy-security-banner">
        <span className="material-symbols-outlined banner-icon">verified</span>
        <div>
          <h4>Certified E-Commerce Merchant Terms</h4>
          <p>
            These Terms & Conditions constitute a legally binding agreement between you and <strong>SnapDent India</strong> in compliance with the <strong>Indian Contract Act, 1872</strong>, the <strong>Information Technology Act, 2000</strong>, and <strong>Reserve Bank of India (RBI)</strong> payment gateway directives.
          </p>
        </div>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Introduction & Agreement to Terms</h2>
          <p>
            Welcome to <strong>SnapDent India</strong> ("SnapDent", "we", "us", or "our"), accessible at <strong>snapdent.in</strong>. We operate an online e-commerce platform specializing in the supply and distribution of dental instruments, clinical equipment, surgical accessories, and consumable supplies.
          </p>
          <p>
            By accessing our website, creating an account, browsing our product catalog, or placing an order, you agree to be bound by these <strong>Terms & Conditions</strong>, together with our <a href="/privacy-policy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</a>, <a href="/shipping-policy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Shipping Policy</a>, and <a href="/cancellation-refund-policy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Cancellation & Refund Policy</a>. If you do not accept these terms in their entirety, you must discontinue using our platform immediately.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Eligibility & Professional Account Use</h2>
          <p>To use this website and purchase clinical dental supplies, you acknowledge and agree that:</p>
          <ul>
            <li>You are at least 18 years of age and legally competent to enter into a binding contract under the laws of India.</li>
            <li>You are a qualified dental healthcare professional, clinic, hospital, dental technician, medical institution, or authorized purchasing agent.</li>
            <li>All account registration information you provide (name, email, clinic address, phone number, GSTIN) is truthful, accurate, and kept up-to-date.</li>
            <li>You are solely responsible for maintaining the confidentiality of your login credentials and password, and for all activities that occur under your account.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Product Information, Pricing & Taxes</h2>
          <ul>
            <li>
              <strong>Product Descriptions:</strong> We make every effort to display the specifications, dimensions, materials, and colors of dental products accurately. However, actual packaging or minor aesthetic finishes may vary slightly depending on manufacturer updates.
            </li>
            <li>
              <strong>Pricing & Currency:</strong> All prices listed on SnapDent India are stated in <strong>Indian National Rupees (INR / ₹)</strong>.
            </li>
            <li>
              <strong>GST Compliance:</strong> Prices displayed clearly specify applicable Goods and Services Tax (GST). Valid tax invoices are issued with every order containing our GSTIN and your GSTIN (if provided at checkout).
            </li>
            <li>
              <strong>Price Changes & Errors:</strong> Prices and stock availability are subject to change without prior notice. In the rare event an item is erroneously listed at an incorrect price due to typographical or technical error, SnapDent reserves the right to cancel the order and provide a full refund.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Online Payment Gateway & Razorpay Compliance</h2>
          <div className="policy-callout callout-info">
            <strong>Payment Processing Notice:</strong> SnapDent India partners with <strong>Razorpay Software Private Limited ("Razorpay")</strong>, an RBI-licensed and regulated payment aggregator, to process all online transactions securely.
          </div>
          <ul>
            <li>
              <strong>Accepted Payment Modes:</strong> Unified Payments Interface (UPI - Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards (Visa, MasterCard, RuPay, Maestro), Net Banking (across 50+ Indian banks), and RBI-approved prepaid wallets.
            </li>
            <li>
              <strong>Data Protection & Card Security:</strong> SnapDent India <u>never</u> collects, stores, or handles sensitive card numbers, CVVs, or NetBanking credentials on our servers. All financial data is transmitted directly to Razorpay's <strong>PCI-DSS Level 1</strong> certified, 256-bit SSL encrypted vault.
            </li>
            <li>
              <strong>Legitimate Use:</strong> You agree and warrant that you are legally authorized to use the payment method employed. SnapDent shall not be liable for any unauthorized use of your credit/debit card or banking account by third parties.
            </li>
            <li>
              <strong>Order Confirmation:</strong> An order is deemed successfully placed only upon receipt of payment authorization confirmation from Razorpay.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Order Acceptance, Modification & Cancellation</h2>
          <ul>
            <li>
              <strong>Order Acceptance:</strong> Receipt of an electronic order confirmation does not signify our final acceptance of your order. SnapDent reserves the right to accept, limit quantities, or decline your order for legitimate reasons (e.g., unavailability of stock, inability to verify prescription/credentials, or unserviceable delivery locations).
            </li>
            <li>
              <strong>Cancellation by Customer:</strong> You may cancel an order before it has been dispatched by contacting our customer care. Once an order is dispatched from our fulfillment center, it cannot be canceled and must be processed under our <a href="/cancellation-refund-policy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Refund Policy</a>.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. Shipping & Doorstep Delivery</h2>
          <p>
            Delivery of products shall be made to the address specified by you at checkout. Shipping timelines, freight charges, and carrier responsibilities are governed by our dedicated <a href="/shipping-policy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Shipping & Delivery Policy</a>:
          </p>
          <ul>
            <li>Standard dispatch within 24–48 business hours.</li>
            <li>Estimated delivery within 3–7 business days across India.</li>
            <li>Free standard shipping on orders above ₹500; flat ₹50 shipping fee on orders below ₹500.</li>
            <li>Risk of loss transfers to the customer once the courier confirms successful delivery.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>7. Returns, Replacements & Refunds</h2>
          <p>
            Due to the clinical, sterile, and hygiene-sensitive nature of dental instruments and consumables, returns are governed by strict medical hygiene standards:
          </p>
          <ul>
            <li>Eligible defective, damaged, or wrong items can be returned within <strong>7 days</strong> of delivery, provided original sterile packaging, labels, and seals remain intact and unused.</li>
            <li>Approved refunds are credited directly back to the original payment source via <strong>Razorpay within 5–7 working days</strong>.</li>
            <li>For complete terms, please refer to our <a href="/cancellation-refund-policy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Cancellation, Return & Refund Policy</a>.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>8. Professional Clinical Disclaimers & Limitation of Liability</h2>
          <ul>
            <li>
              <strong>Medical Disclaimer:</strong> Products sold on SnapDent India are intended strictly for clinical, laboratory, and dental practice use by licensed healthcare practitioners. SnapDent India is not responsible for any clinical outcomes, complications, or improper use of instruments by untrained personnel.
            </li>
            <li>
              <strong>Liability Cap:</strong> To the maximum extent permitted by applicable Indian law, the maximum aggregate liability of SnapDent India for any claim arising out of or related to an order shall not exceed the total amount paid by the customer for the specific product giving rise to the dispute.
            </li>
            <li>
              <strong>Indirect Damages:</strong> Under no circumstances shall SnapDent India be liable for indirect, punitive, special, or consequential damages, loss of business, or clinical downtime.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>9. Intellectual Property</h2>
          <p>
            All trademarks, logos, trade names, graphics, software, code, product descriptions, and visual media on <strong>snapdent.in</strong> are the exclusive property of SnapDent India or its licensed partners and suppliers. Any unauthorized reproduction, scraping, copying, or reverse-engineering is strictly prohibited under the <strong>Copyright Act, 1957</strong> and relevant Indian intellectual property laws.
          </p>
        </section>

        <section className="policy-section">
          <h2>10. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms & Conditions and all related commercial agreements shall be governed by, interpreted, and construed in accordance with the <strong>laws of the Republic of India</strong>.
          </p>
          <p>
            In the event of any legal dispute, controversy, or claim arising between the parties, the courts located in <strong>Mumbai, Maharashtra, India</strong> shall have sole and exclusive jurisdiction.
          </p>
        </section>

        <section className="policy-section">
          <h2>11. Contact & Customer Grievances</h2>
          <p>If you have any questions, clarifications, or complaints regarding these Terms, please reach out to our legal and customer support desk:</p>
          
          <div className="policy-officer-card">
            <p><strong>SnapDent India Support & Legal Desk</strong></p>
            <p><strong>Address:</strong> Mumbai, Maharashtra, India</p>
            <p><strong>Email:</strong> <a href="mailto:support@snapdent.in" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@snapdent.in</a></p>
            <p><strong>Telephone / WhatsApp:</strong> +91 96652 00527</p>
            <p><strong>Hours of Operation:</strong> Monday to Saturday: 10:00 AM – 6:30 PM IST</p>
          </div>
        </section>
      </div>
    </main>
  );
}
