import ContactMessage from '../models/ContactMessage.js';

/**
 * POST /api/contact — Submit contact form (public)
 */
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    const msg = await ContactMessage.create({ name, email, subject, message });
    res.status(201).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/contact — List all messages (Admin)
 */
export const getMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/contact/:id/read — Mark message as read (Admin)
 */
export const markAsRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!msg) {
      return res.status(404).json({ success: false, error: 'Message not found.' });
    }
    res.json({ success: true, message: msg });
  } catch (error) {
    next(error);
  }
};
