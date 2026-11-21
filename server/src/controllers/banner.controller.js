import Banner from '../models/Banner.js';

/**
 * GET /api/banners — Get all banners
 */
export const getBanners = async (req, res, next) => {
  try {
    const filter = {};
    // If not authenticated or not admin, only show active banners
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'Active';
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/banners — Create banner (Admin)
 */
export const createBanner = async (req, res, next) => {
  try {
    const { tag, title, description, buttonText, link, image, status, order } = req.body;

    const banner = await Banner.create({
      tag: tag || 'FEATURED INNOVATION',
      title,
      description,
      buttonText: buttonText || 'DISCOVER MORE',
      link: link || '/shop',
      image,
      status: status || 'Active',
      order: Number(order) || 0,
    });

    res.status(201).json({
      success: true,
      banner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/banners/:id — Update banner (Admin)
 */
export const updateBanner = async (req, res, next) => {
  try {
    const { tag, title, description, buttonText, link, image, status, order } = req.body;

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, error: 'Banner not found.' });
    }

    if (tag !== undefined) banner.tag = tag;
    if (title !== undefined) banner.title = title;
    if (description !== undefined) banner.description = description;
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (link !== undefined) banner.link = link;
    if (image !== undefined) banner.image = image;
    if (status !== undefined) banner.status = status;
    if (order !== undefined) banner.order = Number(order);

    await banner.save();

    res.json({
      success: true,
      banner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/banners/:id — Delete banner (Admin)
 */
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, error: 'Banner not found.' });
    }

    await banner.deleteOne();

    res.json({
      success: true,
      message: 'Banner deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
