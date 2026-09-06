import axios from 'axios';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

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
  }
};

export const carOwnerApi = {
  registerCar: async (carData) => {
    const res = await apiClient.post('/carOwner/registerCar', carData);
    return res.data;
  },

  getAllCars: async () => {
    const res = await apiClient.get('/carOwner/getAllCars');
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
    const res = await apiClient.post(`/carOwner/confirmedOrRejectBookingStatus/${bookingId}/${status}`);
    return res.data;
  },

  logoutCarOwner: async () => {
    const res = await apiClient.get('/carOwner/logoutCarOwner');
    return res.data;
  }
};

export const customerApi = {
  getAllCars: async () => {
    const res = await apiClient.get('/customer/getAllCars');
    return res.data;
  },

  bookCar: async (carId, bookingDetails) => {
    const res = await apiClient.post(`/customer/bookCar/${carId}`, bookingDetails);
    return res.data;
  },

  getConfirmedBookingStatus: async () => {
    const res = await apiClient.get('/customer/getConfirmedBookingStatus');
    return res.data;
  }
};

export default apiClient;
