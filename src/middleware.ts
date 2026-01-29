import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use the edge-compatible auth config (no bcrypt, no DB adapter)
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    // Match all routes except static files, images, PWA assets
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|icons/|.*\\.png$|.*\\.svg$|.*\\.webmanifest$).*)",
  ],
};
