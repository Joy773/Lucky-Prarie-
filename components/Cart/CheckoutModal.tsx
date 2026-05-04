"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { clearCart } from "@/store/features/cartSlice";
import { placeOrder } from "@/store/features/orderSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !telephone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !zip.trim() ||
      !country
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const billing = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      telephone: telephone.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: zip.trim(),
      country,
    };

    const lineItems = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      lineTotal: item.price * item.quantity,
    }));

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing, items: lineItems }),
      });

      const data: unknown = await response.json().catch(() => ({}));
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : "Could not place order.";

      if (!response.ok) {
        toast.error(message);
        return;
      }

      const orderPayload =
        typeof data === "object" &&
        data !== null &&
        "order" in data &&
        typeof (data as { order: unknown }).order === "object" &&
        (data as { order: unknown }).order !== null
          ? (data as { order: Record<string, unknown> }).order
          : null;

      if (!orderPayload || typeof orderPayload.id !== "string") {
        toast.error("Invalid response from server.");
        return;
      }

      dispatch(
        placeOrder({
          billing,
          items: lineItems,
          id: orderPayload.id,
          placedAt:
            typeof orderPayload.placedAt === "string" ? orderPayload.placedAt : undefined,
        })
      );
      dispatch(clearCart());

      toast.success("Order placed successfully.");
      onClose();
    } catch {
      toast.error("Could not reach the server. Try again.");
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
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-modal-title"
        className="flex max-h-[min(92dvh,880px)] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <h2 id="checkout-modal-title" className="text-lg font-bold text-slate-900 sm:text-xl">
            Checkout
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
            aria-label="Close checkout"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_min(280px,34%)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* Billing */}
            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">Billing Information</h3>

              <form onSubmit={handleSubmit} className="mt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-1">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      First Name
                    </span>
                    <input
                      name="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                      autoComplete="given-name"
                    />
                  </label>
                  <label className="block sm:col-span-1">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Last Name
                    </span>
                    <input
                      name="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                      autoComplete="family-name"
                    />
                  </label>
                  <label className="block sm:col-span-1">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </span>
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                      autoComplete="email"
                    />
                  </label>
                  <label className="block sm:col-span-1">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Telephone
                    </span>
                    <input
                      name="telephone"
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                      autoComplete="tel"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Address
                    </span>
                    <input
                      name="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                      autoComplete="street-address"
                    />
                  </label>

                  <label className="block sm:col-span-1">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      City
                    </span>
                    <input
                      name="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                      autoComplete="address-level2"
                    />
                  </label>
                  <label className="block sm:col-span-1">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Zip / Postal Code
                    </span>
                    <input
                      name="zip"
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                      autoComplete="postal-code"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Country
                    </span>
                    <div className="relative">
                      <select
                        name="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
                      >
                        <option value="">Select...</option>
                        <option value="CA">Canada</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </div>
                  </label>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-11 w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {isSubmitting ? "Submitting…" : "Submit"}
                  </button>
                </div>
              </form>
            </div>

            {/* Order summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 lg:bg-white lg:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 sm:text-lg">Order Summary</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 text-xs font-medium text-slate-400 transition-colors hover:text-fuchsia-600"
                >
                  Edit
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-slate-500">Your cart is empty.</p>
                ) : (
                  cartItems.map((item) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <div key={item.id} className="flex gap-3 border-b border-slate-200/80 pb-4 last:border-0 last:pb-0">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold leading-snug text-slate-900">{item.name}</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            {item.category} · {item.size} · {item.unit}
                          </p>
                          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                            <span className="text-slate-600">Qty: {item.quantity}</span>
                            <span className="font-semibold text-slate-900">
                              ${lineTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-lg font-bold text-fuchsia-600 sm:text-xl">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
