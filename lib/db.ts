import { createClient, type Client } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs for primary keys

let clientInstance: Client | null = null;

export function getDbClient(): Client {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL is not defined in environment variables');
  }
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN is not defined in environment variables');
  }

  if (!clientInstance) {
    clientInstance = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    console.log("Turso client initialized.");
  }
  return clientInstance;
}

export async function initializeDb() {
  const client = getDbClient();

  try {
    // Check if users table exists
    await client.execute("SELECT 1 FROM users LIMIT 1;");
    console.log("Users table already exists.");
  } catch (e: any) {
    if (e.message.includes("no such table: users") || e.message.includes("Could not find table 'users'")) {
      console.log("Users table not found, creating...");
      await client.execute(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("Users table created.");
    } else {
      console.error("Error checking/creating users table:", e);
      throw e;
    }
  }

  try {
    // Check if notes table exists
    await client.execute("SELECT 1 FROM notes LIMIT 1;");
    console.log("Notes table already exists.");
  } catch (e: any) {
    if (e.message.includes("no such table: notes") || e.message.includes("Could not find table 'notes'")) {
      console.log("Notes table not found, creating...");
      await client.execute(`
        CREATE TABLE notes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);
      console.log("Notes table created.");
    } else {
      console.error("Error checking/creating notes table:", e);
      throw e;
    }
  }
  console.log("Database initialization check complete.");
}

// Optional: A standalone script to run initialization manually if needed
// To run this: node -r esbuild-register lib/run-init-db.js (after creating that .js file)
/*
async function runInit() {
  try {
    await initializeDb();
    console.log("Manual database initialization successful.");
  } catch (error) {
    console.error("Manual database initialization failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  // This block runs if the script is executed directly
  // For this to work directly with node, you might need to compile TS to JS first
  // or use a loader like ts-node or esbuild-register.
  // console.log("Attempting manual DB initialization...");
  // runInit();
}
*/

// We will also need uuid, so let's install it.
// npm install uuid
// npm install --save-dev @types/uuid
