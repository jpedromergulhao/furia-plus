import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name: "",
    surname: "",
    email: "",
    profilePic: null,
    furias: 0,
    id: null,
    availableRewards: [],
    availableQuizzes: [],
    availableChallenges: [],
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            Object.assign(state, action.payload);
        },
        redeemReward: (state, action) => {
            const reward = action.payload;
            if (state.furias >= reward.price) {
                state.furias -= reward.price;
            }
        },
        setAvailableRewards: (state, action) => {
            state.availableRewards = action.payload;
        },
        setAvailableChallenges: (state, action) => {
            state.availableChallenges = action.payload;
        },
        setAvailableQuizzes: (state, action) => {
            state.availableQuizzes = action.payload;
        },
        setProfilePic: (state, action) => {
            state.profilePic = action.payload;
        },
        logoutUser: (state) => {
            // Reseta o usuário ao fazer logout
            Object.assign(state, initialState);
        }
    },
});

// Exportação das ações
export const {
    setUser,
    redeemReward,
    setAvailableRewards,
    setAvailableChallenges,
    setAvailableQuizzes,
    setProfilePic,
    logoutUser
} = userSlice.actions;

export default userSlice.reducer;
