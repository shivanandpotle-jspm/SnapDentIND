import { get, post, put, del } from './client.js';

export const getBanners = (params = '') => get(`/banners${params ? '?' + params : ''}`);
export const createBanner = (data) => post('/banners', data);
export const updateBanner = (id, data) => put(`/banners/${id}`, data);
export const deleteBanner = (id) => del(`/banners/${id}`);
