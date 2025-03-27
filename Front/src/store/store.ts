import { configureStore } from '@reduxjs/toolkit';
import { articlesApi } from '../api/articlesApi';
import { testsApi } from '../api/testsApi';

export const store = configureStore({
  reducer: {
    [articlesApi.reducerPath]: articlesApi.reducer,
    [testsApi.reducerPath]: testsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(articlesApi.middleware)
      .concat(testsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
