import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user:null,
    isAuthenticated:false
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