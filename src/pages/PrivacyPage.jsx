import React from 'react';
import './PolicyPage.css';

export default function PrivacyPolicy() {
  return (
    <main className="policy-page container-max section-gap animate-fade-in-up">
      <div className="policy-header">
        <span className="policy-badge">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
          Compliance & Data Protection
        </span>
        <h1 className="policy-title">Privacy Policy</h1>
        <div className="policy-updated">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
          Last updated: October 14, 2026
        </div>
      </div>

      <div className="policy-security-banner">
        <span className="material-symbols-outlined banner-icon">lock</span>
        <div>
          <h4>Bank-Grade Payment Security Guaranteed</h4>
          <p>
            SnapDent India uses <strong>Razorpay</strong>, an RBI-licensed payment aggregator with <strong>PCI-DSS Level 1</strong> compliance. Your sensitive debit/credit card credentials and banking pins are never stored on our servers.
          </p>
        </div>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Introduction & Scope</h2>
          <p>
            Welcome to <strong>SnapDent India</strong> ("we", "our", "us", or "SnapDent"), operating via <strong>snapdent.in</strong>. We are committed to safeguarding the privacy and confidential information of our dental practitioners, clinics, vendors, and online visitors.
          </p>
          <p>
            This Privacy Policy sets out how SnapDent collects, stores, processes, and protects your personal and transaction data in strict compliance with the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules)</strong>, and the <strong>Digital Personal Data Protection Act (DPDP Act)</strong> of India.
          </p>
          <p>
            By accessing our website, creating an account, or purchasing dental products through SnapDent India, you explicitly consent to the collection and use of your information in accordance with this policy.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Information We Collect</h2>
          <p>We collect only the information necessary to fulfill your orders, provide reliable clinical supplies, and maintain seamless customer service:</p>
          <ul>
            <li>
              <strong>Personal & Professional Details:</strong> Full Name, email address, mobile/telephone number, clinic or hospital name, professional designation, and GSTIN (if claiming business input tax credit).
            </li>
            <li>
              <strong>Shipping & Billing Address:</strong> Complete delivery street address, clinic name, city, state, postal code (PIN code), and contact person details.
            </li>
            <li>
              <strong>Order & Transaction Records:</strong> Products purchased, quantities, pricing, order dates, invoices, and shipment tracking numbers.
            </li>
            <li>
              <strong>Technical & Device Data:</strong> IP address, browser type and version, device operating system, login timestamps, and browsing patterns on our platform.
            </li>
            <li>
              <strong>Customer Support Communications:</strong> Queries, feedback, emails, and WhatsApp/phone interactions submitted through our support center.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Payment Processing & Razorpay Security (Mandatory Disclosure)</h2>
          <div className="policy-callout callout-info">
            <strong>Important Security Notice:</strong> SnapDent India <u>does NOT</u> collect, capture, or store your debit/credit card numbers, CVV codes, expiry dates, NetBanking credentials, or UPI MPINs on our servers.
          </div>
          <p>
            All online monetary transactions on SnapDent India are processed through our authorized payment partner, <strong>Razorpay Software Private Limited ("Razorpay")</strong>, an RBI-authorized Payment Aggregator.
          </p>
          <ul>
            <li>
              <strong>PCI-DSS Level 1 Compliance:</strong> Razorpay adheres to the highest global security benchmark (Payment Card Industry Data Security Standard - PCI-DSS Level 1), ensuring maximum protection against fraud and data theft.
            </li>
            <li>
              <strong>256-bit SSL Encryption:</strong> Every transaction is protected with end-to-end 256-bit SSL encryption during transit.
            </li>
            <li>
              <strong>Tokenization & Masking:</strong> In accordance with Reserve Bank of India (RBI) mandates, card information is tokenized and masked by card networks and the payment gateway.
            </li>
          </ul>
          <p>
            To understand how Razorpay manages and secures payment data, please refer to the official <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Razorpay Privacy Policy</a>.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. How We Use Your Information</h2>
          <p>We utilize the collected information strictly for legitimate commercial and regulatory purposes, including:</p>
          <ul>
            <li>Processing, packing, and dispatching your dental equipment and consumable orders.</li>
            <li>Generating official tax invoices and keeping accounting records in compliance with Indian GST regulations.</li>
            <li>Transmitting automated order confirmations, shipping updates, tracking links, and delivery notifications via Email and SMS.</li>
            <li>Providing technical assistance, product warranty guidance, and customer support.</li>
            <li>Detecting, preventing, and addressing fraudulent activities, unauthorized logins, and technical issues.</li>
            <li>Improving our website performance, inventory availability, and user experience.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Sharing & Disclosure of Information</h2>
          <p>
            <strong>We respect your privacy. SnapDent India never sells, rents, leases, or trades your personal information to third-party marketing companies.</strong>
          </p>
          <p>We share data exclusively with trusted third parties under stringent confidentiality agreements for operational execution:</p>
          <ul>
            <li>
              <strong>Payment Gateways:</strong> Razorpay, for authorizing, processing, and settling payments or issuing approved refunds.
            </li>
            <li>
              <strong>Logistics & Courier Partners:</strong> Certified shipping providers (e.g., Blue Dart, Delhivery, DTDC, India Post) solely for doorstep delivery and delivery OTP verification.
            </li>
            <li>
              <strong>Communication Gateways:</strong> Email and SMS delivery infrastructure providers (such as Resend) to dispatch transactional messages and OTPs.
            </li>
            <li>
              <strong>Statutory & Legal Requirements:</strong> When mandated by court orders, government authorities, or law enforcement under applicable Indian laws.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. Cookies & Tracking Technologies</h2>
          <p>
            Our website utilizes essential browser cookies and local storage tokens to enhance your shopping experience. These allow you to:
          </p>
          <ul>
            <li>Maintain items in your shopping cart while navigating between pages.</li>
            <li>Keep you securely logged in to your account.</li>
            <li>Remember shipping preferences and filter settings.</li>
          </ul>
          <p>
            You can configure your browser to decline cookies; however, certain interactive features of our store (such as cart persistence) may function suboptimally.
          </p>
        </section>

        <section className="policy-section">
          <h2>7. Data Security & Storage</h2>
          <p>
            We deploy multi-layered physical, technical, and administrative security measures to prevent unauthorized access, alteration, disclosure, or destruction of personal data:
          </p>
          <ul>
            <li>Secure Socket Layer (SSL/TLS) encryption across all web traffic.</li>
            <li>Cryptographic password hashing using salted bcrypt algorithms.</li>
            <li>Role-based access controls ensuring only authorized personnel access customer records.</li>
            <li>Encrypted cloud databases and regular security vulnerability assessments.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>8. Data Retention & User Rights</h2>
          <p>
            We retain your personal information for as long as your account remains active or as required by law (including maintaining accounting and tax audit records under Indian GST and Companies Act).
          </p>
          <p>You possess the following rights regarding your personal information:</p>
          <ul>
            <li><strong>Right to Access:</strong> Request a summary of your personal information stored with us.</li>
            <li><strong>Right to Rectification:</strong> Update or correct inaccurate or incomplete details via your account dashboard or support.</li>
            <li><strong>Right to Erasure:</strong> Request the deletion of your account and personal data, subject to statutory retention obligations.</li>
            <li><strong>Right to Opt-Out:</strong> Unsubscribe from non-essential promotional newsletters or marketing communications at any time.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>9. Grievance Officer & Redressal Mechanism</h2>
          <p>
            In accordance with the <strong>Information Technology Act, 2000</strong> and Rule 3(2) of the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, the contact details of our designated Grievance Officer are provided below:
          </p>
          
          <div className="policy-officer-card">
            <p><strong>Designation:</strong> Grievance Officer, SnapDent India</p>
            <p><strong>Registered Entity:</strong> SnapDent India</p>
            <p><strong>Address:</strong> Mumbai, Maharashtra, India</p>
            <p><strong>Email:</strong> <a href="mailto:support@snapdent.in" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@snapdent.in</a></p>
            <p><strong>Phone / WhatsApp:</strong> +91 96652 00527</p>
            <p><strong>Operating Hours:</strong> Monday – Saturday: 10:00 AM – 6:30 PM IST</p>
            <p><strong>Response Timeline:</strong> We acknowledge complaints within 48 hours and resolve grievances within 30 days of receipt.</p>
          </div>
        </section>

        <section className="policy-section">
          <h2>10. Updates to This Policy</h2>
          <p>
            SnapDent India reserves the right to amend this Privacy Policy periodically to reflect technological, operational, or legal developments. The updated date will always be displayed at the top of this page. Continued use of the platform after updates constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </main>
  );
}
