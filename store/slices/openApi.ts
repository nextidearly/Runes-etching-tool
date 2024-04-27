import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    deviceId: "",
  },
};

export const openAPI = createSlice({
  name: "openAPI",
  initialState: initialState,
  reducers: {
    deviceId: (state, action) => {
      state.value.deviceId = action.payload;
    },
  },
});

export const { deviceId } = openAPI.actions;
export default openAPI.reducer;
