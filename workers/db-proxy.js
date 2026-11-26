// Cloudflare Worker «db-proxy»: отдаёт broskiplay.ru/db/* из репозитория broskiplay/db-assets
// (GitHub Pages, https://broskiplay.github.io/db-assets/). Маршрут: broskiplay.ru/db*.
// Страницы базы собирает основной workflow (.github/workflows/pages.yml) и пушит в db-assets,
// поэтому адреса /db/... на сайте не меняются. Обновление: см. web/ARCHITECTURE.md §8.
const ORIGIN = "https://broskiplay.github.io/db-assets";
const PASS = ["accept", "accept-encoding", "accept-language", "if-none-match", "if-modified-since", "range", "user-agent"];
const DROP = ["x-github-request-id", "x-served-by", "x-cache", "x-cache-hits", "x-timer", "x-fastly-request-id", "via", "x-proxy-cache", "age"];

export default {
  async fetch(req) {
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/db(\/.*)?$/);
    if (!m) return fetch(req); // /dbx и т. п. — не наше, отдаём как есть
    if (!m[1]) return Response.redirect(`${url.origin}/db/${url.search}`, 301);
    if (req.method !== "GET" && req.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const upstream = ORIGIN + m[1] + url.search;
    const headers = new Headers();
    for (const k of PASS) { const v = req.headers.get(k); if (v) headers.set(k, v); }
    const res = await fetch(upstream, {
      method: req.method,
      headers,
      redirect: "manual",
      cf: { cacheEverything: true, cacheTtlByStatus: { "200-299": 600, "301-308": 3600, "404": 60, "500-599": 0 } },
    });

    // GitHub Pages: /db-assets/x → /db-assets/x/ — переписываем на /db/x/
    if (res.status >= 300 && res.status < 400 && res.headers.has("location")) {
      const loc = new URL(res.headers.get("location"), upstream);
      let to = loc.href;
      if (loc.hostname === "broskiplay.github.io" && (loc.pathname + "/").startsWith("/db-assets/")) {
        to = `${url.origin}/db/${loc.pathname.slice("/db-assets/".length)}${loc.search}`;
      }
      return new Response(null, { status: res.status, headers: { Location: to, "Cache-Control": "public, max-age=3600" } });
    }

    const out = new Headers(res.headers);
    for (const k of DROP) out.delete(k);
    out.set("x-db-proxy", "1");
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
  },
};
