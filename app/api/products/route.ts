import { cookies } from "next/headers";
import { ObjectId, type WithId } from "mongodb";
import { NextResponse } from "next/server";
import { PRODUCT_CATEGORIES } from "@/models/products";
import {
  listFirstAddedStorefrontProducts,
  listPremiumStorefrontProducts,
  listStorefrontProducts,
} from "@/lib/storefrontProducts";
import clientPromise from "@/lib/mongodb";
import { verifyLpAdminCookie } from "@/lib/adminSession";
import {
  PRODUCTS_COLLECTION,
  type ProductRecord,
  documentToProductApi,
  parseCreateProductBody,
  parseUpdateProductBody,
} from "@/models/products";

function getDbName(): string {
  return process.env.MONGODB_DB_NAME ?? "lucky-prairie";
}

/** Public product list for the storefront (no admin cookie). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const premiumRaw = searchParams.get("premium");
    const firstAddedRaw = searchParams.get("firstAdded");
    let products;
    const premiumRequested =
      premiumRaw !== null &&
      premiumRaw !== "" &&
      ["1", "true", "yes", "on"].includes(premiumRaw.trim().toLowerCase());

    if (premiumRequested) {
      const limitRaw = searchParams.get("limit");
      const limit =
        limitRaw && /^\d+$/.test(limitRaw)
          ? Number.parseInt(limitRaw, 10)
          : 200;
      products = await listPremiumStorefrontProducts(
        Number.isFinite(limit) ? limit : 200
      );
      // Defensive: ensure only premium items are returned.
      products = products.filter((p) => p.premium);
    } else if (
      firstAddedRaw !== null &&
      firstAddedRaw !== "" &&
      /^\d+$/.test(firstAddedRaw)
    ) {
      const n = Number.parseInt(firstAddedRaw, 10);
      products = await listFirstAddedStorefrontProducts(
        Number.isFinite(n) ? n : 5
      );
    } else {
      products = await listStorefrontProducts();
    }
    return NextResponse.json(
      {
        products,
        categories: [...PRODUCT_CATEGORIES],
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Could not load products." },
      { status: 500 }
    );
  }
}

async function requireAdmin(): Promise<{ ok: true } | { ok: false; response: Response }> {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const cookieStore = await cookies();
  const ok = await verifyLpAdminCookie(cookieStore, adminPassword);
  if (!ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }
  return { ok: true };
}

/** Admin-only create product (used by AddProductModal). */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseCreateProductBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const now = new Date();
  const doc: ProductRecord = {
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const result = await db
      .collection<ProductRecord>(PRODUCTS_COLLECTION)
      .insertOne(doc);

    const inserted: WithId<ProductRecord> = {
      ...doc,
      _id: result.insertedId,
    };

    const product = documentToProductApi(inserted);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/products]", error);
    return NextResponse.json(
      { error: "Could not save product. Try again later." },
      { status: 500 }
    );
  }
}

/** Admin-only update product (used by AddProductModal). */
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseUpdateProductBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { id, ...fields } = parsed.data;

  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const objectId = new ObjectId(id);
    const updateResult = await db
      .collection<ProductRecord>(PRODUCTS_COLLECTION)
      .updateOne(
        { _id: objectId },
        {
          $set: {
            ...fields,
            updatedAt: new Date(),
          },
        }
      );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const updated = await db.collection<ProductRecord>(PRODUCTS_COLLECTION).findOne({
      _id: objectId,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Product was updated but could not be loaded." },
        { status: 500 }
      );
    }

    const product = documentToProductApi(updated as WithId<ProductRecord>);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("[PATCH /api/products]", error);
    return NextResponse.json(
      { error: "Could not update product. Try again later." },
      { status: 500 }
    );
  }
}
