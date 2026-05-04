const textEncoder = new TextEncoder();

function base64UrlToUtf8(b64url: string): string {
  const pad =
    b64url.length % 4 === 0 ? "" : "=".repeat(4 - (b64url.length % 4));
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, textEncoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

type CookieStore = {
  get: (name: string) => { value: string } | undefined;
};

/**
 * Verifies the `lp_admin` cookie issued by POST /api/admin/login (Edge-safe).
 */
export async function verifyLpAdminCookie(
  cookies: CookieStore,
  adminPassword: string
): Promise<boolean> {
  const token = cookies.get("lp_admin")?.value;
  if (!token || !adminPassword) {
    return false;
  }

  let payload: { e?: unknown; exp?: unknown; sig?: unknown };
  try {
    payload = JSON.parse(base64UrlToUtf8(token)) as {
      e?: unknown;
      exp?: unknown;
      sig?: unknown;
    };
  } catch {
    return false;
  }

  if (
    typeof payload.e !== "string" ||
    typeof payload.exp !== "number" ||
    typeof payload.sig !== "string"
  ) {
    return false;
  }

  if (payload.exp < Date.now()) {
    return false;
  }

  const message = `${payload.e}:${payload.exp}`;
  const expectedHex = await hmacSha256Hex(adminPassword, message);
  return timingSafeEqualHex(expectedHex, payload.sig);
}
