import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

/**
 * GET /api/admin/dashboard — Dashboard stats
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalProducts, totalOrders, totalCustomers, categories] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Category.countDocuments({ isActive: true }),
    ]);

    const inStock = await Product.countDocuments({ inStock: true });
    const outOfStock = totalProducts - inStock;

    // Revenue calculation
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        inStock,
        outOfStock,
        pendingOrders,
        categories,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/customers — List customers
 */
export const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { role: 'customer' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with order data
    const enriched = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ user: customer._id });
        const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
        return {
          ...customer,
          orderCount: orders.length,
          totalSpent,
          lastOrder: orders[0]?.createdAt || null,
        };
      })
    );

    res.json({ success: true, customers: enriched });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/settings — Get store settings
 */
export const getSettings = async (req, res) => {
  // For now, return defaults. Could be stored in a Settings collection later.
  res.json({
    success: true,
    settings: {
      storeName: 'SnapDent India',
      contactEmail: 'support@snapdent.com',
      contactPhone: '+91 98765 43210',
      address: 'Mumbai, Maharashtra',
      currency: 'INR',
      taxRate: 18,
    },
  });
};

/**
 * PUT /api/admin/settings — Update store settings
 */
export const updateSettings = async (req, res) => {
  // Placeholder — would write to a Settings collection
  res.json({ success: true, message: 'Settings updated.', settings: req.body });
};
