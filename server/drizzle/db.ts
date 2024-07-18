import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
// import { createClient } from "@libsql/client";
import Database from "better-sqlite3";

const client = new Database("db.sqlite");
// export const client = createClient({
//   url: "file:/Users/xna/methodical/server/db.sqlite",
// });

// { schema } is used for relational queries
export const db = drizzle(client, { schema });
