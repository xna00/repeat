import { useEffect, useMemo, useState } from "react";
import type { WordRecord } from "server";
import { api } from "./api.js";
import cfg from "./cfg.js";

export type FilterFormData = {
  pageNumber: number;
  pageSize: number;
  onlyUnfamiliar: boolean;
  globalOrder: {
    key: keyof WordRecord;
    asc: boolean;
  };
  inPageOrder: {
    key: keyof WordRecord;
    asc: boolean;
  };
};

export const useWords = () => {
  const [allWords, setAllWords] = useState<WordRecord[]>([]);
  const formData: FilterFormData = {
    pageNumber: 1,
    pageSize: 600,
    globalOrder: { key: "text", asc: true },
    inPageOrder: { key: "text", asc: true },
    onlyUnfamiliar: true,
    ...cfg,
  };

  const { pageNumber, pageSize } = formData;

  const page = useMemo(
    () =>
      allWords
        .sort((a, b) => {
          const v1 = a[formData.globalOrder.key]?.toString() ?? "";
          const v2 = b[formData.globalOrder.key]?.toString() ?? "";
          return v1.localeCompare(v2) * (formData.globalOrder.asc ? 1 : -1);
        })
        .slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    [allWords, formData.globalOrder, pageSize, pageNumber]
  );

  const words = page
    .filter((w) => {
      if (!formData.onlyUnfamiliar) return true;
      else return w.averageGrade < 3;
    })
    .sort((a, b) => {
      const v1 = a[formData.inPageOrder.key]?.toString() ?? "";
      const v2 = b[formData.inPageOrder.key]?.toString() ?? "";
      return v1.localeCompare(v2) * (formData.inPageOrder.asc ? 1 : -1);
    });

  const loadAllWords = () => {
    return api.word.getAllWords().then((res) => {
      console.log(res);
      setAllWords(res);
    });
  };

  useEffect(() => {
    loadAllWords();
  }, []);

  return {
    formData,
    words,
    loadAllWords,
    allWords,
  };
};
