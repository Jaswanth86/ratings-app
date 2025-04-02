import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true, // Enable sending cookies (if you switch to HTTP-only cookies)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header (if still using localStorage for tokens)
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

// Response interceptor for handling 401 errors and session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
// ... other imports and config ...

export const login = async (data) => {
  try {
    const response = await api.post('/api/auth/login', data);
    return response.data; // Expect { token, role }
  } catch (error) {
    console.error('Login error details:', error.response); // Log full error
    throw error.response?.data?.error || 'Login failed';
  }
};

export const signup = async (data) => {
  try {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Signup failed';
  }
};

// ... rest of the file ...

// Admin APIs
export const getAdminDashboard = async () => {
  try {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch dashboard data';
  }
};

export const getUsers = async (filters = {}) => {
  try {
    const response = await api.get('/api/admin/users', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch users';
  }
};

export const getStores = async () => {
  try {
    const response = await api.get('/api/admin/stores');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch stores';
  }
};

export const addUser = async (data) => {
  try {
    const response = await api.post('/api/admin/user', data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to add user';
  }
};

export const addStore = async (data) => {
  try {
    const response = await api.post('/api/admin/store', data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to add store';
  }
};

// User APIs
export const getUserStores = async () => {
  try {
    const response = await api.get('/api/user/stores');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch stores';
  }
};

export const submitRating = async (data) => {
  try {
    const response = await api.post('/api/user/rating', data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to submit rating';
  }
};

export const updateUserPassword = async (data) => {
  try {
    const response = await api.put('/api/user/password', data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update password';
  }
};

// Store Owner APIs
export const getStoreOwnerDashboard = async () => {
  try {
    const response = await api.get('/api/store/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch dashboard data';
  }
};

export const updateStoreOwnerPassword = async (data) => {
  try {
    const response = await api.put('/api/store/password', data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update password';
  }
};

// Logout function (if you want to explicitly clear session)
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

// Export the axios instance for custom requests if needed
export default api;