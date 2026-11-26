// Страницы карт: при сборке Next читает исходную страницу игры <игра>-map/index.html (её правят scripts/seo.py,
// early_data.py, build_map_about.py, category_pages.py) и раскладывает на <head>, тело и список скриптов.
// Верхнее меню карты (mtb) не берётся — вместо него общий каркас сайта (components/shell).
// Страницы локаций (/<игра>/<карта>/) — та же страница с <base href="../"> и своими title/description/canonical
// (раньше их копировал scripts/map_pages.py).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { homeGames, SITE } from "./data";

const ROOT = path.join(process.cwd(), "..");
const read = (...p: string[]) => readFileSync(path.join(ROOT, ...p), "utf8");

/** Папки игр с картой: palworld-map, skyrim-map… */
export function mapGames(): string[] {
  return readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.endsWith("-map") && existsSync(path.join(ROOT, d.name, "index.html")))
    .map((d) => d.name)
    .sort();
}

// ---------- список карт игры (как maps() в scripts/map_pages.py) ----------
function evalJs<T>(code: string): T {
  const box: { out?: unknown } = {};
  vm.runInNewContext(code + "\n;__out(__res);", { __out: (v: unknown) => (box.out = v) });
  return box.out as T;
}
function block(src: string, start: string) {
  const a = src.indexOf(start);
  if (a < 0) throw new Error("не найдено: " + start);
  const m = /^\];|^\};/m.exec(src.slice(a));
  if (!m) throw new Error("нет конца блока: " + start);
  return src.slice(a, a + m.index + m[0].length);
}

const cacheMaps = new Map<string, [string, string][]>();
/** [[id, русское название]] в порядке списка карт игры; [] — у игры одна карта, отдельных страниц нет. */
export function gameMaps(folder: string): [string, string][] {
  const hit = cacheMaps.get(folder);
  if (hit) return hit;
  const app = read(folder, "js", "app.js");
  let res: [string, string][] = [];
  if (folder === "stellar-blade-map") {
    res = evalJs(read(folder, "js", "maps.js") + "\nvar __res = MAPS.map(m => [m.id, m.name]);");
  } else if (["oblivion-remake-map", "skyrim-map", "witcher3-map", "hogwarts-legacy-map", "phantom-blade-zero-map", "dragonsword-awakening-map", "cs2-map"].includes(folder)) {
    const a = app.indexOf("const ASSETS_ROOT");
    const b = app.indexOf("\n", app.indexOf("const MAP_ORDER"));
    res = evalJs(app.slice(a, b) + "\nvar __res = MAP_ORDER.map(k => [k, MAPS[k].name]);");
  } else if (["tainted-grail-map", "dimraeth-map"].includes(folder)) {
    let pre = "";
    const maps = block(app, "const MAPS = [");
    if (maps.includes("${ASSETS_ROOT}")) pre = (/^const ASSETS_ROOT = .*$/m.exec(app)?.[0] ?? "") + "\n";
    res = evalJs(pre + maps + "\nvar __res = MAPS.map(m => [m.id, m.name]);");
  }
  cacheMaps.set(folder, res);
  return res;
}

// ---------- разбор HTML ----------
export type Tag = { tag: string; attrs: Record<string, string | true>; inner?: string };

const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
export const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
    e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e] ?? m),
  );

export function attrs(s: string): Record<string, string | true> {
  const out: Record<string, string | true> = {};
  for (const m of s.matchAll(/([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    const v = m[2] ?? m[3] ?? m[4];
    out[m[1].toLowerCase()] = v === undefined ? true : decode(v);
  }
  return out;
}

/** Теги <head> по порядку (комментарии пропускаются). */
export function headTags(head: string): Tag[] {
  const res: Tag[] = [];
  const re = /<!--[\s\S]*?-->|<(script|title|style)\b([^>]*)>([\s\S]*?)<\/\1>|<(meta|link|base)\b([^>]*?)\/?>/gi;
  for (const m of head.matchAll(re)) {
    if (m[0].startsWith("<!--")) continue;
    if (m[1]) res.push({ tag: m[1].toLowerCase(), attrs: attrs(m[2]), inner: m[1].toLowerCase() === "title" ? decode(m[3]) : m[3] });
    else res.push({ tag: m[4].toLowerCase(), attrs: attrs(m[5]) });
  }
  return res;
}

export type MapPage = {
  folder: string;
  mapId: string | null;
  htmlAttrs: Record<string, string | true>;
  bodyAttrs: Record<string, string | true>;
  head: Tag[];
  body: string;
  scripts: string[];
};

const MTB = /[ \t]*<!-- mtb:start[^>]*-->[\s\S]*?<!-- mtb:end -->\n?/;
const MTB_SIDE = /[ \t]*<!-- mtb-side:start[^>]*-->[\s\S]*?<!-- mtb-side:end -->\n?/;
// эти скрипты не нужны внутри каркаса: верхнего меню карты (mtb) больше нет, Метрика остаётся в <head>
const DROP_SCRIPTS = [/\/js\/map-topbar\.js/];
const HEAD_SCRIPTS = [/\/js\/metrika\.js/];

/** Страница карты: игра folder, локация mapId (null — страница игры). */
export function mapPage(folder: string, mapId: string | null): MapPage {
  const src = read(folder, "index.html");
  const htmlAttrs = attrs(/<html\b([^>]*)>/i.exec(src)?.[1] ?? "");
  const headSrc = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(src)?.[1] ?? "";
  const bm = /<body\b([^>]*)>([\s\S]*?)<\/body>/i.exec(src);
  if (!bm) throw new Error(folder + ": нет <body>");
  const bodyAttrs = attrs(bm[1]);

  const scripts: string[] = [];
  const head: Tag[] = [];
  for (const t of headTags(headSrc)) {
    // charset и viewport ставит Next (viewport — из generateViewport в layout)
    if (t.tag === "meta" && (t.attrs.charset || t.attrs.name === "viewport")) continue;
    if (t.tag === "script" && typeof t.attrs.src === "string" && !HEAD_SCRIPTS.some((r) => r.test(t.attrs.src as string))) {
      if (!DROP_SCRIPTS.some((r) => r.test(t.attrs.src as string))) scripts.push(t.attrs.src);
      continue;
    }
    head.push(t);
  }

  let body = bm[2].replace(MTB, "").replace(MTB_SIDE, "");
  body = body.replace(/[ \t]*<script\b([^>]*)\bsrc="([^"]+)"[^>]*>\s*<\/script>\n?/gi, (_, _a, src: string) => {
    if (!DROP_SCRIPTS.some((r) => r.test(src))) scripts.push(decode(src));
    return "";
  });

  // React выносит предзагрузку стилей/шрифтов выше <base>, поэтому адреса в <head> и скриптов — от корня сайта
  const abs = (u: string) => absUrl(u, folder);
  for (const t of head) for (const k of ["href", "src"]) if (typeof t.attrs[k] === "string") t.attrs[k] = abs(t.attrs[k] as string);
  scripts.forEach((u, i) => (scripts[i] = abs(u)));

  if (mapId) localize(head, folder, mapId);
  return { folder, mapId, htmlAttrs, bodyAttrs, head, body, scripts };
}

/** Относительный адрес страницы игры → от корня сайта: ../css/a.css → /css/a.css, css/style.css → /skyrim-map/css/style.css */
export function absUrl(u: string, folder: string) {
  if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(u)) return u;
  const r = new URL(u, folder ? `https://x/${folder}/` : "https://x/");
  return r.pathname + r.search + r.hash;
}

/** title/description/canonical/og страницы локации — как page() в scripts/map_pages.py. */
function localize(head: Tag[], folder: string, mapId: string) {
  const name = gameMaps(folder).find(([id]) => id === mapId)?.[1];
  if (!name) throw new Error(`${folder}: нет карты ${mapId}`);
  const url = `${SITE}${folder}/${mapId}/`;
  const t = head.find((x) => x.tag === "title");
  const title = (t?.inner ?? "").replace(/( — BroskiPlay)$/, `: ${name}$1`);
  if (t) t.inner = title;
  const meta = (k: string, v: string) => head.find((x) => x.tag === "meta" && (x.attrs.name === v || x.attrs.property === v) && k);
  const d = meta("name", "description");
  const desc0 = String(d?.attrs.content ?? "");
  const desc = `${name} — ${desc0.slice(0, 1).toLowerCase()}${desc0.slice(1)}`;
  if (d) d.attrs.content = desc;
  const canon = head.find((x) => x.tag === "link" && x.attrs.rel === "canonical");
  if (canon) canon.attrs.href = url;
  const set = (p: string, v: string) => {
    const m = meta("property", p);
    if (m) m.attrs.content = v;
  };
  set("og:url", url);
  set("og:title", title);
  set("og:description", desc);
  // JSON-LD тоже про локацию, а не про корневую карту: адрес, название, описание и последняя «хлебная крошка»
  const rootUrl = `${SITE}${folder}/`;
  for (const s of head) {
    if (s.tag !== "script" || s.attrs.type !== "application/ld+json" || !s.inner) continue;
    let ld: { "@graph"?: Record<string, unknown>[] };
    try {
      ld = JSON.parse(s.inner);
    } catch {
      continue;
    }
    for (const n of ld["@graph"] ?? []) {
      if (n["@type"] === "WebApplication") {
        n["@id"] = `${url}#app`;
        n.url = url;
        n.name = `${n.name}: ${name}`;
        n.description = desc;
      } else if (n["@type"] === "BreadcrumbList" && Array.isArray(n.itemListElement)) {
        const items = n.itemListElement as Record<string, unknown>[];
        // крошка на корневую карту остаётся, локация добавляется после неё
        if (items.some((i) => i.item === rootUrl) && !items.some((i) => i.item === url))
          items.push({ "@type": "ListItem", position: items.length + 1, name, item: url });
      }
    }
    s.inner = JSON.stringify(ld, null, 2);
  }
  head.unshift({ tag: "base", attrs: { href: "../" } });
}

/** Ссылка «База» в навигации: база игры, если она есть. */
export function dbHref(folder: string) {
  const slug = folder.replace(/-map$/, "");
  return existsSync(path.join(ROOT, "data", "db", slug)) ? `/db/${slug}/` : "/db/";
}

/** Другие написания названий для поиска игр (шапка и главная): «гта 6» находит Grand Theft Auto VI. */
export const SEARCH_ALIAS: Record<string, string> = {
  gta6: "gta 6 gta vi gta6 гта 6 гта6 гта vi гта",
  rdr2: "rdr 2 rdr2 red dead рдр 2 рдр2 ред дед",
  witcher3: "witcher 3 the witcher ведьмак",
  cyberpunk2077: "киберпанк cyberpunk",
  skyrim: "скайрим tes 5 elder scrolls",
  oblivion: "обливион tes 4 elder scrolls",
  hogwarts: "хогвартс hogwarts",
  palworld: "палворлд палворд",
  stellar: "стеллар блейд",
  gothic: "готика gothic",
  tainted: "тейнтед грейл",
  phantomblade: "фантом блейд",
  dragonsword: "драгонсворд драгонсорд dragon sword",
  cs2: "cs2 cs 2 кс2 кс 2 ксго csgo counter strike контра каэс раскидки гранаты смоки",
  ms2: "mortal shell 2 мортал шелл 2 мортал шел ms2 смертная оболочка",
};

/** Игры для поиска в шапке: из тех же карточек, что на главной. */
export function findGames(): { key: string; title: string; href: string; sub: string; alias?: string }[] {
  return homeGames().games.map((g) => {
    const folder = g.links[0]?.href.match(/^\.\/([a-z0-9-]+)\//)?.[1] ?? "";
    return { key: g.key, title: g.title, href: `/${folder}/`, sub: g.count.text.replace(/\s+в прогрессе$/, ""), alias: SEARCH_ALIAS[g.key] };
  });
}
