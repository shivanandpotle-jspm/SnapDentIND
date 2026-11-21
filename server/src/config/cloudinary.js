import { v2 as cloudinary } from 'cloudinary';

/**
 * Initialize Cloudinary with environment variables.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file content
 * @param {string} fileName - Original filename (used for public_id)
 * @param {string} mimeType - MIME type (e.g. 'image/jpeg')
 * @returns {{ url: string, publicId: string }} Optimized URL and public ID
 */
export const uploadToCloudinary = async (fileBuffer, fileName, mimeType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'snapdent',
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }, // auto-optimize
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an image from Cloudinary by its public ID.
 * @param {string} publicId - The Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary image ${publicId}:`, error.message);
  }
};

export default cloudinary;
