import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export interface TextState {
  value: string;
}

const initialState: TextState = {
  value: "",
};

export const textSlice = createSlice({
  name: "text",
  initialState,
  reducers: {
    change: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
  },
});

export const { change } = textSlice.actions;

export default textSlice.reducer;

export const selectValue = (state: RootState) => state.text.value;
