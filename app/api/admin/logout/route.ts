import { NextResponse } from "next/server";

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("lp_admin", "", {
    ...cookieBase,
    maxAge: 0,
  });
  return response;
}
