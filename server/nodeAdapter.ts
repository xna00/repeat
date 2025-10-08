import assert from "assert";
import { readFileSync, readdirSync, statSync } from "fs";
import type { IncomingMessage, ServerResponse } from "http";
import { createServer } from "http";
import { extname, join, relative } from "path";
import { Readable } from "stream";
import { apiHandler } from "./api/handler.js";

const port = 3001;
const base = `http://localhost:${port}`;

export const makeRequest = (req: IncomingMessage): Request => {
  assert(req.url);
  const method = req.method;
  const r = new Request(new URL(req.url, base), {
    method,
    duplex: "half",
    headers: Object.entries(req.headers).map(([k, v]) => [
      k,
      v?.toString() ?? "",
    ]),
    body: method === "GET" || method === "HEAD" ? null : Readable.toWeb(req),
  });

  return r;
};

export const respond = (
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
  },
  response: Response
) => {
  res.writeHead(
    response.status,
    response.statusText,
    Object.fromEntries(response.headers)
  );
  if (response.body) {
    Readable.fromWeb(response.body).pipe(res, { end: true });
  } else {
    res.end();
  }
};

const staticFiles: Record<string, number[]> = {
  /*STATIC_FILES*/
};
function readAllFiles(dirPath: string) {
  // 读取目录中的内容
  readdirSync(dirPath).forEach((file) => {
    const fullPath = join(dirPath, file);
    const fileStats = statSync(fullPath);
    if (fileStats.isDirectory()) {
      // 如果是目录，递归调用 readAllFiles
      readAllFiles(fullPath);
    } else {
      // 如果是文件，将文件路径和状态添加到 map 中
      staticFiles["/" + relative("./www", fullPath)] = [
        ...readFileSync(fullPath, {}),
      ];
    }
  });
}

readAllFiles("./www");

const mimeTypes: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".txt": "text/plain",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const server = createServer({}, (req, res) => {
  console.log(req.url);

  assert(req.url);
  const pathname = new URL(req.url, base).pathname;
  if (req.url.startsWith("/api/")) {
    apiHandler(makeRequest(req)).then(respond.bind(null, res));
  } else {
    const path = staticFiles[pathname] !== undefined ? pathname : "/index.html";
    const ext = extname(path).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, "OK", {
      "content-type": contentType,
    });
    res.end(Buffer.from(staticFiles[path]));
  }
});

server.listen(port, "::");
console.log(base);
