import Discount from '../models/Discount.js';

// @desc    Get all discounts
// @route   GET /api/discounts
// @access  Public (for active ones on home) / Admin (for all)
export const getDiscounts = async (req, res, next) => {
  try {
    const discounts = await Discount.find({}).sort('-createdAt');
    res.json({ success: true, discounts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a discount
// @route   POST /api/discounts
// @access  Private/Admin
export const createDiscount = async (req, res, next) => {
  try {
    const { name, type, value, startDate, endDate, category, code, status, showOnHome } = req.body;
    const discount = await Discount.create({
      name, type, value, startDate, endDate, category, code, status, showOnHome
    });
    res.status(201).json({ success: true, discount });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Discount code already exists' });
    }
    next(error);
  }
};

// @desc    Update a discount
// @route   PUT /api/discounts/:id
// @access  Private/Admin
export const updateDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!discount) return res.status(404).json({ success: false, error: 'Discount not found' });
    res.json({ success: true, discount });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Discount code already exists' });
    }
    next(error);
  }
};

// @desc    Delete a discount
// @route   DELETE /api/discounts/:id
// @access  Private/Admin
export const deleteDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) return res.status(404).json({ success: false, error: 'Discount not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
