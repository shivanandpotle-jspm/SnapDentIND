import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount
} from '../controllers/discount.controller.js';

const router = Router();

router.get('/', getDiscounts);
router.post('/', protect, adminOnly, createDiscount);
router.put('/:id', protect, adminOnly, updateDiscount);
router.delete('/:id', protect, adminOnly, deleteDiscount);

export default router;
