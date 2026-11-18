#!/usr/bin/env python3
"""Страницы категорий: <игра>-map/c/<категория>/index.html — «Яйца Palworld», «Ключи Cyberpunk 2077» и т. п.

    python3 scripts/category_pages.py            # все игры
    python3 scripts/category_pages.py palworld-map

Зачем: поисковик видит у каждой игры одну страницу с картой, а люди ищут «все яйца Palworld на карте».
Страница категории — обычный HTML: сколько меток, где они (по локациям), список названий со счётчиками,
кнопка «Открыть на карте» (карта сама оставит только эту категорию: параметр ?cat=<ключ>, js/map-core.js)
и ссылки на соседние категории игры.

Данные берутся из тех же файлов, что и карта: категории — из js/categories.js (у Tainted Grail — из app.js, там же
правила уточнения по названию), список карт и файлов меток — из js/script.js (*MapConfigs, как у scripts/build_readme.py).
Категории, в которых меньше MIN_MARKERS меток, страниц не получают.

Страницы не хранятся в git (.gitignore: /*-map/c/) — scripts/publish.sh создаёт их перед публикацией.
Кроме страниц скрипт вставляет на страницу игры блок «Все категории» (между <!-- cats:start --> и <!-- cats:end -->,
внутри «О карте»), чтобы у страниц категорий были входящие ссылки. Запускать после build_map_about.py и до map_pages.py.
"""
import collections
import html
import json
import os
import re
import shutil
import time
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from seo import GAMES, SITE, ROOT  # noqa: E402

JSC = os.environ.get("JSC") or "/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"  # на Linux (Actions): scripts/jsc_node.cjs
MIN_MARKERS = 3          # меньше — страницы нет
MAX_ROWS = 300           # строк в списке названий на одной странице
CONFIG_VAR = {
    "stellar-blade-map": "stellarMapConfigs", "tainted-grail-map": "taintedMapConfigs", "gothic-remake-map": "gothicMapConfigs",
    "dimraeth-map": "dimraethMapConfigs", "palworld-map": "palworldMapConfigs", "oblivion-remake-map": "oblivionMapConfigs",
    "skyrim-map": "skyrimMapConfigs", "witcher3-map": "witcher3MapConfigs", "cyberpunk2077-map": "cyberpunkMapConfigs",
    "hogwarts-legacy-map": "hogwartsMapConfigs", "phantom-blade-zero-map": "phantomBladeMapConfigs", "rdr2-map": "rdr2MapConfigs", "silver-palace-map": "silverPalaceMapConfigs",
}
GAME_NAME = {"witcher3-map": "Ведьмак 3: Дикая Охота", "oblivion-remake-map": "Oblivion Remastered", "skyrim-map": "Skyrim"}
# карты, закрытые замком до даты релиза (14 декабря 2026, 00:00 по Москве): после неё страницы появятся при следующей сборке
LOCKED_UNTIL = {"silver-palace-map": 1797195600}
MARK = "<!-- category-page: сгенерировано scripts/category_pages.py — не править вручную -->"
CATS = re.compile(r"([ \t]*)<!-- cats:start[^>]*-->.*?<!-- cats:end -->", re.S)


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(s)


def plural(n, forms):
    a, b = n % 10, n % 100
    return forms[0] if a == 1 and b != 11 else forms[1] if 2 <= a <= 4 and not 12 <= b <= 14 else forms[2]


def fmt(n):
    return f"{n:,}".replace(",", " ")


def esc(s):
    return html.escape(str(s), quote=True)


def run_js(code):
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(code)
    try:
        out = subprocess.run([JSC, f.name], capture_output=True, text=True)
    finally:
        os.unlink(f.name)
    if out.returncode or not out.stdout.strip():
        raise RuntimeError(out.stderr or out.stdout)
    return json.loads(out.stdout.strip().splitlines()[-1])


# ---------- данные игры ----------
def game_maps(folder):
    """[(id, название, файл меток)] из js/script.js."""
    src = read(f"{ROOT}/js/script.js")
    body = re.search(r"const %s = \[(.*?)\n\];" % CONFIG_VAR[folder], src, re.S).group(1)
    return re.findall(r'id: "([^"]+)", name: "([^"]+)".*?markersFile: "([^"]+)"', body)


def game_categories(folder):
    """([группы {title, items:[{key,name,hint?}]}], js-код для классификации или '')."""
    stub = "var Image=function(){};var document={createElement:function(){return {}}};var MAP_HOME=\"/\";\n"
    if folder == "tainted-grail-map":
        app = read(f"{ROOT}/{folder}/js/app.js")
        a = app.index("const CATEGORIES = ["); b = app.index("const state = {")
        chunk = app[a:b]
        groups = run_js(stub + chunk + "\nprint(JSON.stringify(CATEGORIES));")
        return groups, chunk
    code = read(f"{ROOT}/{folder}/js/categories.js")
    return run_js(stub + code + "\nprint(JSON.stringify(CATEGORIES));"), ""


def load_markers(folder, mid, fname, refine_chunk):
    """[{cat, title, id, region}] — унифицированно для всех форматов данных."""
    path = f"{ROOT}/{folder}/data/{fname}"
    d = json.load(open(path, encoding="utf-8"))
    ms = d["markers"] if isinstance(d, dict) else d
    regions = {}
    rp = f"{ROOT}/{folder}/data/palworld_regions.json"
    if folder == "palworld-map" and os.path.exists(rp):
        regions = {str(k): v.get("ru") or v.get("en") for k, v in json.load(open(rp, encoding="utf-8")).items()}
    out = []
    for m in ms:
        if folder == "dimraeth-map":
            cat, title, reg = m.get("c"), m.get("t"), m.get("s")
        elif folder == "tainted-grail-map":
            cat, title, reg = m.get("category"), m.get("title"), None
        else:
            cat, title, reg = m.get("cat"), m.get("title"), m.get("region")
        if isinstance(reg, int) or (isinstance(reg, str) and reg.isdigit()):
            reg = regions.get(str(reg))
        out.append({"cat": cat, "title": (title or "").strip(), "id": m.get("id"), "region": reg if isinstance(reg, str) else None,
                    "lat": m.get("lat") if m.get("lat") is not None else (-m["y"] if m.get("y") is not None else None),
                    "lng": m.get("lng") if m.get("lng") is not None else m.get("x"), "desc": m.get("desc") or "", "img": m.get("img")})
    if folder == "tainted-grail-map":
        # категория по названию — правила refineCategory из app.js (нужны lat/lng: функция берёт метку целиком)
        raw = [{"category": m.get("category"), "title": m.get("title"), "lat": m.get("lat"), "lng": m.get("lng")} for m in ms]
        code = ("var localStorage={};var Image=function(){};var document={createElement:function(){return {}}};var MAP_HOME=\"/\";" + refine_chunk + "\nconst __m=" + json.dumps(raw, ensure_ascii=False) +
                ";\nprint(JSON.stringify(__m.map(m=>refineCategory(m))));")
        for row, cat in zip(out, run_js(code)):
            row["cat"] = cat
    return [m for m in out if m["cat"] and m["title"]]


# ---------- страница ----------
def map_url(folder, mid, n_maps, query=""):
    return f"/{folder}/" + ("" if n_maps == 1 else f"{mid}/") + query


def db_links(slug, game):
    """Ссылки на базу данных игры (/db/<slug>/), если она есть; иначе пусто."""
    if not os.path.exists(f"{ROOT}/data/db/{slug}/meta.json"):
        return ""
    b = f"/db/{slug}/"
    secs = [("items", "предметы"), ("quests", "задания"), ("bestiary", "бестиарий"), ("characters", "персонажи"),
            ("locations", "локации"), ("talents", "таланты"), ("achievements", "достижения")]
    secs = [x for x in secs if os.path.isdir(f"{ROOT}/db/{slug}/{x[0]}") or x[0] != "achievements"]
    return (f'База данных {esc(game)} — ' + ", ".join(f'<a href="{b}{p}/">{t}</a>' for p, t in secs)
            + f'. <a href="{b}">Весь каталог</a>.')


def page_html(game, slug, folder, maps, cat, group, rows_by_map, regs, siblings, total):
    key, name = cat["key"], cat["name"]
    n_maps = len(maps)
    slugkey = key.replace("_", "-")
    url = f"{SITE}{folder}/c/{slugkey}/"
    n_text = f"{fmt(total)} {plural(total, ('метка', 'метки', 'меток'))}"
    title = f"{game}: {name} — все {n_text} на карте"
    shown_maps = [(mid, mname, rows) for mid, mname, rows in rows_by_map if rows]
    where = ", ".join(f"{mname} — {sum(r['count'] for r in rows)}" for _, mname, rows in shown_maps) if n_maps > 1 else ""
    examples = [r["title"] for r in sorted((r for _, _, rows in shown_maps for r in rows), key=lambda r: -r["count"])[:4]]
    lead = f"На интерактивной карте {game} отмечено {n_text} категории «{name}»"
    lead += f" в группе «{group}»." if group else "."
    if where:
        lead += f" По локациям: {where}."
    desc = lead
    if examples and len({e.lower() for e in examples}) > 1:
        desc += " Например: " + ", ".join(examples[:3]) + "."
    desc += " Отмечайте найденное — прогресс сохраняется в браузере и синхронизируется через Google."
    desc = desc[:300]

    ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Интерактивные карты", "item": SITE},
        {"@type": "ListItem", "position": 2, "name": f"Интерактивная карта {game}", "item": f"{SITE}{folder}/"},
        {"@type": "ListItem", "position": 3, "name": name, "item": url}]}
    ld_json = json.dumps(ld, ensure_ascii=False, indent=2).replace("</", "<\\/")

    buttons = []
    for mid, mname, rows in shown_maps:
        cnt = sum(r["count"] for r in rows)
        label = f"Открыть на карте" + (f": {mname} ({cnt})" if n_maps > 1 else "")
        buttons.append(f'<a class="auth-btn cp-open" href="{map_url(folder, mid, n_maps, "?cat=" + key)}"><span>{esc(label)}</span></a>')

    sections = []
    for mid, mname, rows in shown_maps:
        rows = sorted(rows, key=lambda r: (-r["count"], r["title"].lower()))
        cut = len(rows) - MAX_ROWS
        items = []
        for r in rows[:MAX_ROWS]:
            label = esc(r["title"])
            if r["count"] == 1 and r["id"] is not None:
                label = f'<a href="{map_url(folder, mid, n_maps, "?marker=" + str(r["id"]))}">{label}</a>'
            tail = f' <span class="cp-n">×{r["count"]}</span>' if r["count"] > 1 else ""
            if r["count"] == 1 and r["region"]:
                tail = f' <span class="cp-reg">{esc(r["region"])}</span>'
            items.append(f"<li>{label}{tail}</li>")
        more = f'<p class="cp-more">…и ещё {cut} {plural(cut, ("название", "названия", "названий"))}: смотрите на карте.</p>' if cut > 0 else ""
        head = f"<h2>{esc(mname)} <span class=\"cp-n\">{sum(r['count'] for r in rows)}</span></h2>" if n_maps > 1 else "<h2>Что отмечено</h2>"
        sections.append(f'{head}\n    <ul class="cp-list">\n        ' + "\n        ".join(items) + f"\n    </ul>\n    {more}")
        reg = regs.get(mid)
        if reg and len(reg) > 1:
            top = reg.most_common(12)
            sub = "Где искать" + (f" · {mname}" if n_maps > 1 else "")
            sections.append(f'<h3>{esc(sub)}</h3>\n    <p class="cp-where">' + ", ".join(f"{esc(n)}\u00a0— {c}" for n, c in top) +
                            (f" и ещё {len(reg) - len(top)}\u00a0{plural(len(reg) - len(top), ('область', 'области', 'областей'))}" if len(reg) > len(top) else "") + ".</p>")

    hint = f'<p>{esc(cat["hint"])}</p>' if cat.get("hint") else ""
    chips = "".join(f'<a href="../{esc(s["slug"])}/">{esc(s["name"])}</a>' for s in siblings if s["key"] != key)
    og = f"{SITE}og/{slug}.jpg"
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="tdm-reservation" content="1">
    {MARK}
    <title>{esc(title)} — BroskiPlay</title>
    <meta name="description" content="{esc(desc)}">
    <link rel="canonical" href="{url}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="#50e3c2">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="BroskiPlay">
    <meta property="og:locale" content="ru_RU">
    <meta property="og:title" content="{esc(title)}">
    <meta property="og:description" content="{esc(desc)}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{og}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{og}">
    <script type="application/ld+json">
{ld_json}
    </script>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="120x120" href="/favicon-120.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="stylesheet" href="/fonts/fonts.css?v=4">
    <link rel="stylesheet" href="/css/spatial.css?v=6n">
    <link rel="stylesheet" href="/css/style.css?v=52n">
    <link rel="stylesheet" href="/css/category-page.css?v=6">
    <link rel="stylesheet" href="/css/vision.css?v=7n">
    <script>
        (function () {{
            var sys = "dark";
            try {{ if (window.matchMedia("(prefers-color-scheme: light)").matches) sys = "light"; }} catch (e) {{}}
            var theme = sys;
            try {{
                var saved = localStorage.getItem("bp_theme");
                if ((saved === "light" || saved === "dark") && localStorage.getItem("bp_theme_sys") === sys) theme = saved;
            }} catch (e) {{}}
            document.documentElement.setAttribute("data-theme", theme);
        }})();
    </script>
    <script src="/js/metrika.js?v=1" defer></script>
</head>
<body>
<!-- topbar:start --><!-- topbar:end -->
<main class="site-shell legal cp">
    <a class="back-link" href="/{folder}/">← Карта {esc(game)}</a>
    <h1>{esc(name)}: все метки на карте {esc(game)}</h1>
    <p class="cp-lead">{esc(lead)}</p>
    {hint}
    <div class="cp-actions">
        {"".join(buttons)}
    </div>
    {chr(10).join("    " + s for s in sections)}
    <h2>Другие категории</h2>
    <nav class="cp-chips" aria-label="Другие категории {esc(game)}">{chips}</nav>
    {f'<p class="cp-foot">{db_links(slug, game)}</p>' if db_links(slug, game) else ""}
    <p class="cp-foot">Карта открывается на русском, метки можно отмечать найденными, а прогресс переезжает между устройствами после входа через Google. <a href="/">Все игры</a></p>
</main>
</body>
</html>
"""


def build(folder, slug, game):
    maps = game_maps(folder)
    groups, chunk = game_categories(folder)
    flat = [(g["title"], c) for g in groups for c in g["items"]]
    per = {mid: load_markers(folder, mid, fname, chunk) for mid, _, fname in maps}
    names = {mid: name for mid, name, _ in maps}
    # (карта, категория) → [{title, count, id, region}]
    cats = []
    for gtitle, c in flat:
        rows_by_map, total, regs = [], 0, {}
        for mid, mname, _ in maps:
            by = collections.OrderedDict()
            for m in per[mid]:
                if m["cat"] != c["key"]:
                    continue
                r = by.setdefault(m["title"], {"title": m["title"], "count": 0, "id": m["id"], "region": m["region"]})
                r["count"] += 1
            rows = list(by.values())
            total += sum(r["count"] for r in rows)
            rows_by_map.append((mid, mname, rows))
            regs[mid] = collections.Counter(m["region"] for m in per[mid] if m["cat"] == c["key"] and m["region"])
        if total >= MIN_MARKERS:
            cats.append((gtitle, c, rows_by_map, regs, total))
    siblings = [{"key": c["key"], "name": c["name"], "slug": c["key"].replace("_", "-")} for _, c, _, _, _ in cats]
    # старые страницы убираем (категория могла исчезнуть)
    base = f"{ROOT}/{folder}/c"
    keep = {s["slug"] for s in siblings}
    if os.path.isdir(base):
        for d in os.listdir(base):
            p = f"{base}/{d}/index.html"
            if d not in keep and os.path.exists(p) and "<!-- category-page:" in read(p):
                os.remove(p); os.rmdir(os.path.dirname(p))
    for gtitle, c, rows_by_map, regs, total in cats:
        write(f"{base}/{c['key'].replace('_', '-')}/index.html",
              page_html(game, slug, folder, maps, c, gtitle, rows_by_map, regs, siblings, total))
    inject_links(folder, game, cats, slug)
    print(f"{folder:22s} страниц категорий: {len(cats)}")
    return len(cats)


def inject_links(folder, game, cats, slug=""):
    """Блок «Все категории» на странице игры — входящие ссылки для страниц категорий."""
    path = f"{ROOT}/{folder}/index.html"
    page = read(path)
    by_group = collections.OrderedDict()
    for gtitle, c, _, _, total in cats:
        by_group.setdefault(gtitle, []).append((c, total))
    lines = []
    for gtitle, items in by_group.items():
        links = ", ".join(f'<a href="c/{esc(c["key"].replace("_", "-"))}/">{esc(c["name"])}</a>' for c, _ in items)
        lines.append(f"            <li><strong>{esc(gtitle)}:</strong> {links}.</li>")
    block = ('<!-- cats:start — генерируется: python3 scripts/category_pages.py -->\n'
             f'        <h3>Все категории {esc(game)}</h3>\n        <ul class="bp-cats">\n' + "\n".join(lines) +
             '\n        </ul>' + (f'\n        <p class="bp-db">{db_links(slug, game)}</p>' if db_links(slug, game) else "") +
             '\n        <!-- cats:end -->')
    m = CATS.search(page)
    if m:
        page = CATS.sub(lambda _: m.group(1) + block, page, count=1)
    else:
        a = re.search(r"([ \t]*)</details>\s*\n(?=\s*<!-- about:end -->)", page)
        if not a:
            print(f"  {folder}: нет блока «О карте» — ссылки на категории не вставлены")
            return
        page = page[:a.start()] + "        " + block + "\n" + page[a.start():]
    write(path, page)


def main():
    only = sys.argv[1:]
    total = 0
    for slug, folder, game in GAMES:
        if only and folder not in only:
            continue
        if folder in LOCKED_UNTIL and time.time() < LOCKED_UNTIL[folder]:  # карта закрыта до релиза игры — страницы категорий (названия, добыча) не выдаём
            shutil.rmtree(f"{ROOT}/{folder}/c", ignore_errors=True)
            print(f"{folder:22s} закрыта до релиза, страницы категорий пропущены")
            continue
        total += build(folder, slug, GAME_NAME.get(folder, game))
    print("всего страниц категорий:", total)
    if not only:  # верхнее меню карт и страниц категорий
        import site_menu
        site_menu.inject()
    return 0


if __name__ == "__main__":
    sys.exit(main())
