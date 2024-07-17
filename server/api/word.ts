import { DeepPartial } from "typeorm";
import { Word, WordRecord } from "../models/word.js";
import { getInfo } from "./global.js";
import { _currentUser } from "./user.js";

export const getAllWords = async (): Promise<WordRecord[]> => {
  const info = getInfo();
  const user = await _currentUser(info);
  return Word.find({
    where: {
      user,
    },
    order: {
      id: "ASC",
    },
  });
};

export const addWords = async (wordRecords: string[]) => {
  const info = getInfo();
  const date = new Date();
  const user = await _currentUser(info);

  const allWords = (
    await Word.find({
      where: {
        user,
      },
    })
  ).map((w) => w.text);

  const t: DeepPartial<Word>[] = wordRecords
    .filter((w) => !allWords.includes(w))
    .map((w) => ({
      text: w,
      user: user,
      createdAt: date,
    }));

  const ws = Word.create(t);
  await Word.insert(ws);
  return {};
};

export const removeWord = async (word: string) => {
  const info = getInfo();
  const user = await _currentUser(info);

  await Word.delete({
    user,
    text: word,
  });
  return {};
};

export const getWord = async (text: string): Promise<WordRecord> => {
  const info = getInfo();
  const user = await _currentUser(info);
  const p = await Word.findOne({
    where: {
      text,
      user,
    },
  });
  if (!p) {
    throw "No word " + text;
  }

  return p;
};
