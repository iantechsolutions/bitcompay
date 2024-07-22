import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isProtectedAdmin = createRouteMatcher(["/dashboard/administration(.*)"]);
const isPublicRoute = createRouteMatcher([
  "/api/uploadthing(.*)",
  "/signin(.*)",
  "/_next(.*)",
]);

export default clerkMiddleware((auth, req) => {
  console.log("URLLLLL", req.url);
  if (!isPublicRoute(req)) {
    auth().protect();
    const role = auth()?.sessionClaims?.metadata.role;
    if (isProtectedAdmin(req)) {
      if (role != "admin") {
        return NextResponse.redirect(new URL("/accessdenied", req.url));
      }
    }
    if (isProtectedRoute(req)) {
      if (role != "admin" && role != "user") {
        return NextResponse.redirect(new URL("/accessdenied", req.url));
      }
    }
  }
});
