import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/permissions.js';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/banner.controller.js';

const router = Router();

// Optional auth for GET: if admin token is sent, they see disabled banners too
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      await protect(req, res, () => next());
    } else {
      next();
    }
  } catch (err) {
    next();
  }
};

router.get('/', optionalAuth, getBanners);
router.post('/', protect, requireRole('admin'), createBanner);
router.put('/:id', protect, requireRole('admin'), updateBanner);
router.delete('/:id', protect, requireRole('admin'), deleteBanner);

export default router;
