import { FC, useEffect, useState } from "react";
// import { getWordDetail, WordDetail } from "./api.js";
import { logger } from "tdom";
import { api } from "./api.js";
type Sense = Awaited<ReturnType<typeof api.learn.getSense>>;
export const FloatWord: FC<{ word: string }> = ({ word }) => {
  const [wordDetail, setWordDetail] = useState<Sense>();

  logger.log(word);
  useEffect(() => {
    if (word) {
      setWordDetail(undefined);
      api.learn.getSense(word).then((res) => {
        setWordDetail(res);
      });
    }
  }, [word]);

  return word ? (
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
      {word + ": " + wordDetail?.meaning.map((e) => e.def).join("  ")}
    </box>
  ) : null;
};
