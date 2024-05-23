import { createSlice} from "@reduxjs/toolkit"

const initialState = {
	userInfo: null,
}

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {}
})

export default appSlice.reducer
