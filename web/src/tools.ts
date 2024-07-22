import type { Meaning } from "server";

export const localStorageJson = <T>(key: string, defaultValue: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "");
  } catch {
    return defaultValue;
  }
};

export const plainText = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText;
};

export const stringifyMeaning = (m?: Meaning[]) => {
  return m?.map((m) => `${m.def}`).join("；") ?? "";
};

const player = new Audio();
const play = (src: string) => {
  player.src = src;
  return player.play();
};

export function playWord(w: string) {
  return play(
    `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${w}--_us_1.mp3`
  ).catch(() => play(`https://dict.youdao.com/dictvoice?audio=${w}&type=2`));
}
