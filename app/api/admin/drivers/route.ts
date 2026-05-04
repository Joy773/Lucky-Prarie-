import { randomUUID } from "node:crypto";
import { ObjectId, type WithId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  DRIVERS_COLLECTION,
  DEFAULT_DRIVER_STATUS,
  type DriverMongoFields,
  type DriverRecord,
  documentToDriverApi,
  parseCreateDriverBody,
  parseDeleteDriverBody,
  parseUpdateDriverBody,
} from "@/models/drivers";

function getDbName(): string {
  return process.env.MONGODB_DB_NAME ?? "lucky-prairie";
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const cursor = db
      .collection<DriverMongoFields>(DRIVERS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .limit(200);
    const docs = await cursor.toArray();
    const drivers = docs.map((doc) => documentToDriverApi(doc));
    return NextResponse.json({ drivers });
  } catch (error) {
    console.error("[GET /api/admin/drivers]", error);
    return NextResponse.json(
      { error: "Could not load drivers." },
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

  const parsed = parseCreateDriverBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const now = new Date();
  const doc: DriverRecord = {
    ...parsed.data,
    uuid: randomUUID(),
    status: DEFAULT_DRIVER_STATUS,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const result = await db.collection<DriverRecord>(DRIVERS_COLLECTION).insertOne(doc);

    const inserted: WithId<DriverRecord> = {
      ...doc,
      _id: result.insertedId,
    };

    const driver = documentToDriverApi(inserted);
    return NextResponse.json({ driver }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/drivers]", error);
    return NextResponse.json(
      { error: "Could not save driver. Try again later." },
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

  const parsed = parseUpdateDriverBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { id, ...fields } = parsed.data;

  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const objectId = new ObjectId(id);
    const updateResult = await db.collection<DriverMongoFields>(DRIVERS_COLLECTION).updateOne(
      { _id: objectId },
      {
        $set: {
          ...fields,
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Driver not found." }, { status: 404 });
    }

    const updated = await db.collection<DriverMongoFields>(DRIVERS_COLLECTION).findOne({
      _id: objectId,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Driver was updated but could not be loaded." },
        { status: 500 }
      );
    }

    const driver = documentToDriverApi(updated);
    return NextResponse.json({ driver });
  } catch (error) {
    console.error("[PATCH /api/admin/drivers]", error);
    return NextResponse.json(
      { error: "Could not update driver. Try again later." },
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

  const parsed = parseDeleteDriverBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const result = await db.collection<DriverMongoFields>(DRIVERS_COLLECTION).deleteOne({
      _id: new ObjectId(parsed.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Driver not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/drivers]", error);
    return NextResponse.json(
      { error: "Could not delete driver. Try again later." },
      { status: 500 }
    );
  }
}
