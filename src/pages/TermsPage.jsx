import React from 'react';

export default function TermsOfService() {
  return (
    <div className="container-max" style={{ padding: '40px 20px' }}>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginTop: '20px' }}>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>2. Products and Services</h2>
        <p>We strive to display our products and their colors as accurately as possible. However, the actual colors you see will depend on your monitor, and we cannot guarantee that your monitor's display of any color will be accurate. We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction.</p>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>3. Payment and Pricing</h2>
        <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</p>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>4. Governing Law</h2>
        <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India.</p>
      </section>
    </div>
  );
}
