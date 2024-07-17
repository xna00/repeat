import { User, UserRecord } from "../models/user.js";
import { Info, getInfo } from "./global.js";
import cookie from "cookie";
import { ApiError } from "./utils.js";

export const _currentUser = async (info: Info) => {
  const username =
    cookie.parse(info.request.headers.get("cookie") || "").SESSIONID ?? "";
  console.log(username);

  const user = await User.findOne({
    where: {
      username,
    },
  });
  if (user) {
    return user;
  }
  throw new ApiError(401, {}, "未登录！");
};

export const currentUser = async (): Promise<UserRecord> => {
  const info = getInfo();
  return _currentUser(info);
};
