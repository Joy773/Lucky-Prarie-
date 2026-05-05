"use client";

import { useCallback, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CreateDriver from "@/components/Admin/CreateDriver";
import EditDriver from "@/components/Admin/EditDriver";
import { parseDriversListPayload, type DriverApiShape } from "@/models/drivers";

export default function Drivers() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverApiShape | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<DriverApiShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/drivers", {
        credentials: "include",
      });
      const data: unknown = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not load drivers.";
        setError(message);
        setDrivers([]);
        return;
      }

      const list = parseDriversListPayload(data);
      if (!list) {
        setError("Invalid response from server.");
        setDrivers([]);
        return;
      }

      setDrivers(list);
    } catch {
      setError("Could not reach the server.");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDrivers();
  }, [loadDrivers]);

  const handleDelete = useCallback(
    async (driver: DriverApiShape) => {
      setDeletingId(driver.id);
      try {
        const response = await fetch("/api/admin/drivers", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: driver.id }),
        });

        const data: unknown = await response.json().catch(() => ({}));
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not delete driver.";

        if (!response.ok) {
          toast.error(message);
          return;
        }

        setEditingDriver((prev) => (prev?.id === driver.id ? null : prev));
        toast.success("Driver deleted.");
        await loadDrivers();
      } catch {
        toast.error("Could not reach the server.");
      } finally {
        setDeletingId(null);
      }
    },
    [loadDrivers]
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <FiPlus className="text-base sm:text-lg" aria-hidden />
          Create new driver
        </button>
      </div>

      <CreateDriver
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaveSuccess={() => void loadDrivers()}
      />

      <EditDriver
        key={editingDriver?.id ?? "edit-closed"}
        open={editingDriver !== null}
        driver={editingDriver}
        onClose={() => setEditingDriver(null)}
        onSaveSuccess={() => void loadDrivers()}
      />

      {loading ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
          Loading drivers…
        </p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadDrivers()}
            className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 transition-colors hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      ) : drivers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-600">
          No drivers yet. Add one with the button above.
        </p>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {drivers.map((driver) => (
              <li key={driver.id}>
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{driver.name}</p>
                      <p className="mt-1 text-sm text-slate-600">Age {driver.age}</p>
                    </div>
                    <span className="inline-flex shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {driver.status}
                    </span>
                  </div>
                  <p className="mt-3 break-all font-mono text-[11px] leading-snug text-slate-600">
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      UUID{" "}
                    </span>
                    {driver.uuid}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingDriver(driver)}
                      disabled={deletingId === driver.id}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                    >
                      <FiEdit2 className="text-sm" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(driver)}
                      disabled={deletingId === driver.id}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 sm:flex-none"
                    >
                      <FiTrash2 className="text-sm" aria-hidden />
                      {deletingId === driver.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          <div className="hidden min-w-0 md:block">
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90">
                    <th className="px-3 py-3 font-semibold text-slate-700 sm:px-5">Name</th>
                    <th className="whitespace-nowrap px-3 py-3 font-semibold text-slate-700 sm:px-5">
                      Age
                    </th>
                    <th className="min-w-[12rem] px-3 py-3 font-semibold text-slate-700 sm:min-w-[14rem] sm:px-5">
                      UUID
                    </th>
                    <th className="whitespace-nowrap px-3 py-3 font-semibold text-slate-700 sm:px-5">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-3 py-3 font-semibold text-slate-700 sm:px-5">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="bg-white">
                      <td className="max-w-[10rem] px-3 py-3 font-medium text-slate-900 sm:max-w-none sm:px-5">
                        <span className="break-words">{driver.name}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-700 sm:px-5">
                        {driver.age}
                      </td>
                      <td className="max-w-[14rem] break-all px-3 py-3 font-mono text-[11px] leading-snug text-slate-600 sm:max-w-[18rem] sm:px-5 sm:text-xs">
                        {driver.uuid}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-5">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {driver.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 sm:px-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingDriver(driver)}
                            disabled={deletingId === driver.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FiEdit2 className="text-sm" aria-hidden />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(driver)}
                            disabled={deletingId === driver.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FiTrash2 className="text-sm" aria-hidden />
                            {deletingId === driver.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
