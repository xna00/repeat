import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  Unique,
  CreateDateColumn,
} from "typeorm";
import { ExtractType, OmitFrom } from "./utils.js";
import { User } from "./user.js";

@Entity()
export class Log extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column({})
  word!: string;

  @Column({})
  grade!: number;

  @Column({
    name: "create_at",
  })
  createdAt!: Date;
}

export type LogRecord = OmitFrom<ExtractType<Log>, "user">;

export type NewLog = {
  word: string;
  grade: number;
};
