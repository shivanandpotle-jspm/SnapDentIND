import { get, post, put } from './client.js';

export const createOrder = (data) => post('/orders', data);
export const verifyPayment = (data) => post('/orders/verify-payment', data);
export const getMyOrders = () => get('/orders/my-orders');
export const getAllOrders = (params = '') => get(`/orders${params ? '?' + params : ''}`);
export const getOrder = (id) => get(`/orders/${id}`);
export const updateOrderStatus = (id, status, note) => put(`/orders/${id}/status`, { status, note });
