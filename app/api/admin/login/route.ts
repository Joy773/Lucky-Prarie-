import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

function timingSafeStringEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ba, bb);
}

export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Server is not configured for admin login." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("email" in body) ||
    !("password" in body)
  ) {
    return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
  }

  const rawEmail = body.email;
  const rawPassword = body.password;
  if (typeof rawEmail !== "string" || typeof rawPassword !== "string") {
    return NextResponse.json({ error: "Invalid credentials format." }, { status: 400 });
  }

  const email = rawEmail.trim();
  const password = rawPassword;

  const emailOk = timingSafeStringEqual(
    email.toLowerCase(),
    adminEmail.trim().toLowerCase()
  );
  const passwordOk = timingSafeStringEqual(password, adminPassword);

  if (!emailOk || !passwordOk) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const sig = createHmac("sha256", adminPassword)
    .update(`${email}:${exp}`)
    .digest("hex");

  const token = Buffer.from(
    JSON.stringify({ e: email, exp, sig })
  ).toString("base64url");

  const response = NextResponse.json({ ok: true });
  response.cookies.set("lp_admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
