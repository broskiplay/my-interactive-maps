const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

export function plural(n: number, one: string, few: string, many: string): string {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return one;
  return a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
}

export const num = (n: number): string => n.toLocaleString("ru-RU");

export const markers = (n: number): string => `${num(n)} ${plural(n, "метка", "метки", "меток")}`;

export const mapsWord = (n: number): string => `${n} ${plural(n, "карта", "карты", "карт")}`;

export const percent = (found: number, total: number): number => (total ? Math.round((found / total) * 100) : 0);

/** «18 ноября» или «18 ноября 2026» */
export function humanDate(iso: string, withYear = false): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}${withYear ? ` ${y}` : ""}`;
}
