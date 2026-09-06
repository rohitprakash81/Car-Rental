import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi, carOwnerApi } from '../../services/api';

export const fetchCustomerCars = createAsyncThunk(
  'cars/fetchCustomerCars',
  async ({ page = 0, size = 6, sortBy = 'id', sortDir = 'desc' } = {}, { rejectWithValue }) => {
    try {
      const data = await customerApi.getAllCars({ page, size, sortBy, sortDir });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to load cars from backend'
      );
    }
  }
);

export const fetchOwnerCars = createAsyncThunk(
  'cars/fetchOwnerCars',
  async ({ page = 0, size = 6, sortBy = 'id', sortDir = 'desc' } = {}, { rejectWithValue }) => {
    try {
      const data = await carOwnerApi.getAllCars({ page, size, sortBy, sortDir });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to load owner cars from backend'
      );
    }
  }
);

export const registerCar = createAsyncThunk(
  'cars/registerCar',
  async (carData, { rejectWithValue }) => {
    try {
      const res = await carOwnerApi.registerCar(carData);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to register car'
      );
    }
  }
);

const carsSlice = createSlice({
  name: 'cars',
  initialState: {
    cars: [],
    ownerCars: [],
    customerPagination: {
      pageNumber: 0,
      pageSize: 6,
      totalElements: 0,
      totalPages: 1,
      isFirst: true,
      isLast: true,
    },
    ownerPagination: {
      pageNumber: 0,
      pageSize: 6,
      totalElements: 0,
      totalPages: 1,
      isFirst: true,
      isLast: true,
    },
    loading: false,
    error: null,
    registerSuccess: false,
  },
  reducers: {
    resetRegisterState: (state) => {
      state.registerSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Customer Cars
      .addCase(fetchCustomerCars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerCars.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload && Array.isArray(payload.content)) {
          state.cars = payload.content;
          state.customerPagination = {
            pageNumber: payload.pageNumber,
            pageSize: payload.pageSize,
            totalElements: payload.totalElements,
            totalPages: payload.totalPages,
            isFirst: payload.isFirst,
            isLast: payload.isLast,
          };
        } else if (Array.isArray(payload)) {
          state.cars = payload;
          state.customerPagination = {
            pageNumber: 0,
            pageSize: payload.length,
            totalElements: payload.length,
            totalPages: 1,
            isFirst: true,
            isLast: true,
          };
        }
      })
      .addCase(fetchCustomerCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Owner Cars
      .addCase(fetchOwnerCars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerCars.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload && Array.isArray(payload.content)) {
          state.ownerCars = payload.content;
          state.ownerPagination = {
            pageNumber: payload.pageNumber,
            pageSize: payload.pageSize,
            totalElements: payload.totalElements,
            totalPages: payload.totalPages,
            isFirst: payload.isFirst,
            isLast: payload.isLast,
          };
        } else if (Array.isArray(payload)) {
          state.ownerCars = payload;
          state.ownerPagination = {
            pageNumber: 0,
            pageSize: payload.length,
            totalElements: payload.length,
            totalPages: 1,
            isFirst: true,
            isLast: true,
          };
        }
      })
      .addCase(fetchOwnerCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register Car
      .addCase(registerCar.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(registerCar.fulfilled, (state) => {
        state.loading = false;
        state.registerSuccess = true;
      })
      .addCase(registerCar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registerSuccess = false;
      });
  },
});

export const { resetRegisterState } = carsSlice.actions;
export default carsSlice.reducer;
