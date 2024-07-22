import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { OmitFrom } from "./utils.js";

export const user = sqliteTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
});

export type UserRecord = typeof user.$inferSelect;

export type NewUser = OmitFrom<UserRecord, "id">;

export const log = sqliteTable("log", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  word: text("word").notNull(),
  grade: integer("grade").notNull(),
  createAt: text("create_at").notNull(),
  userId: integer("userId")
    .references(() => user.id)
    .notNull(),
});

export type LogRecord = typeof log.$inferSelect;

export type NewLog = OmitFrom<typeof log.$inferInsert, "id">;

export const word = sqliteTable("word", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  text: text("text").notNull(),
  averageGrade: real("average_grade").default(0).notNull(),
  learnCount: integer("learn_count").default(0).notNull(),
  lastGrade: integer("last_grade").default(0).notNull(),
  lastTime: text("last_time"),
  createdAt: text("create_at").notNull(),
  userId: integer("userId")
    .references(() => user.id)
    .notNull(),
});

export type WordRecord = typeof word.$inferSelect;
word.$inferInsert;
export type NewWord = {
  text: string;
};

export const words = sqliteTable("words", {
  word: text("word").primaryKey().notNull(),
  linkTo: text("linkTo").notNull(),
});

export const protoWords = sqliteTable("protoWords", {
  word: text("word").primaryKey().notNull(),
  forms: text("forms", {
    mode: "json",
  }).notNull(),
  senses: text("senses", {
    mode: "json",
  }).notNull(),
});

protoWords.$inferSelect;
