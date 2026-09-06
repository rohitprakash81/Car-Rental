import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response Interceptor for Silent Refresh Token Rotation (RTR) and Rate Limiting
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 429 Too Many Requests (Rate Limiting)
    if (error.response?.status === 429) {
      const retryAfter =
        error.response.headers?.['retry-after'] || error.response.data?.retryAfterSeconds || 60;
      const message =
        error.response.data?.message ||
        `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`;

      window.dispatchEvent(
        new CustomEvent('rate-limit:exceeded', {
          detail: {
            message,
            retryAfter: Number(retryAfter),
            status: 429,
          },
        })
      );
      return Promise.reject(error);
    }

    // Skip refresh token logic for auth login or logout endpoints to prevent loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        // Attempt silent rotation with the HttpOnly refresh token cookie
        await apiClient.post('/auth/refresh-token');
        // Retry original request seamlessly
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.warn('Session expired or revoked. User must sign in again.');
        localStorage.removeItem('car_rental_current_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  saveRole: async (roleData) => {
    const res = await apiClient.post('/auth/saveRole', roleData);
    return res.data;
  },

  registerCarOwner: async (ownerData) => {
    const res = await apiClient.post('/auth/registerCarOwner', ownerData);
    return res.data;
  },

  registerCustomer: async (customerData) => {
    const res = await apiClient.post('/auth/registerCustomer', customerData);
    return res.data;
  },

  loginCarOwner: async (credentials) => {
    const res = await apiClient.post('/auth/loginCarOwner', credentials);
    return res.data;
  },

  loginCustomer: async (credentials) => {
    const res = await apiClient.post('/auth/loginCustomer', credentials);
    return res.data;
  },

  loginSuperAdmin: async (credentials) => {
    const res = await apiClient.post('/auth/loginSuperAdmin', credentials);
    return res.data;
  },

  refreshToken: async () => {
    const res = await apiClient.post('/auth/refresh-token');
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/auth/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const superAdminApi = {
  getDashboardStats: async () => {
    const res = await apiClient.get('/superadmin/dashboard/stats');
    return res.data;
  },

  getPendingOwners: async (params = {}) => {
    const res = await apiClient.get('/superadmin/owners/pending', { params });
    return res.data;
  },

  getAllOwners: async () => {
    const res = await apiClient.get('/superadmin/owners/all');
    return res.data;
  },

  verifyOwner: async (ownerId, approve, reason = '') => {
    const res = await apiClient.patch(`/superadmin/owners/${ownerId}/verify`, { approve, reason });
    return res.data;
  },

  getPendingCars: async (params = {}) => {
    const res = await apiClient.get('/superadmin/cars/pending', { params });
    return res.data;
  },

  getAllCars: async () => {
    const res = await apiClient.get('/superadmin/cars/all');
    return res.data;
  },

  verifyCar: async (carId, approve, reason = '') => {
    const res = await apiClient.patch(`/superadmin/cars/${carId}/verify`, { approve, reason });
    return res.data;
  },

  getAllUsers: async () => {
    const res = await apiClient.get('/superadmin/users');
    return res.data;
  },

  toggleUserBlock: async (userType, userId, block, reason = '') => {
    const res = await apiClient.patch(`/superadmin/users/${userType}/${userId}/toggle-block`, {
      block,
      reason,
    });
    return res.data;
  },
};

export const carOwnerApi = {
  registerCar: async (carData) => {
    const res = await apiClient.post('/carOwner/registerCar', carData);
    return res.data;
  },

  getAllCars: async (params = {}) => {
    const res = await apiClient.get('/carOwner/getAllCars', { params });
    return res.data;
  },

  carOwnerProfile: async () => {
    const res = await apiClient.get('/carOwner/carOwnerProfile');
    return res.data;
  },

  getPendingBookingForCarOwner: async () => {
    const res = await apiClient.get('/carOwner/getPendingBookingForCarOwner');
    return res.data;
  },

  confirmedOrRejectBookingStatus: async (bookingId, status) => {
    if (!bookingId || bookingId === 'undefined') {
      throw new Error('Valid booking ID is required to update booking status.');
    }
    const res = await apiClient.post(
      `/carOwner/confirmedOrRejectBookingStatus/${bookingId}/${status}`
    );
    return res.data;
  },

  logoutCarOwner: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
};

export const customerApi = {
  getAllCars: async (params = {}) => {
    const res = await apiClient.get('/customer/getAllCars', { params });
    return res.data;
  },

  bookCar: async (carId, bookingDetails) => {
    const res = await apiClient.post(`/customer/bookCar/${carId}`, bookingDetails);
    return res.data;
  },

  getConfirmedBookingStatus: async (params = {}) => {
    const res = await apiClient.get('/customer/getConfirmedBookingStatus', { params });
    return res.data;
  },
};

export const paymentApi = {
  createOrder: async (bookingId) => {
    const res = await apiClient.post(`/payments/create-order/${bookingId}`);
    return res.data;
  },

  verifyPayment: async (payload) => {
    const res = await apiClient.post('/payments/verify', payload);
    return res.data;
  },

  getMyPayments: async () => {
    const res = await apiClient.get('/payments/my-payments');
    return res.data;
  },
};

export default apiClient;
