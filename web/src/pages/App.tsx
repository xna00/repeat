import day from "dayjs";
import { useEffect, useState, type ReactNode } from "react";
import type { WordRecord } from "server";
import { api } from "../api";
import { stringifyMeaning } from "../tools";

type FormData = {
  pageNumber: number;
  pageSize: number;
};
type WordState =
  | {
      tag: "untouched";
    }
  | {
      tag: "pending";
      grade: number;
    }
  | {
      tag: "done";
      grade: number;
    };
const Tr = ({
  row,
  loadAllWords,
  pendingWord,
  setPendingWord,
}: {
  row: WordRecord;
  loadAllWords: () => void;
  pendingWord?: string;
  setPendingWord: (v: string) => void;
}) => {
  const [word, setWord] = useState(row);
  const [grade, setGrade] = useState<number>();
  const [sense, setSense] =
    useState<Awaited<ReturnType<typeof api.learn.getSense>>>();

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

  type T = {
    title: ReactNode;
    width?: string | number;
    dataIndex: keyof WordRecord | (string & {});
    render?: (row: WordRecord) => ReactNode;
  };
  const columns: T[] = [
    {
      title: "单词",
      dataIndex: "text",
      render: (row) => {
        return (
          <div>
            {row.text}

            {sense?.phonetic && (
              <span className="text-sm text-black/50">
                {" "}
                /{sense?.phonetic}/{/* <br /> {sense.sense} */}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "lastGrade",
      render: (row) => (
        <div>
          {row.lastGrade}
          <span className="text-sm text-opacity-50 text-black">
            ({" "}
            {row.lastTime
              ? day(row.lastTime).format(
                  day(row.lastTime).year() === day().year()
                    ? "MM-DD HH:mm:ss"
                    : "YY-MM-DD HH:mm:ss"
                )
              : "-"}
            )
          </span>
        </div>
      ),
    },

    {
      title: "得分",
      dataIndex: "grade",
      render: (row) => {
        return (
          <div className="space-x-1">
            {[1, 2, 3].map((g) => (
              <button
                key={g}
                className={`w-8 h-8 rounded-full bg-gray-300 border ${
                  g === grade
                    ? pending
                      ? "border-red-400"
                      : "border-green-300"
                    : ""
                }`}
                onClick={() => {
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
        );
      },
    },
    {
      title: "",
      dataIndex: "aaa",
      render: (_row) => stringifyMeaning(sense?.meaning),
    },
    {
      title: "平均分/学习次数",
      dataIndex: "averageGrade",
      render: (row) => {
        return (
          <div>
            {row.averageGrade}/{row.learnCount}
          </div>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "id",
      render: (row) => {
        return (
          <div>
            <button
              className="border"
              onClick={() => {
                api.word.removeWord([row.text]).then(loadAllWords);
              }}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];
  return (
    <tr className="hover:bg-gray-100">
      {columns.map((c) => (
        <td key={c.dataIndex}>
          {c.render?.(word) ?? (word as any)[c.dataIndex]?.toString()}
        </td>
      ))}
    </tr>
  );
};

export default () => {
  const [allWords, setAllWords] = useState<WordRecord[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    pageNumber: 1,
    pageSize: 600,
  });

  const [words, setWords] = useState<WordRecord[]>([]);

  const loadWords = (
    allWords: WordRecord[],
    { pageNumber, pageSize }: FormData
  ) => {
    const tmp = allWords
      .slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
      .sort((a, b) => {
        return a.lastGrade - b.lastGrade;
      });

    setWords(tmp);
  };

  const loadWordsWithAllWords = loadWords.bind(null, allWords);
  const [pendingWord, setPendingWord] = useState<string>();

  const columns: { title: string; width?: string | number }[] = [
    { title: "单词", width: 100 },
    { title: "上次得分", width: 100 },
    { title: "得分", width: 100 },
    { title: "释义", width: 400 },
    { title: "平均分/学习次数", width: 100 },
    { title: "操作", width: 100 },
  ];

  const loadAllWords = () => {
    api.word.getAllWords().then((res) => {
      console.log(res);
      setAllWords(res.slice(0));
      loadWords(res, formData);
    });
  };

  useEffect(() => {
    loadAllWords();
  }, []);
  return (
    <div className="p-4">
      <div className="mb-4">
        <label>
          Page number:
          <input
            type="number"
            className="border"
            value={formData.pageNumber}
            onChange={(e) => {
              const t: FormData = {
                ...formData,
                pageNumber: e.target.valueAsNumber,
              };
              loadWordsWithAllWords(t);
              setFormData(t);
            }}
          />
        </label>
        <label>
          Page size:{" "}
          <input
            type="number"
            className="border"
            value={formData.pageSize}
            onChange={(e) => {
              const t: FormData = {
                ...formData,
                pageSize: e.target.valueAsNumber,
              };
              loadWordsWithAllWords(t);
              setFormData(t);
            }}
          />
        </label>
        <button
          className="border"
          onClick={() => {
            setAddDialogOpen(true);
          }}
        >
          Add words
        </button>
        <dialog className="border w-1/2 z-10" open={addDialogOpen}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.target as HTMLFormElement;
              const words: string =
                (f.elements.namedItem("words") as any)?.value ?? "";
              console.log(words);
              api.word
                .addWords([
                  ...new Set(
                    words
                      .split("\n")
                      .map((w) => w.trim())
                      .filter(Boolean)
                  ),
                ])
                .then(() => {
                  setAddDialogOpen(false);
                  loadAllWords();
                });
            }}
          >
            <textarea name="words"></textarea>
            <input type="submit"></input>
          </form>
        </dialog>
      </div>
      <div>
        <table className="[&_:is(td,th)]:border w-full">
          {/* <colgroup>
            {columns.map((c) => (
              <col key={c.title} width={c.width}></col>
            ))}
          </colgroup> */}
          <thead className="sticky top-0 bg-white">
            <tr>
              {columns.map((c) => (
                <th key={c.title} style={{ width: c.width }}>
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {words.map((w) => (
              // <tr key={w.id}>
              //   {columns.map((c) => (
              //     <td key={c.dataIndex}>
              //       {c.render?.(w) ?? w[c.dataIndex]?.toString()}
              //     </td>
              //   ))}
              // </tr>
              <Tr
                key={w.id}
                row={w}
                loadAllWords={loadAllWords}
                pendingWord={pendingWord}
                setPendingWord={setPendingWord}
              ></Tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
