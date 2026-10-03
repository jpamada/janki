import { sql } from "drizzle-orm";

export const count = sql<number>`count(*)`;