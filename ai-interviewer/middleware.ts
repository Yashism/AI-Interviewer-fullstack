// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAuth } from "@/lib/auth"; // Adjust the import based on your actual path

export async function middleware(req: NextRequest) {
  const isAuthenticated = await checkAuth(req); // Pass the request to checkAuth

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/interview", "/settings", "/help"],
};
