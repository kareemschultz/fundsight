import { cache } from "react";
import { auth } from "@/lib/auth";

/**
 * Per-request cached auth check.
 * Multiple components calling getCurrentUser() in the same request
 * will only execute auth() once (React.cache deduplication).
 *
 * @see vercel-react-best-practices: server-cache-react
 */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
});
