import { post, get, put } from './client.js';

export const loginUser = (email, password) => post('/auth/login', { email, password });
export const registerUser = (name, email, password) => post('/auth/register', { name, email, password });
export const adminLoginUser = (email, password) => post('/auth/admin/login', { email, password });
export const getProfile = () => get('/auth/me');
export const updateProfile = (data) => put('/auth/profile', data);
export const forgotPassword = (email) => post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => post(`/auth/reset-password/${token}`, { password });
