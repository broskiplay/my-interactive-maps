#!/usr/bin/env python3
"""SEO-разметка страниц карт, sitemap.xml и превью для соцсетей. Идемпотентный: можно гонять сколько угодно.

    python3 scripts/seo.py

Что делает:
  • в <game>-map/index.html: og:image / twitter:image ведут на og/<игра>.jpg (см. make_og_images.py),
    добавляет размеры и alt картинки, <meta name="robots"> и JSON-LD (WebApplication + хлебные крошки)
    между <!-- ld:start --> и <!-- ld:end -->;
  • у страниц-перенаправлений stellar-blade-map/<локация>.html ставит canonical на карту,
    чтобы в поиске жила одна страница;
  • в index.html обновляет og:image:alt;
  • пересобирает sitemap.xml (дата главной берётся из data/changelog.json, даты карт, локаций и категорий —
    из data/lastmod.json: хеш меток и категорий каждой игры; хеш сменился — дата становится сегодняшней).

Новая игра: допишите её в GAMES (и в scripts/make_og_images.py), запустите оба скрипта.
Описание для JSON-LD берётся из <meta name="description"> страницы карты.
"""
import datetime
import glob
import hashlib
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://broskiplay.ru/"

# slug (имя og/<slug>.jpg), папка, название игры
GAMES = [
    ("stellar-blade", "stellar-blade-map", "Stellar Blade"),
    ("tainted-grail", "tainted-grail-map", "Tainted Grail: The Fall of Avalon"),
    ("gothic-remake", "gothic-remake-map", "Gothic 1 Remake"),
    ("dimraeth", "dimraeth-map", "Dimraeth"),
    ("palworld", "palworld-map", "Palworld"),
    ("oblivion-remake", "oblivion-remake-map", "The Elder Scrolls IV: Oblivion Remastered"),
    ("skyrim", "skyrim-map", "The Elder Scrolls V: Skyrim"),
    ("witcher3", "witcher3-map", "The Witcher 3: Wild Hunt"),
    ("cyberpunk2077", "cyberpunk2077-map", "Cyberpunk 2077"),
    ("hogwarts-legacy", "hogwarts-legacy-map", "Hogwarts Legacy"),
    ("phantom-blade-zero", "phantom-blade-zero-map", "Phantom Blade Zero"),
    ("rdr2", "rdr2-map", "Red Dead Redemption 2"),
    ("gta6", "gta6-map", "Grand Theft Auto VI"),
    ("silver-palace", "silver-palace-map", "Silver Palace"),
]

LASTMOD = os.path.join(ROOT, "data", "lastmod.json")
LD = re.compile(r"([ \t]*)<!-- ld:start[^>]*-->.*?<!-- ld:end -->", re.S)


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def set_meta(page, attr, key, content, after_pattern):
    """Меняет <meta attr="key" content=...> или вставляет после after_pattern."""
    tag = f'<meta {attr}="{key}" content="{html.escape(content, quote=True)}">'
    rx = re.compile(rf'<meta {attr}="{re.escape(key)}"[^>]*>')
    if rx.search(page):
        return rx.sub(lambda _: tag, page, count=1)
    m = re.search(after_pattern, page)
    if not m:
        raise RuntimeError(f"нет места для {key}")
    indent = re.search(r"([ \t]*)[^\n]*$", page[: m.start()]).group(1)
    return page[: m.end()] + "\n" + indent + tag + page[m.end():]


def ld_block(indent, game, folder, title, desc):
    url = f"{SITE}{folder}/"
    data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebApplication",
                "@id": url + "#app",
                "name": title,
                "url": url,
                "description": desc,
                "applicationCategory": "GameApplication",
                "operatingSystem": "Любой (браузер)",
                "inLanguage": "ru",
                "isAccessibleForFree": True,
                "offers": {"@type": "Offer", "price": "0", "priceCurrency": "RUB"},
                "about": {"@type": "VideoGame", "name": game},
                "isPartOf": {"@id": SITE + "#website"},
                "author": {"@type": "Person", "name": "BroskiPlay", "url": SITE},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Интерактивные карты", "item": SITE},
                    {"@type": "ListItem", "position": 2, "name": title, "item": url},
                ],
            },
        ],
    }
    body = json.dumps(data, ensure_ascii=False, indent=2).replace("</", "<\\/")
    body = "\n".join(indent + line for line in body.splitlines())
    return (f"{indent}<!-- ld:start — генерируется: python3 scripts/seo.py -->\n"
            f'{indent}<script type="application/ld+json">\n{body}\n{indent}</script>\n'
            f"{indent}<!-- ld:end -->")


def seo_map_page(slug, folder, game):
    path = os.path.join(ROOT, folder, "index.html")
    page = read(path)
    title = re.search(r"<title>(.*?)</title>", page).group(1)
    desc = html.unescape(re.search(r'<meta name="description" content="(.*?)">', page).group(1))
    img = f"{SITE}og/{slug}.jpg"
    alt = f"Интерактивная карта {game} на русском — BroskiPlay"

    page = set_meta(page, "property", "og:image", img, r'<meta property="og:url"[^>]*>')
    page = set_meta(page, "property", "og:image:width", "1200", r'<meta property="og:image"[^>]*>')
    page = set_meta(page, "property", "og:image:height", "630", r'<meta property="og:image:width"[^>]*>')
    page = set_meta(page, "property", "og:image:alt", alt, r'<meta property="og:image:height"[^>]*>')
    page = set_meta(page, "name", "twitter:image", img, r'<meta name="twitter:card"[^>]*>')
    page = set_meta(page, "name", "twitter:image:alt", alt, r'<meta name="twitter:image"[^>]*>')
    page = set_meta(page, "name", "robots", "index, follow, max-image-preview:large",
                    r'<link rel="canonical"[^>]*>')

    m = LD.search(page)
    if m:
        block = ld_block(m.group(1), game, folder, title.split(" — ")[0], desc)
        page = LD.sub(lambda _: block, page, count=1)
    else:
        a = re.search(r'([ \t]*)<meta property="og:type"', page)
        block = ld_block(a.group(1), game, folder, title.split(" — ")[0], desc)
        page = page[: a.start()] + block + "\n" + page[a.start():]
    write(path, page)


def seo_redirects():
    """Старые страницы-перенаправления Stellar Blade: в поиске должна жить одна страница карты."""
    n = 0
    canon = f"{SITE}stellar-blade-map/"
    for path in glob.glob(os.path.join(ROOT, "stellar-blade-map", "*.html")):
        page = read(path)
        if "http-equiv=\"refresh\"" not in page:
            continue
        page = re.sub(r'[ \t]*<link rel="canonical"[^>]*>\n?', "", page)
        page = re.sub(r'[ \t]*<meta name="robots"[^>]*>\n?', "", page)
        page = page.replace(
            '<meta http-equiv="refresh"',
            f'<link rel="canonical" href="{canon}">\n    <meta http-equiv="refresh"', 1)
        write(path, page)
        n += 1
    return n


def seo_home():
    path = os.path.join(ROOT, "index.html")
    page = read(path)
    names = "Stellar Blade, Tainted Grail, Gothic 1 Remake, Dimraeth, Palworld, Oblivion Remastered, Skyrim, Ведьмак 3, Cyberpunk 2077, Hogwarts Legacy, Phantom Blade Zero, Red Dead Redemption 2, Silver Palace"
    alt = "Интерактивные карты BroskiPlay на русском: " + names
    page = re.sub(r'(<meta property="og:image:alt" content=")[^"]*(")',
                  lambda m: m.group(1) + html.escape(alt, quote=True) + m.group(2), page, count=1)
    write(path, page)


def all_map_pages():
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from map_pages import all_pages
    return all_pages()


def data_files(folder):
    """Файлы, от которых зависит содержимое карты: метки локаций и категории (progress-index.json — производный, не считаем)."""
    files = sorted(f for f in glob.glob(os.path.join(ROOT, folder, "data", "*.json")) if not f.endswith("progress-index.json"))
    cats = os.path.join(ROOT, folder, "js", "categories.js")
    return files + ([cats] if os.path.exists(cats) else [])


def game_lastmod():
    """{папка: дата последнего изменения данных карты}. Публикация — коммит-сирота без истории, поэтому
    дату храним сами: data/lastmod.json = {папка: {hash, date}}. Первая запись — по времени изменения файлов."""
    try:
        old = json.loads(read(LASTMOD))
    except FileNotFoundError:
        old = {}
    today = datetime.date.today().isoformat()
    out = {}
    for _, folder, _ in GAMES:
        files = data_files(folder)
        h = hashlib.sha1()
        for f in files:
            h.update(os.path.relpath(f, ROOT).encode("utf-8") + b"\0")
            with open(f, "rb") as fh:
                h.update(fh.read())
        digest = h.hexdigest()[:16]
        prev = old.get(folder)
        if prev and prev.get("hash") == digest:
            out[folder] = prev
        elif prev:
            out[folder] = {"hash": digest, "date": today}
        else:
            mtime = max((os.path.getmtime(f) for f in files), default=None)
            date = datetime.date.fromtimestamp(mtime).isoformat() if mtime else today
            out[folder] = {"hash": digest, "date": date}
    if out != old:
        write(LASTMOD, json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    return {k: v["date"] for k, v in out.items()}


def sitemap():
    changelog = json.loads(read(os.path.join(ROOT, "data", "changelog.json")))
    last = max(e["date"] for e in changelog)
    mods = game_lastmod()
    rows = [f"    <url><loc>{SITE}</loc><lastmod>{last}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>"]
    pages = all_map_pages()
    for _, folder, _ in GAMES:
        lm = f"<lastmod>{mods[folder]}</lastmod>"
        rows.append(f"    <url><loc>{SITE}{folder}/</loc>{lm}<changefreq>weekly</changefreq><priority>0.8</priority></url>")
        for _, mid in (x for x in pages if x[0] == folder):  # страницы локаций (scripts/map_pages.py)
            rows.append(f"    <url><loc>{SITE}{folder}/{mid}/</loc>{lm}<changefreq>weekly</changefreq><priority>0.7</priority></url>")
        for page in sorted(glob.glob(os.path.join(ROOT, folder, "c", "*", "index.html"))):  # страницы категорий (scripts/category_pages.py)
            slug = os.path.basename(os.path.dirname(page))
            rows.append(f"    <url><loc>{SITE}{folder}/c/{slug}/</loc>{lm}<changefreq>monthly</changefreq><priority>0.6</priority></url>")
    db_last = max([last] + [mods.get(f, last) for f in mods])
    for page in sorted(glob.glob(os.path.join(ROOT, "db", "**", "index.html"), recursive=True)):  # база данных (scripts/db_pages.py)
        if os.path.getsize(page) < 2000 and 'http-equiv="refresh"' in open(page, encoding="utf-8").read():
            continue   # переадресация записи на общую страницу (db_pages.py → stub_page)
        rel = os.path.relpath(os.path.dirname(page), ROOT).replace(os.sep, "/") + "/"
        depth = rel.count("/")
        pr = "0.7" if depth <= 2 else "0.5"
        rows.append(f"    <url><loc>{SITE}{rel}</loc><lastmod>{db_last}</lastmod><changefreq>monthly</changefreq><priority>{pr}</priority></url>")
    rows.append(f"    <url><loc>{SITE}updates/</loc><lastmod>{last}</lastmod><changefreq>weekly</changefreq><priority>0.4</priority></url>")  # все обновления (scripts/changelog.py)
    rows.append(f"    <url><loc>{SITE}fixes/</loc><changefreq>weekly</changefreq><priority>0.3</priority></url>")  # журнал исправлений (scripts/fixes.py)
    rows.append(f"    <url><loc>{SITE}privacy.html</loc><priority>0.2</priority></url>")
    write(os.path.join(ROOT, "sitemap.xml"),
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          + "\n".join(rows) + "\n</urlset>\n")


def main():
    for slug, folder, game in GAMES:
        if not os.path.exists(os.path.join(ROOT, "og", slug + ".jpg")):
            print(f"Нет og/{slug}.jpg — сначала python3 scripts/make_og_images.py", file=sys.stderr)
            return 1
        seo_map_page(slug, folder, game)
        print(f"{folder:22s} ok")
    print("перенаправлений Stellar Blade:", seo_redirects())
    seo_home()
    sitemap()
    print("sitemap.xml, index.html обновлены")
    return 0


if __name__ == "__main__":
    sys.exit(main())
