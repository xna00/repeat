import { ChildProcess, exec } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { platform } from "node:os";
import { logger } from "tdom";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let c: ChildProcess | null = null;

export function ttsSpeak(s: string) {
  if (!c) {
    c = exec(`termux-tts-speak "${s}"`);
    c.on("exit", () => {
      c = null;
    });
  }
}

const doPlay = (p: string) => {
  const c = exec(`play ${p}`);
};

export function play(word: string): void {
  const url = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${word}--_us_1.mp3`;
  const url2 = `https://dict.youdao.com/dictvoice?audio=${word}&type=2`;
  const p = `./audios/${word}.mp3`;
  if (existsSync(p)) {
    doPlay(p);
    return;
  }
  fetch(url)
    .then((res) => {
      return res.ok ? res : fetch(url2);
    })
    .then((res) => {
      if (res.ok) {
        res.arrayBuffer().then((buffer) => {
          writeFileSync(p, Buffer.from(buffer), {});
          doPlay(p);
        });
      }
    })
    .catch((e) => {
      logger.log(e);
    });

  return;
}

export function browse(w: string) {
  if (platform() === "android") {
    exec(
      `am start -a android.intent.action.VIEW -d https://cn.bing.com/dict/search?q=${w}`
    );
  } else {
    exec(`open https://cn.bing.com/dict/search?q=${w}`);
  }
  //exec(`open https://www.iciba.com/word?w=${w}`);
}

export function minDistance(word1: string, word2: string): number {
  if (word1.length < word2.length) return minDistance(word2, word1);
  const dp: number[] = new Array(word2.length + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= word1.length; i++) {
    let p1 = dp[0];
    dp[0] = i;
    for (let j = 1; j <= word2.length; j++) {
      let tmp = dp[j];
      dp[j] =
        Math.min(
          dp[j],
          dp[j - 1],
          p1 + (word1[i - 1] === word2[j - 1] ? -1 : 0)
        ) + 1;
      p1 = tmp;
    }
  }

  return dp[word2.length];
}

export function looklike(word: string, vocabulary: string[]) {
  return [
    ...new Set(
      vocabulary
        .filter(
          (w) => w !== word && minDistance(w, word) <= word.length / 2 - 1
        )
        .sort((a, b) => minDistance(word, a) - minDistance(word, b))
        .slice(0, 10)
    ),
  ];
}

export type GetCibaResponse = {
  message: {
    baesInfo: {
      symbols: [
        {
          ph_am: string;
          ph_am_mp3: string;
          ph_en: string;
          ph_en_mp3: string;
          parts: { part: string; means: string[] }[];
        }
      ];
    };
    collins: {
      entry: {
        def: string;
        tran: string;
        example: {
          ex: string;
          tran: string;
        }[];
        posp: string;
      }[];
    }[];
  };
};

export function memoFn(fn: any) {
  return async function (...args: any[]) {
    const res = await fn(...args);

    return res;
  };
}

export function getCiba(word: string): Promise<GetCibaResponse> {
  const params = {
    client: 6,
    key: 1000006,
    timestamp: 1684726707349,
    word,
  };
  const hash = createHash("md5");
  hash.update(
    `/dictionary/word/query/web${Object.values(params).join(
      ""
    )}7ece94d9f9c202b0d2ec557dg4r9bc`
  );
  const signature = hash.digest("hex");
  const url =
    "https://dict.iciba.com/dictionary/word/query/web?" +
    new URLSearchParams(
      Object.entries({ ...params, signature }).map(([k, v]) => [
        k,
        v.toString(),
      ])
    );
  // console.log(signature, url);

  return fetch(url, {
    headers: {
      cookie:
        "BAIDU_SSP_lcr=https://www.google.com/; __bid_n=188415e03ea116d1d94207; FPTOKEN=oogKsiD4et/vphgGZYiibyiWsrSNKglLcTlwaFI0oU2051hmwCkA/XPIIQIo5UxPKxmAlFOhNF7B5PpsCeJQ1Ajs7yS0B3ODjMhgUw3b4jVIUkeMXOMKe08l+wDd8gSrqzGsFzfVq+UM6xzvcc2+9Ps+Arx+Sh1Am2Xz5Bu5AxF7ATmLVBRlbeNR/NmhHAYLYnX4zp7uihcUqG23cE4P5rvaQIVzhS8AXf9OvB0TP+ASbLlvKsGdK8esMKV7yuDBn8OlTu4ln5SLAbR9ybmusKABez7dUHEWiz7hfpAI3KL2oW7IjQsDEYK8swaXn03ssAIlhdq4qdy8dLqde1U8iVcrhZ+o8Bdf8u3y2bJmsoN0I1xcgYalBbhwQGNh7NLPKd4LlsGER42xvAudAdObQg==|Mv5y+/1+I1QS2limjPBl39h/4RiuLeM832hQt2S/ytE=|10|3a983b77fe52b1a3fc24f103c8955be1",
      Referer: "https://www.iciba.com/",
    },
    body: null,
    method: "GET",
  }).then((res) => res.json());
}

export const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
