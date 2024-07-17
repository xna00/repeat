import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  Unique,
} from "typeorm";
import { ExtractType, OmitFrom } from "./utils.js";
import { User } from "./user.js";

@Entity()
@Unique(["user", "text"])
export class Word extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column({})
  text!: string;

  @Column({
    name: "average_grade",
    default: 0,
    type: "float",
  })
  averageGrade!: number;

  @Column({
    name: "learn_count",
    default: 0,
  })
  learnCount!: number;

  @Column({
    name: "last_grade",
    default: 0,
  })
  lastGrade!: number;

  @Column({
    name: "last_time",
    nullable: true,
  })
  lastTime!: Date;

  @Column({
    name: "create_at",
  })
  createdAt!: Date;
}

export type WordRecord = OmitFrom<ExtractType<Word>, "user" | "lastTime"> & {
  lastTime: string | null | Date;
};

export type NewWord = {
  word: string;
};
