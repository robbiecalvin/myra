import { Pool } from "pg";
import { env, getDatabaseUrl } from "../config/env.js";

let pool: Pool | null = null;

export const dbPool = (): Pool => {
  if (!pool) {
    const connectionString = env.databaseUrl ?? getDatabaseUrl();
    pool = new Pool({ connectionString });
  }
  return pool;
};
