import Razorpay from 'razorpay';

let razorpayInstance = null;

const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;

  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
    console.warn('⚠ Razorpay credentials not configured. Payment features will be limited.');
    return null;
  }

  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log('✓ Razorpay initialized');
  return razorpayInstance;
};

export default getRazorpay;
