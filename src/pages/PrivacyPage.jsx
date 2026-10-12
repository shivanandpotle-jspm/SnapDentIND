import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container-max" style={{ padding: '40px 20px' }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginTop: '20px' }}>
        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested, delivery notes, and other information you choose to provide.</p>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>2. Use of Information</h2>
        <p>We may use the information we collect about you to:</p>
        <ul>
          <li>Provide, maintain, and improve our Services.</li>
          <li>Process transactions and send you related information, including confirmations and receipts.</li>
          <li>Send you technical notices, updates, security alerts, and support and administrative messages.</li>
          <li>Respond to your comments, questions, and requests, and provide customer service.</li>
        </ul>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>3. Sharing of Information</h2>
        <p>We may share the information we collect about you as described in this Privacy Policy or as described at the time of collection or sharing, including as follows: With third party service providers who need access to such information to carry out work on our behalf.</p>
      </section>
      
      <section style={{ marginTop: '20px' }}>
        <h2>4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at support@snapdent.com.</p>
      </section>
    </div>
  );
}
