import { useEffect } from "react";
import { api } from "../api";

export default () => {
  useEffect(() => {
    api.word.getRedundancy().then((r) => api.word.removeWord(r));
  }, []);
  return <div>Redundancy</div>;
};
