// Собирает готовый сайт в ../_site: файлы сайта из корня репозитория + страницы Next (web/out) поверх.
// Исходные страницы карт (<игра>-map/index.html) в корне не трогаются — Next читает их при сборке
// (lib/maps.ts) и кладёт в _site версии в общем каркасе. Запуск: npm run site --prefix web (после генераторов).
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const web = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const root = path.dirname(web);
const out = path.join(web, "out");
const site = path.join(root, "_site");

// В сайт идёт только то, что перечислено здесь (белый список верхнего уровня). Всё прочее в корне —
// исходники, настройки редактора, документация репозитория — не публикуется. Новую папку/файл сайта добавлять сюда.
const PUBLISH = new Set([
  ".well-known", "cabinet", "css", "data", "db", "design", "fixes", "fonts", "icons", "img", "js", "og", "reports", "updates", "vendor",
  "404.html", "CNAME", "apple-touch-icon.png", "favicon-120.png", "favicon.ico", "index.html", "llms.txt", "manifest.webmanifest",
  "og-preview.jpg", "privacy.html", "robots.txt", "sitemap.xml", "sw.js", "ui-feedback.js",
]);
// плюс папки карт и файлы подтверждения прав на сайт (Google, Яндекс и т. п.)
const publishable = (name) =>
  PUBLISH.has(name) || /^[a-z0-9-]+-map$/.test(name) || /^(google[0-9a-f]+|yandex_[0-9a-f]+)\.html$/.test(name) || /^[0-9a-f]{32}\.txt$/.test(name);
// внутри опубликованных папок тоже не копируем служебное: инструменты сборки данных, кэш Python, исходники артов
const SKIP_DIR = new Set(["tools", "__pycache__", "node_modules", "source"]);
const SKIP_FILE = /^(\..*|.*\.(py|pyc|md|sh|mjs|cjs|ts|tsx|log|bak|orig|env)|logo-source\.png)$/i;
const keep = (src) => {
  const rel = path.relative(root, src).split(path.sep);
  const name = rel[rel.length - 1];
  if (rel.length === 1) return true; // верхний уровень уже отобран publishable
  if (rel[0] === ".well-known") return true;
  if (statSync(src).isDirectory()) return !SKIP_DIR.has(name) && !name.startsWith(".") && !(rel[0] === "icons" && name === "hero");
  if (SKIP_FILE.test(name)) return false;
  // исходники артов карт (logo.jpg, logo.png Tainted Grail) — в .gitignore, на сайте не используются
  if (rel.length === 2 && /-map$/.test(rel[0]) && (name === "logo.jpg" || (rel[0] === "tainted-grail-map" && name === "logo.png"))) return false;
  return true;
};

if (!existsSync(path.join(out, "index.html"))) {
  console.error("assemble: нет web/out — сначала next build");
  process.exit(1);
}
rmSync(site, { recursive: true, force: true });
for (const name of readdirSync(root)) {
  if (!publishable(name)) continue;
  cpSync(path.join(root, name), path.join(site, name), { recursive: true, verbatimSymlinks: true, filter: keep });
}
// страницы Next поверх; служебные файлы RSC (*.txt) не нужны — у сайта нет клиентской навигации между страницами
let pages = 0;
const copy = (rel) => {
  const src = path.join(out, rel);
  if (statSync(src).isDirectory()) return readdirSync(src).forEach((n) => copy(path.join(rel, n)));
  if (rel.endsWith(".txt") && !rel.startsWith("_next")) return;
  if (rel === "404.html" || rel.startsWith("404") || rel.startsWith("_not-found")) return; // 404 Next не нужен — свой ниже (page-404)
  if (rel.startsWith("wrap")) return; // шаблоны каркаса — ниже
  // отдельные страницы с прежними адресами: /404.html (GitHub Pages отдаёт её на любом адресе) и /privacy.html
  const flat = { "page-404/index.html": "404.html", "privacy/index.html": "privacy.html" }[rel.split(path.sep).join("/")];
  if (flat) return void (cpSync(src, path.join(site, flat)), pages++);
  cpSync(src, path.join(site, rel));
  if (rel.endsWith("index.html")) pages++;
};
copy("");
console.log(`assemble: _site готов, страниц Next: ${pages}`);

// ---------- каталог карт для пересчёта прогресса в кабинете (js/progress-core.js → BPP.refresh) ----------
// Игры и ключи — из js/progress-core.js, карты (id, файл меток) — из *MapConfigs в js/script.js,
// названия и адреса — из карточек главной (web/data/home-games.json), цвет — --game-accent в css/home-neo.css.
{
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(path.join(root, "js/progress-core.js"), "utf8"), ctx);
  const script = readFileSync(path.join(root, "js/script.js"), "utf8");
  const neo = readFileSync(path.join(root, "css/home-neo.css"), "utf8");
  const cards = JSON.parse(readFileSync(path.join(web, "data/home-games.json"), "utf8")).games;
  const games = ctx.window.BPP.GAMES.map((g) => {
    const body = new RegExp(`const ${g.conf} = \\[([\\s\\S]*?)\\n\\];`).exec(script)?.[1];
    const card = cards.find((c) => c.key === g.key);
    if (!body || !card) throw new Error(`assemble: нет конфигов или карточки игры ${g.key}`);
    const links = card.links.map((l) => ({ ...l, href: l.href.replace(/^\.\//, "/") }));
    const maps = [...body.matchAll(/id: "([^"]+)", name: "([^"]+)".*?markersFile: "([^"]+)"/g)].map(([, id, name, markersFile]) => {
      const link = links.find((l) => l.href === `/${g.dir}/${id}/`) ?? links.find((l) => l.href === `/${g.dir}/`);
      return { id, markersFile, name: link?.name ?? name, href: link?.href ?? `/${g.dir}/` };
    });
    if (!maps.length) throw new Error(`assemble: у игры ${g.key} не найдены карты`);
    const accent = new RegExp(`\\.theme-${g.key}\\s*\\{\\s*--game-accent:\\s*(#[0-9a-fA-F]{3,8})`).exec(neo)?.[1] ?? "";
    return { key: g.key, title: card.title, accent, maps };
  });
  writeFileSync(path.join(site, "data/progress-maps.json"), JSON.stringify({ games }));
  console.log(`assemble: каталог прогресса: ${games.length} игр, ${games.reduce((n, g) => n + g.maps.length, 0)} карт`);
}

// ---------- страницы, которые генерирует Python, в каркасе сайта: база данных /db/ и категории карт ----------
// Страницы базы генерирует scripts/db_pages.py (16 тыс. страниц). Next собирает шаблон каркаса один раз на игру
// (app/(wrap)/wrap/[kind] → out/wrap/db-<игра>/), здесь в него вставляются <head> и тело каждой страницы.
// Скрипты Next из шаблона убираются: каркас статичный, поиск и вход — js/shell-lite.js и js/auth-lite.js.
const tpl = new Map();
const template = (kind) => {
  if (tpl.has(kind)) return tpl.get(kind);
  const f = path.join(out, "wrap", kind, "index.html");
  let t = existsSync(f) ? readFileSync(f, "utf8") : null;
  if (t) {
    t = t
      .replace(/<script\b(?![^>]*\btype="application\/json")(?![^>]*\bsrc="\/(?!_next\/))[^>]*>[\s\S]*?<\/script>/g, "")
      .replace(/<link rel="preload" as="script"[^>]*>/g, "")
      .replace(/<div hidden=""><!--\$--><!--\/\$--><\/div>|<!--\$--><!--\/\$-->/g, "");
    if (!t.includes('<div id="bx-raw"></div>')) throw new Error("assemble: в шаблоне " + kind + " нет #bx-raw");
  }
  tpl.set(kind, t);
  return t;
};
const TOPBAR = /<!-- topbar:start[^>]*-->[\s\S]*?<!-- topbar:end -->\n?/;
const wrap = (file, kind) => {
  const src = readFileSync(file, "utf8");
  if (src.length < 2000 && src.includes('http-equiv="refresh"')) return false;   // переадресация на общую страницу (db_pages.py → stub_page)
  const t = template(kind) ?? template("db");
  const html = /<html\b[^>]*>/i.exec(src)?.[0];
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(src)?.[1];
  const body = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(src)?.[1];
  if (!t || !html || head == null || body == null) return false;
  const h = head.replace(/[ \t]*<meta charset="[^"]*">\n?|[ \t]*<meta name="viewport"[^>]*>\n?/gi, "");
  // стили каркаса после стилей страницы — чтобы общая шапка не зависела от db/site.css
  const res = t
    .replace(/<html\b[^>]*>/, html.replace(/<html/, '<html data-shell=""'))
    .replace(/(<meta name="viewport"[^>]*>)/, (m) => m + h)
    .replace('<div id="bx-raw"></div>', () => body.replace(TOPBAR, ""));
  writeFileSync(file, res);
  return true;
};
/** Оборачивает все index.html в папке; kind — шаблон (null — по имени папки игры в /db/). Возвращает число страниц. */
const walk = (dir, kind) => {
  let n = 0;
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) n += walk(p, kind ?? "db-" + d.name);
    else if (d.name === "index.html" && wrap(p, kind ?? "db")) n++;
  }
  return n;
};
const dbn = existsSync(path.join(site, "db")) ? walk(path.join(site, "db"), null) : 0;
console.log(`assemble: база данных в каркасе: ${dbn} страниц`);

// страницы категорий /<игра>-map/c/ (scripts/category_pages.py) — шаблон c-<игра>-map: «Игры» активны, «База» — база игры
let cn = 0;
for (const d of readdirSync(site, { withFileTypes: true })) {
  const c = path.join(site, d.name, "c");
  if (d.isDirectory() && d.name.endsWith("-map") && existsSync(c) && template("c-" + d.name)) cn += walk(c, "c-" + d.name);
}
console.log(`assemble: страницы категорий в каркасе: ${cn}`);

// ---------- проверка состава: служебные файлы в _site — ошибка сборки ----------
// Ловит то, что могло проскочить мимо белого списка (в т. ч. из web/out): настройки редактора, документацию,
// скрипты, кэш, файлы окружения. Ошибка останавливает сборку и публикацию (CI).
const BAD_DIR = new Set([".git", ".github", ".vscode", ".idea", ".claude", "node_modules", "__pycache__", "tools", "scripts", "web"]);
const BAD_FILE = /^(\.(?!well-known$).*|.*\.(py|pyc|md|sh|mjs|cjs|ts|tsx|log|bak|orig|env|pem|key)|package(-lock)?\.json|tsconfig\.json|AGENTS\.md|settings\.json)$/i;
const bad = [];
const audit = (dir) => {
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name), rel = path.relative(site, p);
    if (d.isDirectory()) {
      if (BAD_DIR.has(d.name) || (d.name.startsWith(".") && rel !== ".well-known")) bad.push(rel + "/");
      else audit(p);
    } else if (BAD_FILE.test(d.name) && !(rel.startsWith(".well-known" + path.sep))) bad.push(rel);
  }
};
audit(site);
if (bad.length) {
  console.error("assemble: в сайт попали служебные файлы:\n  " + bad.slice(0, 40).join("\n  ") + (bad.length > 40 ? `\n  …и ещё ${bad.length - 40}` : ""));
  process.exit(1);
}
console.log("assemble: состав сайта проверен — служебных файлов нет");
