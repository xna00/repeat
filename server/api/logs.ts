import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { log } from "../drizzle/schema.js";
import { getInfo } from "./global.js";
import { _currentUser } from "./user.js";

export const getLogs = async (start: string, end: string) => {
  const info = getInfo();
  const user = await _currentUser(info);

  return db
    .select()
    .from(log)
    .where(
      and(
        eq(log.userId, user.id),
        gte(log.createAt, start),
        lte(log.createAt, end)
      )
    );
};
