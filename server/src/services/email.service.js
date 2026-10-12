import { Resend } from 'resend';

let resendInstance = null;

const getResend = () => {
  if (resendInstance) return resendInstance;
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder') {
    console.warn('⚠ Resend API key not configured. Emails will not be sent.');
    return null;
  }
  resendInstance = new Resend(process.env.RESEND_API_KEY);
  return resendInstance;
};

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const resend = getResend();
    if (!resend) return;

    await resend.emails.send({
      from: `${process.env.FROM_NAME || 'SnapDent India'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to,
      subject,
      html,
      attachments,
    });
  } catch (error) {
    console.error(`Email send failed to ${to}:`, error.message);
    throw error;
  }
};

// ─── Email Templates ─────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f1f5f9; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #E31E24 0%, #1A3673 100%); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; }
    .footer { background: #f8fafc; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; padding: 14px 32px; background: #E31E24; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .order-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .order-table th, .order-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .order-table th { background: #f8fafc; font-weight: 600; color: #475569; }
    .total-row { font-weight: 700; font-size: 16px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    h2 { color: #1e293b; margin-top: 0; }
    p { color: #475569; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🦷 SnapDent India</h1>
      <p>Premium Dental Solutions</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SnapDent India. All rights reserved.</p>
      <p>Mumbai, Maharashtra, India</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Exported Email Functions ────────────────────────────────

export const sendVerificationEmail = async (email, name, verifyUrl) => {
  const html = baseTemplate(`
    <h2>Welcome to SnapDent India, ${name}! 🎉</h2>
    <p>Thank you for creating your account. Please verify your email address to get started.</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
    </p>
    <p style="font-size: 13px; color: #94a3b8;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
  `);
  await sendEmail(email, 'Verify your SnapDent India account', html);
};

export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const html = baseTemplate(`
    <h2>Password Reset Request</h2>
    <p>Hi ${name}, we received a request to reset your password.</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </p>
    <p style="font-size: 13px; color: #94a3b8;">This link expires in 1 hour. If you didn't request a reset, please ignore this email.</p>
  `);
  await sendEmail(email, 'Reset your SnapDent India password', html);
};

export const sendOrderConfirmationEmail = async (email, name, order, invoiceBuffer = null) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center;">${item.qty}</td>
      <td style="text-align: right;">₹${(item.price * item.qty).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = baseTemplate(`
    <h2>Order Confirmed! 🎉</h2>
    <p>Hi ${name}, your order <strong>${order.orderId}</strong> has been placed successfully.</p>
    
    <table class="order-table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr><td colspan="2">Subtotal</td><td style="text-align: right;">₹${order.subtotal.toLocaleString()}</td></tr>
        <tr><td colspan="2">Shipping</td><td style="text-align: right;">${order.shipping === 0 ? 'Free' : '₹' + order.shipping}</td></tr>
        <tr class="total-row"><td colspan="2">Total</td><td style="text-align: right;">₹${order.total.toLocaleString()}</td></tr>
      </tbody>
    </table>

    <p><strong>Shipping to:</strong> ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}</p>
    <p><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()} — ${order.paymentStatus}</p>
  `);
  
  const attachments = invoiceBuffer ? [{ filename: `Invoice-${order.orderId}.pdf`, content: invoiceBuffer }] : [];
  
  await sendEmail(email, `Order Confirmed — ${order.orderId}`, html, attachments);
};

export const sendOrderStatusEmail = async (email, name, order) => {
  const statusColors = {
    confirmed: '#16a34a', processing: '#2563eb', shipped: '#7c3aed',
    delivered: '#059669', cancelled: '#dc2626',
  };
  const color = statusColors[order.status] || '#475569';

  const html = baseTemplate(`
    <h2>Order Update</h2>
    <p>Hi ${name}, your order <strong>${order.orderId}</strong> status has been updated:</p>
    <p style="text-align: center; margin: 24px 0;">
      <span class="status-badge" style="background: ${color}20; color: ${color};">${order.status}</span>
    </p>
    <p>You can track your order in your account dashboard.</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${process.env.CLIENT_URL}/orders" class="btn">View Order</a>
    </p>
  `);
  await sendEmail(email, `Order ${order.orderId} — ${order.status}`, html);
};
