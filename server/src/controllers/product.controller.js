import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { uploadToDrive, deleteFromDrive } from '../config/gdrive.js';

/**
 * GET /api/products — List products with search, filter, pagination, sort
 */
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, subcategory, inStock, badge, sort, page = 1, limit = 50 } = req.query;

    const filter = { isVisible: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (badge) filter.badge = badge;

    // Sort options
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'name') sortObj = { name: 1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('vendorId', 'name companyName')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:slug — Get single product by slug
 */
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products — Create product (Admin)
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name, category, subcategory, price, discountPrice,
      description, material, sku, stock, badge, isVisible, isFeatured, image,
    } = req.body;

    const productData = {
      name, category, subcategory, price: Number(price),
      description, material, sku,
      stock: stock ? Number(stock) : 50,
      badge: badge || '',
      isVisible: isVisible !== false,
      isFeatured: isFeatured === true,
    };

    if (discountPrice) productData.discountPrice = Number(discountPrice);

    // If an image URL is provided directly (for seeding/placeholder purposes)
    if (image) {
      productData.images = [{ url: image, driveFileId: '' }];
    }

    // Set vendor ownership
    if (req.user.role === 'vendor') {
      productData.vendorId = req.user._id;
    }

    const product = await Product.create(productData);

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id — Update product (Admin)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const {
      name, category, subcategory, price, discountPrice,
      description, material, sku, stock, badge, inStock, isVisible, isFeatured,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    // Vendor ownership check
    if (req.user.role === 'vendor' && product.vendorId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You are not authorized to edit this product.' });
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (description !== undefined) product.description = description;
    if (material !== undefined) product.material = material;
    if (sku !== undefined) product.sku = sku;
    if (stock !== undefined) product.stock = Number(stock);
    if (badge !== undefined) product.badge = badge;
    if (inStock !== undefined) product.inStock = inStock;
    if (isVisible !== undefined) product.isVisible = isVisible;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;

    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id — Delete product (Admin)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    // Vendor ownership check — vendors can only delete their own products
    if (req.user.role === 'vendor' && product.vendorId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You are not authorized to delete this product.' });
    }

    // Delete images from Google Drive and local storage fallback
    for (const img of product.images) {
      if (img.driveFileId) {
        await deleteFromDrive(img.driveFileId);
      } else if (img.url && img.url.includes('/uploads/')) {
        const filename = img.url.split('/uploads/')[1];
        const filepath = path.resolve('public/uploads', filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    }

    await product.deleteOne();

    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products/:id/images — Upload product images to Google Drive (Admin)
 */
export const uploadProductImages = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    // Vendor ownership check
    if (req.user.role === 'vendor' && product.vendorId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'You are not authorized to modify this product.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No images provided.' });
    }

    const uploadedImages = [];
    for (const file of req.files) {
      const { url, driveFileId } = await uploadToDrive(file.buffer, file.originalname, file.mimetype);
      uploadedImages.push({ url, driveFileId });
    }

    product.images.push(...uploadedImages);
    await product.save();

    res.json({ success: true, images: product.images });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/my — Get products owned by the current vendor
 */
export const getMyProducts = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const filter = { vendorId: req.user._id };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products/bulk — Bulk create products (Admin)
 */
export const bulkCreateProducts = async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, error: 'No products provided.' });
    }

    const formattedProducts = products.map(p => ({
      name: p.name,
      category: p.category,
      subcategory: p.subcategory || '',
      price: Number(p.price) || 0,
      description: p.description || '',
      material: p.material || '',
      sku: p.sku || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      stock: Number(p.stock) || 50,
      isVisible: p.isVisible !== false,
      inStock: (Number(p.stock) || 50) > 0,
      isFeatured: p.isFeatured === true,
      vendorId: req.user.role === 'vendor' ? req.user._id : undefined
    }));

    const created = await Product.create(formattedProducts);
    res.status(201).json({ success: true, count: created.length });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products/:id/reviews — Create a new review
 */
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, error: 'Product already reviewed.' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    next(error);
  }
};
