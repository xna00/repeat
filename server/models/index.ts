import { DataSource, DataSourceOptions } from "typeorm";

import { User } from "./user.js";
import { Word } from "./word.js";
import { Log } from "./log.js";

export type * from "./user.js";
export type * from "./word.js";
export type * from "./log.js";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: `./db.sqlite`,
  entities: [User, Word, Log],
  logging: true,
});

AppDataSource.initialize()
  .then((d) => {
    console.log("inited!");
    return AppDataSource.synchronize();
  })
  .then(() => {
    console.log("synced");
  });
