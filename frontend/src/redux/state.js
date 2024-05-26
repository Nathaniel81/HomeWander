import { createSlice} from "@reduxjs/toolkit"

const initialState = {
	userInfo: null,
  
}

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.userInfo = action.payload;
    },
    resetUser: (state) => {
      state.userInfo = null;
    },
    setListings: (state, action) => {
      state.listings = action.payload.listings
    },
    setWishList: (state, action) => {
      state.userInfo.wishList = action.payload
    },
    setTripList: (state, action) => {
      state.userInfo.tripList = action.payload
    },
    setPropertyList: (state, action) => {
      state.userInfo.propertyList = action.payload
    },
    resetPropertyList: (state) => {
      state.userInfo.propertyList = null
    },
    resetWishList: (state) => {
      state.userInfo.wishList = null;
    },
    resetTripList: (state) => {
      state.userInfo.tripList = null;
    },
    setReservationList: (state, action) => {
      state.userInfo.reservationList = action.payload
    }
  }
})

export const {
  addUser,
  resetUser,
  setListings,
  setWishList,
  setTripList,
  setPropertyList,
  setReservationList,
  resetPropertyList,
  resetTripList,
  resetWishList
} = appSlice.actions;
export default appSlice.reducer
