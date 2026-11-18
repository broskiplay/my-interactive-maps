// localStorage может быть недоступен (приватный режим, запрет cookies) — тогда всё работает без сохранения.

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    /* без хранилища — только на время визита */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* нет доступа */
  }
}

export function readArray(key: string): unknown[] {
  const value = readJSON<unknown>(key, []);
  return Array.isArray(value) ? value : [];
}
