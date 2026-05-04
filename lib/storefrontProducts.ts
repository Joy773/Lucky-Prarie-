import clientPromise from "@/lib/mongodb";
import {
  PRODUCTS_COLLECTION,
  type ProductRecord,
  documentToProductApi,
  type ProductApiShape,
} from "@/models/products";

function getDbName(): string {
  return process.env.MONGODB_DB_NAME ?? "lucky-prairie";
}

/** Products for the public storefront (same list as `GET /api/products`). */
export async function listStorefrontProducts(): Promise<ProductApiShape[]> {
  const client = await clientPromise;
  const db = client.db(getDbName());
  const cursor = db
    .collection<ProductRecord>(PRODUCTS_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .limit(200);
  const docs = await cursor.toArray();
  return docs.map((doc) =>
    documentToProductApi({
      ...doc,
      imageUrl: doc.imageUrl ?? "",
    })
  );
}

/**
 * Oldest products by `createdAt` (first added to the catalog), for home “Premium Picks”.
 */
export async function listFirstAddedStorefrontProducts(
  limit: number
): Promise<ProductApiShape[]> {
  const capped = Math.min(200, Math.max(1, Math.floor(limit)));
  const client = await clientPromise;
  const db = client.db(getDbName());
  const cursor = db
    .collection<ProductRecord>(PRODUCTS_COLLECTION)
    .find({})
    .sort({ createdAt: 1 })
    .limit(capped);
  const docs = await cursor.toArray();
  return docs.map((doc) =>
    documentToProductApi({
      ...doc,
      imageUrl: doc.imageUrl ?? "",
    })
  );
}
