import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { requirePermission, requireRole } from '../middleware/permissions.js';
import { upload } from '../middleware/upload.js';
import {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, uploadProductImages, bulkCreateProducts, createProductReview,
  getMyProducts,
} from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/my', protect, requireRole('vendor', 'admin'), getMyProducts);
router.get('/:slug', getProduct);
router.post('/bulk', protect, requireRole('admin', 'vendor'), bulkCreateProducts);
router.post('/', protect, requirePermission('product:create'), createProduct);
router.put('/:id', protect, requirePermission('product:update'), updateProduct);
router.delete('/:id', protect, requirePermission('product:delete'), deleteProduct);
router.post('/:id/images', protect, requirePermission('product:update'), upload.array('images', 5), uploadProductImages);
router.post('/:id/reviews', protect, createProductReview);

export default router;
