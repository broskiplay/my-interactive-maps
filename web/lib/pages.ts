// Отдельные страницы сайта (Что нового, кабинет, журнал исправлений, очередь правок, справочник дизайна,
// политика, 404) в общем каркасе. Как и у карт (lib/maps.ts), исходник — прежний HTML в корне репозитория:
// Next берёт из него <head>, тело и скрипты, старое верхнее меню (scripts/site_menu.py) заменяется общей шапкой.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { RailItem } from "@/components/shell/rail";
import type { LegacyScript } from "@/components/shell/legacy-scripts";
import { absUrl, attrs, headTags, type Tag } from "./maps";

const ROOT = path.join(process.cwd(), "..");

export type PageKey = "updates" | "cabinet" | "fixes" | "reports" | "design" | "privacy" | "page-404";

/** src — исходник от корня репозитория; dir — папка страницы на сайте (для относительных адресов). */
export const PAGES: Record<PageKey, { src: string; dir: string; active: RailItem | null }> = {
  updates: { src: "updates/index.html", dir: "updates", active: null },
  cabinet: { src: "cabinet/index.html", dir: "cabinet", active: "profile" },
  fixes: { src: "fixes/index.html", dir: "fixes", active: null },
  reports: { src: "reports/index.html", dir: "reports", active: null },
  design: { src: "design/index.html", dir: "design", active: null },
  privacy: { src: "privacy.html", dir: "", active: null },
  // assemble.mjs кладёт её в _site/404.html (GitHub Pages отдаёт её на любом адресе — ссылки только от корня)
  "page-404": { src: "404.html", dir: "", active: null },
};

export type RawPage = {
  htmlAttrs: Record<string, string | true>;
  bodyAttrs: Record<string, string | true>;
  head: Tag[];
  body: string;
  scripts: LegacyScript[];
  active: RailItem | null;
};

// старое верхнее меню сайта: блок scripts/site_menu.py (у кабинета — без конечной метки) и его скрипт
const TOPBAR = /[ \t]*<!-- topbar:start[^>]*-->[\s\S]*?(?:<!-- topbar:end -->|<\/header>)\n?/;
const DROP_SCRIPTS = [/\/js\/topbar\.js/];
const HEAD_SCRIPTS = [/\/js\/metrika\.js/];

const cache = new Map<PageKey, RawPage>();

export function rawPage(key: PageKey): RawPage {
  const hit = cache.get(key);
  if (hit) return hit;
  const { src: file, dir, active } = PAGES[key];
  const src = readFileSync(path.join(ROOT, file), "utf8");
  const htmlAttrs = attrs(/<html\b([^>]*)>/i.exec(src)?.[1] ?? "");
  const headSrc = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(src)?.[1] ?? "";
  const bm = /<body\b([^>]*)>([\s\S]*?)<\/body>/i.exec(src);
  if (!bm) throw new Error(file + ": нет <body>");
  const abs = (u: string) => absUrl(u, dir);

  const scripts: LegacyScript[] = [];
  const head: Tag[] = [];
  for (const t of headTags(headSrc)) {
    if (t.tag === "meta" && (t.attrs.charset || t.attrs.name === "viewport")) continue;
    const s = typeof t.attrs.src === "string" ? t.attrs.src : null;
    if (t.tag === "script" && s && !HEAD_SCRIPTS.some((r) => r.test(s))) {
      if (!DROP_SCRIPTS.some((r) => r.test(s))) scripts.push(abs(s));
      continue;
    }
    for (const k of ["href", "src"]) if (typeof t.attrs[k] === "string") t.attrs[k] = abs(t.attrs[k] as string);
    head.push(t);
  }

  let body = bm[2].replace(TOPBAR, "");
  // скрипты тела (файлы и встроенный код) — после гидратации, в прежнем порядке
  body = body.replace(/[ \t]*<script\b([^>]*)>([\s\S]*?)<\/script>\n?/gi, (_, a: string, code: string) => {
    const s = attrs(a).src;
    if (typeof s === "string") {
      if (!DROP_SCRIPTS.some((r) => r.test(s))) scripts.push(abs(s));
    } else if (code.trim()) scripts.push({ code });
    return "";
  });

  const res = { htmlAttrs, bodyAttrs: attrs(bm[1]), head, body, scripts, active };
  cache.set(key, res);
  return res;
}
