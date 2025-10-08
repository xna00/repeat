import { FC, useEffect, useMemo, useRef, useState } from "react";
import { createRoot, Document, logger } from "tdom";

import {
  GetCibaResponse,
  getCiba,
  looklike,
  play,
  browse,
  ttsSpeak,
  isToday,
} from "./tools.js";
import { FloatWord } from "./FloatWord.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import type { WordRecord } from "server";
import { useWords } from "./useWords.js";
import { api } from "./api.js";

const doc = new Document(process.stdin, process.stdout);
doc.root.style = {
  ...doc.root.style,
  flexDirection: "column",
};
const onKey: { current?: (key: string) => any } = {};
const beforeExit: ((...args: never[]) => unknown)[] = [];

doc.inStream.addListener("data", (data) => {
  if (data.toString() === "q" || data.toString() === "0") {
    doc.console.clear();
    logger.log(beforeExit);
    Promise.allSettled(beforeExit.map((fn) => fn())).then(() => {
      process.exit();
    });
  }
  onKey.current?.(data.toString());
});
type Sense = Awaited<ReturnType<typeof api.learn.getSense>>;
function App() {
  const [index, setIndex] = useState(0);
  const { words, loadAllWords, formData, allWords } = useWords();
  const [gradeKey, setGradeKey] = useState("");
  const [selectedWord, setSelectedWord] = useState("");
  const [cibaInfo, setCibaInfo] = useState<GetCibaResponse>();
  const [online, setOnline] = useState(false);
  const [sense, setSense] = useState<Sense>();
  const mode = useRef(0);
  const [todayCount, oneCount, twoCount, threeCount] = useMemo(
    () => [
      words.filter((w) => w.lastTime && isToday(new Date(w.lastTime))).length,
      words.filter((w) => w.lastGrade === 1).length,
      words.filter((w) => w.lastGrade === 2).length,
      words.filter((w) => w.lastGrade === 3).length,
    ],
    [words]
  );

  const word: WordRecord | undefined = words[index];
  const grade = { a: 1, s: 2, d: 3 }[gradeKey] || 0;
  const looklikes = useMemo(
    () =>
      word
        ? looklike(
            word.text,
            allWords.map((w) => w.text)
          )
        : [],
    [word, allWords]
  );

  const reloadCiba = () => {
    getCiba(word.text)
      .then((res) => {
        setCibaInfo(res);
      })
      .catch(() => null);
  };

  useEffect(() => {
    setGradeKey("");
    setSelectedWord("");
    setCibaInfo(undefined);
    setOnline(false);
    setSense(undefined);

    if (word) {
      setTimeout(() => {
        play(word.text);
      }, 300);
      const r = api.learn.getSense(word.text);
      r.then((res) => {
        setSense(res);
      });
      return () => {
        r.abortController.abort();
      };
    }
  }, [word]);

  const mapKey = (key: string) => {
    if (mode.current === 0) {
      return (
        {
          4: "a",
          5: "s",
          6: "d",
          2: "k",
          8: "j",
          3: "r",
          "+": "m",
          9: "p",
          7: "h",
          1: "b",
        }[key] ?? key
      );
    }
    if (mode.current === 1) {
      return (
        {
          7: "b",
          8: "k",
          9: "r",
          4: "a",
          5: "s",
          6: "d",
          1: "h",
          2: "j",
          3: "p",
          "+": "m",
          ".": "f",
        }[key] ?? key
      );
    }
    return key;
  };
  onKey.current = (_key: string) => {
    const key = mapKey(_key);
    if ("asd".includes(key)) {
      setGradeKey(key);
    }
    if ("jk".includes(key)) {
      if (word && grade) {
        api.learn.learn({
          word: word.text,
          grade,
        });
        setGradeKey("");
        setIndex(index + (key === "j" ? 1 : -1));
      }
    }
    if (key === "c") {
      setSelectedWord("");
      setOnline(false);
    }
    if (key === "p") {
      if (word) play(word.text);
    }
    if (key === "o") {
      if (!cibaInfo) {
        reloadCiba();
      }
      setOnline(true);
    }
    if (key === "b") {
      word && browse(word.text);
    }
    if (key === "m") {
      mode.current = Number(!mode.current);
    }
    if (key === "r") {
      loadAllWords().then(() => {
        setIndex(0);
      });
    }
    if (key === "h") {
      const m = sense?.meaning
        .map((m) => m.def)
        .filter((d) => d.trim())
        .join("\n");
      if (m) {
        ttsSpeak(m);
      }
    }
    if (key === "f") {
      if (word) ttsSpeak(word.text.split("").join(";"));
    }
    if (/^\d$/.test(key)) {
      if (looklikes[parseInt(key) - 1]) {
        setSelectedWord(looklikes[parseInt(key) - 1]);
      } else {
        setSelectedWord("");
      }
    }
  };
  return (
    <box
      style={{
        flexDirection: "column",
        height: "100%",
      }}
      onMouseDown={() => {
        setSelectedWord("");
        setOnline(false);
      }}
    >
      <box>{`${index + 1}/${
        words.length
      } ${todayCount} ${oneCount}/${twoCount} ${word?.id} ${
        mode.current
      }`}</box>
      {word && (
        <>
          <box
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
          >
            {word.text}{" "}
            <box style={{ color: "yellow" }}>{` ${word.lastGrade.toFixed(
              2
            )}/${word.averageGrade.toFixed(2)}/${word.learnCount} `}</box>
            {word.lastTime &&
              new Date(word.lastTime).toLocaleString("zh-Hans-CN")}
          </box>
          <box
            id="looklikes_box"
            // key={looklikes.join("")}
            style={{
              color: "red",
              maxHeight: 3,
              flexWrap: "wrap",
            }}
          >
            {looklikes.map((l, i) => (
              <box
                key={l}
                id={l}
                style={{ color: selectedWord === l ? "yellow" : undefined }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setSelectedWord(l);
                }}
              >{`${i + 1} ${l} `}</box>
            ))}
          </box>
          <box style={{ height: 3, color: "gray" }}>
            {!!grade &&
              sense &&
              `${sense.meaning
                ?.filter((e) => e.def.trim())
                .map(
                  (e) =>
                    `* ${e.pos}${e.def}${(
                      "\n" +
                      (e.examples?.at(0)?.english ?? "") +
                      (e.examples?.at(0)?.chinese ?? "")
                    ).trimEnd()}`
                )
                .map((e) => e.trim())
                .join("\n")}`}
          </box>

          <box
            style={{
              marginTop: "auto",
              height: 1,
              color: (["red", "yellow", "green"] as const)[grade - 1],
            }}
          >
            {!!gradeKey &&
              `${gradeKey}/${grade} ${
                (word.learnCount * word.averageGrade + grade) /
                (word.learnCount + 1)
              }`}
          </box>
          <FloatWord word={selectedWord} />
          {online && <OnlineExplanation cibaInfo={cibaInfo} />}
        </>
      )}
    </box>
  );
}

const OnlineExplanation: FC<{ cibaInfo?: GetCibaResponse }> = (props) => {
  try {
    return (
      <box
        style={{
          position: "absolute",
          top: "25%",
          left: "25%",
          width: "50%",
          height: "50%",
          backgroundColor: "gray",
        }}
      >
        {props.cibaInfo?.message.baesInfo.symbols[0]?.parts
          .map((p) => p.part + p.means.join(","))
          .join("\n")}
      </box>
    );
  } catch {
    return null;
  }
};

createRoot(doc.root).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
