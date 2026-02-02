import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LuggageItem } from "../../domain/models";

interface LuggageState {
  items: LuggageItem[];
  isLoading: boolean;
}

const initialState: LuggageState = {
  items: [],
  isLoading: false,
};

const luggageSlice = createSlice({
  name: "luggage",
  initialState,
  reducers: {
    setLuggageItems: (state, action: PayloadAction<LuggageItem[]>) => {
      state.items = action.payload;
    },
    addLuggageItem: (state, action: PayloadAction<LuggageItem>) => {
      state.items.push(action.payload);
    },
    updateLuggageItem: (state, action: PayloadAction<LuggageItem>) => {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeLuggageItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    washAllItems: (state) => {
      state.items = state.items.map((item) => {
        if (item.type === "clothing") {
          return {
            ...item,
            cleanQuantity: item.cleanQuantity + item.dirtyQuantity,
            dirtyQuantity: 0,
          };
        }
        return item;
      });
    },
    washCategory: (state, action: PayloadAction<number>) => {
      const index = state.items.findIndex((i) => i.id === action.payload);
      if (index !== -1 && state.items[index].type === "clothing") {
        state.items[index].cleanQuantity += state.items[index].dirtyQuantity;
        state.items[index].dirtyQuantity = 0;
      }
    },
  },
});

export const {
  setLuggageItems,
  addLuggageItem,
  updateLuggageItem,
  removeLuggageItem,
  setLoading,
  washAllItems,
  washCategory,
} = luggageSlice.actions;
export default luggageSlice.reducer;
