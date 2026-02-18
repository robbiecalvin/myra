import { runMigrations } from "../db/migrations.js";

const main = async (): Promise<void> => {
  await runMigrations();
  console.log("Migrations completed successfully.");
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Migration failed.";
  console.error(message);
  process.exit(1);
});
