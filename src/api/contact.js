import { get, put } from './client';

export const getContactMessages = (params = '') => get(`/contact${params ? '?' + params : ''}`);
export const markMessageAsRead = (id) => put(`/contact/${id}/read`);
