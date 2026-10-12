import User from '../models/User.js';
import Product from '../models/Product.js';

/**
 * GET /api/cart — Get user's cart with product details
 */
export const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    const cart = user.cart
      .filter(item => item.product) // filter out deleted products
      .map(item => ({
        id: item.product._id,
        cartItemId: item._id,
        name: item.product.name,
        price: item.product.discountPrice || item.product.price,
        image: item.product.images[0]?.url || '',
        category: item.product.category,
        material: item.product.material,
        inStock: item.product.inStock,
        qty: item.qty,
        variant: item.variant || '',
      }));

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart — Add item to cart
 */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty = 1, variant = '' } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const user = await User.findById(req.user._id);
    const existingIdx = user.cart.findIndex(
      item => item.product.toString() === productId && (item.variant || '') === variant
    );

    if (existingIdx > -1) {
      user.cart[existingIdx].qty += qty;
    } else {
      user.cart.push({ product: productId, qty, variant });
    }

    await user.save();

    // Return populated cart
    await user.populate('cart.product');
    const cart = user.cart.filter(item => item.product).map(item => ({
      id: item.product._id,
      cartItemId: item._id,
      name: item.product.name,
      price: item.product.discountPrice || item.product.price,
      image: item.product.images[0]?.url || '',
      category: item.product.category,
      material: item.product.material,
      inStock: item.product.inStock,
      qty: item.qty,
      variant: item.variant || '',
    }));

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/cart/:itemId — Update item quantity
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { qty } = req.body;
    const user = await User.findById(req.user._id);

    const item = user.cart.find(
      item => item._id.toString() === req.params.itemId
    );

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not in cart.' });
    }

    item.qty = Math.max(1, qty);
    await user.save();

    await user.populate('cart.product');
    const cart = user.cart.filter(item => item.product).map(item => ({
      id: item.product._id,
      cartItemId: item._id,
      name: item.product.name,
      price: item.product.discountPrice || item.product.price,
      image: item.product.images[0]?.url || '',
      category: item.product.category,
      material: item.product.material,
      inStock: item.product.inStock,
      qty: item.qty,
      variant: item.variant || '',
    }));

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/:itemId — Remove item from cart
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(
      item => item._id.toString() !== req.params.itemId
    );
    await user.save();

    await user.populate('cart.product');
    const cart = user.cart.filter(item => item.product).map(item => ({
      id: item.product._id,
      cartItemId: item._id,
      name: item.product.name,
      price: item.product.discountPrice || item.product.price,
      image: item.product.images[0]?.url || '',
      category: item.product.category,
      material: item.product.material,
      inStock: item.product.inStock,
      qty: item.qty,
      variant: item.variant || '',
    }));

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart — Clear cart
 */
export const clearCart = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.json({ success: true, cart: [] });
  } catch (error) {
    next(error);
  }
};
