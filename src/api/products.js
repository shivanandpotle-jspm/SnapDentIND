import { get, post, put, del, upload } from './client.js';

export const getProducts = (params = '') => get(`/products${params ? '?' + params : ''}`);
export const getProduct = (slug) => get(`/products/${slug}`);
export const createProduct = (data) => post('/products', data);
export const updateProduct = (id, data) => put(`/products/${id}`, data);
export const deleteProduct = (id) => del(`/products/${id}`);
export const bulkUploadProducts = (products) => post('/products/bulk', { products });
export const uploadProductImages = (id, formData) => upload(`/products/${id}/images`, formData);
export const addProductReview = (id, data) => post(`/products/${id}/reviews`, data);
