// Сборка главной: клиентский бандл в /assets/home/, затем пререндер React в статический /index.html (для SEO и первой отрисовки без JS).
// Запуск: npm run build:home (из корня репозитория).
import { createHash } from "node:crypto";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const HOME = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HOME, "..");
const OUT = join(ROOT, "assets", "home");
const SSR_OUT = join(HOME, ".ssr");
const configFile = join(HOME, "vite.config.ts");

await build({ configFile, logLevel: "warn" });
await build({
  configFile,
  logLevel: "warn",
  build: { ssr: join(HOME, "src", "entry-server.tsx"), outDir: SSR_OUT, emptyOutDir: true, rollupOptions: { output: { format: "esm" } } },
});

// «Что нового»: две последние даты; метка прочитанного — как в scripts/changelog.py token()
const log = JSON.parse(readFileSync(join(ROOT, "data", "changelog.json"), "utf8"));
const token = log.length ? createHash("sha1").update(`${log[0].date}\n${log[0].items.join("\n")}`).digest("hex").slice(0, 10) : "";
const data = { updates: { token, entries: log.slice(0, 2), more: Math.max(0, log.length - 2) } };

const { games } = JSON.parse(readFileSync(join(ROOT, "data", "games.json"), "utf8"));
const site = "https://broskiplay.ru";
const ld = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${site}/#website`, url: `${site}/`, name: "BroskiPlay", inLanguage: "ru" },
    {
      "@type": "ItemList",
      name: "Интерактивные карты игр",
      itemListElement: games.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: `Карта ${g.title}`, url: `${site}/${g.folder}/` })),
    },
  ],
};

// JSON внутри <script>: «<» экранируем, чтобы строка с </script> не закрыла тег
const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c");

const { render } = await import(pathToFileURL(join(SSR_OUT, "entry-server.js")).href);
const template = readFileSync(join(OUT, "index.html"), "utf8");
const html = template
  .replace("<!--ld-json-->", `<script type="application/ld+json">${json(ld)}</script>`)
  .replace("<!--app-html-->", render(data))
  .replace("<!--app-data-->", `<script id="home-data" type="application/json">${json(data)}</script>`);

writeFileSync(join(ROOT, "index.html"), html);
rmSync(join(OUT, "index.html"));
rmSync(SSR_OUT, { recursive: true, force: true });
console.log(`главная: index.html ${(html.length / 1024).toFixed(1)} КБ, обновлений ${data.updates.entries.length}+${data.updates.more}`);
