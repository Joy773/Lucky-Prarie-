import { ObjectId, type WithId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  DEFAULT_DRIVER_STATUS,
  DRIVER_STATUS_BUSY,
  DRIVERS_COLLECTION,
  type DriverMongoFields,
} from "@/models/drivers";
import {
  ORDERS_COLLECTION,
  type OrderRecord,
  documentToPlacedOrder,
  parseAssignDriverToOrderBody,
  parseCreateOrderBody,
  sumLineTotals,
} from "@/models/Order";

function getDbName(): string {
  return process.env.MONGODB_DB_NAME ?? "lucky-prairie";
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const cursor = db
      .collection<OrderRecord>(ORDERS_COLLECTION)
      .find({})
      .sort({ placedAt: -1 })
      .limit(100);
    const docs = await cursor.toArray();
    const orders = docs.map(documentToPlacedOrder);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json(
      { error: "Could not load orders." },
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

  const parsed = parseCreateOrderBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { billing, items } = parsed.data;
  const orderTotal = sumLineTotals(items);
  const placedAt = new Date();

  const doc: OrderRecord = {
    billing,
    items,
    orderTotal,
    placedAt,
  };

  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const result = await db.collection<OrderRecord>(ORDERS_COLLECTION).insertOne(doc);

    const inserted: WithId<OrderRecord> = {
      ...doc,
      _id: result.insertedId,
    };

    const order = documentToPlacedOrder(inserted);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      { error: "Could not save order. Try again later." },
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

  const parsed = parseAssignDriverToOrderBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(getDbName());
    const orderObjectId = new ObjectId(parsed.orderId);
    const driverObjectId = new ObjectId(parsed.driverId);

    const existingOrder = await db.collection<OrderRecord>(ORDERS_COLLECTION).findOne({
      _id: orderObjectId,
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const previousAssignedId = existingOrder.assignedDriverId;

    const driver = await db
      .collection<DriverMongoFields>(DRIVERS_COLLECTION)
      .findOne({ _id: driverObjectId });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found." }, { status: 404 });
    }

    const driverUuid =
      typeof driver.uuid === "string" && driver.uuid.length > 0 ? driver.uuid : "—";

    const now = new Date();

    await db.collection<OrderRecord>(ORDERS_COLLECTION).updateOne(
      { _id: orderObjectId },
      {
        $set: {
          assignedDriverId: parsed.driverId,
          assignedDriverUuid: driverUuid,
          assignedDriverName: driver.name,
        },
      }
    );

    await db.collection<DriverMongoFields>(DRIVERS_COLLECTION).updateOne(
      { _id: driverObjectId },
      { $set: { status: DRIVER_STATUS_BUSY, updatedAt: now } }
    );

    if (
      previousAssignedId &&
      previousAssignedId !== parsed.driverId
    ) {
      const stillAssignedCount = await db
        .collection<OrderRecord>(ORDERS_COLLECTION)
        .countDocuments({ assignedDriverId: previousAssignedId });

      if (stillAssignedCount === 0) {
        await db.collection<DriverMongoFields>(DRIVERS_COLLECTION).updateOne(
          { _id: new ObjectId(previousAssignedId) },
          { $set: { status: DEFAULT_DRIVER_STATUS, updatedAt: new Date() } }
        );
      }
    }

    const updated = await db.collection<OrderRecord>(ORDERS_COLLECTION).findOne({
      _id: orderObjectId,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Order was updated but could not be loaded." },
        { status: 500 }
      );
    }

    const order = documentToPlacedOrder(updated);
    return NextResponse.json({ order });
  } catch (error) {
    console.error("[PATCH /api/orders]", error);
    return NextResponse.json(
      { error: "Could not assign driver. Try again later." },
      { status: 500 }
    );
  }
}
