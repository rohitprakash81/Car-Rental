import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';

const savedUser = localStorage.getItem('car_rental_current_user');
const initialUser = savedUser ? JSON.parse(savedUser) : null;

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.getMe();
    const user = res.data;
    localStorage.setItem('car_rental_current_user', JSON.stringify(user));
    return user;
  } catch {
    localStorage.removeItem('car_rental_current_user');
    return rejectWithValue(null);
  }
});

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ credentials, role }, { rejectWithValue }) => {
    try {
      let res;
      if (role === 'SUPER_ADMIN' || role === 'SuperAdmin') {
        res = await authApi.loginSuperAdmin(credentials);
      } else if (role === 'CarOwner' || role === 'CAR_OWNER') {
        res = await authApi.loginCarOwner(credentials);
      } else {
        res = await authApi.loginCustomer(credentials);
      }

      const user = res.data || {
        email: credentials.email,
        name: credentials.email.split('@')[0],
        role,
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
      if (role === 'CarOwner' || role === 'CAR_OWNER') {
        res = await authApi.registerCarOwner(userData);
      } else {
        res = await authApi.registerCustomer(userData);
      }

      const user = res.data || { ...userData, role };
      localStorage.setItem('car_rental_current_user', JSON.stringify(user));
      return { user, message: res.message || 'Account registered successfully!' };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await authApi.logout();
  } catch (e) {
    console.warn('Logout backend warning:', e);
  }
  localStorage.removeItem('car_rental_current_user');
  return null;
});

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
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
      })
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
  },
});

export const { openAuthModal, closeAuthModal, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
