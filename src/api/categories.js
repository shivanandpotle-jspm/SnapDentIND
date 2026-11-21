import { get, post, put, del } from './client.js';

export const getCategories = () => get('/categories');
export const createCategory = (data) => post('/categories', data);
export const updateCategory = (id, data) => put(`/categories/${id}`, data);
export const deleteCategory = (id) => del(`/categories/${id}`);
