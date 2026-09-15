import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, uploadProductImages,
} from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/:slug', getProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/images', protect, adminOnly, upload.array('images', 5), uploadProductImages);

export default router;
