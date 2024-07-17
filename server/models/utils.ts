type NoF<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends (...args: never[]) => unknown
    ? never
    : K
  : never;
export type ExtractType<M> = {
  [K in NoF<M>]: M[K];
};

export type NewRecord<M> = Omit<ExtractType<M>, "id">;

export type OmitFrom<T, K extends keyof T> = Omit<T, K>;
