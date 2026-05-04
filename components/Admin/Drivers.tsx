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
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2"
        >
          <FiPlus className="text-lg" aria-hidden />
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
        <p className="text-sm text-slate-500">Loading drivers…</p>
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
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90">
                <th className="px-4 py-3 font-semibold text-slate-700 sm:px-5">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-700 sm:px-5">Age</th>
                <th className="px-4 py-3 font-semibold text-slate-700 sm:px-5">UUID</th>
                <th className="px-4 py-3 font-semibold text-slate-700 sm:px-5">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700 sm:px-5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((driver) => (
                <tr key={driver.id} className="bg-white">
                  <td className="px-4 py-3 font-medium text-slate-900 sm:px-5">
                    {driver.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700 sm:px-5">{driver.age}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600 sm:px-5">
                    {driver.uuid}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
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
      )}
    </div>
  );
}
