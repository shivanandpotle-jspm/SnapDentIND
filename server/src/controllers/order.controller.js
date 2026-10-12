import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import getRazorpay from '../config/razorpay.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/email.service.js';
import { generateInvoicePDF } from '../utils/invoice.js';
import ContactMessage from '../models/ContactMessage.js';

/**
 * POST /api/orders — Create order + Razorpay payment order
 */
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, discountAmount = 0, discountCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in order.' });
    }

    // Validate items and compute totals from DB prices
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ success: false, error: `Product ${item.product} not found.` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, error: `Insufficient stock for "${product.name}".` });
      }

      const price = product.discountPrice || product.price;
      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        qty: item.qty,
        variant: item.variant || '',
        image: product.images[0]?.url || '',
      });
      subtotal += price * item.qty;
    }

    const shipping = subtotal > 500 ? 0 : 50;
    const tax = 0; // Can add GST calculation later
    const total = Math.max(0, subtotal - discountAmount) + shipping + tax;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount: discountAmount,
      discountCode,
      shipping,
      tax,
      total,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    // Deduct stock
    for (const item of orderItems) {
      const updatedProduct = await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty },
      }, { new: true });

      if (updatedProduct && updatedProduct.stock <= 0) {
        await ContactMessage.create({
          name: 'System Alerts',
          email: 'system@snapdent.com',
          subject: `Stock Out Alert: ${updatedProduct.name}`,
          message: `The product "${updatedProduct.name}" (SKU: ${updatedProduct.sku}) is now out of stock following Order #${order.orderId}. Please restock.`
        });
      }
    }

    // Clear user's cart
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    // Create Razorpay order if payment method is not COD
    let razorpayOrder = null;
    if (paymentMethod !== 'cod') {
      const razorpay = getRazorpay();
      if (razorpay) {
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(total * 100), // Amount in paise
          currency: 'INR',
          receipt: order.orderId,
        });
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();
      }
    } else {
      // COD — mark as confirmed
      order.status = 'confirmed';
      order.paymentStatus = 'pending';
      order.statusHistory.push({ status: 'confirmed', note: 'COD order confirmed' });
      await order.save();
    }

    // Send confirmation email for COD immediately
    if (paymentMethod === 'cod') {
      try {
        const invoiceBuffer = await generateInvoicePDF(order);
        await sendOrderConfirmationEmail(req.user.email, req.user.name, order, invoiceBuffer);
      } catch (emailErr) {
        console.error('Order confirmation email failed:', emailErr.message);
      }
    }

    res.status(201).json({
      success: true,
      order,
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/verify-payment — Verify Razorpay payment signature
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed.' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', note: 'Payment verified via Razorpay' });
    await order.save();

    // Send confirmation email with invoice for prepaid orders
    await order.populate('user', 'name email');
    try {
      const invoiceBuffer = await generateInvoicePDF(order);
      await sendOrderConfirmationEmail(order.user.email, order.user.name, order, invoiceBuffer);
    } catch (emailErr) {
      console.error('Order confirmation email failed:', emailErr.message);
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders — List all orders (Admin)
 */
export const getOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status.toLowerCase();
    }
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/my-orders — User's own orders
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders, razorpayKeyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id — Get single order
 */
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }
    // Ensure user can only see their own order (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id/status — Update order status (Admin)
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

    if (status === 'cancelled' && order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    await order.save();

    // Send status update email
    try {
      await sendOrderStatusEmail(order.user.email, order.user.name, order);
    } catch (emailErr) {
      console.error('Order status email failed:', emailErr.message);
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id/invoice — Download order invoice PDF
 */
export const downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }
    
    // Ensure user can only download their own invoice (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized.' });
    }

    const pdfBuffer = await generateInvoicePDF(order);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.orderId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
