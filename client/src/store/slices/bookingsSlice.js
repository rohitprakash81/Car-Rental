import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi, carOwnerApi } from '../../services/api';

export const bookCarThunk = createAsyncThunk(
  'bookings/bookCar',
  async ({ carId, bookingDetails }, { rejectWithValue }) => {
    try {
      const res = await customerApi.bookCar(carId, bookingDetails);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Booking request failed');
    }
  }
);

export const fetchCustomerBookings = createAsyncThunk(
  'bookings/fetchCustomerBookings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await customerApi.getConfirmedBookingStatus();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch customer bookings');
    }
  }
);

export const fetchOwnerPendingBookings = createAsyncThunk(
  'bookings/fetchOwnerPendingBookings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await carOwnerApi.getPendingBookingForCarOwner();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch pending bookings for owner');
    }
  }
);

export const updateBookingStatusThunk = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const res = await carOwnerApi.confirmedOrRejectBookingStatus(bookingId, status);
      return { bookingId, status, message: res.message || `Booking status updated to ${status}` };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update booking status');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    customerBookings: [],
    ownerPendingBookings: [],
    loading: false,
    actionLoadingId: null,
    error: null,
    bookingSuccess: false
  },
  reducers: {
    resetBookingState: (state) => {
      state.bookingSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Book Car
      .addCase(bookCarThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingSuccess = false;
      })
      .addCase(bookCarThunk.fulfilled, (state) => {
        state.loading = false;
        state.bookingSuccess = true;
      })
      .addCase(bookCarThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bookingSuccess = false;
      })
      // Customer Bookings
      .addCase(fetchCustomerBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.customerBookings = action.payload;
      })
      .addCase(fetchCustomerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Owner Pending Bookings
      .addCase(fetchOwnerPendingBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnerPendingBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.ownerPendingBookings = action.payload;
      })
      .addCase(fetchOwnerPendingBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateBookingStatusThunk.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.bookingId;
      })
      .addCase(updateBookingStatusThunk.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        state.ownerPendingBookings = state.ownerPendingBookings.filter(
          b => b.id !== action.payload.bookingId
        );
      })
      .addCase(updateBookingStatusThunk.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload;
      });
  }
});

export const { resetBookingState } = bookingsSlice.actions;
export default bookingsSlice.reducer;
