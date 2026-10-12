import multer from 'multer';

import path from 'path';

// Use memory storage to save files in memory for Drive upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'), false);
  }
};

/**
 * Multer middleware for product image uploads.
 * - Max 5 files per request
 * - Max 5MB per file
 * - Images only (JPEG, PNG, WebP, GIF)
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
});
