import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  size: string;
  unit: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>
    ) => {
      const quantityToAdd = Math.max(1, action.payload.quantity ?? 1);
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += quantityToAdd;
        return;
      }

      state.items.push({ ...action.payload, quantity: quantityToAdd });
    },
    increaseCartItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find((cartItem) => cartItem.id === action.payload);
      if (!item) {
        return;
      }
      item.quantity += 1;
    },
    decreaseCartItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find((cartItem) => cartItem.id === action.payload);
      if (!item) {
        return;
      }

      item.quantity -= 1;
      if (item.quantity <= 0) {
        state.items = state.items.filter((cartItem) => cartItem.id !== action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, increaseCartItem, decreaseCartItem, removeFromCart, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
