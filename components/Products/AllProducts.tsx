"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FiMapPin, FiMinus, FiPackage, FiPlus, FiShoppingCart, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import SearchBar from "@/components/layout/SearchBar";
import SectionWrapper from "@/components/layout/SectionWrapper";
import type { ProductApiShape } from "@/models/products";
import { addToCart } from "@/store/features/cartSlice";
import { useAppDispatch } from "@/store/hooks";

type ShopProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  size: string;
  unit: string;
  stockQuantity: number;
};

function apiToShop(p: ProductApiShape): ShopProduct {
  const img = p.imageUrl?.trim() || "/pack-1.png";
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description.trim() || "No description yet.",
    image: img,
    category: p.category,
    size: p.quantity > 0 ? `${p.quantity} in stock` : "Out of stock",
    unit: "each",
    stockQuantity: p.quantity,
  };
}

function defaultQuantitiesFor(list: ShopProduct[]): Record<string, number> {
  return Object.fromEntries(list.map((p) => [p.id, 1]));
}

type AllProductsProps = {
  /** When set (e.g. from the server), skips client fetch and shows DB data immediately. */
  initialProducts?: ProductApiShape[];
};

export default function AllProducts({ initialProducts }: AllProductsProps) {
  const dispatch = useAppDispatch();
  const seededFromServer = initialProducts !== undefined;
  const [products, setProducts] = useState<ShopProduct[]>(() =>
    initialProducts ? initialProducts.map(apiToShop) : []
  );
  const [loading, setLoading] = useState(!seededFromServer);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    initialProducts ? defaultQuantitiesFor(initialProducts.map(apiToShop)) : {}
  );

  useEffect(() => {
    if (seededFromServer) {
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products", {
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
          if (!cancelled) {
            setProducts([]);
            toast.error(message);
          }
          return;
        }

        if (
          typeof data !== "object" ||
          data === null ||
          !("products" in data) ||
          !Array.isArray((data as { products: unknown }).products)
        ) {
          if (!cancelled) {
            setProducts([]);
            toast.error("Invalid product list from server.");
          }
          return;
        }

        const list = (data as { products: ProductApiShape[] }).products.map(apiToShop);
        if (!cancelled) {
          setProducts(list);
          setQuantities((prev) => {
            const next = { ...prev };
            for (const p of list) {
              if (next[p.id] === undefined) next[p.id] = 1;
            }
            return next;
          });
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          toast.error("Could not reach the server.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [seededFromServer]);

  const increaseQty = (id: string) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] ?? 1) + 1 }));
  };

  const decreaseQty = (id: string) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) - 1) }));
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return products;
    }
    return products.filter((product) => {
      const name = product.name.toLowerCase();
      const category = product.category.toLowerCase();
      const size = product.size.toLowerCase();
      const unit = product.unit.toLowerCase();
      const desc = product.description.toLowerCase();
      return (
        name.includes(query) ||
        category.includes(query) ||
        size.includes(query) ||
        unit.includes(query) ||
        desc.includes(query)
      );
    });
  }, [products, searchQuery]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const handleAddToCart = (product: ShopProduct, quantity: number) => {
    if (product.stockQuantity <= 0) {
      toast.error(`${product.name} is out of stock.`);
      return;
    }
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
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
      <SectionWrapper className="max-w-[1280px] py-8">
        <SearchBar value={searchQuery} onChange={setSearchQuery} id="products-search" />

        {loading ? (
          <p className="mt-8 text-center text-md text-slate-600">Loading products…</p>
        ) : (
          <p className="mt-8 text-center text-md text-slate-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              onClick={() => setSelectedProductId(product.id)}
              className="flex h-[516px] w-[290px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="relative h-[250px] bg-gradient-to-b from-white to-slate-200 p-4">
                <div className="relative h-full w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized={product.image.startsWith("data:")}
                    className="object-contain p-2"
                  />
                </div>

                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-slate-800">
                  <FiPackage className="text-xs" />
                  {product.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 min-h-[64px] text-xl font-bold leading-tight text-slate-900">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500">{product.size}</p>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-slate-900">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500">per {product.unit}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        decreaseQty(product.id);
                      }}
                      aria-label={`Decrease quantity for ${product.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                    >
                      <FiMinus />
                    </button>
                    <span className="text-lg font-semibold text-slate-900">
                      {quantities[product.id] ?? 1}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        increaseQty(product.id);
                      }}
                      aria-label={`Increase quantity for ${product.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
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
                  disabled={product.stockQuantity <= 0}
                  className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-md font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiShoppingCart />
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>

        {!loading && products.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            No products available yet. Check back soon.
          </p>
        )}

        {!loading && products.length > 0 && filteredProducts.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            No products found for &quot;{searchQuery}&quot;.
          </p>
        )}
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
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  unoptimized={selectedProduct.image.startsWith("data:")}
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
                  disabled={selectedProduct.stockQuantity <= 0}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
