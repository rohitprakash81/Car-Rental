import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    message: null,
    type: 'success', // 'success' | 'error'
  },
  reducers: {
    showToast: (state, action) => {
      if (typeof action.payload === 'string') {
        state.message = action.payload;
        state.type = 'success';
      } else {
        state.message = action.payload.message;
        state.type = action.payload.type || 'success';
      }
    },
    hideToast: (state) => {
      state.message = null;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
