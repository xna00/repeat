import day from "dayjs";
import { useEffect, useRef, useState } from "react";
import type { WordRecord } from "server";
import { api } from "../api";
import Drawer from "../components";
import SelectOrder from "../components/SelectOrder";
import { useWords } from "../hooks/useWords";
import { playWord, stringifyMeaning } from "../tools";

type Sense = Awaited<ReturnType<typeof api.learn.getSense>>;

const Tr = ({
  row,
  pendingWord,
  setPendingWord,
  setDetailWord,
  loadAllWords,
  muted,
}: {
  row: WordRecord;
  pendingWord?: string;
  setPendingWord: (v: string) => void;
  setDetailWord: (v: WordRecord | undefined) => void;
  loadAllWords: () => void;
  muted: boolean;
}) => {
  const [word, setWord] = useState(row);
  const [grade, setGrade] = useState<number>();
  const [sense, setSense] = useState<Sense>();

  const played = useRef(false);

  const pending = pendingWord === word.text;

  useEffect(() => {
    if (grade !== undefined && !pending) {
      api.learn
        .learn({
          word: word.text,
          grade: grade,
        })
        .then(() => {
          api.word.getWord(word.text).then((res) => {
            setWord(res);
          });
        });
    }
  }, [grade, pending]);

  return (
    <li className="flex overflow-x-scroll overflow-y-hidden snap-x snap-mandatory">
      <div
        className="flex items-center border-b border-b-orange-100 py-1 w-full flex-shrink-0 snap-start word-box"
        onClick={() => {
          if (!played.current && !muted) {
            playWord(word.text);
            played.current = true;
          }
        }}
      >
        <div className="overflow-hidden flex-grow">
          <div className="flex items-center">
            <div className="mr-1">
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setDetailWord({ ...word, ...sense });
                }}
              >
                {word.text}
              </a>
            </div>
            <div>
              <a
                href={`https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${word.text}`}
                target="_blank"
                className="text-sm"
              >
                <img src="/cambridgeicon.ico" alt="" />
              </a>
            </div>
          </div>
          <p className="text-xs text-ellipsis whitespace-nowrap overflow-hidden">
            <a
              href={`https://cn.bing.com/dict/search?q=${word.text}`}
              target="_blank"
            >
              {stringifyMeaning(sense?.meaning)}
              &#8203;
            </a>
          </p>
          <div className="text-sm">
            <span className="mr-2">
              {word.lastGrade}/
              {word.lastTime
                ? day(word.lastTime).format(
                    day(word.lastTime).year() === day().year()
                      ? "MM-DD HH:mm:ss"
                      : "YY-MM-DD HH:mm:ss"
                  )
                : "-"}
            </span>
            <span>
              {word.averageGrade.toFixed(2)}/{word.learnCount}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {[1, 2, 3].map((g) => (
            <button
              key={g}
              className={`bg-gray-200 w-8 h-8 rounded-full ml-1 border cursor-pointer ${
                grade === g
                  ? !pending
                    ? "border-green-300"
                    : "border-red-300"
                  : "border-none"
              }`}
              onClick={() => {
                console.log(grade, pending);
                if (grade === undefined || pending) {
                  setGrade(g);
                  setPendingWord(row.text);
                }
                if (!sense) {
                  api.learn.getSense(word.text).then((r) => {
                    setSense(r);
                  });
                }
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div
        className="bg-red-300 w-20 self-stretch flex-shrink-0 snap-start ml-px"
        onClick={() => {
          api.word.removeWord([word.text]).then(() => {
            setDetailWord(undefined);
            loadAllWords();
          });
        }}
      >
        <button>删除</button>
      </div>
    </li>
  );
};
export default () => {
  const { words, loadAllWords, formData, setFormData, allWords } = useWords();
  const [detailWord, setDetailWord] = useState<WordRecord & Partial<Sense>>();
  const [pendingWord, setPendingWord] = useState<string>();
  const [filterVisible, setFilterVisible] = useState(false);
  const [muted, setMuted] = useState(false);

  return (
    <div className="">
      <header className="flex text-lg gap-x-3 [&:has(>:checked)~ol>li>div.word-box]:flex-row-reverse sticky top-0 bg-white p-2 items-center">
        <button onClick={() => setFilterVisible(true)}>Filter</button>
        <input type="checkbox" className="" />
        {formData.pageNumber}-{formData.pageSize}-{allWords.length}
        <button onClick={() => setMuted(!muted)}>
          {muted ? "unmute" : "mute"}
        </button>
      </header>
      <Drawer
        visible={filterVisible}
        onClose={() => {
          setFilterVisible(false);
        }}
      >
        <div className="w-[75vw] bg-white h-full">
          <label>
            Page number
            <input
              type="number"
              className="border"
              value={formData.pageNumber}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  pageNumber: e.target.valueAsNumber,
                });
              }}
            ></input>
          </label>
          <label>
            Page size
            <input
              type="number"
              className="border"
              value={formData.pageSize}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  pageSize: e.target.valueAsNumber,
                });
              }}
            ></input>
          </label>
          <label>
            Global order
            <SelectOrder
              words={words}
              value={JSON.stringify(formData.globalOrder)}
              onChange={(v) => {
                setFormData({
                  ...formData,
                  globalOrder: JSON.parse(v),
                });
              }}
            ></SelectOrder>
          </label>
          <br />
          <label>
            In page order
            <SelectOrder
              words={words}
              value={JSON.stringify(formData.inPageOrder)}
              onChange={(v) => {
                setFormData({
                  ...formData,
                  inPageOrder: JSON.parse(v),
                });
              }}
            ></SelectOrder>
          </label>
        </div>
      </Drawer>
      <ol className="px-2">
        {words.map((w) => (
          <Tr
            key={w.id}
            row={w}
            pendingWord={pendingWord}
            setPendingWord={setPendingWord}
            setDetailWord={setDetailWord}
            loadAllWords={loadAllWords}
            muted={muted}
          ></Tr>
        ))}
      </ol>
      <Drawer
        placement="right"
        visible={!!detailWord}
        onClose={() => {
          setDetailWord(undefined);
        }}
      >
        <div className="bg-white w-[75vw] h-full overflow-auto">
          {detailWord && (
            <div>
              <span className="text-3xl">{detailWord.text}</span>
              {detailWord.phonetic && <span>/{detailWord.phonetic}/</span>}

              <button
                className="border"
                onClick={() => {
                  caches
                    .open("REPEAT_V2")
                    .then((c) => {
                      const url = api.learn.getSense.makeRequest(
                        detailWord.text
                      ).url;
                      console.log(url);
                      return c.delete(url);
                    })
                    .then(() => api.learn.getSense(detailWord.text))
                    .then((r) => setDetailWord({ ...detailWord, ...r }));
                }}
              >
                Reload
              </button>
            </div>
          )}

          <ol>
            {detailWord?.meaning?.map((m) => (
              <li key={m.pos + m.def}>
                {m.pos}
                {m.def}
              </li>
            ))}
          </ol>
        </div>
      </Drawer>
    </div>
  );
};
