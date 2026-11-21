import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';


import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import cartRoutes from './routes/cart.routes.js';
import discountRoutes from './routes/discount.routes.js';
import contactRoutes from './routes/contact.routes.js';
import adminRoutes from './routes/admin.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import bannerRoutes from './routes/banner.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
const allowedOrigins = [
  'https://snapdent.in',
  'https://www.snapdent.in',
  'https://snapdent-frontend.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, curl, Postman, or requests without origin
    if (!origin) return callback(null, true);
    
    // Allow exact matches or subdomains of snapdent.in / onrender.com
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.snapdent.in') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(['/api/', '/'], limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: { error: 'Too many authentication attempts, please try again later.' },
});
app.use(['/api/auth/login', '/auth/login'], authLimiter);
app.use(['/api/auth/register', '/auth/register'], authLimiter);
app.use(['/api/auth/forgot-password', '/auth/forgot-password'], authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve static files
app.use('/uploads', express.static('public/uploads'));

// Health check & Root
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get(['/', '/api'], (req, res) => {
  res.json({
    name: 'SnapDent India API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

import { upload } from './middleware/upload.js';
import { uploadToCloudinary } from './config/cloudinary.js';

// Generic Upload Route
app.post(['/api/upload', '/upload'], upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  try {
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ success: true, url, publicId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Routes (mounted on both /api/* and /* for full compatibility)
const routes = [
  ['/auth', authRoutes],
  ['/products', productRoutes],
  ['/categories', categoryRoutes],
  ['/orders', orderRoutes],
  ['/cart', cartRoutes],
  ['/discounts', discountRoutes],
  ['/contact', contactRoutes],
  ['/admin', adminRoutes],
  ['/admin/vendors', vendorRoutes],
  ['/vendor', vendorRoutes],
  ['/banners', bannerRoutes],
];

routes.forEach(([routePath, router]) => {
  app.use(`/api${routePath}`, router);
  app.use(routePath, router);
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 SnapDent API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

start();
