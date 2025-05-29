import { configureStore } from '@reduxjs/toolkit';
import gameInstallerReducer from './slices/dl-slice';

export const store = configureStore({
    reducer: {
        gameInstaller: gameInstallerReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;