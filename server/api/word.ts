import { and, eq, inArray } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { word, words, type WordRecord } from "../drizzle/schema.js";
import { getInfo } from "./global.js";
import { _currentUser } from "./user.js";

export const getAllWords = async (): Promise<WordRecord[]> => {
  const info = getInfo();
  const user = await _currentUser(info);
  // return Word.find({
  //   where: {
  //     user,
  //   },
  //   order: {
  //     id: "ASC",
  //   },
  // });
  return db.select().from(word).where(eq(word.userId, user.id));
};

export const addWords = async (wordRecords: string[]) => {
  const info = getInfo();
  const date = new Date();
  const user = await _currentUser(info);

  const allWords = (
    await db.select().from(word).where(eq(word.userId, user.id))
  ).map((w) => w.text);

  const t = wordRecords
    .filter((w) => !allWords.includes(w))
    .map((w) => ({
      text: w,
      userId: user.id,
      createdAt: date.toISOString(),
    }));

  await db.insert(word).values(t);

  // const ws = Word.create(t);
  // await Word.insert(ws);
  return {};
};

export const removeWord = async (w: string[]) => {
  const info = getInfo();
  const user = await _currentUser(info);

  // await Word.delete({
  //   user,
  //   text: word,
  // });
  await db
    .delete(word)
    .where(and(inArray(word.text, w), eq(word.userId, user.id)));
  return {};
};

export const getWord = async (text: string): Promise<WordRecord> => {
  const info = getInfo();
  const user = await _currentUser(info);
  // const p = await Word.findOne({
  //   where: {
  //     text,
  //     user,
  //   },
  // });
  const p = (
    await db
      .select()
      .from(word)
      .where(and(eq(word.userId, user.id), eq(word.text, text)))
  ).at(0);
  if (!p) {
    throw "No word " + text;
  }

  return p;
};

export const getRedundancy = async () => {
  const info = getInfo();
  const user = await _currentUser(info);

  // return [];
  const ws = (
    await db
      .select()
      .from(word)
      .where(and(eq(word.userId, user.id)))
  ).map((w) => w.text);

  const links = await db.select().from(words).where(inArray(words.word, ws));
  const m = Object.fromEntries(links.map((l) => [l.word, l.linkTo]));

  const ret = ws.filter((w) => {
    const linkto = m[w];
    return w !== linkto && ws.includes(linkto);
  });
  return ret;
};
