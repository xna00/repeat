import cookie from "cookie";
import { eq } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { type NewUser, user } from "../drizzle/schema.js";
import { idMap, state } from "./global.js";
import { makeJsonResponse, makeJsonResponse200 } from "./utils.js";

export const login = async (_user: NewUser) => {
  const id = state.id;
  const u = (
    await db.select().from(user).where(eq(user.username, _user.username))
  ).at(0);
  if (!u) {
    throw "Username is not existed!";
  }
  if (u.password !== _user.password) {
    throw "Password is incorrect!";
  }

  return makeJsonResponse(
    200,
    {
      "set-cookie": cookie.serialize("SESSIONID", u.username, {
        path: "/",
        expires: new Date(253402300000000),
      }),
    },
    {}
  );
};

export const logout = () => {
  const info = idMap[state.id];
  return makeJsonResponse200(
    {
      "set-cookie": `SESSIONID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    },
    {}
  );
};
