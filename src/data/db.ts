import { createDatabase, type Database } from "@/data/seed";

// Singleton in-memory store. Persisted for the session via module caching.
export const db: Database = createDatabase();

export type DB = Database;
