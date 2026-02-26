import axios from 'axios';

// Use Vite proxy by default in development to avoid hard dependency on localhost URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000;

console.log('Using API base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For session authentication
});

// Function to get CSRF token
const getCsrfToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Add request interceptor for authentication and CSRF
api.interceptors.request.use((config) => {
  // Add CSRF token
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  const authFreeEndpoints = ['/user/login/', '/user/register/'];
  const isAuthFreeRequest = authFreeEndpoints.some((endpoint) => config.url?.includes(endpoint));

  // Add JWT token if available for protected endpoints only
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken && !isAuthFreeRequest) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // Only force logout on 401 (invalid/expired auth). A 403 can be a permission issue
    // for a specific endpoint and should not drop the whole user session.
    if (status === 401) {
      // Clear auth data on auth errors
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Dispatch custom event for auth error - React components will handle redirect
      window.dispatchEvent(new CustomEvent('auth-error', { 
        detail: { status } 
      }));
    }
    return Promise.reject(error);
  }
);

// API methods for User
export const userAPI = {
  register: (data) => api.post('/user/register/', data),
  login: (data) => api.post('/user/login/', data),
  logout: () => api.post('/user/logout/'),
  getProfiles: () => api.get('/user/user/'),
  getProfile: (id) => api.get(`/user/user/${id}/`),
  createProfile: (data) => api.post('/user/user/', data),
  updateProfile: (id, data) => api.put(`/user/user/${id}/`, data),
  deleteProfile: (id) => api.delete(`/user/user/${id}/`),
};

// API methods for Waste Types
export const wasteAPI = {
  getWastes: () => api.get('/waste/waste/'),
  getWaste: (id) => api.get(`/waste/waste/${id}/`),
  createWaste: (data) => api.post('/waste/waste/', data),
  updateWaste: (id, data) => api.put(`/waste/waste/${id}/`, data),
  deleteWaste: (id) => api.delete(`/waste/waste/${id}/`),
};

// API methods for Reports
export const reportAPI = {
  getReports: () => api.get('/report/report/'),
  getReport: (id) => api.get(`/report/report/${id}/`),
  createReport: (data) => {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post('/report/report/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateReport: (id, data) => api.patch(`/report/report/${id}/`, data),
  deleteReport: (id) => api.delete(`/report/report/${id}/`),
};

export default api;

