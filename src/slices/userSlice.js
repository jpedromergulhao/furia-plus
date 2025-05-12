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
    usedCoupons: [],
    unlockedWallpapers: [],
    loginStreak: 0,
    lastLoginDate: null,
    isQuizFinished: false
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
            Object.assign(state, initialState);
        },
        addFurias: (state, action) => {
            state.furias += action.payload;
        },
        setFurias: (state, action) => {
            state.furias = action.payload;
        },
        setUsedCoupons: (state, action) => {
            state.usedRewards = action.payload;
        },
        setUnlockedWallpapers: (state, action) => {
            state.unlockedWallpapers = action.payload;
        },
        setLoginStreak: (state, action) => {
            state.loginStreak = action.payload;
        },
        setLastLoginDate: (state, action) => {
            state.lastLoginDate = action.payload;
        },
        setIsQuizFinished: (state, action) => {
            state.isQuizFinished = action.payload;
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
    logoutUser,
    addFurias,
    setFurias,
    setUsedCoupons,
    setUnlockedWallpapers,
    setLoginStreak,
    setLastLoginDate,
    setIsQuizFinished
} = userSlice.actions;

export default userSlice.reducer;
