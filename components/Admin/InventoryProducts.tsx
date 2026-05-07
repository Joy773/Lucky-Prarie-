"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import AddProductModal, {
  type AdminProductDraft,
} from "@/components/Admin/AddProductModal";
import SearchBar from "@/components/layout/SearchBar";
import type { ProductApiShape } from "@/models/products";

const PLACEHOLDER_IMAGE = "/banner.png";

type ModalState =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; product: AdminProductDraft };

function productApiToDraft(p: ProductApiShape): AdminProductDraft {
  const imageUrl = p.imageUrl;
  const trimmed = imageUrl.trim();
  return {
    id: p.id,
    name: p.name,
    imageSrc: trimmed !== "" ? imageUrl : PLACEHOLDER_IMAGE,
    quantity: p.quantity,
    price: p.price,
    category: p.category,
    premium: p.premium,
    description: p.description,
    imageUrl,
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

export default function InventoryProducts() {
  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [products, setProducts] = useState<AdminProductDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const pageSize = 10;
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const name = p.name.toLowerCase();
      const category = p.category.toLowerCase();
      const description = (p.description ?? "").toLowerCase();
      return (
        name.includes(q) ||
        category.includes(q) ||
        description.includes(q) ||
        p.price.toFixed(2).includes(q)
      );
    });
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pagedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safePage]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/products", {
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
            : "Could not load products.";
        setError(message);
        setProducts([]);
        return;
      }

      const list = parseProductsPayload(data);
      if (!list) {
        setError("Invalid response from server.");
        setProducts([]);
        return;
      }

      setProducts(list.map(productApiToDraft));
      setPage(1);
    } catch {
      setError("Could not reach the server.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleDelete = useCallback(
    async (product: AdminProductDraft) => {
      if (
        !window.confirm(
          `Delete “${product.name}”? This cannot be undone.`
        )
      ) {
        return;
      }

      setDeletingId(product.id);
      try {
        const response = await fetch("/api/admin/products", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: product.id }),
        });

        const data: unknown = await response.json().catch(() => ({}));
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not delete product.";

        if (!response.ok) {
          toast.error(message);
          return;
        }

        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        if (modal.kind === "edit" && modal.product.id === product.id) {
          setModal({ kind: "closed" });
        }
        toast.success("Product deleted.");
      } catch {
        toast.error("Could not reach the server.");
      } finally {
        setDeletingId(null);
      }
    },
    [modal]
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setModal({ kind: "add" })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <FiPlus className="text-base sm:text-lg" aria-hidden />
          Add Product
        </button>

        <div className="w-full sm:max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            id="admin-products-search"
          />
        </div>
      </div>

      <AddProductModal
        key={
          modal.kind === "add"
            ? "add"
            : modal.kind === "edit"
              ? `edit-${modal.product.id}`
              : "idle"
        }
        open={modal.kind !== "closed"}
        mode={modal.kind === "edit" ? "edit" : "add"}
        product={modal.kind === "edit" ? modal.product : undefined}
        onClose={() => setModal({ kind: "closed" })}
        onSaveSuccess={() => void loadProducts()}
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading products…</p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadProducts()}
            className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-900 transition-colors hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-600">
          No products yet. Add one with the button above.
        </p>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-600">
          <p>No products found for &quot;{searchQuery.trim()}&quot;.</p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pagedProducts.map((product) => (
            <li key={product.id}>
              <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="relative aspect-square bg-slate-100">
                  <Image
                    src={product.imageSrc}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized={
                      product.imageSrc.startsWith("data:") ||
                      product.imageSrc.startsWith("blob:")
                    }
                  />
                </div>
                <div className="border-t border-slate-100 p-4">
                  <h2 className="truncate font-semibold text-slate-900">{product.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    ${product.price.toFixed(2)} · Qty {product.quantity}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setModal({ kind: "edit", product })}
                      disabled={deletingId === product.id}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                    >
                      <FiEdit2 className="text-base" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(product)}
                      disabled={deletingId === product.id}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                    >
                      <FiTrash2 className="text-base" aria-hidden />
                      {deletingId === product.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(filteredProducts.length, (safePage - 1) * pageSize + 1)}
              </span>
              {"–"}
              <span className="font-semibold text-slate-900">
                {Math.min(filteredProducts.length, safePage * pageSize)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{filteredProducts.length}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm font-semibold text-slate-800">
                Page {safePage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
