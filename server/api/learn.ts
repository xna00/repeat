// import { Log, NewLog } from "../models/log.js";
// import { Word } from "../models/word.js";
import { eq } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import {
  type NewLog,
  log,
  word,
  words,
  protoWords,
} from "../drizzle/schema.js";
import { getInfo } from "./global.js";
import { _currentUser } from "./user.js";
import type { OmitFrom } from "../drizzle/utils.js";

export const learn = async (l: OmitFrom<NewLog, "createAt" | "userId">) => {
  const info = getInfo();
  const date = new Date();
  const user = await _currentUser(info);

  console.log(l);
  const w = (await db.select().from(word).where(eq(word.text, l.word))).at(0);
  // const w = await Word.findOne({
  //   where: {
  //     user,
  //     text: log.word,
  //   },
  // });
  if (!w) {
    throw "Unknown word " + w;
  }

  await db.insert(log).values({
    userId: user.id,
    word: l.word,
    grade: l.grade,
    createAt: date.toISOString(),
  });

  // const l = new Log();
  // l.user = user;
  // l.word = l.word;
  // l.grade = l.grade;
  // l.createdAt = date;

  // await l.save();

  const newCount = w.learnCount + 1;
  w.averageGrade = (w.averageGrade * w.learnCount + l.grade) / newCount;
  w.learnCount = newCount;

  w.lastTime;
  w.lastGrade = l.grade;
  w.lastTime = date.toISOString();

  // await w.save();
  await db
    .update(word)
    .set({
      ...w,
    })
    .where(eq(word.id, w.id));

  return {};
};

export type Meaning = {
  pos: string;
  def: string;
  enDef?: string;
  examples?: { english?: string; chinese?: string }[];
};

const _getBingSense = async (word: string) => {
  const dict = await fetch("https://cn.bing.com/dict/search?q=" + word);
  const text = await dict.text();

  const phonetic = (
    text.match(/hd_prUS b_primtxt.+?\[(.+?)\]/)?.at(1) ?? ""
  ).replace(/&#(\d+);/gi, (match, numStr) => {
    const num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });
  let meaning: Meaning[] = [
    ...text.matchAll(
      /<span class="pos.*?">(.+?)<\/span><span class="def b_regtxt"><span>(.+?)<\/span><\/span>/g
    ),
  ].map((m) => {
    let pos = m.at(1) ?? "";
    pos = pos === "网络" ? "web." : pos;
    return {
      pos,
      def: m.at(2) ?? "",
    };
  });

  return {
    phonetic,
    meaning,
  };
};

export const getSense = async (word: string) => {
  const info = getInfo();

  let phonetic = "";
  let meaning: Meaning[] = [];

  const collins = (
    await db.select().from(words).where(eq(words.word, word))
  ).at(0);

  if (collins) {
    const proto = (
      await db
        .select()
        .from(protoWords)
        .where(eq(protoWords.word, collins.linkTo))
    ).at(0);
    if (proto) {
      const p = proto as {
        forms?: {
          third?: string;
          done?: string;
          ing?: string;
          past?: string;
          plural?: string;
          noun?: string;
          verb?: string;
          adverb?: string;
          adjective?: string;
          comparative?: string;
          superlative?: string;
        };
        senses?: {
          form?: string;
          chineseExplanation?: string;
          englishExplanation?: string;
          tips?: string[];
          examples?: {
            english?: string;
            chinese?: string;
            grammar?: string;
          }[];
          synonym?: string[];
        }[];
      };

      meaning =
        p.senses?.map((s) => ({
          pos: s.form ? s.form + "." : "",
          def: s.chineseExplanation ?? "",
          enDef: s.englishExplanation ?? "",
          examples: s.examples ?? [],
        })) ?? [];
    }
  }

  if (meaning.length) return { phonetic, meaning };
  else {
    try {
      return _getBingSense(word);
    } catch {
      return {
        phonetic: "",
        meaning: [],
      };
    }
  }
};
