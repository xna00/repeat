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
          },
          body: isGet ? null : JSON.stringify(argArray),
        }
      );
      if (target.isMakeRequest) return req;
      return fetch(req).then((res) => {
        if (res.status === 401) {
          location.href = "/login";
        }
        console.log([...res.headers]);
        if (
          res.headers.get("content-type")?.toLowerCase() === "application/json"
        ) {
          return res.json();
        }
        return res;
      });
    },
  });
};
type Promisify<T> = {
  [K in keyof T]: T[K] extends (...params: infer P) => infer R
    ? ((
        ...params: P
      ) => Promise<unknown extends Awaited<R> ? Response : Awaited<R>>) & {
        makeRequest: (...params: P) => Request;
      }
    : Promisify<T[K]>;
};

const api = createHandler("/api") as Promisify<Api>;
export { api };
