import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { dbPool } from "./pool.js";

const migrationsDir = path.resolve(process.cwd(), "migrations");

export const runMigrations = async (): Promise<void> => {
  const files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();
  const pool = dbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const file of files) {
      const content = await readFile(path.join(migrationsDir, file), "utf8");
      await client.query(content);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
