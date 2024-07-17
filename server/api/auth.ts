import { NewUser, User } from "../models/user.js";
import { state, idMap } from "./global.js";
import cookie from "cookie";
import { makeJsonResponse, makeJsonResponse200 } from "./utils.js";

export const login = async (user: NewUser) => {
  const id = state.id;
  const u = await User.findOneBy({
    username: user.username,
  });
  if (!u) {
    throw "Username is not existed!";
  }
  if (u.password !== user.password) {
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
