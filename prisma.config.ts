/**
 * Prisma Configuration File (Prisma 7+)
 */

import "dotenv/config";
import { defineConfig } from "prisma/config";

// Get DATABASE_URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

// Validate that DATABASE_URL exists
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not defined in environment variables. " +
    "Please add it to your .env file."
  );
}

export default defineConfig({
  // Path to your schema file
  schema: "prisma/schema.prisma",
  
  // Migrations configuration
  migrations: {
    path: "prisma/migrations",
  },
  
  // Datasource configuration
  datasource: {
    url: databaseUrl,
  },
});