const isGetMethod = (path) => !!path.split("/").pop()?.startsWith("get");
const createHandler = (base) => {
    return new Proxy(() => { }, {
        get(target, p, receiver) {
            if (p === "makeUrl") {
                const ret = (...data) => {
                    return isGetMethod(base)
                        ? `${base}?data=${encodeURIComponent(JSON.stringify(data))}`
                        : base;
                };
                return ret;
            }
            const ret = createHandler(`${base}/${p}`);
            return ret;
        },
        apply(target, thisArg, argArray) {
            const isGet = isGetMethod(base);
            return fetch(isGet
                ? `${base}?data=${encodeURIComponent(JSON.stringify(argArray))}`
                : base, {
                method: isGet ? "GET" : "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: isGet ? null : JSON.stringify(argArray),
            }).then((res) => {
                if (res.headers.get("content-type")?.toLowerCase() === "application/json") {
                    return res.json();
                }
                return res;
            });
        },
    });
};
//
const api = createHandler("/api");
const CACHE_OLD = "REPEAT_V1";
const CACHE = "REPEAT_V2";
self.addEventListener("install", (event) => {
    self.skipWaiting();
    caches.delete(CACHE_OLD);
});
const fetchAndCache = async (request) => {
    const r = await fetch(request);
    if (r.ok) {
        const cache = await caches.open(CACHE);
        cache.put(request, r.clone()).catch(console.log);
    }
    return r;
};
const cacheOrFetch = async (request) => {
    const cache = await caches.open(CACHE);
    const t = await cache.match(request);
    if (t) {
        return t;
    }
    else {
        return fetchAndCache(request);
    }
};
const getPath = (fn) => {
    const u = new URL(fn.makeUrl(), location.origin);
    return u.pathname;
};
self.addEventListener("fetch", (e) => {
    const u = new URL(e.request.url);
    console.log(e.request.url, getPath(api.learn.getSense));
    // if (u.pathname === getPath(api.learn.getSense)) {
    //   e.respondWith(cacheOrFetch(e.request));
    // }
});
export {};
