import type { WithId } from "mongodb";
import type { OrderDetails, OrderLineItem, PlacedOrder } from "@/store/features/orderSlice";

/** MongoDB collection name for shop orders. */
export const ORDERS_COLLECTION = "orders" as const;

/**
 * Order document shape stored in MongoDB (native driver — not Mongoose).
 * `placedAt` is a Date; `_id` is added on insert.
 */
function isLikelyObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id);
}

export type OrderRecord = {
  billing: OrderDetails;
  items: OrderLineItem[];
  orderTotal: number;
  placedAt: Date;
  assignedDriverId?: string;
  assignedDriverUuid?: string;
  assignedDriverName?: string;
};

export type CreateOrderBody = {
  billing: OrderDetails;
  items: OrderLineItem[];
};

export function sumLineTotals(items: OrderLineItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isOrderDetails(v: unknown): v is OrderDetails {
  if (typeof v !== "object" || v === null) {
    return false;
  }
  const b = v as Record<string, unknown>;
  return (
    isNonEmptyString(b.name) &&
    isNonEmptyString(b.email) &&
    isNonEmptyString(b.telephone) &&
    isNonEmptyString(b.address) &&
    isNonEmptyString(b.city) &&
    isNonEmptyString(b.postalCode) &&
    isNonEmptyString(b.country)
  );
}

function isOrderLineItem(v: unknown): v is OrderLineItem {
  if (typeof v !== "object" || v === null) {
    return false;
  }
  const o = v as Record<string, unknown>;
  return (
    isNonEmptyString(o.id) &&
    isNonEmptyString(o.name) &&
    typeof o.quantity === "number" &&
    Number.isFinite(o.quantity) &&
    o.quantity > 0 &&
    Number.isInteger(o.quantity) &&
    typeof o.unitPrice === "number" &&
    Number.isFinite(o.unitPrice) &&
    o.unitPrice >= 0 &&
    typeof o.lineTotal === "number" &&
    Number.isFinite(o.lineTotal) &&
    o.lineTotal >= 0
  );
}

/** Validates JSON body for POST /api/orders. */
export function parseCreateOrderBody(body: unknown):
  | { ok: true; data: CreateOrderBody }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = body as Record<string, unknown>;
  if (!isOrderDetails(o.billing)) {
    return { ok: false, error: "Invalid or incomplete billing details." };
  }
  if (!Array.isArray(o.items) || o.items.length === 0) {
    return { ok: false, error: "Order must include at least one line item." };
  }
  for (const item of o.items) {
    if (!isOrderLineItem(item)) {
      return { ok: false, error: "Invalid line item." };
    }
  }
  const items = o.items as OrderLineItem[];
  const mismatched = items.some(
    (item) => Math.abs(item.lineTotal - item.quantity * item.unitPrice) > 0.01
  );
  if (mismatched) {
    return { ok: false, error: "Line totals do not match quantity × unit price." };
  }
  return {
    ok: true,
    data: {
      billing: {
        name: o.billing.name.trim(),
        email: String(o.billing.email).trim(),
        telephone: String(o.billing.telephone).trim(),
        address: String(o.billing.address).trim(),
        city: String(o.billing.city).trim(),
        postalCode: String(o.billing.postalCode).trim(),
        country: String(o.billing.country).trim(),
      },
      items,
    },
  };
}

export function parseAssignDriverToOrderBody(body: unknown):
  | { ok: true; orderId: string; driverId: string }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = body as Record<string, unknown>;
  if (typeof o.orderId !== "string" || !isLikelyObjectId(o.orderId)) {
    return { ok: false, error: "Invalid order id." };
  }
  if (typeof o.driverId !== "string" || !isLikelyObjectId(o.driverId)) {
    return { ok: false, error: "Invalid driver id." };
  }
  return { ok: true, orderId: o.orderId, driverId: o.driverId };
}

export function documentToPlacedOrder(doc: WithId<OrderRecord>): PlacedOrder {
  const placedAt =
    doc.placedAt instanceof Date ? doc.placedAt.toISOString() : String(doc.placedAt);
  return {
    ...doc.billing,
    id: doc._id.toString(),
    placedAt,
    items: doc.items,
    orderTotal: doc.orderTotal,
    assignedDriverId: doc.assignedDriverId,
    assignedDriverUuid: doc.assignedDriverUuid,
    assignedDriverName: doc.assignedDriverName,
  };
}
