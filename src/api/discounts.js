import { get, post, put, del } from './client';

export const getDiscounts = () => get('/discounts');
export const createDiscount = (data) => post('/discounts', data);
export const updateDiscount = (id, data) => put(`/discounts/${id}`, data);
export const deleteDiscount = (id) => del(`/discounts/${id}`);
