import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {persistReducer, persistStore} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi, authSlice} from '../features/auth/auth';
import {dropdownApi} from '../features/dropdown/dropdown-api';
import {baseApi, pjpSlice} from '../features/base/base-api';
import {tadaApi, tadaSlice} from '../features/tada/tadaApi';
import {
  promoterBaseApi,
  promoterSlice,
} from '../features/base/promoter-base-api';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const authReducer = combineReducers({
  authSlice: authSlice.reducer,
  pjpSlice: pjpSlice.reducer,
  tadaSlice: tadaSlice.reducer,
  promoterSlice: promoterSlice.reducer,
});
const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    persistedReducer,

    [authApi.reducerPath]: authApi.reducer,
    [dropdownApi.reducerPath]: dropdownApi.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [promoterBaseApi.reducerPath]: promoterBaseApi.reducer,
    [tadaApi.reducerPath]: tadaApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({serializableCheck: false}).concat([
      authApi.middleware,
      dropdownApi.middleware,
      baseApi.middleware,
      tadaApi.middleware,
      promoterBaseApi.middleware,
    ]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
