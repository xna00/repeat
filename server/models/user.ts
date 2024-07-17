import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";
import { ExtractType, NewRecord } from "./utils.js";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({
    unique: true,
  })
  username!: string;
  @Column()
  password!: string;
}

export type UserRecord = ExtractType<User>;

export type NewUser = NewRecord<User>;
