import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';

/**
 * POST /api/auth/register — Customer signup
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });

    // Generate verification token and send email
    const verifyToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
      await sendVerificationEmail(user.email, user.name, verifyUrl);
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message);
      // Don't block registration if email fails
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login — Customer login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/admin/login — Admin login
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }

    // Allow both admin and vendor to log in through this endpoint
    const user = await User.findOne({ email, role: { $in: ['admin', 'vendor'] } }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    if (user.role === 'vendor') {
      if (user.approvalStatus === 'pending') {
        return res.status(403).json({
          success: false,
          error: 'Your vendor account is pending admin approval. You will receive access once approved.',
          approvalStatus: 'pending',
        });
      }
      if (user.approvalStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          error: `Your vendor application was not approved.${user.rejectionReason ? ` Reason: ${user.rejectionReason}` : ''}`,
          approvalStatus: 'rejected',
          rejectionReason: user.rejectionReason,
        });
      }
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, error: 'Account is disabled. Contact admin.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName || '',
        permissions: user.permissions || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/register-vendor — Public vendor registration
 */
export const registerVendor = async (req, res, next) => {
  try {
    const { name, email, password, phone, companyName, businessCategory, businessDescription, taxId } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ success: false, error: 'Name, email, password, and company name are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered.' });
    }

    const vendor = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      companyName,
      businessCategory: businessCategory || '',
      businessDescription: businessDescription || '',
      taxId: taxId || '',
      role: 'vendor',
      approvalStatus: 'pending',
      isActive: false,
      permissions: ['product:view', 'product:create', 'product:update'],
    });

    res.status(201).json({
      success: true,
      message: 'Your vendor application has been submitted successfully and is pending administrator review.',
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        companyName: vendor.companyName,
        approvalStatus: vendor.approvalStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me — Get current user profile
 */
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      companyName: user.companyName || '',
      permissions: user.permissions || [],
      addresses: user.addresses,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
};

/**
 * PUT /api/auth/profile — Update profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (addresses) updates.addresses = addresses;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, error: 'Failed to send reset email.' });
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password/:token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      message: 'Password reset successful.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/verify-email/:token
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
};
