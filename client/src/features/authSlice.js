import { createSlice } from "@reduxjs/toolkit";

const getPersistedUser = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const raw = window.localStorage.getItem("lms_auth_user");
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const persistedUser = getPersistedUser();

const initialState = {
    user:persistedUser,
    isAuthenticated:Boolean(persistedUser)
}

const authSlice = createSlice({
    name:"authSlice",
    initialState,
    reducers:{
        userLoggedIn:(state,action)=>{
            state.user = action.payload.user;
            state.isAuthenticated =true
        },
        userloggedout:(state)=>{
            state.user = null
            state.isAuthenticated= false
        }
    }
})

export const {userLoggedIn,userloggedout}=authSlice.actions
export default authSlice.reducer