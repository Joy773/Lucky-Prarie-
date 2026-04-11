"use client";

import Link from "next/link";
import SectionWrapper from "@/components/layout/SectionWrapper";
import type { PlacedOrder } from "@/store/features/orderSlice";
import { useAppSelector } from "@/store/hooks";

function countryLabel(code: string) {
  if (code === "CA") {
    return "Canada";
  }
  if (code === "US") {
    return "United States";
  }
  return code || "—";
}

function formatPlacedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function OrderBillingCard({ order }: { order: PlacedOrder }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">Billing &amp; delivery</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Name</dt>
          <dd className="mt-0.5 font-medium text-slate-900">{order.name}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</dt>
          <dd className="mt-0.5 font-medium text-slate-900">{order.email}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Telephone
          </dt>
          <dd className="mt-0.5 font-medium text-slate-900">{order.telephone}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Address</dt>
          <dd className="mt-0.5 font-medium text-slate-900">{order.address}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">City</dt>
          <dd className="mt-0.5 font-medium text-slate-900">{order.city}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Postal code
          </dt>
          <dd className="mt-0.5 font-medium text-slate-900">{order.postalCode}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Country</dt>
          <dd className="mt-0.5 font-medium text-slate-900">{countryLabel(order.country)}</dd>
        </div>
      </dl>
    </div>
  );
}

function OrderItemsCard({ order }: { order: PlacedOrder }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">Items</h2>
      <ul className="mt-4 divide-y divide-slate-100">
        {order.items.map((item) => (
          <li
            key={`${order.id}-${item.id}`}
            className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-500">
                Qty {item.quantity} × ${item.unitPrice.toFixed(2)} each
              </p>
            </div>
            <p className="shrink-0 text-base font-bold text-slate-900">
              ${item.lineTotal.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-base font-bold text-slate-900">Total</span>
        <span className="text-xl font-bold text-fuchsia-600">${order.orderTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function OrderDetails() {
  const { orders } = useAppSelector((state) => state.order);
  const hasOrders = orders.length > 0;

  if (!hasOrders) {
    return (
      <SectionWrapper className="py-8 sm:py-12">
        <div className="mx-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Your Orders</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Your order history will appear here.
          </p>
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center sm:mt-6 sm:p-6">
            <p className="text-sm text-slate-600">You don&apos;t have any orders yet.</p>
            <Link
              href="/products"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto sm:min-h-0"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper className="py-8 sm:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Your Orders</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Newest orders first. Each checkout keeps its own billing address and items.
          </p>
        </div>

        <ul className="space-y-10">
          {orders.map((placed) => (
            <li key={placed.id}>
              <article className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-col gap-1 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-900">Order</p>
                  <p className="text-sm text-slate-600">{formatPlacedAt(placed.placedAt)}</p>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
                  <OrderBillingCard order={placed} />
                  <OrderItemsCard order={placed} />
                </div>
              </article>
            </li>
          ))}
        </ul>

        <Link
          href="/products"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto sm:min-h-0"
        >
          Continue Shopping
        </Link>
      </div>
    </SectionWrapper>
  );
}
