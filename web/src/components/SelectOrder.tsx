import type { WordRecord } from "server";
import Select from "./Select";

export default ({
  value,
  onChange,
  words,
}: {
  value: string;
  onChange: (v: string) => void;
  words: WordRecord[];
}) => (
  <Select
    value={value}
    options={Object.keys(words.at(0) ?? {})
      .flatMap((k) => [
        {
          label: k + " " + "asc",
          value: {
            key: k,
            asc: true,
          },
        },
        {
          label: k + " " + "desc",
          value: {
            key: k,
            asc: false,
          },
        },
      ])
      .map((o) => ({ ...o, value: JSON.stringify(o.value) }))}
    onChange={onChange}
  ></Select>
);
