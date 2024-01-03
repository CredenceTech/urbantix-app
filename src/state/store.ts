import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authenticationReducer from './slices/authenticationSlice';
import { persistReducer } from 'redux-persist';

const persistConfig = {
    key: "root",
    version: 1,
    storage: AsyncStorage,
}

const rootReducer = combineReducers({
    authentication: authenticationReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
});