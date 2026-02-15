import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  try {
    const res = await fetch("http://localhost:4000/auth/isAuth", {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const data = await res.json();

    if (!data.isAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (err) {
    console.error("Auth check failed:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/myworkspace"],
};
