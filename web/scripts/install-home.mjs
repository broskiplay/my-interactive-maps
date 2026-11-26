// После `next build`: кладёт главную в корень сайта — out/index.html → ../index.html, out/_next → ../_next.
// Остальное из out/ (404.html и т. п.) не копируется: у сайта свои страницы.
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const site = path.dirname(web);
const out = path.join(web, "out");

const html = readFileSync(path.join(out, "index.html"), "utf8");
if (!html.includes('id="games-container"') || (html.match(/class="game-dropdown/g) || []).length < 5) {
  console.error("install-home: в собранной главной нет карточек игр — корень сайта не тронут");
  process.exit(1);
}
writeFileSync(path.join(site, "index.html"), "<!DOCTYPE html>" === html.slice(0, 15) ? html : "<!DOCTYPE html>" + html);
const dest = path.join(site, "_next");
if (existsSync(dest)) rmSync(dest, { recursive: true });
cpSync(path.join(out, "_next"), dest, { recursive: true });
console.log(`install-home: index.html (${(html.length / 1024).toFixed(0)} КБ) и _next/ → корень сайта`);
