import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the Drizzle instance with schema for relations
export const db = drizzle(pool, { schema });

// Export schema for use elsewhere
export * from "./schema";
