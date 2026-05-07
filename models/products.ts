import { ObjectId, type WithId } from "mongodb";

export const PRODUCTS_COLLECTION = "products" as const;

/** Max length for `imageUrl` (e.g. data URLs); keeps documents under MongoDB’s 16MB cap. */
export const MAX_IMAGE_URL_LENGTH = 10_000_000;

/** Fixed storefront / admin categories (also returned by `GET /api/products` as `categories`). */
export const PRODUCT_CATEGORIES = [
  "Spirits",
  "Beer",
  "Wine",
  "Ciders & seltzers",
  "Mix & chips",
  "Non-alcoholic",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

/** Used when older documents have no `category` field. */
export const DEFAULT_PRODUCT_CATEGORY: ProductCategory = PRODUCT_CATEGORIES[0];

/** Document stored in MongoDB `products` collection. */
export type ProductRecord = {
  name: string;
  price: number;
  description: string;
  quantity: number;
  /** Public URL or data URL (`data:image/...;base64,...`) for the product image. */
  imageUrl: string;
  /** Premium products are highlighted in the storefront. */
  premium?: boolean;
  /** One of {@link PRODUCT_CATEGORIES}; may be missing on legacy documents. */
  category?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProductBody = {
  name: string;
  price: number;
  description: string;
  quantity: number;
  imageUrl: string;
  premium: boolean;
  category: ProductCategory;
};

export type UpdateProductBody = CreateProductBody & {
  id: string;
};

export type ProductApiShape = {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
  imageUrl: string;
  premium: boolean;
  category: ProductCategory;
  createdAt: string;
  updatedAt: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function parseCreateProductBody(body: unknown):
  | { ok: true; data: CreateProductBody }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = body as Record<string, unknown>;

  if (!isNonEmptyString(o.name)) {
    return { ok: false, error: "Name is required." };
  }

  if (typeof o.description !== "string") {
    return { ok: false, error: "Description must be a string." };
  }

  if (typeof o.quantity !== "number" || !Number.isFinite(o.quantity)) {
    return { ok: false, error: "Quantity must be a number." };
  }
  if (!Number.isInteger(o.quantity) || o.quantity < 0) {
    return { ok: false, error: "Quantity must be a non-negative integer." };
  }

  if (typeof o.price !== "number" || !Number.isFinite(o.price)) {
    return { ok: false, error: "Price must be a number." };
  }
  if (o.price < 0) {
    return { ok: false, error: "Price cannot be negative." };
  }

  const imageUrl =
    typeof o.imageUrl === "string" ? o.imageUrl.trim() : "";
  if (imageUrl.length > MAX_IMAGE_URL_LENGTH) {
    return {
      ok: false,
      error: `Image data is too large (max ${MAX_IMAGE_URL_LENGTH} characters). Use a smaller file or host the image elsewhere.`,
    };
  }

  const rawCategory = typeof o.category === "string" ? o.category.trim() : "";
  if (!rawCategory || !isProductCategory(rawCategory)) {
    return { ok: false, error: "A valid category is required." };
  }

  const premium = typeof o.premium === "boolean" ? o.premium : false;

  return {
    ok: true,
    data: {
      name: o.name.trim(),
      description: o.description.trim(),
      quantity: o.quantity,
      price: o.price,
      imageUrl,
      premium,
      category: rawCategory,
    },
  };
}

export function parseUpdateProductBody(body: unknown):
  | { ok: true; data: UpdateProductBody }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = body as Record<string, unknown>;
  const docId = o.id;
  if (typeof docId !== "string" || !ObjectId.isValid(docId)) {
    return { ok: false, error: "Invalid product id." };
  }
  const rest = { ...o };
  delete rest.id;
  const parsed = parseCreateProductBody(rest);
  if (!parsed.ok) {
    return parsed;
  }
  return {
    ok: true,
    data: {
      id: docId,
      ...parsed.data,
    },
  };
}

export function parseDeleteProductBody(body: unknown):
  | { ok: true; id: string }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = body as Record<string, unknown>;
  if (typeof o.id !== "string" || !ObjectId.isValid(o.id)) {
    return { ok: false, error: "Invalid product id." };
  }
  return { ok: true, id: o.id };
}

export function documentToProductApi(doc: WithId<ProductRecord>): ProductApiShape {
  const category =
    typeof doc.category === "string" && isProductCategory(doc.category)
      ? doc.category
      : DEFAULT_PRODUCT_CATEGORY;

  return {
    id: doc._id.toString(),
    name: doc.name,
    price: doc.price,
    description: doc.description,
    quantity: doc.quantity,
    imageUrl: doc.imageUrl ?? "",
    premium: Boolean(doc.premium),
    category,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
}
