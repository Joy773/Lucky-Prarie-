"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import AddProductModal, {
  type AdminProductDraft,
} from "@/components/Admin/AddProductModal";
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
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModal({ kind: "add" })}
          className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2"
        >
          <FiPlus className="text-lg" aria-hidden />
          Add Product
        </button>
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
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
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
      )}
    </div>
  );
}
