"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { parseDriversListPayload, type DriverApiShape } from "@/models/drivers";

type AssignDriverModalProps = {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
  onAssigned?: () => void;
};

export default function AssignDriverModal({
  open,
  orderId,
  onClose,
  onAssigned,
}: AssignDriverModalProps) {
  const titleId = useId();
  const [drivers, setDrivers] = useState<DriverApiShape[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const response = await fetch("/api/admin/drivers", { credentials: "include" });
      const data: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not load drivers.";
        setListError(message);
        setDrivers([]);
        return;
      }
      const list = parseDriversListPayload(data);
      if (!list) {
        setListError("Invalid response from server.");
        setDrivers([]);
        return;
      }
      setDrivers(list);
    } catch {
      setListError("Could not reach the server.");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedId(null);
    void loadDrivers();
  }, [open, loadDrivers]);

  const handleClose = useCallback(() => {
    setSelectedId(null);
    setListError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, handleClose]);

  const handleAssign = async () => {
    if (!orderId || !selectedId) {
      toast.error("Select a driver.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, driverId: selectedId }),
      });
      const data: unknown = await response.json().catch(() => ({}));
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : "Could not assign driver.";
      if (!response.ok) {
        toast.error(message);
        return;
      }
      toast.success("Driver assigned to order.");
      onAssigned?.();
      handleClose();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !orderId) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(92dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
          <h2 id={titleId} className="text-lg font-bold text-slate-900">
            Assign driver
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
            aria-label="Close"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-xs text-slate-500">
            Order{" "}
            <span className="font-mono font-medium text-slate-700">{orderId}</span>
          </p>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading drivers…</p>
          ) : listError ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-red-700">{listError}</p>
              <button
                type="button"
                onClick={() => void loadDrivers()}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          ) : drivers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No drivers in the database. Add drivers from the Drivers page first.
            </p>
          ) : (
            <ul className="mt-4 space-y-2" role="listbox" aria-label="Drivers">
              {drivers.map((driver) => {
                const selected = selectedId === driver.id;
                return (
                  <li key={driver.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setSelectedId(driver.id)}
                      className={`flex w-full flex-col rounded-xl border px-3 py-3 text-left transition-colors sm:flex-row sm:items-center sm:justify-between ${
                        selected
                          ? "border-fuchsia-400 bg-fuchsia-50 ring-2 ring-fuchsia-200"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                      }`}
                    >
                      <span className="font-semibold text-slate-900">{driver.name}</span>
                      <span className="mt-1 font-mono text-[11px] text-slate-500 sm:mt-0">
                        {driver.uuid} · Age {driver.age}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 px-4 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || !selectedId || loading || !!listError}
            onClick={() => void handleAssign()}
            className="rounded-lg bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Assigning…" : "Assign to order"}
          </button>
        </div>
      </div>
    </div>
  );
}
