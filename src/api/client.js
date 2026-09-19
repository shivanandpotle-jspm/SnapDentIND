const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Base API client with JWT interceptor.
 */
const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('snapdent_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('snapdent_token');
      localStorage.removeItem('snapdent_user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

export const get = (endpoint) => api(endpoint, { method: 'GET' });
export const post = (endpoint, body) => api(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const put = (endpoint, body) => api(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const del = (endpoint) => api(endpoint, { method: 'DELETE' });
export const upload = (endpoint, formData) => api(endpoint, { method: 'POST', body: formData });

export const getBlob = async (endpoint) => {
  const token = localStorage.getItem('snapdent_token');
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) throw new Error('Download failed');
  return response.blob();
};

export default api;
