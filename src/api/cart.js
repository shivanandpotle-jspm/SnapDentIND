import { get, post, put, del } from './client.js';

export const getCart = () => get('/cart');
export const addToCart = (productId, qty = 1, variant = '') => post('/cart', { productId, qty, variant });
export const updateCartItem = (itemId, qty) => put(`/cart/${itemId}`, { qty });
export const removeFromCart = (itemId) => del(`/cart/${itemId}`);
export const clearCart = () => del('/cart');
