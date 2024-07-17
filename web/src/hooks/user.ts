import { createContext, useContext } from "react";
import type { UserRecord } from "server/models/user";

export const CurrentUserContext = createContext<UserRecord>(null!);

export const useCurrentUser = () => {
  const ctx = useContext(CurrentUserContext);
  return ctx;
};
