import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi, carOwnerApi } from '../../services/api';

export const bookCarThunk = createAsyncThunk(
  'bookings/bookCar',
  async ({ carId, bookingDetails }, { rejectWithValue }) => {
    try {
      const res = await customerApi.bookCar(carId, bookingDetails);
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Booking request failed'
      );
    }
  }
);

export const fetchCustomerBookings = createAsyncThunk(
  'bookings/fetchCustomerBookings',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const data = await customerApi.getConfirmedBookingStatus({ page, size });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch customer bookings'
      );
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
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch pending bookings for owner'
      );
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
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to update booking status'
      );
    }
  }
);

const normalizeBooking = (item) => {
  if (!item) return null;
  const b = item.booking || item;
  const car = b.car || item.car || {};
  const customer = b.customer || item.customer || {};

  const id = b.id || item.id || item.bookingId;
  const status = b.status || item.status;
  const journeyDate = b.journeyDate || item.journeyDate;
  const source = b.source || item.source;
  const destination = b.destination || item.destination;
  const totalAmount = b.totalAmount || item.totalAmount || b.amount || item.amount;
  const bookingDate = b.bookingDate || item.bookingDate;
  const paymentDeadline = b.paymentDeadline || item.paymentDeadline;

  const carId = item.carId || car.id || b.carId;
  const carBrand = car.brand || item.carBrand || '';
  const carModel = car.model || item.carModel || '';
  const carName =
    item.carName ||
    (carBrand || carModel ? `${carBrand} ${carModel}`.trim() : b.carName || 'Vehicle');
  const vehicleNumber = item.vehicleNumber || car.vehicleNumber || b.vehicleNumber || '';

  const customerName =
    item.customerName || customer.name || b.customerName || customer.email || 'Customer';
  const customerEmail = item.customerEmail || customer.email || b.customerEmail || '';
  const customerPhone =
    item.customerPhone || customer.phoneNumber || b.customerPhone || customer.phone || '';

  return {
    ...b,
    ...item,
    id,
    bookingId: id,
    status,
    journeyDate,
    source,
    destination,
    totalAmount,
    bookingDate,
    paymentDeadline,
    carId,
    carName,
    vehicleNumber,
    customerName,
    customerEmail,
    customerPhone,
    car: {
      ...car,
      id: carId,
      brand: carBrand,
      model: carModel,
      vehicleNumber,
    },
    customer: {
      ...customer,
      name: customerName,
      email: customerEmail,
      phoneNumber: customerPhone,
    },
  };
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    customerBookings: [],
    customerPagination: {
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 1,
      isFirst: true,
      isLast: true,
    },
    ownerPendingBookings: [],
    loading: false,
    actionLoadingId: null,
    error: null,
    bookingSuccess: false,
  },
  reducers: {
    resetBookingState: (state) => {
      state.bookingSuccess = false;
      state.error = null;
    },
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
        const payload = action.payload;
        if (payload && Array.isArray(payload.content)) {
          state.customerBookings = payload.content.map(normalizeBooking).filter(Boolean);
          state.customerPagination = {
            pageNumber: payload.pageNumber,
            pageSize: payload.pageSize,
            totalElements: payload.totalElements,
            totalPages: payload.totalPages,
            isFirst: payload.isFirst,
            isLast: payload.isLast,
          };
        } else if (Array.isArray(payload)) {
          state.customerBookings = payload.map(normalizeBooking).filter(Boolean);
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
        const list = Array.isArray(action.payload) ? action.payload : [];
        state.ownerPendingBookings = list.map(normalizeBooking).filter(Boolean);
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
        const targetId = action.payload.bookingId;
        state.ownerPendingBookings = state.ownerPendingBookings.filter(
          (b) => b.id !== targetId && String(b.id) !== String(targetId)
        );
      })
      .addCase(updateBookingStatusThunk.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload;
      });
  },
});

export const { resetBookingState } = bookingsSlice.actions;
export default bookingsSlice.reducer;
