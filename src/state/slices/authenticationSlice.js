import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
}

export const authenticationSlice = createSlice({
    name: 'authentication',
    initialState,
    reducers: {
        saveUser: (state, action) => {
            state.user = action.payload;
        },
        removeUser: (state) => {
            state.user = null;
        },
    }
})

export const { saveUser, removeUser } = authenticationSlice.actions;
export default authenticationSlice.reducer;
