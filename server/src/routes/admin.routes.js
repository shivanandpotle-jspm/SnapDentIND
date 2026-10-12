import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getDashboardStats, getCustomers, getSettings, updateSettings,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomers);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
