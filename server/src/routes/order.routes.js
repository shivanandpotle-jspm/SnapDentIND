import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  createOrder, verifyPayment, getOrders, getMyOrders, getOrder, updateOrderStatus,
} from '../controllers/order.controller.js';

const router = Router();

router.post('/', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, adminOnly, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
