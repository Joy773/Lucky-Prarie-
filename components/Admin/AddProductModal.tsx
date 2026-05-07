"use client";

import Image from "next/image";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { FiStar, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

export type AdminProductDraft = {
  id: string;
  name: string;
  imageSrc: string;
  quantity: number;
  price: number;
  category: string;
  premium?: boolean;
  description?: string;
  imageUrl?: string;
};

function parseCategoriesFromProductsApi(data: unknown): string[] | null {
  if (typeof data !== "object" || data === null || !("categories" in data)) {
    return null;
  }
  const raw = (data as { categories: unknown }).categories;
  if (!Array.isArray(raw) || !raw.every((item) => typeof item === "string")) {
    return null;
  }
  return raw as string[];
}

/** Mirrors `PRODUCT_CATEGORIES` in `@/models/products` (not imported here to avoid bundling `mongodb` on the client). */
const FALLBACK_PRODUCT_CATEGORIES: string[] = [
  "Spirits",
  "Beer",
  "Wine",
  "Ciders & seltzers",
  "Mix & chips",
  "Non-alcoholic",
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsDataURL(file);
  });
}

type AddProductModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  product?: AdminProductDraft;
  /** Called after a product is created or updated successfully (before modal closes). */
  onSaveSuccess?: () => void;
};

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-200";

const labelClassName =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export default function AddProductModal({
  open,
  onClose,
  mode = "add",
  product,
  onSaveSuccess,
}: AddProductModalProps) {
  const titleId = useId();
  const isEdit = mode === "edit";
  const [name, setName] = useState(
    () => (mode === "edit" && product ? product.name : "")
  );
  const [quantity, setQuantity] = useState(
    () => (mode === "edit" && product ? String(product.quantity) : "")
  );
  const [price, setPrice] = useState(
    () => (mode === "edit" && product ? String(product.price) : "")
  );
  const [description, setDescription] = useState(
    () => (mode === "edit" && product ? (product.description ?? "") : "")
  );
  const [category, setCategory] = useState(
    () => (mode === "edit" && product ? product.category : "")
  );
  const [premium, setPremium] = useState(
    () => (mode === "edit" && product ? Boolean(product.premium) : false)
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baselineImageSrc, setBaselineImageSrc] = useState<string | null>(() =>
    mode === "edit" && product ? product.imageSrc : null
  );
  const imageFileRef = useRef<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const resetForm = useCallback(() => {
    setName("");
    setQuantity("");
    setPrice("");
    setDescription("");
    setCategory("");
    setPremium(false);
    setBaselineImageSrc(null);
    setImagePreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    imageFileRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    setFileInputKey((k) => k + 1);
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

  useEffect(() => {
    if (!open) {
      return;
    }
    setCategory(mode === "edit" && product ? product.category : "");
    setPremium(mode === "edit" && product ? Boolean(product.premium) : false);
  }, [open, mode, product]);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    setCategoriesLoading(true);
    (async () => {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const data: unknown = await response.json().catch(() => ({}));
        const list = parseCategoriesFromProductsApi(data);
        if (!cancelled) {
          setCategories(
            list && list.length > 0 ? list : FALLBACK_PRODUCT_CATEGORIES
          );
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || mode !== "add" || categories.length === 0) {
      return;
    }
    setCategory((prev) => (prev === "" ? categories[0] : prev));
  }, [open, mode, categories]);

  const assignImageFile = (file: File | null) => {
    setImagePreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return file ? URL.createObjectURL(file) : null;
    });
    imageFileRef.current = file;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (isEdit && !product) {
      toast.error("Missing product to edit.");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFileRef.current) {
        try {
          imageUrl = await fileToDataUrl(imageFileRef.current);
        } catch {
          toast.error("Could not read the image file.");
          setIsSubmitting(false);
          return;
        }
      } else if (isEdit && product) {
        imageUrl =
          product.imageUrl ??
          (product.imageSrc.startsWith("data:") ? product.imageSrc : "");
      }

      const payload = {
        name: name.trim(),
        price: Number(price),
        quantity: Number(quantity),
        description: description.trim(),
        imageUrl,
        category,
        premium,
      };

      const response = await fetch("/api/products", {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit && product
            ? {
                id: product.id,
                ...payload,
              }
            : payload
        ),
      });

      const data: unknown = await response.json().catch(() => ({}));
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : isEdit
            ? "Could not update product."
            : "Could not save product.";

      if (!response.ok) {
        toast.error(message);
        return;
      }

      toast.success(isEdit ? "Product updated." : "Product saved.");
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

  const showBaselineImage = Boolean(baselineImageSrc && !imagePreviewUrl);

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
            {isEdit ? "Edit product" : "Add product"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
            aria-label={isEdit ? "Close edit product" : "Close add product"}
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
        >
          <div className="space-y-5">
            <div>
              <span className={labelClassName}>Product image</span>
              <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-start">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-fuchsia-300 hover:bg-fuchsia-50/50">
                  <span>{isEdit ? "Replace image" : "Choose image"}</span>
                  <input
                    key={fileInputKey}
                    name="image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      assignImageFile(e.target.files?.[0] ?? null);
                    }}
                  />
                </label>
                <div className="relative h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:h-28 sm:w-28 sm:shrink-0">
                  {showBaselineImage && baselineImageSrc ? (
                    <Image
                      src={baselineImageSrc}
                      alt={name || "Product"}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : imagePreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                    <img
                      src={imagePreviewUrl}
                      alt="Selected product preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-slate-500">
                      No image selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            <label className="block">
              <span className={labelClassName}>Category</span>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={categoriesLoading || categories.length === 0}
                className={`${inputClassName} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
              >
                {categoriesLoading || categories.length === 0 ? (
                  <option value="">
                    {categoriesLoading ? "Loading categories…" : "Categories unavailable"}
                  </option>
                ) : (
                  categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                )}
              </select>
            </label>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Premium</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Mark this product as premium.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPremium((p) => !p)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-200 ${
                  premium
                    ? "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                aria-pressed={premium}
                aria-label={premium ? "Unset premium product" : "Set as premium product"}
              >
                <FiStar
                  className={`text-base ${premium ? "fill-current" : ""}`}
                  aria-hidden
                />
                {premium ? "Premium" : "Not premium"}
              </button>
            </div>

            <label className="block">
              <span className={labelClassName}>Name</span>
              <input
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClassName}
                placeholder="e.g. Discovery Pack"
              />
            </label>

            <label className="block">
              <span className={labelClassName}>Description</span>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`${inputClassName} min-h-[5rem] resize-y`}
                placeholder="Short description for the product"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClassName}>Quantity</span>
                <input
                  name="quantity"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className={inputClassName}
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className={labelClassName}>Price</span>
                <input
                  name="price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className={inputClassName}
                  placeholder="0.00"
                />
              </label>
            </div>
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
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Save product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
