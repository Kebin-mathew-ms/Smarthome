import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 / Authorization Errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const pathname = window.location.pathname;
      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/volunteer/login', '/categories', '/search', '/unauthorized'];
      const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/services/');
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    const apiError = error.response?.data || {
      success: false,
      message: error.message || 'Network error occurred',
      errors: [error.message]
    };
    return Promise.reject(apiError);
  }
);

export default api;
