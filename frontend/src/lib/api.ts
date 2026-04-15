// src/lib/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Instancia principal
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,          // envía cookies (refresh token)
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adjuntar access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: refresh token automático
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.accessToken;
        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── API HELPERS ──────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data: RegisterData)  => api.post('/auth/register', data),
  login:    (data: LoginData)     => api.post('/auth/login', data),
  logout:   ()                    => api.post('/auth/logout'),
  me:       ()                    => api.get('/auth/me'),
  refresh:  ()                    => api.post('/auth/refresh'),
};

export const productsAPI = {
  getAll:   (params?: ProductsParams) => api.get('/products', { params }),
  getBySlug:(slug: string)            => api.get(`/products/${slug}`),
};

export const cartAPI = {
  get:    ()                                              => api.get('/cart'),
  add:    (productId: string, quantity: number, variantId?: string) =>
            api.post('/cart/items', { productId, quantity, variantId }),
  update: (itemId: string, quantity: number)              => api.put(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId: string)                                => api.delete(`/cart/items/${itemId}`),
  clear:  ()                                              => api.delete('/cart'),
};

export const ordersAPI = {
  create:  (data: CreateOrderData) => api.post('/orders', data),
  getAll:  (params?: PaginationParams) => api.get('/orders', { params }),
  getById: (id: string)            => api.get(`/orders/${id}`),
};

export const adminAPI = {
  getStats:      ()             => api.get('/admin/stats'),
  getOrders:     (params?: any) => api.get('/admin/orders', { params }),
  updateOrder:   (id: string, data: any) => api.patch(`/admin/orders/${id}/status`, data),
  createProduct: (data: any)    => api.post('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string)   => api.delete(`/admin/products/${id}`),
  uploadImage:   (file: File)   => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface RegisterData { email: string; password: string; firstName: string; lastName: string; phone?: string; }
interface LoginData    { email: string; password: string; }
interface ProductsParams { page?: number; limit?: number; search?: string; category?: string; minPrice?: number; maxPrice?: number; featured?: boolean; sort?: string; }
interface PaginationParams { page?: number; limit?: number; }
interface CreateOrderData { addressId: string; notes?: string; paymentMethod?: string; }

export default api;
