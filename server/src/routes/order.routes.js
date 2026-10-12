import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { createOrder, getOrders, getMyOrders, getOrder, updateOrderStatus, verifyPayment, downloadInvoice } from '../controllers/order.controller.js';

const router = Router();

router.post('/', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/', protect, adminOnly, getOrders);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.get('/:id/invoice', protect, downloadInvoice);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
