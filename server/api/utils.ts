import { gzipSync } from "node:zlib";

export class ApiError extends Error {
  constructor(
    public status: number,
    public headers: ResponseInit["headers"],
    public message: string
  ) {
    super(message);
  }
}

export const makeJsonResponse = (
  status: number,
  _headers: ResponseInit["headers"],
  obj: object
): Response => {
  const bodyStr = JSON.stringify(obj);
  const e = new TextEncoder();
  let body = e.encode(bodyStr);

  const headers = new Headers(_headers);
  headers.delete("content-type");
  headers.delete("content-length");

  if (Array.isArray(obj)) {
    body = gzipSync(body);
    headers.set("content-encoding", "gzip");
  }

  headers.set("content-type", "application/json");
  headers.set("content-length", body.length.toString());

  return new Response(body, { status, headers });
};

export const makeJsonResponse200 = makeJsonResponse.bind(null, 200);
