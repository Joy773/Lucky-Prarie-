import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type OrderDetails = {
  name: string;
  email: string;
  telephone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderLineItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

/** One completed checkout (billing + line items + totals). */
export type PlacedOrder = OrderDetails & {
  id: string;
  placedAt: string;
  items: OrderLineItem[];
  orderTotal: number;
  /** Set when an admin assigns a delivery driver (MongoDB driver document id). */
  assignedDriverId?: string;
  assignedDriverUuid?: string;
  assignedDriverName?: string;
};

export type OrdersState = {
  orders: PlacedOrder[];
};

function sumLineTotals(items: OrderLineItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

function newOrderId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const initialState: OrdersState = {
  orders: [],
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    placeOrder: (
      state,
      action: PayloadAction<{
        billing: OrderDetails;
        items: OrderLineItem[];
        id?: string;
        placedAt?: string;
      }>
    ) => {
      const { billing, items, id, placedAt } = action.payload;
      const orderTotal = sumLineTotals(items);
      state.orders.unshift({
        ...billing,
        id: id ?? newOrderId(),
        placedAt: placedAt ?? new Date().toISOString(),
        items,
        orderTotal,
      });
    },
    clearOrders: () => initialState,
  },
});

export const { placeOrder, clearOrders } = orderSlice.actions;

export default orderSlice.reducer;
