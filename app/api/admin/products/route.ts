import { ObjectId, type WithId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  PRODUCTS_COLLECTION,
  type ProductRecord,
  documentToProductApi,
  parseCreateProductBody,
  parseUpdateProductBody,
  parseDeleteProductBody,
} from "@/models/products";

function getDbName(): string {
  return process.env.MONGODB_DB_NAME ?? "lucky-prairie";
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const cursor = db
      .collection<ProductRecord>(PRODUCTS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .limit(200);
    const docs = await cursor.toArray();
    const products = docs.map((doc) =>
      documentToProductApi({
        ...doc,
        imageUrl: doc.imageUrl ?? "",
      })
    );
    return NextResponse.json({ products });
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json(
      { error: "Could not load products." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const result = await db.collection<ProductRecord>(PRODUCTS_COLLECTION).insertOne(doc);

    const inserted: WithId<ProductRecord> = {
      ...doc,
      _id: result.insertedId,
    };

    const product = documentToProductApi(inserted);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json(
      { error: "Could not save product. Try again later." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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
    const updateResult = await db.collection<ProductRecord>(PRODUCTS_COLLECTION).updateOne(
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

    const product = documentToProductApi(updated);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("[PATCH /api/admin/products]", error);
    return NextResponse.json(
      { error: "Could not update product. Try again later." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseDeleteProductBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const result = await db.collection<ProductRecord>(PRODUCTS_COLLECTION).deleteOne({
      _id: new ObjectId(parsed.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/products]", error);
    return NextResponse.json(
      { error: "Could not delete product. Try again later." },
      { status: 500 }
    );
  }
}
