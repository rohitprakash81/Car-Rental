import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, carOwnerApi } from '../../services/api';

const savedUser = localStorage.getItem('car_rental_current_user');
const initialUser = savedUser ? JSON.parse(savedUser) : null;

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ credentials, role }, { rejectWithValue }) => {
    try {
      let res;
      if (role === 'CarOwner') {
        res = await authApi.loginCarOwner(credentials);
      } else {
        res = await authApi.loginCustomer(credentials);
      }
      
      const user = (res && typeof res === 'object' && res.user) ? res.user : {
        email: credentials.email,
        name: credentials.email.split('@')[0],
        role
      };

      localStorage.setItem('car_rental_current_user', JSON.stringify(user));
      return { user, message: res.message || `Welcome back, ${user.name}!` };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ userData, role }, { rejectWithValue }) => {
    try {
      let res;
      if (role === 'CarOwner') {
        res = await authApi.registerCarOwner(userData);
      } else {
        res = await authApi.registerCustomer(userData);
      }

      const user = (res && typeof res === 'object' && res.user) ? res.user : { ...userData, role };
      localStorage.setItem('car_rental_current_user', JSON.stringify(user));
      return { user, message: res.message || 'Account created successfully!' };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState }) => {
    const { auth } = getState();
    if (auth.user?.role === 'CarOwner') {
      try {
        await carOwnerApi.logoutCarOwner();
      } catch (e) {
        console.error('Logout error on backend', e);
      }
    }
    localStorage.removeItem('car_rental_current_user');
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    loading: false,
    error: null,
    isAuthModalOpen: false,
    authModalMode: 'login', // 'login' | 'register'
  },
  reducers: {
    openAuthModal: (state, action) => {
      state.authModalMode = action.payload || 'login';
      state.isAuthModalOpen = true;
      state.error = null;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthModalOpen = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthModalOpen = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      });
  }
});

export const { openAuthModal, closeAuthModal, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
