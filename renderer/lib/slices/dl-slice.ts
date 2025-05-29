import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameInstallManager } from '../types';

interface GameInstallerState {
    managers: GameInstallManager[];
}

const initialState: GameInstallerState = {
    managers: [], // 여러 게임의 설치 매니저를 배열로 관리
};

const gameInstallerSlice = createSlice({
    name: 'gameInstaller',
    initialState,
    reducers: {
        addManager: (state, action: PayloadAction<GameInstallManager>) => {
            state.managers.push(action.payload);
        },
        removeManager: (state, action: PayloadAction<number>) => {
            state.managers = state.managers.filter(
                (manager, index) => index !== action.payload
            );
        },
        clearManagers: (state) => {
            state.managers = [];
        },
    },
});

export const { addManager, removeManager, clearManagers } =
    gameInstallerSlice.actions;

export default gameInstallerSlice.reducer;