// scripts/init-db.ts
import { initializeDb } from "../lib/db";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  console.log("Starting database initialization script...");
  try {
    // Ensure environment variables are loaded if you're running this outside of `next dev`
    // For example, using `dotenv` package:
    // import dotenv from 'dotenv';
    // dotenv.config({ path: '.env.local' });

    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.error(
        "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.local",
      );
      process.exit(1);
    }

    await initializeDb();
    console.log("Database initialization script finished successfully.");
  } catch (error) {
    console.error("Error during database initialization script:", error);
    process.exit(1);
  }
}

main();
