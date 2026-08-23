import { useState, useEffect } from 'react';
import { 
  products as initialProducts, 
  categoryTree as initialCategories, 
  heroImages as initialHeroImages, 
  categoryImages as initialCategoryImages, 
  testimonials as initialTestimonials, 
  logos as initialLogos,
  implantBrands as initialImplantBrands
} from './data/products';

const getInitialData = (key, fallback) => {
  const stored = localStorage.getItem(`snapdent_${key}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
};

const defaultSettings = {
  storeName: 'SnapDent India',
  contactEmail: 'support@snapdent.com',
  contactPhone: '+91 98765 43210',
  logoUrl: initialLogos?.main || 'https://cdn-icons-png.flaticon.com/512/3004/3004416.png',
  address: 'Mumbai, Maharashtra',
  currency: 'INR',
  taxRate: 18,
  notifications: {
    email: true,
    sms: false,
    orderUpdates: true,
    promotions: false
  }
};

const store = {
  products: getInitialData('products', initialProducts),
  categories: getInitialData('categories', initialCategories),
  orders: getInitialData('orders', []),
  settings: getInitialData('settings', defaultSettings),
  heroImages: initialHeroImages,
  categoryImages: initialCategoryImages,
  testimonials: initialTestimonials,
  logos: initialLogos,
  implantBrands: initialImplantBrands,
  cart: getInitialData('cart', [])
};

const listeners = new Set();

export const updateStore = (key, data) => {
  store[key] = data;
  localStorage.setItem(`snapdent_${key}`, JSON.stringify(data));
  listeners.forEach(l => l());
};

export const useStore = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick(t => t + 1);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return store;
};
