import type { NextAuthConfig } from "next-auth";

// Routes that don't require authentication
export const publicRoutes = ["/login", "/register", "/api/auth", "/api/register", "/offline"];

// Base auth config for Edge runtime (middleware)
// Does NOT include adapter or bcrypt - those require Node.js runtime
export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [], // Providers added in auth.ts for Node.js runtime
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = publicRoutes.some(
        (route) => nextUrl.pathname.startsWith(route) || nextUrl.pathname === route
      );

      // Allow API routes for auth
      if (nextUrl.pathname.startsWith("/api/auth")) {
        return true;
      }

      // Redirect logged-in users away from auth pages
      if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // Redirect unauthenticated users to login
      if (!isLoggedIn && !isPublicRoute) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
