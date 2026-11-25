import { useState, useEffect, useCallback } from 'react';
import { get } from './api/client.js';
import { categoryTree, products as fallbackProducts } from './data/products.js';

/**
 * API-backed store. Falls back to local data if API is unavailable.
 * Keeps the reactive useStore() pattern the frontend already depends on.
 */

const loadLocalProducts = () => {
  try {
    const saved = localStorage.getItem('snapdent_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading snapdent_products', e);
  }
  return fallbackProducts || [];
};

const loadLocalCategories = () => {
  try {
    const saved = localStorage.getItem('snapdent_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading snapdent_categories', e);
  }
  return categoryTree || [];
};

const defaultBanners = [
  {
    id: 'default-1',
    tag: 'FEATURED INNOVATION',
    title: 'Anatomic Healing Abutment',
    description: 'Create a natural gum contour, support inter-dental papilla formation, and improve aesthetic outcomes with our precision-engineered anatomic healing abutments.',
    buttonText: 'DISCOVER MORE',
    link: '/shop',
    image: '/images/hero_featured.jpg',
    status: 'Active',
  }
];

const loadLocalBanners = () => {
  try {
    const saved = localStorage.getItem('snapdent_banners');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading snapdent_banners', e);
  }
  return defaultBanners;
};

const store = {
  products: loadLocalProducts(),
  categories: loadLocalCategories(),
  banners: loadLocalBanners(),
  orders: [],
  cart: [],
  discounts: [],
  appliedDiscount: null,
  settings: {
    storeName: 'SnapDent India',
    contactEmail: 'support@snapdent.com',
    contactPhone: '+91 98765 43210',
    logoUrl: '/logo.png',
    address: 'Mumbai, Maharashtra',
    currency: 'INR',
    taxRate: 18,
    lowStockThreshold: 10,
  },
  // Keep static assets that don't come from API
  heroImages: {
    main: '/images/hero_main.jpg',
    detail: '/images/hero_detail.jpg',
    featured: '/images/hero_featured.jpg',
    trust: '/images/hero_trust.jpg',
    about: 'https://placehold.co/800x600/f8fafc/1A3673?text=About+Us',
    aboutDetail: 'https://placehold.co/800x600/f8fafc/1A3673?text=Our+Story',
    contact: 'https://placehold.co/800x600/f8fafc/1A3673?text=Map+Location',
  },
  categoryImages: [
    { name: 'Surgical Accessories', image: 'https://placehold.co/400x400/E31E24/FFFFFF?text=Surgical' },
    { name: 'Dental Equipment', image: 'https://placehold.co/400x400/1A3673/FFFFFF?text=Equipment' },
    { name: 'Instruments', image: 'https://placehold.co/400x400/1e3a8a/FFFFFF?text=Instruments' },
    { name: 'Endodontics', image: 'https://placehold.co/400x400/cbd5e1/1A3673?text=Endodontics' },
  ],
  testimonials: [
    { name: 'Dr. Sarah Jenkins', role: 'Lead Prosthodontist', initials: 'DR', quote: '"The quality of the digital prosthetic components has significantly improved our workflow and patient outcomes. Truly top-tier."', color: 'secondary', featured: false },
    { name: 'Dr. Michael Chen', role: 'Implant Specialist', initials: 'MC', quote: '"Snapdent India\'s Korean (Oss.) compatible components are consistently precise. Highly recommend their entire product line for serious practitioners."', color: 'primary', featured: true },
    { name: 'Elena Patel', role: 'Clinic Director', initials: 'EP', quote: '"The customer service paired with the high-quality general dental products makes Snapdent India our go-to supplier for everything."', color: 'tertiary', featured: false },
  ],
  logos: { main: '/logo.png', footer: '/logo.png' },
  implantBrands: [
    'Korean (Oss.)', 'Korean (Den.)', 'Israel (Adn.)', 'Israel (Nor.)',
    'Korean (Do.)', 'Swiss (Str.)', 'Swiss (Nob.)', 'Swiss (Al-Bio (IH))',
    'Swiss(Neode.)', 'Korean (Cowell.)',
  ],
  loaded: false,
};

const listeners = new Set();

export const updateStore = (key, data) => {
  store[key] = data;
  try {
    if (key === 'products' || key === 'categories' || key === 'discounts' || key === 'cart' || key === 'banners') {
      localStorage.setItem(`snapdent_${key}`, JSON.stringify(data));
    }
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
  listeners.forEach(l => l());
};

/**
 * Fetch only categories from API for fast sub-200ms updates
 */
export const loadCategoriesFromAPI = async () => {
  try {
    const res = await get('/categories');
    if (res?.categories) {
      const mapped = res.categories.map(c => ({
        id: c._id || c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        description: c.description,
        color: c.color,
        items: c.items,
      }));
      store.categories = mapped;
      try {
        localStorage.setItem('snapdent_categories', JSON.stringify(mapped));
      } catch (e) {}
      listeners.forEach(l => l());
      return mapped;
    }
  } catch (e) {
    console.warn('Error fetching categories:', e.message);
  }
};

/**
 * Fetch only banners from API for fast sub-200ms updates
 */
export const loadBannersFromAPI = async () => {
  try {
    const res = await get('/banners');
    if (res?.banners) {
      store.banners = res.banners;
      try {
        localStorage.setItem('snapdent_banners', JSON.stringify(res.banners));
      } catch (e) {}
      listeners.forEach(l => l());
      return res.banners;
    }
  } catch (e) {
    console.warn('Error fetching banners:', e.message);
  }
};

/**
 * Fetch products and categories from the API and populate the store.
 */
export const loadStoreFromAPI = async () => {
  try {
    const [productsRes, categoriesRes, discountsRes, bannersRes] = await Promise.all([
      get('/products?limit=200'),
      get('/categories'),
      get('/discounts'),
      get('/banners').catch(() => ({ banners: [] })),
    ]);

    // Map API products to the format the frontend expects
    const mappedProducts = productsRes.products.map(p => {
      const imgList = (p.images && p.images.length > 0)
        ? p.images.map(img => (typeof img === 'string' ? img : img.url)).filter(Boolean)
        : (p.image ? [p.image] : []);
      const primaryImg = imgList[0] || p.image || 'https://placehold.co/400x400/f8fafc/1A3673?text=Product';

      return {
        id: p._id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        subcategory: p.subcategory || '',
        price: p.discountPrice || p.price,
        originalPrice: p.price,
        description: p.description,
        image: primaryImg,
        images: imgList.length > 0 ? imgList : [primaryImg],
        badge: p.badge || null,
        material: p.material || '',
        inStock: p.inStock,
        stock: p.stock,
        sku: p.sku,
        isFeatured: p.isFeatured,
        vendor: p.vendorId ? { id: p.vendorId._id, name: p.vendorId.name, companyName: p.vendorId.companyName } : null,
      };
    });

    // Map API categories to the format the frontend expects
    const mappedCategories = categoriesRes.categories.map(c => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      description: c.description,
      color: c.color,
      items: c.items,
    }));

    store.products = mappedProducts;
    store.categories = mappedCategories;
    store.discounts = discountsRes.discounts || [];
    if (bannersRes?.banners && bannersRes.banners.length > 0) {
      store.banners = bannersRes.banners;
    }
    store.loaded = true;
    try {
      localStorage.setItem('snapdent_products', JSON.stringify(mappedProducts));
      localStorage.setItem('snapdent_categories', JSON.stringify(mappedCategories));
      if (bannersRes?.banners && bannersRes.banners.length > 0) {
        localStorage.setItem('snapdent_banners', JSON.stringify(bannersRes.banners));
      }
    } catch (e) {}
    listeners.forEach(l => l());
  } catch (error) {
    console.warn('API unavailable, using local catalog fallback:', error.message);
    if (!store.products || store.products.length === 0) {
      store.products = loadLocalProducts();
      store.categories = loadLocalCategories();
    }
    store.loaded = true;
    listeners.forEach(l => l());
  }
};

export const useStore = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const l = () => setTick(t => t + 1);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);

  // Load from API on first use
  useEffect(() => {
    if (!store.loaded) {
      loadStoreFromAPI();
    }
  }, []);

  return store;
};
