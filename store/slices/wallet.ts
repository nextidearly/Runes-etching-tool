import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    address: "",
    pubkey: "",
    price: 60000,
    feeOptions: [
      {
        title: "Slow",
        desc: "About 1 hours",
        feeRate: 12,
      },
      {
        title: "Avg",
        desc: "About 30 minutes",
        feeRate: 12,
      },
      {
        title: "Fast",
        desc: "About 10 minutes",
        feeRate: 13,
      },
      { title: "Custom", feeRate: 0 },
    ],
  },
};

export const wallet = createSlice({
  name: "wallet",
  initialState: initialState,
  reducers: {
    updatePrice: (state, action) => {
      state.value.price = action.payload;
    },
    updateFeeRate: (state, action) => {
      state.value.feeOptions = [
        ...action.payload.feeRate,
        { title: "Custom", feeRate: 0 },
      ];
    },
    updateAddress: (state, action) => {
      state.value.address = action.payload;
    },
    updatePubkey: (state, action) => {
      state.value.pubkey = action.payload;
    },
  },
});

export const {
  updatePrice,
  updateFeeRate,
  updateAddress,
  updatePubkey
} = wallet.actions;
export default wallet.reducer;
