import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi, carOwnerApi } from '../../services/api';

export const fetchCustomerCars = createAsyncThunk(
  'cars/fetchCustomerCars',
  async (_, { rejectWithValue }) => {
    try {
      const data = await customerApi.getAllCars();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to load cars from backend');
    }
  }
);

export const fetchOwnerCars = createAsyncThunk(
  'cars/fetchOwnerCars',
  async (_, { rejectWithValue }) => {
    try {
      const data = await carOwnerApi.getAllCars();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to load owner cars from backend');
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
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to register car');
    }
  }
);

const carsSlice = createSlice({
  name: 'cars',
  initialState: {
    cars: [],
    ownerCars: [],
    loading: false,
    error: null,
    registerSuccess: false,
  },
  reducers: {
    resetRegisterState: (state) => {
      state.registerSuccess = false;
      state.error = null;
    }
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
        state.cars = action.payload;
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
        state.ownerCars = action.payload;
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
  }
});

export const { resetRegisterState } = carsSlice.actions;
export default carsSlice.reducer;
