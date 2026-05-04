/** MongoDB collection name for delivery drivers. */
export const DRIVERS_COLLECTION = "drivers" as const;

/** Default status for newly created drivers. */
export const DEFAULT_DRIVER_STATUS = "Idle" as const;

/** Status while a driver is assigned to at least one delivery order. */
export const DRIVER_STATUS_BUSY = "Busy" as const;

/** Fields persisted for a driver (new inserts always include uuid + status). */
export type DriverMongoFields = {
  name: string;
  age: number;
  address: string;
  /** UUID v4, generated on create. Older documents may omit this until backfilled. */
  uuid?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Full document written on POST (uuid and status always set). */
export type DriverRecord = DriverMongoFields & {
  uuid: string;
  status: string;
};

export type CreateDriverBody = {
  name: string;
  age: number;
  address: string;
};

export type UpdateDriverBody = CreateDriverBody & {
  id: string;
};

export type DriverApiShape = {
  id: string;
  name: string;
  age: number;
  address: string;
  uuid: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const MAX_ADDRESS_LENGTH = 2000;

/** Matches MongoDB ObjectId hex strings without importing the `mongodb` package (keeps this module safe for client bundles). */
function isLikelyObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function parseAge(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Number.isInteger(raw) ? raw : null;
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = Number(raw);
    if (Number.isFinite(n) && Number.isInteger(n)) {
      return n;
    }
  }
  return null;
}

export function parseCreateDriverBody(body: unknown):
  | { ok: true; data: CreateDriverBody }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = body as Record<string, unknown>;

  if (!isNonEmptyString(o.name)) {
    return { ok: false, error: "Driver name is required." };
  }

  const age = parseAge(o.age);
  if (age === null) {
    return { ok: false, error: "Age must be a whole number." };
  }
  if (age < 16 || age > 100) {
    return { ok: false, error: "Age must be between 16 and 100." };
  }

  if (!isNonEmptyString(o.address)) {
    return { ok: false, error: "Address is required." };
  }
  const address = o.address.trim();
  if (address.length > MAX_ADDRESS_LENGTH) {
    return {
      ok: false,
      error: `Address is too long (max ${MAX_ADDRESS_LENGTH} characters).`,
    };
  }

  return {
    ok: true,
    data: {
      name: o.name.trim(),
      age,
      address,
    },
  };
}

export function parseUpdateDriverBody(body: unknown):
  | { ok: true; data: UpdateDriverBody }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = body as Record<string, unknown>;
  const docId = o.id;
  if (typeof docId !== "string" || !isLikelyObjectId(docId)) {
    return { ok: false, error: "Invalid driver id." };
  }
  const rest = { ...o };
  delete rest.id;
  const parsed = parseCreateDriverBody(rest);
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

export function parseDeleteDriverBody(body: unknown):
  | { ok: true; id: string }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = body as Record<string, unknown>;
  if (typeof o.id !== "string" || !isLikelyObjectId(o.id)) {
    return { ok: false, error: "Invalid driver id." };
  }
  return { ok: true, id: o.id };
}

/** Document as returned by the MongoDB driver (`_id` has `toString()`). */
export type DriverMongoDocument = DriverMongoFields & {
  _id: { toString(): string };
};

export function documentToDriverApi(doc: DriverMongoDocument): DriverApiShape {
  const uuid =
    typeof doc.uuid === "string" && doc.uuid.length > 0 ? doc.uuid : "—";
  const status =
    typeof doc.status === "string" && doc.status.length > 0
      ? doc.status
      : DEFAULT_DRIVER_STATUS;

  return {
    id: doc._id.toString(),
    name: doc.name,
    age: doc.age,
    address: doc.address,
    uuid,
    status,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
}

/** Parses JSON from GET /api/admin/drivers. */
export function parseDriversListPayload(data: unknown): DriverApiShape[] | null {
  if (typeof data !== "object" || data === null || !("drivers" in data)) {
    return null;
  }
  const raw = (data as { drivers: unknown }).drivers;
  if (!Array.isArray(raw)) {
    return null;
  }
  return raw as DriverApiShape[];
}
