import type React from "react";
import { useRef, type ReactNode } from "react";

export type OptionType<V> = {
  label: ReactNode;
  value: V;
};

export type SelectProps<V> = {
  value: V;
  options: OptionType<V>[];
  onChange?: (v: V) => void;
};

const keyMap = new WeakMap<object, string>();

const genKey = (o: object) => {
  const key = keyMap.get(o) ?? crypto.randomUUID();
  keyMap.set(o, key);
  return key;
};

export default <V extends string | number | object>(
  props: SelectProps<V> &
    Omit<React.JSX.IntrinsicElements["select"], "value" | "onChange">
) => {
  const { value, options, onChange, ...rest } = props;

  const baseMapRef = useRef(new Map<V, string>());
  const baseMap = baseMapRef.current;

  const values = options.map((o) => o.value);

  options.forEach((o) => {
    if (baseMap.get(o.value) === undefined) {
      baseMap.set(o.value, crypto.randomUUID());
    }
  });

  baseMap.forEach((_, k) => {
    if (!values.includes(k)) {
      baseMap.delete(k);
    }
  });

  const getKey = (o: V) => {
    const key = baseMap.get(o)!;
    return key;
  };

  return (
    <select
      {...rest}
      value={getKey(value)}
      onChange={(e) => {
        const v = e.target.value;
        const l = Object.fromEntries(
          [...baseMap.entries()].map(([k, v]) => [v, k] as const)
        );
        onChange?.(l[v]);
      }}
    >
      {options.map((o) => (
        <option key={getKey(o.value)} value={getKey(o.value)}>
          {o.label}
        </option>
      ))}
    </select>
  );
};
