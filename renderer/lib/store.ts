import { configureStore } from '@reduxjs/toolkit';
import gameInstallerReducer from './slices/dl-slice';
import platformReducer from './slices/platform-slice';

export const store = configureStore({
    reducer: {
        gameInstaller: gameInstallerReducer,
        platform: platformReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;