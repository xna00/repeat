import type { Meaning } from "server";
import { api } from ".";

export const CACHE = "REPEAT_V2";

export const getSense = async (
  word: string
): Promise<{
  meaning: Meaning[];
  phonetic: string;
}> => {
  const req = api.learn.getSense.makeRequest(word);
  const cache = await caches.open(CACHE);

  const cRes = await cache.match(req.url);
  console.log(cRes);
  if (cRes) return cRes.json();
  const res = await fetch(req);

  if (res.ok) {
    cache.put(req, res.clone());
  }
  return res.json();
};
