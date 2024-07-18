import "dotenv/config"; // make sure to install dotenv package
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  out: "./drizzle",
  schema: "./drizzle/schema.ts",
  dbCredentials: {
    url: "./db.sqlite",
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
});
