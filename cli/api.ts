import type { Api } from "server";

const isGetMethod = (path: string) =>
  !!path.split("/").pop()?.startsWith("get");

const createHandler = (base: string): any => {
  return new Proxy(() => {}, {
    get(target, p: string, receiver) {
      // if (p === "makeUrl") {
      //   const ret = (...data: any) => {
      //     return isGetMethod(base)
      //       ? `${base}?data=${encodeURIComponent(JSON.stringify(data))}`
      //       : base;
      //   };
      //   return ret;
      // }
      let ret = createHandler(`${base}/${p as string}`);
      if (p === "makeRequest") {
        ret = createHandler(`${base}`);
        ret.isMakeRequest = true;
      }
      return ret;
    },
    apply(target: any, thisArg, argArray) {
      const isGet = isGetMethod(base);
      const req = new Request(
        isGet
          ? `${base}?data=${encodeURIComponent(JSON.stringify(argArray))}`
          : base,
        {
          method: isGet ? "GET" : "POST",
          headers: {
            "content-type": "application/json",
            cookie: "SESSIONID=xna",
          },
          body: isGet ? null : JSON.stringify(argArray),
        }
      );
      if (target.isMakeRequest) return req;
      const controller = new AbortController();
      const ret = fetch(req, {
        signal: controller.signal,
      }).then((res) => {
        if (
          res.headers.get("content-type")?.toLowerCase() === "application/json"
        ) {
          return res.json();
        }
        return res;
      });
      (ret as any).abortController = controller;
      return ret;
    },
  });
};
type Promisify<T> = {
  [K in keyof T]: T[K] extends (...params: infer P) => infer R
    ? ((...params: P) => Promise<
        unknown extends Awaited<R> ? Response : Awaited<R>
      > & {
        abortController: AbortController;
      }) & {
        makeRequest: (...params: P) => Request;
      }
    : Promisify<T[K]>;
};

const api = createHandler("https://words.xna00.top/api") as Promisify<Api>;
export { api };
