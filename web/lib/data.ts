// Данные главной читаются при сборке (next build) из файлов сайта — те же, что у Python-скриптов.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const SITE_ROOT = path.join(process.cwd(), "..");
const readJson = <T>(...p: string[]): T => JSON.parse(readFileSync(path.join(...p), "utf8")) as T;

export const SITE = "https://broskiplay.ru/";

// ---------- карточки игр (web/data/home-games.json, пишет scripts/prerender_home.py) ----------
export type MapLink = {
  href: string;
  className: string;
  title: string | null;
  name: string;
  icon: "marker" | "db";
  progress: string | null;
};
export type GameCard = {
  key: string;
  maps: number;
  bannerClass: string;
  badge: { className: string; text: string } | null;
  img: Record<string, string>;
  title: string;
  progressLabel: string;
  count: { text: string; title: string | null };
  indicatorsTitle: string | null;
  direct: Record<string, string> | null;
  /** короткое название — показывается, если полное не влезает в карточку */
  titleShort?: string;
  links: MapLink[];
};
export type Suggest = { href: string; className: string; style: string | null; title: string; sub: string; cta: string };

export function homeGames() {
  return readJson<{ games: GameCard[]; suggest: Suggest | null }>(process.cwd(), "data", "home-games.json");
}

// ---------- «Что нового» (data/changelog.json, правит scripts/changelog.py) ----------
export type ChangelogEntry = { date: string; items: string[] };
const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const VISIBLE = 3; // как VISIBLE в scripts/changelog.py

const day = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
};
export const humanDate = (iso: string) => {
  const { y, m, d } = day(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
export const shortDate = (iso: string) => {
  const { m, d } = day(iso);
  return `${d} ${MONTHS[m - 1]}`;
};

export function changelog() {
  const all = readJson<ChangelogEntry[]>(SITE_ROOT, "data", "changelog.json")
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const shown: ChangelogEntry[] = [];
  let remaining = VISIBLE;
  for (const e of all) {
    if (remaining <= 0) break;
    if (!e.items?.length) continue;
    const items = e.items.slice(0, remaining);
    shown.push({ ...e, items });
    remaining -= items.length;
  }
  const total = all.reduce((n, e) => n + (e.items?.length ?? 0), 0);
  const visible = shown.reduce((n, e) => n + e.items.length, 0);
  const newest = all[0];
  // метка последнего обновления — та же формула, что token() в changelog.py
  const token = newest
    ? createHash("sha1")
        .update(newest.date + "\n" + newest.items.join("\n"), "utf8")
        .digest("hex")
        .slice(0, 10)
    : "";
  const latest = newest ? { date: newest.date, text: newest.items[0].split(" — ")[0].replace(/[ .]+$/, "") } : null;
  return { shown, hasMore: total > visible, token, latest };
}

// ---------- цель сбора (data/goal.json) ----------
export type Goal = { title?: string; goal: number; raised?: number; currency?: string; deadline?: string };
export function goal(): Goal | null {
  try {
    const g = readJson<Goal>(SITE_ROOT, "data", "goal.json");
    return g && g.goal > 0 ? g : null;
  } catch {
    return null;
  }
}
