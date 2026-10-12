import User from '../models/User.js';
import Product from '../models/Product.js';
import { DEFAULT_VENDOR_PERMISSIONS, ALL_PERMISSIONS } from '../middleware/permissions.js';

/**
 * GET /api/admin/vendors — List all vendors with approval status counts
 */
export const getVendors = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = { role: 'vendor' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      if (status === 'approved') {
        filter.$or = [
          { approvalStatus: 'approved' },
          { approvalStatus: { $exists: false } },
        ];
      } else {
        filter.approvalStatus = status;
      }
    }

    const vendors = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with product count and normalize approvalStatus
    const enriched = await Promise.all(
      vendors.map(async (vendor) => {
        const productCount = await Product.countDocuments({ vendorId: vendor._id });
        return {
          ...vendor,
          productCount,
          approvalStatus: vendor.approvalStatus || 'approved',
        };
      })
    );

    // Calculate status counts
    const [pendingCount, approvedCount, rejectedCount, totalCount] = await Promise.all([
      User.countDocuments({ role: 'vendor', approvalStatus: 'pending' }),
      User.countDocuments({ role: 'vendor', $or: [{ approvalStatus: 'approved' }, { approvalStatus: { $exists: false } }] }),
      User.countDocuments({ role: 'vendor', approvalStatus: 'rejected' }),
      User.countDocuments({ role: 'vendor' }),
    ]);

    res.json({
      success: true,
      vendors: enriched,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/vendors/:id — Get vendor details
 */
export const getVendor = async (req, res, next) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' })
      .select('-password')
      .lean();

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found.' });
    }

    const products = await Product.find({ vendorId: vendor._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      vendor: {
        ...vendor,
        approvalStatus: vendor.approvalStatus || 'approved',
      },
      products,
      allPermissions: ALL_PERMISSIONS,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/vendors — Create vendor account (Directly approved by admin)
 */
export const createVendor = async (req, res, next) => {
  try {
    const { name, email, password, companyName, permissions, phone, businessCategory, businessDescription, taxId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered.' });
    }

    const vendor = await User.create({
      name,
      email,
      password,
      role: 'vendor',
      companyName: companyName || '',
      phone: phone || '',
      businessCategory: businessCategory || '',
      businessDescription: businessDescription || '',
      taxId: taxId || '',
      permissions: permissions || DEFAULT_VENDOR_PERMISSIONS,
      approvalStatus: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        companyName: vendor.companyName,
        approvalStatus: vendor.approvalStatus,
        permissions: vendor.permissions,
        isActive: vendor.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/vendors/:id — Update vendor info
 */
export const updateVendor = async (req, res, next) => {
  try {
    const { name, email, companyName, isActive, password, phone, businessCategory, businessDescription, taxId } = req.body;
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found.' });
    }

    if (name !== undefined) vendor.name = name;
    if (email !== undefined) vendor.email = email;
    if (companyName !== undefined) vendor.companyName = companyName;
    if (phone !== undefined) vendor.phone = phone;
    if (businessCategory !== undefined) vendor.businessCategory = businessCategory;
    if (businessDescription !== undefined) vendor.businessDescription = businessDescription;
    if (taxId !== undefined) vendor.taxId = taxId;
    if (isActive !== undefined) vendor.isActive = isActive;
    if (password) vendor.password = password;

    await vendor.save();

    res.json({
      success: true,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        companyName: vendor.companyName,
        approvalStatus: vendor.approvalStatus,
        permissions: vendor.permissions,
        isActive: vendor.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/vendors/:id/approve — Approve a pending vendor
 */
export const approveVendor = async (req, res, next) => {
  try {
    const { permissions } = req.body;
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found.' });
    }

    vendor.approvalStatus = 'approved';
    vendor.isActive = true;
    vendor.rejectionReason = '';
    vendor.approvedAt = new Date();
    vendor.approvedBy = req.user._id;

    if (permissions && Array.isArray(permissions)) {
      vendor.permissions = permissions.filter(p => ALL_PERMISSIONS.includes(p));
    }

    await vendor.save();

    res.json({
      success: true,
      message: `Vendor "${vendor.name}" has been approved.`,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        companyName: vendor.companyName,
        approvalStatus: vendor.approvalStatus,
        isActive: vendor.isActive,
        permissions: vendor.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/vendors/:id/reject — Reject a vendor application
 */
export const rejectVendor = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found.' });
    }

    vendor.approvalStatus = 'rejected';
    vendor.isActive = false;
    vendor.rejectionReason = reason || 'Your application did not meet our current requirements.';

    await vendor.save();

    res.json({
      success: true,
      message: `Vendor "${vendor.name}" application rejected.`,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        approvalStatus: vendor.approvalStatus,
        rejectionReason: vendor.rejectionReason,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/vendors/:id/permissions — Update vendor permissions
 */
export const updateVendorPermissions = async (req, res, next) => {
  try {
    const { permissions } = req.body;
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found.' });
    }

    const valid = (permissions || []).filter(p => ALL_PERMISSIONS.includes(p));
    vendor.permissions = valid;
    await vendor.save();

    res.json({
      success: true,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        permissions: vendor.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/vendors/:id — Disable vendor (soft delete)
 */
export const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found.' });
    }

    vendor.isActive = false;
    await vendor.save();

    res.json({ success: true, message: 'Vendor disabled.' });
  } catch (error) {
    next(error);
  }
};
