import { Log, NewLog } from "../models/log";
import { Word } from "../models/word";
import { getInfo } from "./global";
import { _currentUser } from "./user";

export const learn = async (log: NewLog) => {
  const info = getInfo();
  const date = new Date();
  const user = await _currentUser(info);

  console.log(log);
  const word = await Word.findOne({
    where: {
      user,
      text: log.word,
    },
  });
  if (!word) {
    throw "Unknown word " + word;
  }

  const l = new Log();
  l.user = user;
  l.word = log.word;
  l.grade = log.grade;
  l.createdAt = date;

  await l.save();

  const newCount = word.learnCount + 1;
  word.averageGrade =
    (word.averageGrade * word.learnCount + log.grade) / newCount;
  word.learnCount = newCount;

  word.lastTime;
  word.lastGrade = log.grade;
  word.lastTime = date;

  await word.save();

  return {};
};

export type Meaning = {
  pos: string;
  def: string;
};

export const getSense = async (word: string) => {
  const info = getInfo();
  const dict = await fetch("https://cn.bing.com/dict/search?q=" + word);
  const text = await dict.text();

  const phonetic = (
    text.match(/hd_prUS b_primtxt.+?\[(.+?)\]/)?.at(1) ?? ""
  ).replace(/&#(\d+);/gi, (match, numStr) => {
    const num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });
  const meaning: Meaning[] = [
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

  return { phonetic, meaning };
};
