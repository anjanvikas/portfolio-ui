import { NextResponse } from "next/server";

import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, apiBaseURL } from "@/lib/auth";

type LoginBody = { password?: unknown };

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  if (typeof body.password !== "string" || body.password.length === 0) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const upstream = await fetch(`${apiBaseURL()}/api/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: body.password }),
    cache: "no-store",
  });

  if (upstream.status === 429) {
    return NextResponse.json(
      { error: "too many attempts, try again later" },
      { status: 429 },
    );
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const data = (await upstream.json()) as { token?: unknown };
  if (typeof data.token !== "string" || data.token.length === 0) {
    return NextResponse.json({ error: "upstream returned no token" }, { status: 502 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: data.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
