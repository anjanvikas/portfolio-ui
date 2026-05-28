import { NextResponse } from "next/server";

import { ADMIN_COOKIE, apiBaseURL } from "@/lib/auth";

export async function POST() {
  // Best-effort: tell the Go API too. If it's down we still clear the local
  // cookie so the user can't get stuck in the admin shell.
  void fetch(`${apiBaseURL()}/api/v1/admin/logout`, {
    method: "POST",
    cache: "no-store",
  }).catch(() => undefined);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
