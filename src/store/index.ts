
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import stockReducer from './stockSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stock: stockReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
