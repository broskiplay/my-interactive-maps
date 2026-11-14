// Service Worker сайта: долговременный кэш тайлов и картинок меток + работа без сети.
//
// 1) Тайлы и попапы лежат на GitHub Pages (broskiplay.github.io/<игра>-assets/), а там заголовок всегда
// Cache-Control: max-age=600 — через 10 минут браузер снова идёт в хранилище. Поэтому файлы из tiles/ и popups/
// кладём в Cache Storage и дальше отдаём оттуда без запроса в сеть («сначала кэш»). Хранятся, пока пользователь
// не очистит данные сайта (или браузер не вытеснит их при нехватке места на диске).
//
// Если тайлы или попапы какой-то игры заменены под теми же адресами — увеличьте VERSION: старый кэш удалится
// у всех при следующем заходе.
//
// 2) Страницы, стили, скрипты и данные карт с broskiplay.ru (и manifest.json тайлов) — «сначала сеть»: пока сеть
// есть, всё приходит свежим, как раньше, а копия ответа кладётся в кэш SITE. Без сети отдаём копию, поэтому уже
// открытые карты работают офлайн (в том числе в установленном приложении). Версию SITE менять не нужно:
// при наличии сети кэш не используется.

const VERSION = 1;
const CACHE = `bp-assets-v${VERSION}`;
// Все тайлы и попапы всех игр — около 33 тыс. файлов (~370 МБ). Лимит — только страховка от бесконечного роста.
const MAX_ENTRIES = 45000;
const SITE = "bp-site-v1";
const ASSET_RE = /^\/[a-z0-9-]+-assets\/(tiles|popups)\/.+\.(webp|avif|png|jpe?g)$/;

const TILE_MANIFEST_RE = /^\/[a-z0-9-]+-assets\/.*manifest\.json$/;
// Что не кладём в кэш сайта: очередь правок автора и служебные файлы проверки поисковиков
const SITE_SKIP_RE = /^\/(reports\/|sw\.js$)/;

self.addEventListener("install", event => {
    // главная нужна установленному приложению как стартовая страница, даже если её ещё не открывали под SW
    event.waitUntil(caches.open(SITE).then(c => c.add("/")).catch(() => {}).then(() => self.skipWaiting()));
});

// Страница, открытая до установки SW, загрузилась мимо него — она присылает список своих файлов, чтобы и они
// попали в офлайн-копию (см. js/pwa.js).
self.addEventListener("message", event => {
    const d = event.data;
    if (!d || d.type !== "bp-warm" || !Array.isArray(d.urls)) return;
    event.waitUntil((async () => {
        let cache;
        try { cache = await caches.open(SITE); } catch (e) { return; }
        for (const href of d.urls.slice(0, 200)) {
            try {
                if (!siteUrl(new URL(href)) || await cache.match(href)) continue;
                const res = await fetch(href, { credentials: "omit" });
                if (res.ok && res.status === 200) await cache.put(href, res);
            } catch (e) { /* нет сети или квоты — не критично */ }
        }
    })());
});

function siteUrl(url) {
    if (url.origin === self.location.origin) return !SITE_SKIP_RE.test(url.pathname);
    return url.hostname === "broskiplay.github.io" && TILE_MANIFEST_RE.test(url.pathname);
}

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.filter(n => n.startsWith("bp-assets-") && n !== CACHE).map(n => caches.delete(n)));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", event => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.hostname === "broskiplay.github.io" && ASSET_RE.test(url.pathname)) {
        event.respondWith(fromCache(req, url.href, event));
        return;
    }
    if (req.headers.has("range") || !siteUrl(url)) return;
    event.respondWith(networkFirst(req, event));
});

// «Сначала сеть»: свежий ответ отдаём и запоминаем; если сети нет — последняя сохранённая копия.
async function networkFirst(req, event) {
    try {
        const res = await fetch(req);
        if (res.ok && res.status === 200 && (res.type === "basic" || res.type === "cors")) {
            const copy = res.clone();
            event.waitUntil(caches.open(SITE).then(c => c.put(req.url, copy)).catch(() => {}));
        }
        return res;
    } catch (err) {
        try {
            const cache = await caches.open(SITE);
            // страницу карты могли открывать с другими параметрами (?marker=…, ?cat=…) — подойдёт любая её копия
            const hit = await cache.match(req.url) || (req.mode === "navigate" ? await cache.match(req.url, { ignoreSearch: true }) : null);
            if (hit) return hit;
        } catch (e) { /* Cache Storage недоступен */ }
        if (req.mode === "navigate") return offlinePage();
        throw err;
    }
}

function offlinePage() {
    const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Нет сети — BroskiPlay</title><meta name="robots" content="noindex">
<style>html{color-scheme:dark light}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0d1118;color:#e8ecf3;font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:420px;padding:24px;text-align:center}h1{margin:0 0 10px;font-size:22px}p{margin:0 0 18px;color:#9aa6b8}
a,button{display:inline-block;margin:4px;padding:10px 18px;border:0;border-radius:999px;background:#1b2330;color:#50e3c2;font-family:inherit;font-size:14px;font-weight:600;line-height:1;text-decoration:none;cursor:pointer}
@media (prefers-color-scheme:light){body{background:#e6e9f2;color:#1b2230}p{color:#5b6678}a,button{background:#f3f5fa;color:#0d7f6c}}</style></head>
<body><main><h1>Нет подключения к сети</h1><p>Эта страница ещё не сохранена на устройстве. Без сети открываются карты, которые вы уже открывали.</p>
<button type="button" onclick="location.reload()">Повторить</button><a href="/">На главную</a></main></body></html>`;
    return new Response(html, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

async function fromCache(req, key, event) {
    let cache = null;
    try {
        cache = await caches.open(CACHE);
        const hit = await cache.match(key);
        if (hit) return hit;
    } catch (e) { /* Cache Storage недоступен (приватный режим и т. п.) — просто идём в сеть */ }

    let res;
    try {
        // <img> без crossorigin делает запрос no-cors, и ответ был бы «непрозрачным» (без статуса, а Chrome считает
        // такой ответ в квоте за несколько МБ). У хранилища CORS: *, поэтому запрашиваем сами в режиме cors.
        res = await fetch(key, { mode: "cors", credentials: "omit" });
    } catch (e) {
        return fetch(req);
    }
    if (cache && res.ok && res.status === 200) {
        event.waitUntil(store(cache, key, res.clone()));
    }
    return res;
}

let putsSinceTrim = 0;

async function store(cache, key, res) {
    try {
        await cache.put(key, res);
    } catch (e) {
        // Кончилась квота — освобождаем четверть места от самых старых записей
        await trim(cache, n => Math.floor(n * 0.75));
        return;
    }
    if (++putsSinceTrim >= 300) {
        putsSinceTrim = 0;
        await trim(cache, () => MAX_ENTRIES);
    }
}

async function trim(cache, limitFor) {
    try {
        const keys = await cache.keys(); // в порядке добавления: сначала самые старые
        const extra = keys.length - limitFor(keys.length);
        for (let i = 0; i < extra; i++) await cache.delete(keys[i]);
    } catch (e) { /* не критично */ }
}
