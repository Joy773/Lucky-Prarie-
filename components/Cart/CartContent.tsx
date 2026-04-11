"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import CheckoutModal from "@/components/Cart/CheckoutModal";
import SectionWrapper from "@/components/layout/SectionWrapper";
import {
  clearCart,
  decreaseCartItem,
  increaseCartItem,
  removeFromCart,
} from "@/store/features/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function CartContent() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { subtotal, totalUnits } = useMemo(() => {
    const sub = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const units = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal: sub, totalUnits: units };
  }, [cartItems]);

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.info("Cart cleared");
  };

  if (cartItems.length === 0) {
    return (
      <SectionWrapper className="py-8 sm:py-12">
        <div className="mx-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Your Cart</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Your selected products will appear here.
          </p>
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center sm:mt-6 sm:p-6">
            <p className="text-sm text-slate-600">Your cart is currently empty.</p>
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
    <>
      <SectionWrapper className="py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1160px]">
          <h1 className="mb-5 text-2xl font-bold text-slate-900 sm:mb-6 sm:text-3xl">Your Cart</h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_min(100%,300px)] md:items-start md:gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,340px)] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <div className="space-y-3 sm:space-y-4">
              {cartItems.map((item) => {
                const itemTotal = item.price * item.quantity;

                return (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="relative h-16 w-16 shrink-0 rounded-md border border-slate-200 bg-white p-1 sm:h-14 sm:w-14">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="(max-width: 640px) 64px, 56px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="min-w-0 pr-1">
                            <h3 className="text-base font-extrabold leading-snug text-slate-900 sm:text-lg md:text-xl">
                              <span className="line-clamp-2 sm:line-clamp-none sm:truncate">
                                {item.name}
                              </span>
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase sm:gap-2 sm:text-[11px]">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                                {item.category}
                              </span>
                              <span className="text-slate-500">{item.size}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              dispatch(removeFromCart(item.id));
                              toast(`${item.name} has been removed`);
                            }}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-rose-200 text-rose-500 transition-colors hover:bg-rose-50 sm:h-8 sm:w-8"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <FiTrash2 className="text-base sm:text-sm" />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                          <div className="inline-flex w-fit max-w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-1.5 py-1 sm:gap-4 sm:px-2">
                            <button
                              type="button"
                              onClick={() => dispatch(decreaseCartItem(item.id))}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 sm:h-8 sm:w-8"
                              aria-label={`Decrease quantity for ${item.name}`}
                            >
                              <FiMinus className="text-lg sm:text-base" />
                            </button>
                            <span className="min-w-[1.75rem] text-center text-lg font-semibold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => dispatch(increaseCartItem(item.id))}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 sm:h-8 sm:w-8"
                              aria-label={`Increase quantity for ${item.name}`}
                            >
                              <FiPlus className="text-lg sm:text-base" />
                            </button>
                          </div>

                          <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                            <p className="text-2xl font-extrabold leading-none text-slate-900 sm:text-right sm:text-3xl md:text-4xl">
                              ${itemTotal.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500 sm:text-right">
                              {item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 sm:mt-6">
              <Link
                href="/products"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto sm:min-h-0 sm:py-2"
              >
                <FiShoppingBag />
                Continue Shopping
              </Link>
            </div>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.08)] sm:p-5 md:sticky md:top-20 lg:top-24">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Order Summary</h2>

            <div className="mt-4 space-y-2.5 text-sm text-slate-700 sm:mt-5">
              <div className="flex items-center justify-between gap-3">
                <span>Subtotal</span>
                <span className="shrink-0 font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Items</span>
                <span className="shrink-0 font-bold text-slate-900">{totalUnits}</span>
              </div>
            </div>

            <div className="my-4 h-px bg-slate-200 sm:my-5" />

            <div className="flex items-end justify-between gap-3">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-xl font-bold leading-none text-fuchsia-600 sm:text-2xl">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
            >
              <FiShoppingBag className="text-base" />
              Checkout
            </button>

            <button
              type="button"
              onClick={handleClearCart}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <FiTrash2 className="text-base" />
              Clear Cart
            </button>
          </aside>
          </div>
        </div>
      </SectionWrapper>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
