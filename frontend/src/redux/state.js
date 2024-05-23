import { createSlice} from "@reduxjs/toolkit"

const initialState = {
	userInfo: null,
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.userInfo = action.payload;
    },
    resetUser: (state) => {
      state.userInfo = null;
    }
  }
})

export const {
  addUser,
  resetUser,
} = userSlice.actions;
export default userSlice.reducer
