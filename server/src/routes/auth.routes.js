import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  register, login, adminLogin, getMe, updateProfile,
  forgotPassword, resetPassword, verifyEmail, registerVendor,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register-vendor', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  validate,
], registerVendor);

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], login);

router.post('/admin/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], adminLogin);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  validate,
], forgotPassword);

router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
], resetPassword);

router.get('/verify-email/:token', verifyEmail);

export default router;
