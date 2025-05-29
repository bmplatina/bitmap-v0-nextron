import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlatformState {
    bIsMac: boolean;
}

const initialState: PlatformState = {
    bIsMac: false, // 여러 게임의 설치 매니저를 배열로 관리
};

const platformSlice = createSlice({
    name: 'platform',
    initialState,
    reducers: {
        setIsMac: (state, action: PayloadAction<boolean>) => {
            state.bIsMac = action.payload;
        },
    },
});

export const { setIsMac } =
    platformSlice.actions;

export default platformSlice.reducer;