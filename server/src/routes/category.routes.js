import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';

const router = Router();

router.get('/', getCategories);
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
