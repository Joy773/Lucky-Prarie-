"use client";

import { type FormEvent, useCallback, useEffect, useId, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";

type CreateDriverProps = {
  open: boolean;
  onClose: () => void;
  /** Called after the form submits successfully (before modal closes). */
  onSaveSuccess?: () => void;
};

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200";

const labelClassName =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export default function CreateDriver({ open, onClose, onSaveSuccess }: CreateDriverProps) {
  const titleId = useId();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setName("");
    setAge("");
    setAddress("");
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/drivers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: Number(age),
          address: address.trim(),
        }),
      });

      const data: unknown = await response.json().catch(() => ({}));
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : "Could not save driver.";

      if (!response.ok) {
        toast.error(message);
        return;
      }

      toast.success("Driver created.");
      onSaveSuccess?.();
      handleClose();
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
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
        className="flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <h2 id={titleId} className="text-lg font-bold text-slate-900 sm:text-xl">
            Create driver
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
            aria-label="Close create driver"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
        >
          <div className="space-y-5">
            <label className="block">
              <span className={labelClassName}>Driver name</span>
              <input
                name="driverName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className={inputClassName}
                placeholder="Full name"
              />
            </label>

            <label className="block">
              <span className={labelClassName}>Age</span>
              <input
                name="age"
                type="number"
                inputMode="numeric"
                min={16}
                max={100}
                step={1}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className={inputClassName}
                placeholder="e.g. 28"
              />
            </label>

            <label className="block">
              <span className={labelClassName}>Address</span>
              <textarea
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={4}
                autoComplete="street-address"
                className={`${inputClassName} min-h-[6rem] resize-y`}
                placeholder="Street, city, state, ZIP"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : "Save driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
