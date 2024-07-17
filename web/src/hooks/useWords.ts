import { useEffect, useMemo, useState } from "react";
import type { WordRecord } from "server";
import { api } from "../api";
import { localStorageJson } from "../tools";

export type FilterFormData = {
  pageNumber: number;
  pageSize: number;
  globalOrder: {
    key: keyof WordRecord;
    asc: boolean;
  };
  inPageOrder: {
    key: keyof WordRecord;
    asc: boolean;
  };
};

const FilterFormDataKey = "FilterFormDataKey";
export const useWords = () => {
  const [allWords, setAllWords] = useState<WordRecord[]>([]);
  const [formData, setFormData] = useState<FilterFormData>(
    localStorageJson(FilterFormDataKey, {
      pageNumber: 1,
      pageSize: 600,
      globalOrder: { key: "text", asc: true },
      inPageOrder: { key: "text", asc: true },
    })
  );

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

  const words = page.sort((a, b) => {
    const v1 = a[formData.inPageOrder.key]?.toString() ?? "";
    const v2 = b[formData.inPageOrder.key]?.toString() ?? "";
    return v1.localeCompare(v2) * (formData.inPageOrder.asc ? 1 : -1);
  });

  const loadAllWords = () => {
    api.word.getAllWords().then((res) => {
      console.log(res);
      setAllWords(res);
    });
  };

  useEffect(() => {
    loadAllWords();
  }, []);

  useEffect(() => {
    localStorage.setItem(FilterFormDataKey, JSON.stringify(formData));
  }, [formData]);

  return {
    formData,
    setFormData,
    words,
    loadAllWords,
    allWords,
  };
};
