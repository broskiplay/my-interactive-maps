#!/usr/bin/env python3
"""Страницы локаций: <game>-map/<карта>/index.html — чтобы у каждой карты был чистый адрес
(broskiplay.ru/stellar-blade-map/wasteland/) вместо ?map=wasteland. GitHub Pages не умеет переписывать адреса,
поэтому страница — копия <game>-map/index.html с <base href="../"> (все относительные пути, в том числе fetch()
в js/app.js, считаются от папки игры) и своими title/description/canonical. Какую карту открыть, app.js
узнаёт из адреса (urlMapId). У игр с одной картой (Palworld, Gothic) отдельных страниц нет.

Копии не правьте руками: меняйте <game>-map/index.html и запускайте скрипт (его же вызывает scripts/publish.sh).
Запускать после early_data.py / seo.py / build_map_about.py — они правят исходную страницу:

    python3 scripts/map_pages.py            # все игры
    python3 scripts/map_pages.py skyrim-map # одна
"""
import glob, html, os, re, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from early_data import ROOT, jsc, read, block  # noqa: E402

SITE = "https://broskiplay.ru/"
MARK = "<!-- map-page: сгенерировано scripts/map_pages.py из ../index.html — не править вручную -->"


def maps(d):
    """[(id, русское название)] в порядке списка карт игры."""
    app = read(f"{ROOT}/{d}/js/app.js")
    if d == "stellar-blade-map":
        return jsc(read(f"{ROOT}/{d}/js/maps.js") + "\nprint(JSON.stringify(MAPS.map(m=>[m.id,m.name])))")
    if d in ("oblivion-remake-map", "skyrim-map", "witcher3-map", "hogwarts-legacy-map", "phantom-blade-zero-map", "dragonsword-awakening-map", "cs2-map"):
        a = app.index("const ASSETS_ROOT"); b = app.index("\n", app.index("const MAP_ORDER"))
        return jsc(app[a:b] + "\nprint(JSON.stringify(MAP_ORDER.map(k=>[k,MAPS[k].name])))")
    if d in ("tainted-grail-map", "dimraeth-map"):
        pre = ""
        if "${ASSETS_ROOT}" in block(app, "const MAPS = ["):
            pre = re.search(r"^const ASSETS_ROOT = .*$", app, re.M).group(0) + "\n"
        return jsc(pre + block(app, "const MAPS = [") + "\nprint(JSON.stringify(MAPS.map(m=>[m.id,m.name])))")
    return []  # одна карта — страница игры и есть страница карты


def sub1(pattern, repl, s):
    out, n = re.subn(pattern, repl, s, count=1)
    if n != 1:
        raise RuntimeError("не найдено: " + pattern)
    return out


def page(src, d, mid, name):
    url = f"{SITE}{d}/{mid}/"
    esc = lambda t: html.escape(t, quote=True)
    title = html.unescape(re.search(r"<title>(.*?)</title>", src).group(1))
    title = re.sub(r"( — BroskiPlay)$", f": {name}\\1", title)
    desc = html.unescape(re.search(r'<meta name="description" content="(.*?)">', src).group(1))
    desc = f"{name} — {desc[:1].lower()}{desc[1:]}"
    s = sub1(r'(<meta charset="UTF-8">\n)', lambda m: m.group(1) + f'    <base href="../">\n    {MARK}\n', src)
    s = sub1(r"<title>.*?</title>", lambda m: f"<title>{esc(title)}</title>", s)
    s = sub1(r'<meta name="description" content=".*?">', lambda m: f'<meta name="description" content="{esc(desc)}">', s)
    s = sub1(r'<link rel="canonical" href="[^"]*">', lambda m: f'<link rel="canonical" href="{url}">', s)
    s = sub1(r'<meta property="og:url" content="[^"]*">', lambda m: f'<meta property="og:url" content="{url}">', s)
    s = sub1(r'<meta property="og:title" content=".*?">', lambda m: f'<meta property="og:title" content="{esc(title)}">', s)
    s = sub1(r'<meta property="og:description" content=".*?">', lambda m: f'<meta property="og:description" content="{esc(desc)}">', s)
    return s


def build(d):
    src = read(f"{ROOT}/{d}/index.html")
    want = maps(d)
    # убираем страницы карт, которых больше нет
    for f in glob.glob(f"{ROOT}/{d}/*/index.html"):
        sub = os.path.basename(os.path.dirname(f))
        if MARK in read(f) and sub not in dict(want):
            shutil.rmtree(os.path.dirname(f)); print("  удалено", f"{d}/{sub}/")
    for mid, name in want:
        out = f"{ROOT}/{d}/{mid}"
        if os.path.exists(out) and not os.path.exists(f"{out}/index.html"):
            raise RuntimeError(f"{out}: папка занята (не страница карты)")
        if os.path.exists(f"{out}/index.html") and MARK not in read(f"{out}/index.html"):
            raise RuntimeError(f"{out}/index.html: не сгенерирована этим скриптом")
        os.makedirs(out, exist_ok=True)
        with open(f"{out}/index.html", "w", encoding="utf-8") as fh:
            fh.write(page(src, d, mid, name))
    print("ок", d, len(want))


def all_pages():
    """[(папка игры, id)] — для sitemap (seo.py)."""
    res = []
    for f in sorted(glob.glob(f"{ROOT}/*-map/*/index.html")):
        if MARK in read(f):
            p = os.path.relpath(os.path.dirname(f), ROOT).split(os.sep)
            res.append((p[0], p[1]))
    return res


if __name__ == "__main__":
    games = sys.argv[1:] or sorted(os.path.basename(p) for p in glob.glob(f"{ROOT}/*-map") if os.path.isdir(p))
    for g in games:
        build(g)
