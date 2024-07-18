import { relations } from "drizzle-orm/relations";
import { log, user, word } from "./schema.js";

export const logRelations = relations(log, ({ one }) => ({
  user: one(user, {
    fields: [log.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  logs: many(log),
  words: many(word),
}));

export const wordRelations = relations(word, ({ one }) => ({
  user: one(user, {
    fields: [word.userId],
    references: [user.id],
  }),
}));
