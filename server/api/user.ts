// import { User } from "../models/user.js";
import { type Info, getInfo } from "./global.js";
import cookie from "cookie";
import { ApiError } from "./utils.js";
import { type UserRecord, user } from "../drizzle/schema.js";
import { db } from "../drizzle/db.js";
import { eq } from "drizzle-orm";

export const _currentUser = async (info: Info) => {
  const username =
    cookie.parse(info.request.headers.get("cookie") || "").SESSIONID ?? "";
  console.log(username);

  const u = (
    await db.select().from(user).where(eq(user.username, username))
  ).at(0);
  // const user = await .findOne({
  //   where: {
  //     username,
  //   },
  // });
  if (u) {
    return u;
  }
  throw new ApiError(401, {}, "未登录！");
};

export const currentUser = async (): Promise<UserRecord> => {
  const info = getInfo();
  return _currentUser(info);
};
