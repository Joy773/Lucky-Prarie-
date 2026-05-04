"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiChevronRight,
  FiMapPin,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiStar,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { addToCart } from "@/store/features/cartSlice";
import { useAppDispatch } from "@/store/hooks";
import { useHomeSearch } from "@/components/home/HomeSearchContext";
import { filterProductsBySearchQuery } from "@/components/home/homeProductSearch";
import type { ProductApiShape } from "@/models/products";

type PremiumPackProduct = {
  id: string;
  src: string;
  alt: string;
  name: string;
  size: string;
  unit: string;
  price: number;
  category: string;
  description: string;
  stockQuantity: number;
};

function apiToPremiumPack(p: ProductApiShape): PremiumPackProduct {
  const img = p.imageUrl?.trim() || "/pack-1.png";
  return {
    id: p.id,
    src: img,
    alt: p.name,
    name: p.name,
    size: p.quantity > 0 ? `${p.quantity} in stock` : "Out of stock",
    unit: "each",
    price: p.price,
    category: p.category,
    description: p.description.trim() || "No description yet.",
    stockQuantity: p.quantity,
  };
}

function parseProductsPayload(data: unknown): ProductApiShape[] | null {
  if (typeof data !== "object" || data === null || !("products" in data)) {
    return null;
  }
  const raw = (data as { products: unknown }).products;
  if (!Array.isArray(raw)) {
    return null;
  }
  return raw as ProductApiShape[];
}

function imageUnoptimized(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("blob:");
}

export default function PremiumPacks() {
  const dispatch = useAppDispatch();
  const { query } = useHomeSearch();
  const [products, setProducts] = useState<PremiumPackProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/products?firstAdded=5", {
        cache: "no-store",
      });
      const data: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not load products.";
        setLoadError(message);
        setProducts([]);
        return;
      }
      const list = parseProductsPayload(data);
      if (!list) {
        setLoadError("Invalid response from server.");
        setProducts([]);
        return;
      }
      const mapped = list.map(apiToPremiumPack);
      setProducts(mapped);
      setQuantities(Object.fromEntries(mapped.map((p) => [p.id, 1])));
    } catch {
      setLoadError("Could not reach the server.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const increaseQty = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.stockQuantity <= 0) {
      return;
    }
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.min(
        product.stockQuantity,
        (prev[productId] ?? 1) + 1
      ),
    }));
  };

  const decreaseQty = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] ?? 1) - 1),
    }));
  };
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const filteredProducts = useMemo(
    () => filterProductsBySearchQuery(products, query),
    [products, query]
  );

  const searchActive = query.trim().length > 0;
  const handleAddToCart = (product: PremiumPackProduct, quantity: number) => {
    if (product.stockQuantity <= 0) {
      toast.error(`${product.name} is out of stock.`);
      return;
    }
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.src,
        category: product.category,
        size: product.size,
        unit: product.unit,
        quantity,
      })
    );
    toast.success(`${product.name} added to cart! Quantity: ${quantity}`);
  };

  return (
    <>
      <SectionWrapper className="py-10">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className="w-full text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:w-auto sm:text-left sm:text-4xl">
            {searchActive ? (
              <>
                Search{" "}
                <span className="bg-gradient-to-r from-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
                  results
                </span>
              </>
            ) : (
              <>
                Popular{" "}
                <span className="bg-gradient-to-r from-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
                  Premium
                </span>{" "}
                Picks
              </>
            )}
          </h2>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-100 px-5 py-2.5 text-base font-medium text-slate-800 transition-colors hover:bg-fuchsia-200"
          >
            Explore Collection
            <FiChevronRight className="text-lg" />
          </Link>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600 sm:text-left">
          {loading
            ? "Loading featured products…"
            : loadError
              ? loadError
              : `Showing ${filteredProducts.length} of ${products.length} products`}
          {!loading && !loadError && searchActive ? (
            <>
              {" "}
              for &quot;{query.trim()}&quot;
            </>
          ) : null}
        </p>

        {loadError && !loading ? (
          <p className="mt-7 rounded-xl border border-red-200 bg-red-50/80 px-4 py-6 text-center text-sm text-red-800">
            {loadError}{" "}
            <button
              type="button"
              onClick={() => void loadProducts()}
              className="mt-2 block w-full text-center font-semibold text-red-900 underline sm:mt-0 sm:inline sm:w-auto"
            >
              Retry
            </button>
          </p>
        ) : null}

        {!loading && !loadError && products.length === 0 && !searchActive ? (
          <p className="mt-7 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-600">
            No products in the catalog yet. Browse the collection when items are available.
          </p>
        ) : !loading && !loadError ? (
        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              onClick={() => setSelectedProductId(product.id)}
              className="cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="relative h-56 overflow-hidden bg-gradient-to-b from-white to-slate-200 p-4">
                <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  <FiStar className="text-[11px]" />
                  Premium
                </span>

                <div className="relative h-full w-full">
                  <Image
                    src={product.src}
                    alt={product.alt}
                    fill
                    unoptimized={imageUnoptimized(product.src)}
                    className="object-contain p-3 drop-shadow-xl"
                  />
                </div>

                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                  <FiShoppingCart className="text-xs" />
                  {product.category}
                </span>
              </div>

              <div className="p-4">
                <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-slate-900">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500">{product.size}</p>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold tracking-tight text-slate-900">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500">per {product.unit}</p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      aria-label={`Decrease quantity for ${product.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        decreaseQty(product.id);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                    >
                      <FiMinus />
                    </button>
                    <span className="text-base font-semibold text-slate-900">
                      {quantities[product.id] ?? 1}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity for ${product.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        increaseQty(product.id);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddToCart(product, quantities[product.id] ?? 1);
                  }}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <FiShoppingCart />
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
        ) : null}

        {searchActive && filteredProducts.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">
            No products found for &quot;{query.trim()}&quot;.
          </p>
        ) : null}
      </SectionWrapper>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-[1080px] rounded-lg bg-white p-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedProductId(null)}
              className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500"
              aria-label="Close product details"
            >
              <FiX className="text-sm" />
            </button>

            <p className="px-2 text-sm font-semibold text-slate-900">{selectedProduct.name}</p>

            <div className="mt-3 grid grid-cols-1 gap-4 rounded-lg border border-fuchsia-200/60 p-2 md:grid-cols-[1.1fr_1fr]">
              <div className="relative min-h-[420px] rounded-xl border border-fuchsia-100 bg-white p-2">
                <Image
                  src={selectedProduct.src}
                  alt={selectedProduct.alt}
                  fill
                  unoptimized={imageUnoptimized(selectedProduct.src)}
                  className="object-contain p-4"
                />
              </div>

              <div className="flex min-h-[420px] flex-col">
                <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <FiMapPin className="text-[11px]" />
                  Unknown
                </div>
                <h3 className="mt-2 text-[36px] font-bold leading-tight text-slate-900">
                  {selectedProduct.name}
                </h3>

                <div className="mt-4 rounded-xl border border-fuchsia-100 bg-fuchsia-50/35 p-3">
                  <p className="text-xs text-slate-500">Price</p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-[42px] font-extrabold leading-none text-fuchsia-500">
                      ${selectedProduct.price.toFixed(2)}
                    </span>
                    <span className="pb-1 text-sm text-slate-500">per {selectedProduct.unit}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-800">Description</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="mt-4 w-full max-w-[260px] rounded-xl border border-slate-200 px-3 py-2">
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedProduct.category}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-800">Select Quantity</p>
                  <div className="mt-2 inline-flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-2 py-1">
                    <button
                      type="button"
                      onClick={() => decreaseQty(selectedProduct.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600"
                      aria-label={`Decrease quantity for ${selectedProduct.name}`}
                    >
                      <FiMinus />
                    </button>
                    <span className="min-w-6 text-center text-lg font-semibold text-slate-900">
                      {quantities[selectedProduct.id] ?? 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => increaseQty(selectedProduct.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600"
                      aria-label={`Increase quantity for ${selectedProduct.name}`}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleAddToCart(selectedProduct, quantities[selectedProduct.id] ?? 1)
                  }
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
                >
                  <FiShoppingCart />
                  Add to Cart ({quantities[selectedProduct.id] ?? 1})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
