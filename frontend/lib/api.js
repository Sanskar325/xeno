import axios from 'axios';
import { computeMockMetrics, mockProducts, mockCustomers, mockOrders } from '../mock/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const shopDomain = localStorage.getItem('shop_domain');
  if (shopDomain) {
    config.headers['x-shop-domain'] = shopDomain;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  generateJWT: async (firebaseToken, userData) => {
    const response = await api.post('/api/auth/generate-jwt', {
      firebaseToken,
      ...userData
    });
    return response.data;
  },

  verifyToken: () => api.post('/api/auth/verify'),

  // Data sync
  syncData: async ({ storeUrl, accessToken }) => {
    return api.post('/api/sync/sync-data', {
      storeUrl,
      accessToken
    });
  },

  async getLastSync() {
    // Implementation to fetch last sync timestamp
  },

  // Metrics
  getMetrics: async (params = {}) => {
    try {
      const res = await api.get('/api/metrics/metrics', { params });
      const data = res?.data?.data;
      if (!data || (data.summary?.totalOrders === 0 && data.summary?.totalRevenue === 0 && data.summary?.totalCustomers === 0)) {
        return { data: { data: computeMockMetrics() } };
      }
      return res;
    } catch (e) {
      return { data: { data: computeMockMetrics() } };
    }
  },

  // Products
  getProducts: async (params = {}) => {
    try {
      const res = await api.get('/api/metrics/products', { params });
      if (!res?.data?.data?.products?.length) {
        return { data: { data: { products: mockProducts, totalCount: mockProducts.length, hasMore: false } } };
      }
      return res;
    } catch (e) {
      return { data: { data: { products: mockProducts, totalCount: mockProducts.length, hasMore: false } } };
    }
  },

  // Orders
  getOrders: async (params = {}) => {
    try {
      const res = await api.get('/api/metrics/orders', { params });
      if (!res?.data?.data?.orders?.length) {
        return { data: { data: { orders: mockOrders, totalCount: mockOrders.length, hasMore: false } } };
      }
      return res;
    } catch (e) {
      return { data: { data: { orders: mockOrders, totalCount: mockOrders.length, hasMore: false } } };
    }
  },

  // Customers
  getCustomers: async (params = {}) => {
    try {
      const res = await api.get('/api/metrics/customers', { params });
      if (!res?.data?.data?.customers?.length) {
        return { data: { data: { customers: mockCustomers, totalCount: mockCustomers.length, hasMore: false } } };
      }
      return res;
    } catch (e) {
      return { data: { data: { customers: mockCustomers, totalCount: mockCustomers.length, hasMore: false } } };
    }
  },
};

export default api;