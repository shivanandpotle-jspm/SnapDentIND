import { validationResult } from 'express-validator';

/**
 * Middleware that checks express-validator results and returns 400 on failure.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array().map(e => e.msg).join('. '),
      details: errors.array(),
    });
  }
  next();
};
