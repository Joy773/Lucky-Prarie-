"use client";

import { useCallback, useEffect, useState } from "react";
import AssignDriverModal from "@/components/Admin/AssignDriverModal";
import type { PlacedOrder } from "@/store/features/orderSlice";

function formatPlacedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function parseOrdersPayload(data: unknown): PlacedOrder[] | null {
  if (typeof data !== "object" || data === null || !("orders" in data)) {
    return null;
  }
  const raw = (data as { orders: unknown }).orders;
  if (!Array.isArray(raw)) {
    return null;
  }
  return raw as PlacedOrder[];
}

const assignDriverButtonClass =
  "mt-4 inline-flex w-full max-w-md items-center justify-center rounded-full border-4 border-double border-fuchsia-300 bg-fuchsia-50/95 px-4 py-2 text-xs font-bold text-fuchsia-900 shadow-[inset_0_0_0_1px_rgba(217,70,239,0.15)] transition-colors hover:bg-fuchsia-100/90 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 sm:w-auto sm:max-w-none sm:px-5 sm:py-2.5 sm:text-sm lg:max-w-sm xl:max-w-md";

export default function AllOrders() {
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignOrderId, setAssignOrderId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders");
      const data: unknown = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not load orders.";
        setError(message);
        setOrders([]);
        return;
      }

      const list = parseOrdersPayload(data);
      if (!list) {
        setError("Invalid response from server.");
        setOrders([]);
        return;
      }

      setOrders(list);
    } catch {
      setError("Could not reach the server.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
        Loading orders…
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 transition-colors hover:bg-red-50"
        >
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600">
        No orders in the database yet.
      </p>
    );
  }

  return (
    <>
      <AssignDriverModal
        open={assignOrderId !== null}
        orderId={assignOrderId}
        onClose={() => setAssignOrderId(null)}
        onAssigned={() => void load()}
      />
      <ul className="space-y-5 md:space-y-6">
      {orders.map((order) => (
        <li
          key={order.id}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-slate-50/80 px-4 py-4 sm:grid-cols-3 sm:items-end sm:gap-6 sm:px-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order ID
              </p>
              <p className="mt-1 break-all font-mono text-xs font-medium leading-snug text-slate-900 sm:text-sm">
                {order.id}
              </p>
            </div>
            <div className="min-w-0 sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Placed
              </p>
              <p className="mt-1 text-sm text-slate-800">{formatPlacedAt(order.placedAt)}</p>
            </div>
            <div className="min-w-0 sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-fuchsia-600 sm:text-2xl">
                ${order.orderTotal.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-4 sm:p-5 lg:grid-cols-2 lg:gap-8 lg:items-start">
            <div className="min-w-0">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </h3>
              <p className="mt-2 break-words font-semibold text-slate-900">{order.name}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                <li>
                  <span className="text-slate-500">Email: </span>
                  <a
                    href={`mailto:${order.email}`}
                    className="text-fuchsia-700 underline-offset-2 hover:underline"
                  >
                    {order.email}
                  </a>
                </li>
                <li>
                  <span className="text-slate-500">Phone: </span>
                  {order.telephone}
                </li>
                <li className="break-words pt-1 leading-relaxed">
                  <span className="text-slate-500">Address: </span>
                  {order.address}, {order.city} {order.postalCode}, {order.country}
                </li>
              </ul>
              {order.assignedDriverName ? (
                <div className="mt-4 rounded-xl border border-fuchsia-100 bg-fuchsia-50/60 px-3 py-2.5 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-800">
                    Assigned driver
                  </p>
                  <p className="mt-1 break-words font-semibold text-slate-900">
                    {order.assignedDriverName}
                  </p>
                  {order.assignedDriverUuid && order.assignedDriverUuid !== "—" ? (
                    <p className="mt-1 break-all font-mono text-[11px] leading-snug text-slate-600 sm:text-xs">
                      {order.assignedDriverUuid}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => setAssignOrderId(order.id)}
                className={assignDriverButtonClass}
              >
                {order.assignedDriverName ? "Change driver" : "Assign driver"}
              </button>
            </div>

            <div className="min-w-0 lg:min-w-[min(100%,28rem)]">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Line items
              </h3>
              <div className="mt-2 overflow-x-auto rounded-lg border border-slate-100 [-webkit-overflow-scrolling:touch]">
                <table className="w-full min-w-[320px] text-left text-xs sm:min-w-[360px] sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                      <th className="px-2 py-2 sm:px-3">Product</th>
                      <th className="whitespace-nowrap px-2 py-2 text-right sm:px-3">Qty</th>
                      <th className="whitespace-nowrap px-2 py-2 text-right sm:px-3">Price</th>
                      <th className="whitespace-nowrap px-2 py-2 text-right sm:px-3">Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={`${order.id}-${item.id}`} className="border-b border-slate-50 last:border-0">
                        <td className="max-w-[11rem] px-2 py-2 font-medium text-slate-900 sm:max-w-none sm:px-3">
                          <span className="line-clamp-3 sm:line-clamp-none">{item.name}</span>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums text-slate-600 sm:px-3">
                          {item.quantity}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums text-slate-600 sm:px-3">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-right font-medium tabular-nums text-slate-900 sm:px-3">
                          ${item.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </li>
      ))}
      </ul>
    </>
  );
}
