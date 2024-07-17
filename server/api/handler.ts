import assert from "assert";
import { idMap, state } from "./global.js";
import * as api from "./index.js";
import { ApiError, makeJsonResponse } from "./utils.js";

const parseFn = (req: Request) => {
  const pathname = new URL(req.url).pathname;
  const segs = pathname.split("/").slice(2);
  const fnName = segs[segs.length - 1];
  if (
    !(
      (fnName.startsWith("get") && req.method === "GET") ||
      req.method === "POST"
    )
  ) {
    return;
  }
  const fn = segs.reduce((prev, curr) => (prev as any)?.[curr], api);
  return fn;
};

export const apiHandler = async (req: Request): Promise<Response> => {
  let res: Response;

  const fn: any = parseFn(req);
  if (!fn) res = makeJsonResponse(404, {}, { url: req.url });
  let params: any = null;
  try {
    if (req.method === "POST") params = await req.json();
    else if (req.method === "GET")
      params = JSON.parse(new URL(req.url).searchParams.get("data") ?? "");
  } catch (e) {
    assert(e instanceof Error);
    console.error(e);
    res = makeJsonResponse(400, {}, { message: e.message });
  }

  const id = state.id;
  idMap[id] = {
    request: req,
    status: 200,
    headers: {},
  };
  try {
    const tmp = fn(...params);
    state.id++;
    const ret = await tmp;
    if (ret instanceof Response) res = ret;
    else res = makeJsonResponse(idMap[id].status, idMap[id].headers, ret);
  } catch (e) {
    console.error(e);
    let status = 500;
    let headers: ResponseInit["headers"] = {};
    let obj = { message: e };
    if (e instanceof ApiError) {
      status = e.status;
      headers = e.headers;
      obj = { message: e.message };
    }
    res = makeJsonResponse(status, headers, obj);
  }

  delete idMap[id];
  return res;
};
