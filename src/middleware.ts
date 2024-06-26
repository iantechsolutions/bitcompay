import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isProtectedAdmin = createRouteMatcher(["/dashboard/administration(.*)"]);
export default clerkMiddleware((auth, req) => {
  const role = auth().protect().sessionClaims.metadata.role;

  if (isProtectedAdmin(req)) {
    if (role != "admin") {
      return NextResponse.redirect(new URL("/accessdenied", req.url));
    }
  }
  if (isProtectedRoute(req)) {
    if (role != "admin" && role != "user") {
      return NextResponse.redirect(new URL("/accessdenied", req.url));
    }
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
