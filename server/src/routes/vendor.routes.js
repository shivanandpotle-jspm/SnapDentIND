import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getVendors, getVendor, createVendor, updateVendor,
  updateVendorPermissions, deleteVendor, approveVendor, rejectVendor,
} from '../controllers/vendor.controller.js';

const router = Router();

// All vendor management routes are admin-only
router.use(protect, adminOnly);

router.get('/', getVendors);
router.get('/:id', getVendor);
router.post('/', createVendor);
router.put('/:id', updateVendor);
router.put('/:id/approve', approveVendor);
router.put('/:id/reject', rejectVendor);
router.put('/:id/permissions', updateVendorPermissions);
router.delete('/:id', deleteVendor);

export default router;
