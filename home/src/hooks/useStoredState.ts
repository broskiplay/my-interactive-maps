import { useCallback, useEffect, useState } from "react";
import { readJSON, readString, write } from "../lib/storage";

/** Состояние, сохранённое в localStorage. Первый рендер — значение по умолчанию (совпадает с пререндером),
 *  сохранённое подставляется после монтирования. validate отсекает мусор из старых версий сайта. */
export function useStoredState<T>(key: string, initial: T, validate: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    // строки старый код сайта писал без JSON-кавычек ("list", "az") — сначала пробуем их как есть
    const raw = readString(key);
    if (validate(raw)) return setValue(raw);
    const stored = readJSON<unknown>(key, initial);
    if (validate(stored)) setValue(stored);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}
