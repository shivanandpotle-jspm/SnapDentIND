import { get, put } from './client.js';

export const getDashboardStats = () => get('/admin/dashboard');
export const getCustomers = (params = '') => get(`/admin/customers${params ? '?' + params : ''}`);
export const getSettings = () => get('/admin/settings');
export const updateSettings = (data) => put('/admin/settings', data);
