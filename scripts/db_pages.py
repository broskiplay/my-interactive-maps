#!/usr/bin/env python3
"""База данных игр: /db/ (все игры), /db/<игра>/ (каталог с поиском), /db/<игра>/<раздел>/<запись>/ (страница записи).

Данные — data/db/<игра>/*.json (для Tainted Grail их собирает tools/tg_db/build_db.py из файлов игры).
Картинки лежат в репозитории ассетов игры (…-assets/db/<адрес>.webp, WebP q90).
Каталог рендерит js/db-catalog.js по сжатому индексу /db/<игра>/index.json; у каждой записи есть статичная страница
(для поиска и ссылок), ссылки «На карте» ведут на /<игра>-map/<карта>/?marker=<id>.

    python3 scripts/db_pages.py            # всё пересобрать (старые страницы записей удаляются)
Идемпотентный; верхнее меню вставляет scripts/site_menu.py (inject_subpages), его вызывает этот скрипт в конце.
"""
import hashlib
import html
import json
import math
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from category_pages import SITE, ROOT, MARK, game_maps, game_categories, map_url, plural, fmt  # noqa: E402

# Число со словом в нужной форме: pn(21, "item") → «21 предмет»
PN_FORMS = {
    "item": ("предмет", "предмета", "предметов"), "rec": ("запись", "записи", "записей"),
    "loc": ("локация", "локации", "локаций"), "quest": ("задание", "задания", "заданий"),
    "beast": ("существо", "существа", "существ"), "char": ("персонаж", "персонажа", "персонажей"),
    "talent": ("талант", "таланта", "талантов"), "tree": ("дерево", "дерева", "деревьев"),
    "type": ("тип", "типа", "типов"), "book": ("книга и записка", "книги и записки", "книг и записок"),
}


def pn(n, key):
    return f"{fmt(n)} {plural(n, PN_FORMS[key])}"

DB = [{
    "slug": "tainted-grail",
    "merge_tiers": ("Зелья",),   # «Малое / Сильное / Великое зелье здоровья» → одна страница
    "merge_series": True,   # «Таможенный журнал – запись 1…10», «Дневник Этайн, часть…» → одна страница серии
    "game": "Tainted Grail: The Fall of Avalon",
    "short": "Tainted Grail",
    "folder": "tainted-grail-map",
    "drop_items": ["Death's Arrow"],  # служебная стрела разработчиков, урон 999999
    "assets": os.environ.get("DB_ASSETS_TAINTED_GRAIL", "https://broskiplay.github.io/tainted-grail-assets/db/"),
    "popups": "https://broskiplay.github.io/tainted-grail-assets/",   # + img метки (popups/<id>.webp), как popupImgUrl() в app.js карты
    "og": "tainted-grail",
    "theme": "tainted", "theme_color": "#200f0b",
    "bg": "tainted",   # живой фон всех страниц базы игры (js/db-bg.js + .dbg-<…> в css/db.css): туман Мглы, пепел, искры, огам   # палитра движка (css/spatial.css :root[data-game=…]) — страницы базы в оформлении карты
    "banner": ("logo-card-720.webp", "logo-card.webp"),  # баннер игры с главной (<папка карты>/…), 16:9
    # шапка каталога (js/db-hero.js): кадры из игры (попапы меток, popups/<id>.webp) сменяются под туманом и искрами,
    "hero_shots": ["7e9fc27612b1", "b75869a36603", "93fa053dbba2", "2afc31d0a857", "0ceb4e57b5a6", "3012f5ae39a8"],
    # справа — рендеры в полный рост: боссы и чудовища бестиария вперемешку с ключевыми персонажами сюжета
    # (имя ищется сначала в bestiary, потом в characters; подпись — ссылка на запись). Первый — всегда первым (LCP),
    # остальных js/db-hero.js перемешивает при каждом заходе
    "hero_beasts": ["Отец-Олень", "Галахад", "Великан-часовой", "Король Сагремор", "Архивариус", "Королева Сагремора",
                    "Бездонный", "Персеваль", "Владеющий Туманом", "Тристан", "Хранитель Кургана", "Нимуэ", "Наклави", "Кай",
                    "Гладомороз", "Карадок", "Меланхолия", "Ткач", "Древний видец", "Лорд Ивейн из рода Тарианов", "Огнеглот",
                    "Одноглазый", "Утопший рыцарь", "Пчелиная матка", "Марь-олень", "Трюгве", "Плоть-древо", "Повитуха",
                    "Огр", "Клара", "Призрачный экипаж", "Правда", "Морген", "Курбан", "Бич морей", "Страж могильника",
                    "Приливница", "Загрыбаст"],
    "tab_pick": {"items": "Экскалибур", "bestiary": "Огр", "characters": "Альма"},
    "loc_text": "подземелий, интерьеров и мест Призрачного мира",
}, {
    "slug": "gothic-remake",
    "game": "Gothic 1 Remake",
    "short": "Gothic Remake",
    "folder": "gothic-remake-map",
    "assets": os.environ.get("DB_ASSETS_GOTHIC_REMAKE", "https://broskiplay.github.io/gothic-remake-assets/db/"),
    "popups": "https://broskiplay.github.io/gothic-remake-assets/",
    "og": "gothic-remake",
    "theme": "gothic", "theme_color": "#15191e",
    "banner": ("logo-card-720.webp", "logo-card.webp"),  # как в карточке на главной
    # рендеров в полный рост у Gothic нет: арт глоссария — широкие карандашные наброски 500×264 на пергаменте
    # (tools/g1r_db/glossary.py). В шапке они сменяются на рваном листе (hero_sheet) поверх фактуры меню игры —
    # без попапов-скриншотов
    "hero_sheet": True,
    "hero_beasts": ["Диего", "Тролль", "Ксардас", "Мракорис", "Горн", "Каменный голем", "Мильтен", "Огненный ящер",
                    "Гомез", "Ползун", "Ли", "Глорх", "Ю’Берион", "Падальщик", "Сатурас", "Шныг", "Кор Ангар",
                    "Ищейка", "Лестер", "Скелет-маг", "Волк", "Демон"],
    "tab_pick": {"items": "Кусок руды", "bestiary": "Тролль", "characters": "Диего"},
    "loc_text": "главных мест Долины рудников из глоссария игры",
    # оформление как в игре (css/db.css → html[data-game="gothic"]): шрифты интерфейса игры, фактура меню и пергамент
    # из G1R/Content/UI/Textures (gothic-remake-map/images/ui/). Шапка — лёгкая: без canvas и тумана с blend-режимом,
    # только искры магической руды на CSS (transform/opacity) и свечение Барьера
    "hero_fx": "ore",
}, {
    "slug": "skyrim",
    "game": "The Elder Scrolls V: Skyrim",
    "short": "Skyrim",
    "folder": "skyrim-map",
    "assets": os.environ.get("DB_ASSETS_SKYRIM", "https://broskiplay.github.io/skyrim-assets/db/"),
    "popups": "https://broskiplay.github.io/skyrim-assets/",
    "og": "skyrim",
    "theme": "skyrim", "theme_color": "#0b0d10",
    "banner": ("logo-card-720.webp", "logo-card.webp"),
    # иконок предметов и портретов в игре нет (инвентарь — 3D-модели): глифы «q:<вид>» в духе интерфейса игры
    # (css/db.css → html[data-game="skyrim"], блок генерирует tools/sk_db/glyphs.py). Шапка — кадры из попапов меток
    # под лёгким снегом на CSS, без рендеров существ
    "hero_shots": ["8deeeb398675", "5f496eeb8f6c", "8ab428535861"],
    "hero_fx": "snow",
    "tab_pick": {},
    "beast_q": "q:beast", "person_q": "q:person",   # значки записей без портрета
    "loc_text": "городов, поселений, подземелий и других мест Скайрима и Солстейма",
    "tips_title": "Подсказки экранов загрузки",
    "tips_lead": "Все {n} подсказок с экранов загрузки {game} — как в игре.",
    "group_variants": ("weapons", "armor"),   # зачарованные «Арбалет горения», «Арбалет душ»… сворачиваются в «Арбалет» (в каталоге — «варианты»)
    # без отдельных страниц (записи — строками таблицы на общей странице, старые адреса — переадресация на #запись):
    "merge_tiers": ("Зелье", "Яд"),   # «Слабое зелье лечения», «Зелье лечения»… → одна страница зелья
    "merge_all": {"Строительство дома": ("stroitelstvo-doma", "q:hammer",
                                         "Части построек и обстановка для своего дома — по комнатам и пристройкам.")},
    "quest_groups": True,   # группы заданий — по типам из meta.json (quest_types), а не «Основное/Побочное/Задача»
}]
def merc_x(lng):
    return (lng + 180) / 360


def merc_y(lat):
    s = math.sin(max(-85.0511, min(85.0511, lat)) * math.pi / 180)
    return 0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)


def split_figs(h):
    """Ведущие <figure> текста отдельно от абзацев (figure внутри <p> — невалидный HTML)."""
    m = re.match(r"((?:<figure\b.*?</figure>)*)(.*)", h or "", re.S)
    return m.group(1), m.group(2)


QUALITY = {"Магический": "magic", "Обычный": "common", "Сюжетный": "story", "Хлам": "junk", "Слабый": "junk", "Инструмент": "tool"}
ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]

QUEST_ICON = {"Основное": "main", "Побочное": "side", "Задача": "task",  # → .db-qi-<…> в css/db.css
              # Skyrim: типы заданий из файлов игры
              "Основной сюжет": "main", "Побочные задания": "side", "Разное": "task", "Коллегия Винтерхолда": "q-mage",
              "Гильдия воров": "q-thief", "Тёмное Братство": "q-db", "Соратники": "q-comp", "Даэдрические задания": "q-daedra",
              "Гражданская война": "q-war", "Dawnguard": "q-dg", "Dragonborn": "q-dbn"}


def qi(icon):
    """Глиф-значок «q:<вид>» (css/db.css .db-qi-<вид>)."""
    return f'<i class="db-qi db-qi-{icon[2:]}" aria-hidden="true"></i>'

KINDS = [  # (ключ данных, путь, вкладка, ед. число)
    ("items", "items", "Предметы", "Предмет"),
    ("quests", "quests", "Задания", "Задание"),
    ("bestiary", "bestiary", "Бестиарий", "Существо"),
    ("characters", "characters", "Персонажи", "Персонаж"),
    ("lore", "lore", "Лор", "Запись"),
    ("locations", "locations", "Локации", "Локация"),
    ("talents", "talents", "Таланты", "Дерево талантов"),
    ("effects", "effects", "Эффекты", "Эффект"),
]
OPTIONAL = ("tips", "achievements", "sets", "markers", "spells", "guilds")  # данные без своих страниц-записей (одна общая страница)
MAX_WHERE = 40
MAX_SHOTS = 6
SHOTS_JS = '\n    <script src="/js/db-shots.js?v=1" defer></script>'
CSS_V = 28
JS_V = 16
LINKS_V = 3
EXTRAS_V = 5
SMALL = {}        # слаг игры → {"<kind> <адрес>"} уменьшенных копий (img_small)
STRIPS = {}       # слаг игры → полоса игры (поиск + разделы) наверху страниц записей и списков
INDEX_URL = {}   # слаг игры → адрес index.json с версией (для подсказок на страницах записей)
HERO_V = 5
# случайное существо в шапке каталога при каждом заходе: выбирается до первой отрисовки, подпись — под него
PICK_BEAST = ('<script>(function(){var b=document.querySelectorAll(".dbx-beast[data-src]"),e=b[Math.floor(Math.random()*b.length)],'
              'c=document.querySelector(".dbx-cap");if(!e)return;if(matchMedia("(min-width:701px)").matches)e.setAttribute("fetchpriority","high");e.srcset=e.getAttribute("data-srcset");e.src=e.getAttribute("data-src");'
              'e.classList.add("is-on");if(c){c.href=e.getAttribute("data-href");c.innerHTML="";var k=document.createElement("small");'
              'k.textContent=e.getAttribute("data-kind");c.appendChild(k);c.appendChild(document.createTextNode(e.getAttribute("data-name")))}})()</script>')
BG_V = 3


def esc(s):
    return html.escape(str(s or ""), quote=True)


def strip(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


def short(s, n=200):
    s = strip(s)
    return s if len(s) <= n else s[:n].rsplit(" ", 1)[0] + "…"


# ---------- один файл стилей для всех страниц базы (/db/site.css) ----------
# Было 5 блокирующих отрисовку файлов; style.css на ~90 % — главная и карты. Склеиваем в один и выбрасываем из
# style.css правила, чьи классы/id не встречаются ни на страницах базы, ни в подключённых к ним скриптах.
CSS_PARTS = ("fonts/fonts.css", "css/spatial.css", "css/style.css", "css/vision.css", "css/category-page.css", "css/db.css", "css/ui-system.css")
PRUNE = {"css/style.css", "css/vision.css"}
SHELL_WORDS = {"topbar", "topbar-inner", "auth-card", "auth-info", "auth-btn", "auth-avatar", "auth-status", "auth-text",
               "auth-guest", "google-icon", "logout", "logout-icon", "ui-controls", "ui-theme-toggle", "social-btn"}
CSS_JS_EXTRA = ("js/pwa.js",)   # грузятся из других скриптов, а не тегом <script> на странице
_CSS_V = []


def css_v():
    """Версия /db/site.css — по исходникам и генератору (известна до сборки страниц)."""
    if not _CSS_V:
        import hashlib
        h = hashlib.sha1()
        for f in CSS_PARTS + ("scripts/db_pages.py",):
            h.update(open(os.path.join(ROOT, f), "rb").read())
        _CSS_V.append(h.hexdigest()[:10])
    return _CSS_V[0]


def _css_blocks(css):
    """Верхний уровень CSS → [(prelude, body)]; тело с вложенными блоками и строками (data: URI) не ломается."""
    out, i, n = [], 0, len(css)
    while i < n:
        j, q = i, None
        while j < n:
            c = css[j]
            if q:
                if c == "\\": j += 1
                elif c == q: q = None
            elif c in "\"'": q = c
            elif c == "{" or c == ";": break
            j += 1
        if j >= n:
            break
        pre = css[i:j].strip()
        if css[j] == ";":   # @import / @charset
            out.append((pre, None)); i = j + 1; continue
        k, depth, q = j, 0, None
        while k < n:
            c = css[k]
            if q:
                if c == "\\": k += 1
                elif c == q: q = None
            elif c in "\"'": q = c
            elif c == "{": depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0: break
            k += 1
        out.append((pre, css[j + 1:k]))
        i = k + 1
    return out


def _sel_used(sel, words):
    sel = re.sub(r":(?:not|is|where|has)\((?:[^()]|\([^()]*\))*\)", "", sel)   # внутри — необязательные условия
    sel = re.sub(r"\[[^\]]*\]", "", sel)
    toks = re.findall(r"[.#]([A-Za-z_][\w-]*)", sel)
    return all(t in words for t in toks)


def _prune(css, words):
    res = []
    for pre, body in _css_blocks(css):
        if body is None:
            res.append(pre + ";")
        elif pre.startswith("@media") or pre.startswith("@supports") or pre.startswith("@layer"):
            inner = _prune(body, words)
            if inner.strip():
                res.append(pre + "{" + inner + "}")
        elif pre.startswith("@"):
            res.append(pre + "{" + body + "}")   # @keyframes, @font-face — как есть
        else:
            used = [x for x in _split_sel(pre) if _sel_used(x, words)]   # из списка селекторов — только нужные
            if used:
                res.append(",".join(used) + "{" + body + "}")
    return "\n".join(res)


def _split_sel(pre):
    """Список селекторов по запятым верхнего уровня (запятые внутри :is()/:not() не делят)."""
    out, depth, cur = [], 0, ""
    for c in pre:
        if c in "([": depth += 1
        elif c in ")]": depth -= 1
        if c == "," and depth == 0:
            out.append(cur); cur = ""
        else:
            cur += c
    out.append(cur)
    return [x.strip() for x in out if x.strip()]


def build_site_css():
    """Собирает /db/site.css после записи всех страниц (и верхнего меню в них)."""
    words = set()
    srcs = set()
    for d, _, fs in os.walk(os.path.join(ROOT, "db")):
        for f in fs:
            if f.endswith(".html"):
                t = open(os.path.join(d, f), encoding="utf-8").read()
                words.update(re.findall(r"[\w-]+", t))
                srcs.update(re.findall(r'src="/([^"?]+\.js)', t))
    # шапку страниц базы на сайте рисует общий каркас (css/shell.css, вставляет web/scripts/assemble.mjs) —
    # стили старого верхнего меню и блока входа из css/style.css в site.css не берём
    srcs |= set(CSS_JS_EXTRA)
    for f in sorted(srcs):
        fp = os.path.join(ROOT, f)
        if os.path.isfile(fp):
            words.update(re.findall(r"[\w-]+", open(fp, encoding="utf-8").read()))
    words -= SHELL_WORDS   # и после скриптов: auth.js упоминает auth-info и т. п.
    words -= {w for w in words if w.startswith("tb-")}
    parts = []
    for f in CSS_PARTS:
        css = re.sub(r"/\*.*?\*/", "", open(os.path.join(ROOT, f), encoding="utf-8").read(), flags=re.S)
        if f.startswith("fonts/"):
            css = re.sub(r"url\((['\"]?)(?![a-z]+:|/)", r"url(\1/fonts/", css)
        if f in PRUNE:
            css = _prune(css, words)
        parts.append(f"/* {f} */\n" + re.sub(r"\n\s*\n+", "\n", css).strip())
    out = "\n".join(parts) + "\n"
    write(os.path.join(ROOT, "db", "site.css"), out)
    return len(out)


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(s)


def game_cfg(path):
    return next((c for c in DB if path.startswith(f"db/{c['slug']}/")), None)


def map_loader(cfg):
    """Загрузочный экран карты игры (#map-loader.spl в <папка карты>/index.html) — та же разметка и эмблема,
    стили эмблемы — раздел «Загрузочный экран» из css/style.css карты. Берётся из файлов карты, чтобы не расходиться."""
    try:
        page = open(os.path.join(ROOT, cfg["folder"], "index.html"), encoding="utf-8").read()
        css = open(os.path.join(ROOT, cfg["folder"], "css", "style.css"), encoding="utf-8").read()
    except OSError:
        return "", ""
    m = re.search(r'<div id="map-loader" class="spl"[^>]*>(.*?)\n</div>\n', page, re.S)
    c = re.search(r"/\* -+ Загрузочный экран.*?\*/\n(.*?)(?:\n/\*|\Z)", css, re.S)
    if not m:
        return "", ""
    card = m.group(1)
    status = re.search(r'class="spl-status">([^<]*)<', card)
    card = card.replace(status.group(0), 'class="spl-status">Открываем базу…<') if status else card
    html_ = (f'<div id="db-loader" class="spl" role="status" aria-live="polite">{card}\n</div>\n'
             '<script>window.__dbLoaderAt=performance.now();try{if(sessionStorage.getItem("bp_db_seen"))document.getElementById("db-loader").remove()}catch(e){}</script>'
             '<noscript><style>#db-loader{display:none}</style></noscript>\n')
    return html_, (c.group(1).strip() if c else "")


def shell(title, desc, path, body, crumbs, og=None, scripts="", loader=False, head="", foot=None, main_cls=""):
    url = SITE + path
    gcfg = game_cfg(path)
    theme = (gcfg or {}).get("theme")
    loader_html, loader_css = map_loader(gcfg) if (loader and gcfg) else ("", "")
    og = og or f"{SITE}og-preview.jpg"
    bg = (gcfg or {}).get("bg")
    bg_html = f'<div class="dbg dbg-{bg}" aria-hidden="true"><i></i><i></i><i></i><canvas></canvas></div>\n' if bg else ""
    bg_js = f'\n    <script src="/js/db-bg.js?v={BG_V}" defer></script>' if bg else ""
    if gcfg:
        bg_js += f'\n    <script src="/js/db-extras.js?v={EXTRAS_V}" defer></script>'
    if gcfg and "db-catalog.js" not in scripts:   # страницы записей: подсказки у ссылок, «← к списку» (js/db-links.js)
        bg_js += (f'\n    <meta name="db-index" content="{INDEX_URL.get(gcfg["slug"], "")}">'
                  f'\n    <script src="/js/db-links.js?v={LINKS_V}" defer></script>')
    items = [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + p} for i, (n, p) in enumerate(crumbs)]
    ld = json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items},
                    ensure_ascii=False, indent=2).replace("</", "<\\/")
    strip = STRIPS.get(gcfg["slug"], "") if (gcfg and not loader and path != f"db/{gcfg['slug']}/") else ""
    if strip:
        kind = path.split("/")[2] if path.count("/") >= 3 else ""
        strip = strip.replace(f'data-k="{kind}"', f'data-k="{kind}" aria-current="page"')
    # полоса игры уже ведёт на «База данных» и в каталог игры — в крошках остаются только раздел и ниже
    shown = crumbs[3:-1] if strip else crumbs[:-1]
    parts = [f'<a href="/{p}">{esc(n)}</a>' for n, p in shown]
    if crumbs and (not strip or len(crumbs) > 4):   # последняя крошка — текущая страница (на страницах с полосой игры — только у записей)
        parts.append(f'<b class="db-crumb-cur" aria-current="page">{esc(crumbs[-1][0])}</b>')
    nav = " <span aria-hidden=\"true\">›</span> ".join(parts)
    nav = f'<nav class="db-crumbs{" is-sub" if strip else ""}" aria-label="Навигация">{nav}</nav>' if nav else ""
    return f"""<!DOCTYPE html>
<html lang="ru"{f' data-game="{theme}" data-theme="dark"' if theme else ""}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="tdm-reservation" content="1">
    {MARK.replace("category_pages.py", "db_pages.py")}
    <title>{esc(title)} — BroskiPlay</title>
    <meta name="description" content="{esc(desc)}">
    <link rel="canonical" href="{url}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="{gcfg["theme_color"] if theme else "#50e3c2"}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="BroskiPlay">
    <meta property="og:locale" content="ru_RU">
    <meta property="og:title" content="{esc(title)}">
    <meta property="og:description" content="{esc(desc)}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{og}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{og}">
    <script type="application/ld+json">
{ld}
    </script>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="120x120" href="/favicon-120.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.webmanifest">{head}
    <link rel="stylesheet" href="/db/site.css?v={css_v()}">
    {f'<style>{loader_css}</style>' if loader_css else ""}
    <script>
        (function () {{
            if (document.documentElement.hasAttribute("data-game")) return;  // база игры — тёмная палитра карты, как сама карта
            document.documentElement.setAttribute("data-theme", "dark");
        }})();
    </script>
    <script src="/js/metrika.js?v=1" defer></script>
    <script src="/js/db-protect.js?v=3" defer></script>
    <script src="/js/db-top.js?v=2" defer></script>
    <script src="/js/bp-slot.js?v=7" defer></script>{bg_js}{scripts}{SHOTS_JS if "db-shots" in body else ""}
</head>
<body>
{bg_html}{loader_html}<!-- topbar:start --><!-- topbar:end -->
<main class="site-shell legal cp db{main_cls}">
{strip}    {nav}
{body}
    <div class="bp-slot" data-bp-slot="db"></div>
    {foot or '<p class="db-copy">База собрана командой BroskiPlay по файлам игры. При использовании материалов, пожалуйста, ставьте ссылку на страницу-источник.</p>'}
</main>
</body>
</html>
"""


def talent_tree(t, img, href=""):
    """Экран дерева талантов как в игре: холст 1920×720 из UI-префаба, арт ветвей, слоты по координатам игры.
    Подписей у узлов нет (как в игре) — имя и ранги в подсказке (js/db-tree.js), клик ведёт к карточке ниже."""
    subs = [st for st in t["subtrees"] if all("xy" in nd for nd in st["talents"])]
    if not subs:
        return ""
    xs, ys = [], []
    for st in subs:
        for nd in st["talents"]:
            xs += [nd["xy"][0] - 40, nd["xy"][0] + 40]
            ys += [nd["xy"][1] - 40, nd["xy"][1] + 40]
    x0, x1, y0, y1 = min(xs) - 40, max(xs) + 40, min(ys) - 70, max(ys) + 40
    art, lines, nodes, labels, tabs = [], [], [], [], []
    for i, st in enumerate(subs):
        sec = st.get("sec") or {}
        by = {nd["name"]: nd for nd in st["talents"]}
        sx = [nd["xy"][0] for nd in st["talents"]]
        sy = [nd["xy"][1] for nd in st["talents"]]
        root = next((nd for nd in st["talents"] if nd.get("root")), st["talents"][0])
        half = len(st["name"] or "") * 10 + 20   # подпись ветви (26px, разрядка .08em) не должна обрезаться при приближении
        bx0, bx1 = min(min(sx) - 70, root["xy"][0] - half), max(max(sx) + 70, root["xy"][0] + half)
        box = [bx0, min(sy) - 90, bx1 - bx0, max(sy) - min(sy) + 150]
        if sec.get("art"):
            (cx, cy), (w, h) = sec["xy"], sec["wh"]
            art.append(f'<image href="{img(sec["art"])}" x="{cx - w / 2:.0f}" y="{cy - h / 2:.0f}" width="{w}" height="{h}" '
                       f'preserveAspectRatio="xMidYMid meet" data-sub="{i}"/>')
        for nd in st["talents"]:
            for pn in [nd.get("after")] + (nd.get("also") or []):   # «also» — второй и следующие родители (Skyrim)
                p = by.get(pn)
                if p:
                    lines.append(f'<line x1="{p["xy"][0]}" y1="{p["xy"][1]}" x2="{nd["xy"][0]}" y2="{nd["xy"][1]}" data-sub="{i}"/>')
            x, y = nd["xy"]
            nodes.append(f'<a class="db-tn" href="{href}#{esc(nd["slug"])}" data-sub="{i}" aria-label="{esc(nd["name"])}">'
                         f'<title>{esc(nd["name"])}</title><g transform="translate({x} {y})"><circle r="30"/>'
                         f'<use href="#db-tn-star" x="-28" y="-28" width="56" height="56"/></g></a>')   # масштаб вокруг (0,0) = центр звезды
        # подпись ветви — над корнем (в игре имя стоит у фигуры ветви)
        labels.append(f'<text x="{root["xy"][0]}" y="{min(sy) - 48}" data-sub="{i}">{esc(st["name"]).upper()}</text>')
        tabs.append(f'<button type="button" data-sub="{i}" data-box="{" ".join(str(round(v)) for v in box)}">{esc(st["name"])}</button>')
    vb = f"{x0} {y0} {x1 - x0} {y1 - y0}"
    return (f'<div class="db-tree" data-vb="{vb}"><div class="db-tree-tabs" hidden><button type="button" class="is-on" data-box="{vb}">Всё дерево</button>{"".join(tabs)}</div>'
            f'<div class="db-tree-sc"><svg class="db-tree-svg" viewBox="{vb}" style="aspect-ratio:{x1 - x0}/{y1 - y0}" role="img" aria-label="Дерево талантов «{esc(t["name"])}»">'
            f'<g class="db-tree-art">{"".join(art)}</g><g class="db-tree-ln">{"".join(lines)}</g>'
            f'<g class="db-tree-lb">{"".join(labels)}</g><g class="db-tree-nd">{"".join(nodes)}</g></svg></div></div>')


TREE_STAR = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="db-tn-star" viewBox="0 0 48 48">'
             '<path fill="var(--tn-spk)" d="M24 1l3 15 12-9-8 13 15-1-14 6 14 6-15-1 8 13-12-9-3 15-3-15-12 9 8-13-15 1 14-6-14-6 15 1-8-13 12 9z"/>'
             '<circle cx="24" cy="24" r="9" fill="var(--tn-core)" stroke="#1a1c22" stroke-width="2.5"/></symbol></svg>')


class Game:
    def __init__(self, cfg):
        self.cfg = cfg
        self.dir = os.path.join(ROOT, "data", "db", cfg["slug"])
        self.data = {k: json.load(open(os.path.join(self.dir, k + ".json"), encoding="utf-8")) for k, *_ in KINDS}
        for k in OPTIONAL:
            f = os.path.join(self.dir, k + ".json")
            self.data[k] = json.load(open(f, encoding="utf-8")) if os.path.exists(f) else []
        self.meta = json.load(open(os.path.join(self.dir, "meta.json"), encoding="utf-8"))
        # убрано с сайта: служебные предметы разработчиков и раздел «Метки игры»
        drop = set(cfg.get("drop_items", ()))
        if drop:
            n0 = len(self.data["items"])
            self.data["items"] = [r for r in self.data["items"] if r.get("en") not in drop]
            self.meta["counts"]["items"] -= n0 - len(self.data["items"])
        for sub, (slug, icon, desc) in (cfg.get("merge_all") or {}).items():
            sec = next(r["sec"] for r in self.data["items"] if r["sub"] == sub)
            self.data["items"].append({"name": sub, "en": "", "sec": sec, "sub": sub, "icon": icon, "stats": {}, "facts": [],
                                       "desc": desc, "flavor": "", "price": None, "weight": None, "markers": [], "slug": slug, "_hub": sub})
        self.data["markers"] = []
        folder = cfg["folder"]
        self.maps = game_maps(folder)
        mm = os.path.join(self.dir, "minimap.json")   # геометрия обзорных картинок для мини-карты «Где найти» (tools/minimap/build.py)
        self.mm = json.load(open(mm, encoding="utf-8")) if os.path.exists(mm) else {}
        self.map_names = {mid: name for mid, name, _ in self.maps}
        self.markers = {}
        for mid, _, mf in self.maps:
            for m in json.load(open(os.path.join(ROOT, folder, "data", os.path.basename(mf)), encoding="utf-8"))["markers"]:
                self.markers[m["id"]] = m
        groups, _ = game_categories(folder)
        self.cat_names = {i["key"]: i["name"] for g in groups for i in g["items"]}
        self._items_by_sec = {}
        for r in self.data["items"]:
            self._items_by_sec.setdefault(r["sec"], []).append(r)

    def banner(self, cls, lazy=True):
        b = self.cfg.get("banner")
        if not b:
            return ""
        f = self.cfg["folder"]
        return (f'<img class="{cls}" src="/{f}/{b[0]}" srcset="/{f}/{b[0]} 720w, /{f}/{b[1]} 1080w" '
                f'sizes="(max-width: 1000px) 100vw, 980px" width="720" height="405" alt="{esc(self.cfg["game"])}"'
                f'{" loading=\"lazy\"" if lazy else ""} decoding="async">')

    def img(self, addr):
        return self.cfg["assets"] + addr + ".webp" if addr else ""

    def doc_imgs(self, h):
        """Картинки внутри текста документа (Gothic: AddImage) пишутся как {{A}}<адрес>.webp — подставляем …-assets/db/."""
        return h.replace("{{A}}", self.cfg["assets"])

    def img_small(self, addr, kind):
        """Уменьшенная копия из …-assets/db/<kind>/ (t — 96 px для значков вкладок, m — 540 px для рендеров шапки
        на телефоне); делает tools/db_small.sh по списку tools/db_small_<игра>.txt."""
        if addr:
            SMALL.setdefault(self.cfg["slug"], set()).add(f"{kind} {addr}")
        return self.cfg["assets"] + kind + "/" + addr + ".webp" if addr else ""

    # ---------- связи между записями (обратные ссылки + совпадения по тексту) ----------
    @staticmethod
    def _norm(s):
        return re.sub(r"\s+", " ", strip(s).lower().replace("ё", "е"))

    @staticmethod
    def _word_re(name):
        """Шаблон названия с запасом на падежные окончания: «Кровотечение» → «кровотечени[а-я]{0,3}»."""
        parts = []
        for w in name.lower().replace("ё", "е").split():
            stem = w[:-2] if len(w) >= 7 else w[:-1] if len(w) >= 5 else w
            parts.append(re.escape(stem) + (r"[а-яa-z]{0,3}" if stem != w else ""))
        return r"(?<![а-яa-z])" + r"\s+".join(parts) + r"(?![а-яa-z])"

    def rel(self):
        if hasattr(self, "_rel"):
            return self._rel
        d = self.data
        R = {k: {} for k in ("item_quests", "item_locs", "item_sets", "item_ach", "quest_items", "quest_who", "quest_locs", "effect_items")}
        add = lambda key, a, b: R[key].setdefault(a, []).append(b) if b not in R[key].get(a, []) else None
        for k in ("characters", "bestiary"):
            for r in d[k]:
                for s_, _, _ in r.get("quests") or []:
                    add("quest_who", s_, (k, r))
        for l in d["locations"]:
            for s_, *_ in l["quests"]:
                add("quest_locs", s_, l)
            for s_, *_ in l["items"]:
                add("item_locs", s_, l)
        for st in d["sets"]:
            for i in st["armor"] + st["gear"]:
                add("item_sets", i["slug"], st)
        for a in d["achievements"]:
            for i in a["items"] + a["weapons"]:
                add("item_ach", i["slug"], a)
        # предметы, названные в тексте задания (описание + этапы журнала): точное название, без однословной мелочи
        by_name = {}
        hubs = set(self.cfg.get("merge_all") or ())   # части дома («Грязевой краб» — трофей) — не предметы заданий
        for r in d["items"]:
            if r["sub"] in hubs:
                continue
            n = r["name"].lower().replace("ё", "е")
            if len(n) >= 5 and (n not in by_name or r["sec"] in ("quest", "keys")):
                by_name[n] = r
        qtext = {q["slug"]: " " + self._norm(q.get("desc", "") + " " + " ".join(q.get("steps") or [])) + " " for q in d["quests"]}
        qraw = {q["slug"]: re.sub(r"\s+", " ", strip(q.get("desc", "") + " . " + " . ".join(q.get("steps") or []))).replace("ё", "е") for q in d["quests"]}
        hits = {}
        for n, r in by_name.items():
            pat = re.compile(r"(?<![а-яa-z0-9])" + re.escape(n) + r"(?![а-яa-z0-9])")
            qs = [s_ for s_, t in qtext.items() if n in t and pat.search(t)]
            if qs and " " not in n and r["sec"] not in ("quest", "keys", "books"):
                # одно слово («Дерево», «Камень») — предмет, только если оно с заглавной не в начале предложения
                # и не часть чужого имени («Кровоточащее Сердце», «Сердце Энфис»)
                qs = [s_ for s_ in qs if self._proper(qraw[s_], r["name"].replace("ё", "е"))]
            if qs and (len(qs) <= 6 or r["sec"] in ("quest", "keys")):   # «Яблоко» в десятке заданий — не связь, а слово
                hits[r["slug"]] = (r, qs)
        qby = {q["slug"]: q for q in d["quests"]}
        names_in = {}
        for r, qs in hits.values():
            for s_ in qs:
                names_in.setdefault(s_, []).append(r["name"].lower())
        for slug, (r, qs) in hits.items():
            n = r["name"].lower()
            # «Сердце» рядом с «Сердцем Энфис» в том же задании — это оно и есть, отдельной ссылки не надо
            qs = [s_ for s_ in qs if not any(o != n and n in o.split() for o in names_in[s_])]
            for s_ in qs:
                add("quest_items", s_, r)
                add("item_quests", slug, qby[s_])
        # эффекты в описаниях предметов: длинные названия раньше коротких («Благословение Сарраса» прежде «Благословения»)
        self._eff_re = [(e, re.compile(self._word_re(e["name"]), re.I)) for e in sorted(d["effects"], key=lambda e: -len(e["name"])) if len(e["name"]) >= 4]
        for r in d["items"]:
            for e in self.effects_in(r.get("desc")):
                add("effect_items", e["slug"], r)
        self._rel = R
        return R

    @staticmethod
    def _proper(text, name):
        for m in re.finditer(r"(?<![\wа-яА-Я])" + re.escape(name) + r"(?![\wа-яА-Я])", text):
            before, after = text[:m.start()].rstrip(), text[m.end():].lstrip()
            if not before or before[-1] in ".!?:|«\"" or re.search(r"(?:^|\s)[А-ЯA-Z][\wа-яё-]*$", before) or re.match(r"[А-ЯA-Z]", after):
                continue
            return True
        return False

    def effects_in(self, text):
        out, t = [], self._norm(text)
        for e, pat in self._eff_re:
            if pat.search(t) and e not in out:
                out.append(e)
        return out

    def link_effects(self, html_):
        """Названия эффектов в описании → ссылки на эффект (первое упоминание каждого; внутри тегов не трогаем)."""
        if not html_:
            return html_
        done, out = set(), []
        for part in re.split(r"(<[^>]+>)", html_):
            if part.startswith("<"):
                out.append(part)
                continue
            spans = []
            for e, pat in self._eff_re:
                if e["slug"] in done:
                    continue
                # «ё»→«е» сохраняет длину строки, поэтому позиции совпадения годятся для исходного текста
                m = pat.search(part.replace("ё", "е").replace("Ё", "Е"))
                if m and not any(a < m.end() and m.start() < b for a, b, _ in spans):
                    spans.append((m.start(), m.end(), e))
                    done.add(e["slug"])
            for a, b, e in sorted(spans, key=lambda x: -x[0]):
                part = part[:a] + f'<a class="db-ref" href="/{self.base()}effects/{e["slug"]}/">' + part[a:b] + "</a>" + part[b:]
            out.append(part)
        return "".join(out)


    # ---------- упоминания в тексте: персонажи, существа, места → ссылки (подсказки при наведении даёт js/db-links.js) ----------
    def mention_map(self):
        """{название: (раздел, запись)} для персонажей, существ и локаций; неоднозначные и короткие названия отбрасываются."""
        if hasattr(self, "_mm"):
            return self._mm
        cnt, cand = {}, {}
        for k in ("bestiary", "characters", "locations"):
            for r in self.data[k]:
                n = r["name"].strip()
                cnt[n] = cnt.get(n, 0) + 1
                cand.setdefault(n, (k, r))
        mm = {n: v for n, v in cand.items() if cnt[n] == 1 and len(n) >= 5 and n[0].isupper() and not re.search(r"[0-9()/]", n)
              and not (" " not in n and n.lower() in self._common_words())}
        names = sorted(mm, key=lambda n: -len(n))
        def pat(n):
            w = n.split(" ")
            last = w[-1]
            stem = last[:-1] if len(last) >= 5 and last[-1] in "аяыиеоьйу" else last
            return re.escape(" ".join(w[:-1] + [stem])) + (r"[а-яё]{0,3}" if stem != last or len(last) >= 5 else "")
        self._mm_list = names
        self._mm_re = bool(names)
        # Ускорение: одно выражение из тысяч имён перебирает их все в каждой позиции текста (минуты на сборку).
        # Имя может совпасть только там, где с начала слова идут его первые три буквы, поэтому для каждого
        # куска текста собираем выражение только из таких имён — в том же порядке и с теми же номерами групп,
        # так что результат не меняется.
        self._mm_alts = [f"(?P<g{i}>{pat(n)})" for i, n in enumerate(names)]
        self._mm_by3 = {}
        for i, n in enumerate(names):
            self._mm_by3.setdefault(n[:3], []).append(i)
        self._mm_cache = {}
        self._mm = mm
        return mm

    _WSTART = re.compile(r"(?<![\wа-яёА-ЯЁ])(?=[\wа-яёА-ЯЁ])")

    def _mm_iter(self, part):
        """Совпадения имён в куске текста (как один общий regex по всем именам, только быстрее)."""
        by3 = self._mm_by3
        idx = set()
        for m in self._WSTART.finditer(part):
            ids = by3.get(part[m.start():m.start() + 3])
            if ids:
                idx.update(ids)
        if not idx:
            return ()
        key = tuple(sorted(idx))
        rx = self._mm_cache.get(key)
        if rx is None:
            rx = self._mm_cache[key] = re.compile(r"(?<![\wа-яёА-ЯЁ])(?:" + "|".join(self._mm_alts[i] for i in key) + r")(?![\wа-яёА-ЯЁ])")
        return rx.finditer(part)

    def _common_words(self):
        """Однословные названия, совпадающие с обычными словами текста (с маленькой буквы они встречаются в описаниях)."""
        if not hasattr(self, "_cw"):
            txt = " ".join(strip(r.get("desc") or "") for k in ("quests", "lore", "items") for r in self.data[k][:3000]).lower()
            self._cw = set(re.findall(r"[а-яё]{5,}", txt))
        return self._cw

    def link_mentions(self, html_, host=None, extra=()):
        """Первое упоминание каждого имени в тексте → ссылка на запись. host=(раздел, slug) — саму запись не трогаем;
        extra=[(название, раздел, запись)] — дополнительные предметы этого текста (предметы заданий)."""
        if not html_:
            return html_
        mm_ = self.mention_map()
        pats = [(n, "items", x) for n, _, x in [(e["name"], "", e) for e in extra]] if extra else []
        done, out, inside_a = set(), [], 0
        for part in re.split(r"(<[^>]+>)", html_):
            if part.startswith("<"):
                if re.match(r"<a[\s>]", part, re.I):
                    inside_a += 1
                elif part.lower().startswith("</a"):
                    inside_a = max(0, inside_a - 1)
                out.append(part)
                continue
            if inside_a or len(part) < 5:
                out.append(part)
                continue
            spans = []
            for n, k, x in pats:
                if x["slug"] in done:
                    continue
                m = re.search(r"(?<![\wа-яёА-ЯЁ])" + re.escape(n) + r"(?![\wа-яёА-ЯЁ])", part)
                if m:
                    spans.append((m.start(), m.end(), k, x)); done.add(x["slug"])
            if self._mm_re:
                for m in self._mm_iter(part):
                    k, x = mm_[self._mm_list[int(m.lastgroup[1:])]]
                    if (k, x["slug"]) == host or x["slug"] in done and k != "items" or any(a < m.end() and m.start() < b for a, b, _, _ in spans):
                        continue
                    done.add(x["slug"])
                    spans.append((m.start(), m.end(), k, x))
            for a, b, k, x in sorted(spans, key=lambda t: -t[0]):
                part = part[:a] + f'<a class="db-ref" href="/{self.base()}{k}/{x["slug"]}/">' + part[a:b] + "</a>" + part[b:]
            out.append(part)
        res = "".join(out)
        for k, x in ([] if not getattr(self, "_ment_rec", True) else re.findall(r'href="/' + re.escape(self.base()) + r'(bestiary|characters|locations)/([^/"]+)/"', res)):
            if host:
                self._ment_hosts.setdefault((k, x), []).append(host)
        return res

    def prepass_mentions(self):
        """Один раз перед сборкой страниц: кто кого упоминает (для блока «Упоминается в»)."""
        self._ment_hosts = {}
        R = self.rel()
        for q in self.data["quests"]:
            its = R["quest_items"].get(q["slug"], [])
            for t in [q.get("desc")] + list(q.get("objs") or []) + list(q.get("steps") or []):
                self.link_mentions(t, ("quests", q["slug"]), its)
        for k in ("bestiary", "characters", "lore"):
            for r in self.data[k]:
                for t in [r.get("desc")] + list(r.get("more") or []):
                    self.link_mentions(t, (k, r["slug"]))
        for r in self.data["locations"]:
            self.link_mentions(r.get("desc"), ("locations", r["slug"]))
        for k, v in self._ment_hosts.items():
            self._ment_hosts[k] = list(dict.fromkeys(v))
        self._ment_rec = False

    def mentioned_block(self, kind, slug):
        hosts = (getattr(self, "_ment_hosts", {}) or {}).get((kind, slug), [])
        if not hosts:
            return ""
        by = {k: {x["slug"]: x for x in self.data[k]} for k in ("quests", "bestiary", "characters", "locations", "lore")}
        lis, quest = [], []
        for k, sl in hosts:
            x = by[k].get(sl)
            if not x:
                continue
            if k == "quests":
                quest.append(self.quest_chip(x))
            else:
                lis.append(self.chip(k, sl, x["name"], x.get("image") or (self.loc_pic(sl) if k == "locations" else "") or
                                     self.cfg.get({"bestiary": "beast_q", "characters": "person_q"}.get(k, ""), "") or "",
                                     {"bestiary": "Существо", "characters": "Персонаж", "locations": "Локация", "lore": "Лор"}[k]))
        lis = lis[:12] if len(lis) > 12 else lis
        return (self.chip_list("Упоминается в записях", lis, len(lis)) + ("\n    " if lis and quest else "")
                + self.chip_list("Упоминается в текстах заданий", quest[:12], len(quest)))

    def similar_chips(self, kind, r, n=8):
        """«Похожее» для записей, у которых нет своих связей: тот же подтип, сначала с картинкой/метками; набор зависит от записи."""
        key = {"quests": "type", "locations": "kind"}.get(kind, "sub")
        rows = [x for x in self.data[kind] if x is not r and x.get(key) == r.get(key) and x.get(key)]
        if len(rows) < 2:
            return ""
        seed = int(hashlib.md5(r["slug"].encode()).hexdigest()[:6], 16)
        rows.sort(key=lambda x: (not (x.get("image") or x.get("markers")), (int(hashlib.md5((x["slug"] + str(seed)).encode()).hexdigest()[:6], 16))))
        rows = rows[:n]
        if kind == "quests":
            lis = [self.quest_chip(x) for x in rows]
        elif kind == "locations":
            lis = [self.chip("locations", x["slug"], x["name"], self.loc_pic(x["slug"]) or "q:loc", x["kind"]) for x in rows]
        else:
            q = self.cfg.get({"bestiary": "beast_q", "characters": "person_q"}.get(kind, ""), "")
            lis = [self.chip(kind, x["slug"], x["name"], x.get("image") or q, x.get("sub") or "") for x in rows]
        return self.chip_list("Похожее", lis)

    def scene(self, markers=None, image=None):
        """Размытая сцена за заголовком страницы записи: кадр с метки записи, иначе кадр шапки игры. Параллакс — js/db-links.js."""
        src = ""
        sh = self.shot_list(markers)
        if sh:
            src = sh[0][0]
        elif image:
            src = self.img(image)
        elif self.cfg.get("hero_shots") and self.cfg.get("popups"):
            hs = self.cfg["hero_shots"]
            src = f'{self.cfg["popups"]}popups/{hs[0]}.webp'
        if not src:
            return ""
        return f'<div class="db-scene" aria-hidden="true" data-src="{esc(src)}"></div>'

    QUALITY_CLS = {"Магический": "magic", "Сюжетный": "story", "Хлам": "junk", "Инструмент": "tool", "Обычный": "common", "Слабый": "junk"}

    def rarity(self, r):
        """Класс редкости для рамки карточки предмета: у Tainted Grail — качество из игры; у остальных — зачарованный вариант = магический,
        цена в верхних 3% раздела = редкий, предметы заданий = сюжетные."""
        q = self.QUALITY_CLS.get(r.get("quality") or "")
        if q:
            return q
        if r["sec"] in ("quest", "keys", "key"):
            return "story"
        base_of = self.vmap()[0]
        if r["slug"] in base_of:
            return "magic"
        if not hasattr(self, "_p97"):
            by = {}
            for x in self.data["items"]:
                if x.get("price"):
                    by.setdefault(x["sec"], []).append(x["price"])
            self._p97 = {k: sorted(v)[int(len(v) * 0.97)] for k, v in by.items() if len(v) >= 30}
        if r.get("price") and r["price"] >= self._p97.get(r["sec"], 1e18):
            return "rare"
        return "common"

    def pager(self, kind, rows, r, group=None):
        """Соседние записи раздела (по алфавиту внутри группы) — листать без возврата в каталог."""
        # отсортированный раздел и позиции записей считаем один раз на раздел/группу, а не для каждой страницы
        cache = self.__dict__.setdefault("_pager_cache", {})
        ck = (kind, id(rows), group.__code__ if group else None, group(r) if group else None)
        if ck not in cache:
            same_ = sorted((x for x in rows if group is None or group(x) == group(r)), key=lambda x: x["name"].lower())
            cache[ck] = (same_, {id(x): j for j, x in enumerate(same_)})
        same, pos = cache[ck]
        i = pos.get(id(r))
        if i is None or len(same) < 2:
            return ""
        prv, nxt = same[i - 1] if i > 0 else None, same[i + 1] if i + 1 < len(same) else None
        link = lambda x, rel_, cls: (f'<a class="db-pg-{cls}" rel="{rel_}" href="/{self.base()}{kind}/{x["slug"]}/"><small>{"← Предыдущая" if cls == "prev" else "Следующая →"}</small>'
                                     f'<span>{esc(x["name"])}</span></a>') if x else "<span></span>"
        return f'<nav class="db-pager" aria-label="Соседние записи">{link(prv, "prev", "prev")}<small class="db-pg-n">{i + 1} из {len(same)}</small>{link(nxt, "next", "next")}</nav>'

    def vmap(self):
        """Варианты предметов: «Арбалет горения» → «Арбалет». Один значок, раздел и тип + название начинается с названия базового
        предмета. Только разделы из cfg["group_variants"], базовых предметов — от двух вариантов. → (variant_slug → base_slug, base_slug → [записи])"""
        if hasattr(self, "_vmap"):
            return self._vmap
        secs = self.cfg.get("group_variants") or ()
        base_of, groups = {}, {}
        for r in self.data["items"]:
            if r["sec"] in secs and r.get("icon"):
                groups.setdefault((r["sec"], r["icon"], r["sub"]), {}).setdefault(r["name"], r)
        for names in groups.values():
            for n, r in names.items():
                cand = [b for b in names if b != n and n.startswith(b + " ")]
                if cand:
                    base_of[r["slug"]] = names[max(cand, key=len)]["slug"]
        for v in list(base_of):            # цепочка «A» ← «A B» ← «A B C» — все под корнем
            b = base_of[v]
            while b in base_of:
                b = base_of[b]
            base_of[v] = b
        cnt = {}
        for b in base_of.values():
            cnt[b] = cnt.get(b, 0) + 1
        base_of = {v: b for v, b in base_of.items() if cnt[b] >= 2}
        by_slug = {r["slug"]: r for r in self.data["items"]}
        kids = {}
        for v, b in base_of.items():
            kids.setdefault(b, []).append(by_slug[v])
        for rs in kids.values():
            rs.sort(key=lambda x: x["name"].lower())
        self._vmap = (base_of, kids, by_slug)
        return self._vmap

    TIER_NOUN = {"зелье": "p", "микстура": "p", "снадобье": "p", "эликсир": "p", "напиток": "p", "яд": "y", "отрава": "y", "неприятие": "n"}

    TIER_ADJ = ("слаб", "сильн", "крепк", "идеальн", "наилучш", "велик", "превосходн", "мал", "отвратительн", "пагубн", "вирулентн",
                "беспрестанн", "длительн", "затянувш", "продолжительн", "смертельн")
    SERIES_RE = re.compile(r"^(.*?)(?:,| –| -|:)?\s+(?:часть|том|запись)\s+([IVX]+|\d+)$")

    @staticmethod
    def roman(n):
        if n.isdigit():
            return int(n)
        v = {"I": 1, "V": 5, "X": 10}
        return sum(-v[c] if i + 1 < len(n) and v[c] < v[n[i + 1]] else v[c] for i, c in enumerate(n))

    def merged(self):
        """Записи без своей страницы → (host_of: слаг → слаг общей страницы, members: общая → [записи], kind: общая → вид).
        variants — зачарованные варианты (vmap; варианты с метками на карте сохраняют страницу, но есть и в таблице);
        tiers — ступени силы зелий/ядов (cfg["merge_tiers"]); all — все записи типа на одной странице (cfg["merge_all"])."""
        if hasattr(self, "_merged"):
            return self._merged
        base_of, kids, by_slug = self.vmap()
        host_of, members, kind = {}, {}, {}
        for b, ks in kids.items():
            members[b] = [by_slug[b]] + ks
            kind[b] = "variants"
            for x in ks:
                if not x["markers"]:
                    host_of[x["slug"]] = b
        tiers = set(self.cfg.get("merge_tiers") or ())
        groups = {}
        for r in self.data["items"]:
            if r["sub"] not in tiers or r["markers"] or r["slug"] in host_of:
                continue
            w = r["name"].lower().split()
            if w and w[0] in self.TIER_NOUN:
                adj, noun, rest = None, w[0], w[1:]
            elif len(w) > 1 and w[1] in self.TIER_NOUN:
                adj, noun, rest = w[0], w[1], w[2:]
            else:
                continue
            if not rest and adj and not adj.startswith(self.TIER_ADJ):   # «Багровый яд» и «Иссушающий яд» — разные яды
                rest = [adj]
            groups.setdefault((r["sub"], self.TIER_NOUN[noun], " ".join(rest)), []).append((adj, noun, r))
        for g in groups.values():
            if len(g) < 2:
                continue
            h = min(g, key=lambda t: (t[0] is not None, t[1] not in ("зелье", "яд", "неприятие"), t[2].get("price") or 0, t[2]["name"]))[2]
            members[h["slug"]] = sorted((t[2] for t in g), key=lambda x: (x.get("price") or 0, x["name"]))
            kind[h["slug"]] = "tiers"
            for _, _, r in g:
                if r is not h:
                    host_of[r["slug"]] = h["slug"]
        if self.cfg.get("merge_series"):
            ser = {}
            for r in self.data["items"]:
                m = self.SERIES_RE.match(r["name"])
                if m and r["sec"] == "books" and r["slug"] not in host_of:
                    ser.setdefault(m[1], []).append((self.roman(m[2]), r))
            for g in ser.values():
                g = [r for _, r in sorted(g, key=lambda t: (t[0], t[1]["name"]))]
                h = g[0]
                if len(g) < 2 or not any(not r["markers"] for r in g[1:]):
                    continue
                members[h["slug"]], kind[h["slug"]] = g, "series"
                for r in g[1:]:
                    if not r["markers"]:
                        host_of[r["slug"]] = h["slug"]
        for r in self.data["items"]:
            if r.get("_hub"):
                ms = [x for x in self.data["items"] if x["sub"] == r["_hub"] and not x.get("_hub") and not x["markers"]]
                members[r["slug"]] = ms
                kind[r["slug"]] = "all"
                for x in ms:
                    host_of[x["slug"]] = r["slug"]
        self._merged = (host_of, members, kind)
        return self._merged

    def item_href(self, slug):
        h = self.merged()[0].get(slug)
        return f"{h}/#{slug}" if h else f"{slug}/"

    def relink(self, html_):
        """Ссылки на записи без своей страницы → общая страница с якорем."""
        host_of = self.merged()[0]
        pre = re.escape(f"/{self.base()}items/")
        return re.sub(pre + r'([^/"#?]+)/(?=")', lambda m: f"/{self.base()}items/{host_of[m[1]]}/#{m[1]}" if m[1] in host_of else m[0], html_)

    def stub_page(self, r):
        """Переадресация со старого адреса записи на строку общей страницы."""
        to = f"/{self.base()}items/{self.item_href(r['slug'])}"
        host = f"{SITE}{self.base()}items/{self.merged()[0][r['slug']]}/"
        return (f'<!DOCTYPE html>\n<html lang="ru"><head><meta charset="UTF-8"><title>{esc(r["name"])} — {esc(self.cfg["short"])}</title>'
                f'<link rel="canonical" href="{host}"><meta http-equiv="refresh" content="0; url={to}">'
                f'<script>location.replace({json.dumps(to)})</script></head>'
                f'<body><a href="{to}">{esc(r["name"])}</a></body></html>\n')

    def pic(self, icon):
        if not icon:
            return '<span class="db-noimg" aria-hidden="true">•</span>'
        return qi(icon) if icon.startswith("q:") else f'<img src="{esc(self.img(icon))}" alt="" width="32" height="32" loading="lazy" decoding="async">'

    def merge_block(self, r):
        """Таблица записей общей страницы: строка = бывшая отдельная страница (id — её слаг, на него ведут старые адреса)."""
        host_of, members, kind = self.merged()
        ms, k = members.get(r["slug"]), kind.get(r["slug"])
        if not ms:
            return ""
        def name_td(x):
            own = x["slug"] not in host_of and x is not r
            nm = esc(x["name"])
            if own:
                nm = f'<a href="/{self.base()}items/{x["slug"]}/">{nm}</a>'
            return f'<td><span class="db-mrow">{self.pic(x.get("icon") or "")}<span>{nm}</span></span></td>'
        def row(x, cells):
            cur = ' class="is-host"' if x is r else ""
            return f'<tr id="{esc(x["slug"])}"{cur}>{name_td(x)}{cells}</tr>'
        num = lambda v: fmt(v) if v else "—"
        if k == "all":
            by = {}
            for x in ms:
                by.setdefault(re.split(r" - |, ", x["name"], maxsplit=1)[0].strip(), []).append(x)
            rooms = {g: xs for g, xs in by.items() if len(xs) >= 2}
            rest = [x for g, xs in by.items() if len(xs) < 2 for x in xs]
            out = [f'<p class="db-note">{pn(len(ms), "rec")} — по постройкам.</p>']
            for g, xs in sorted(rooms.items(), key=lambda t: t[0].lower()) + ([("Обстановка и прочее", rest)] if rest else []):
                trs = "".join(row(x, "") for x in sorted(xs, key=lambda x: x["name"].lower()))
                out.append(f'<h2>{esc(g)} <span class="cp-n">{len(xs)}</span></h2>\n    <div class="db-scroll"><table class="db-table db-mtable"><tbody>{trs}</tbody></table></div>')
            return "\n    ".join(out)
        if k == "series":
            out = []
            for x in ms[1:]:
                link = (f'<p class="db-note"><a href="/{self.base()}items/{x["slug"]}/">Где найти эту часть — на её странице</a></p>'
                        if x["slug"] not in host_of else "")
                txt = f'<div class="db-book">{self.doc_imgs(x["text"])}</div>' if x.get("text") else (f'<p class="db-text">{x["desc"]}</p>' if x.get("desc") else "")
                out.append(f'<section class="db-part" id="{esc(x["slug"])}"><h2>{esc(x["name"])}</h2>\n    {txt}{link}</section>')
            return "\n    ".join(out)
        if k == "tiers":
            trs = "".join(row(x, f'<td>{self.link_effects(x.get("desc") or "") or "—"}</td><td>{num(x.get("price"))}</td>') for x in ms)
            return ('<h2>Все ступени силы <span class="cp-n">' + str(len(ms)) + '</span></h2>\n    <div class="db-scroll"><table class="db-table db-mtable">'
                    f'<thead><tr><th>Название</th><th>Эффект</th><th>Цена</th></tr></thead><tbody>{trs}</tbody></table></div>')
        st = lambda x: x.get("stats") or {}
        val = lambda x: (f"{st(x)['damage'][0]:g}–{st(x)['damage'][1]:g}" if st(x)["damage"][0] != st(x)["damage"][1] else f"{st(x)['damage'][0]:g}") if st(x).get("damage") else (f"{st(x)['armor']:g}" if st(x).get("armor") else "—")
        label = "Урон" if st(r).get("damage") else "Броня"
        trs = "".join(row(x, f'<td>{self.link_effects(x.get("desc") or "") or "—"}</td><td>{val(x)}</td><td>{num(x.get("price"))}</td>') for x in ms)
        return ('<h2>Варианты и зачарования <span class="cp-n">' + str(len(ms) - 1) + '</span></h2>\n    <div class="db-scroll"><table class="db-table db-mtable">'
                f'<thead><tr><th>Название</th><th>Зачарование</th><th>{label}</th><th>Цена</th></tr></thead><tbody>{trs}</tbody></table></div>')

    @staticmethod
    def stat_note(x):
        st = x.get("stats") or {}
        out = []
        if st.get("damage"):
            a, b = st["damage"]
            out.append("Урон " + (f"{a:g}–{b:g}" if a != b else f"{a:g}"))
        elif st.get("armor"):
            out.append(f"Броня {st['armor']:g}")
        if x.get("price"):
            out.append(f"{fmt(x['price'])} з.")
        return " · ".join(out)

    def variants_block(self, r):
        """Вместо алфавитных «Похожих»: у базового предмета — его варианты, у варианта — базовый предмет и соседние варианты."""
        base_of, kids, by_slug = self.vmap()
        mk = lambda x: self.chip("items", x["slug"], x["name"], x.get("icon") or "", self.stat_note(x))
        if r["slug"] in kids:
            ks = kids[r["slug"]]
            return self.chip_list("Варианты и зачарования", [mk(x) for x in ks], len(ks))
        b = by_slug.get(base_of.get(r["slug"]))
        if not b:
            return ""
        sib = [x for x in kids[b["slug"]] if x["slug"] != r["slug"]]
        return (self.chip_list("Базовый предмет", [mk(b)])
                + "\n    " + self.chip_list("Другие варианты", [mk(x) for x in sib[:24]], len(sib)))

    def similar(self, r, n=8):
        """Похожие предметы: тот же раздел и тип, ближе по тиру, сначала того же качества."""
        same = [x for x in self._pages_by_sec[r["sec"]] if x["sub"] == r["sub"] and x["name"] != r["name"]]
        t = r.get("tier") or 0
        same.sort(key=lambda x: (abs((x.get("tier") or 0) - t), x.get("quality") != r.get("quality"), x["name"].lower()))
        return same[:n]

    def chip_list(self, title, lis, n=None, hid=""):
        if not lis:
            return ""
        cnt = f' <span class="cp-n">{n}</span>' if n and n > 1 else ""
        return f'<h2{f" id=\"{hid}\"" if hid else ""}>{title}{cnt}</h2>\n    <ul class="db-links">{"".join(lis)}</ul>'

    def quest_chip(self, q):
        return (f'<li><a class="db-link" href="/{self.base()}quests/{q["slug"]}/"><i class="db-qi db-qi-{QUEST_ICON.get(q["type"], "task")}" aria-hidden="true"></i>'
                f'<span>{esc(q["name"])}<small>{esc(q["type"])}</small></span></a></li>')

    def base(self):
        return f"db/{self.cfg['slug']}/"

    # ---------- общие блоки ----------
    def shot_list(self, markers):
        """Картинки из попапов меток записи: [(url, метка, id карты)], без повторов."""
        out, seen = [], set()
        for mk in markers or []:
            m = self.markers.get(mk["id"]) or {}
            src = m.get("img")
            if src and src not in seen and self.cfg.get("popups"):
                seen.add(src)
                out.append((src if src.startswith("http") else self.cfg["popups"] + src, m, mk["map"]))
        return out

    def shots(self, markers, name):
        lst = self.shot_list(markers)
        if not lst:
            return ""
        folder, n_maps = self.cfg["folder"], len(self.maps)
        figs = []
        for url, m, mid in lst[:MAX_SHOTS]:
            cap = m.get("title") or name
            if n_maps > 1:
                cap += " · " + self.map_names.get(mid, "")
            href = map_url(folder, mid, n_maps, "?marker=" + str(m["id"]))
            figs.append(f'<figure><button type="button" class="db-shot-open" aria-label="Открыть изображение: {esc(cap)}">'
                        f'<img src="{esc(url)}" alt="{esc(name)} — {esc(cap)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" '
                        f'onerror="this.closest(\'figure\').remove()"></button><figcaption><span>{esc(cap)}</span>'
                        f'<a class="db-shot-map" href="{href}">На карте</a></figcaption></figure>')
        more = f' <span class="cp-n">{len(lst)}</span>' if len(lst) > MAX_SHOTS else ""
        return f'<h2>Как выглядит на месте{more}</h2>\n    <div class="db-shots">{"".join(figs)}</div>'

    def add_map_btn(self, body, markers):
        """Кнопка «Показать на карте» под шапкой записи, если у неё есть метки: ведёт к первой метке (окно метки
        открывается сразу), при нескольких — ещё ссылка на список «Где найти на карте». Обратная кнопка «В базе →»
        в окне метки — app.js карты по marker-links.json."""
        if not markers:
            return
        order = {mid: i for i, (mid, _, _) in enumerate(self.maps)}
        mk = min(markers, key=lambda m: order.get(m["map"], 99))
        href = map_url(self.cfg["folder"], mk["map"], len(self.maps), "?marker=" + str(mk["id"]))
        n = len(markers)
        more = f'<a class="db-mapall" href="#where">все {n} {plural(n, ("метка", "метки", "меток"))} ↓</a>' if n > 1 else ""
        btn = (f'<p class="db-mapbtn"><a class="db-mapgo" href="{href}">'
               f'<svg class="sp-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>'
               f'<span>Показать на карте</span><i aria-hidden="true">→</i></a>{more}</p>')
        at = next((i for i, b in enumerate(body) if b and ('class="db-head' in b or 'class="db-hero' in b)), None)
        if at is None:
            at = 1 if len(body) > 1 and 'class="db-en"' in (body[1] or "") else 0
        body.insert(at + 1, btn)

    def minimap(self, mid, rows, name):
        """Мини-карта «Где найти»: обзорная картинка карты (…-assets/db/map/<карта>.webp) и точки меток. Точки — ссылки на
        метку в большой карте; положение считается здесь, при сборке, поэтому работает без скриптов. Окно приближено к
        меткам, если они лежат кучно."""
        c = self.mm.get(mid)
        pts = []
        for mk in rows:
            m = self.markers.get(mk["id"])
            if not m or "lat" not in m or "lng" not in m:
                continue
            if c["crs"] == "merc":
                s_, w_, n_, e_ = c["box"]
                x = (merc_x(m["lng"]) - merc_x(w_)) / (merc_x(e_) - merc_x(w_))
                y = (merc_y(m["lat"]) - merc_y(n_)) / (merc_y(s_) - merc_y(n_))
            else:
                T, (s_, w_, n_, e_) = c["T"], c["box"]
                x = (T["bx"] + T["ax"] * m["lng"] - w_) / (e_ - w_)
                y = (n_ - (T["by"] + T["ay"] * m["lat"])) / (n_ - s_)
            if -0.02 <= x <= 1.02 and -0.02 <= y <= 1.02:
                pts.append((x, y, mk, m))
        if not pts:
            return ""
        W, H = c["w"], c["h"]
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        # окно: рамка меток с запасом, минимум 30 % картинки, пропорции 16:10 (в долях картинки)
        cw = max((max(xs) - min(xs)) * 1.35, 0.3)
        ch = max((max(ys) - min(ys)) * 1.35, 0.3 * W / H / 1.6)
        cw, ch = max(cw, ch * 1.6 * H / W), max(ch, cw * W / H / 1.6)
        if cw >= 0.92 and ch >= 0.92:
            cw = ch = 1.0
            cx = cy = 0.0
            ar = f"{W} / {H}"
        else:
            cw, ch = min(cw, 1.0), min(ch, 1.0)
            cx = min(max((min(xs) + max(xs)) / 2 - cw / 2, 0), 1 - cw)
            cy = min(max((min(ys) + max(ys)) / 2 - ch / 2, 0), 1 - ch)
            ar = f"{cw * W:.0f} / {ch * H:.0f}"
        folder, n_maps = self.cfg["folder"], len(self.maps)
        dots = []
        for x, y, mk, m in pts:
            title = m.get("title") or name
            dots.append(f'<a class="db-mm-dot" style="left:{x * 100:.2f}%;top:{y * 100:.2f}%" '
                        f'href="{map_url(folder, mid, n_maps, "?marker=" + str(mk["id"]))}" aria-label="{esc(title)}" title="{esc(title)}"></a>')
        src = f'{self.cfg["assets"]}map/{mid}.webp'
        full = "" if cw >= 1 else ' db-mm-zoom'
        return (f'<figure class="db-mm{full}{" db-mm-few" if len(pts) <= 8 else ""}" style="aspect-ratio:{ar}">'
                f'<div class="db-mm-view" style="width:{100 / cw:.3f}%;height:{100 / ch:.3f}%;left:{-cx / cw * 100:.3f}%;top:{-cy / ch * 100:.3f}%">'
                f'<img src="{esc(src)}" alt="Карта: {esc(self.map_names.get(mid, ""))}, метки «{esc(name)}»" width="{W}" height="{H}" '
                f'loading="lazy" decoding="async" onerror="this.remove()">{"".join(dots)}</div>'
                f'<figcaption><span>{len(pts)} {plural(len(pts), ("метка", "метки", "меток"))}</span>'
                f'<a class="db-shot-map" href="{map_url(folder, mid, n_maps, "")}">Открыть карту</a></figcaption></figure>')

    def where(self, markers, name):
        if not markers:
            return ""
        gallery = self.shots(markers, name)
        folder, n_maps = self.cfg["folder"], len(self.maps)
        by = {}
        for mk in markers:
            by.setdefault(mk["map"], []).append(mk)
        out = ([gallery] if gallery else []) + [f'<h2 id="where">Где найти на карте <span class="cp-n">{len(markers)}</span></h2>']
        for mid, _, _ in self.maps:
            rows = by.get(mid)
            if not rows:
                continue
            if n_maps > 1:
                out.append(f"<h3>{esc(self.map_names[mid])} <span class=\"cp-n\">{len(rows)}</span></h3>")
            if mid in self.mm:
                out.append(self.minimap(mid, rows, name))
            lis = []
            for mk in rows[:MAX_WHERE]:
                m = self.markers.get(mk["id"], {})
                title = m.get("title") or name
                cat = self.cat_names.get(mk.get("cat") or m.get("category"), "")
                lis.append(f'<li><a href="{map_url(folder, mid, n_maps, "?marker=" + str(mk["id"]))}">{esc(title)}</a>'
                           + (f"<small>{esc(cat)}</small>" if cat else "") + "</li>")
            out.append('<ul class="db-where">' + "".join(lis) + "</ul>")
            if len(rows) > MAX_WHERE:
                cut = len(rows) - MAX_WHERE
                out.append(f'<p class="cp-more">…и ещё {cut} {plural(cut, ("метка", "метки", "меток"))} на этой карте.</p>')
        return "\n    ".join(out)

    def chip(self, kind, slug, name, icon="", note=""):
        """Ссылка-плашка на другую запись базы (с иконкой)."""
        pic = qi(icon) if icon.startswith("q:") else f'<img src="{esc(icon if icon.startswith("http") else self.img(icon))}"{' class="db-pic" referrerpolicy="no-referrer"' if icon.startswith("http") else ""} alt="" width="32" height="32" loading="lazy" decoding="async">' if icon else '<span class="db-noimg" aria-hidden="true">•</span>'
        inner = f'{pic}<span>{esc(name)}{f"<small>{esc(note)}</small>" if note else ""}</span>'
        if not slug:
            return f'<li><span class="db-link db-nolink">{inner}</span></li>'
        return f'<li><a class="db-link" href="/{self.base()}{kind}/{slug}/">{inner}</a></li>'

    def recipes(self, r):
        out = []
        for i, c in enumerate(r.get("craft") or []):
            head = "Как создать" if len(r["craft"]) == 1 else f"Как создать — способ {i + 1}"
            qty = f" · получается {c['qty']} шт." if c.get("qty", 1) > 1 else ""
            ings = "".join(self.chip("items", s, n, ic, f"× {k}") for s, n, ic, k in c["ing"])
            out.append(f'<h2>{head}</h2>\n    <p class="db-note">{esc(c["station"])}{qty}</p>\n    <ul class="db-links">{ings}</ul>')
        used = r.get("usedin") or []
        if used:
            lis = "".join(self.chip("items", s, n, ic, st) for s, n, ic, st in used[:60])
            out.append(f'<h2>Используется в рецептах <span class="cp-n">{len(used)}</span></h2>\n    <ul class="db-links">{lis}</ul>')
        return "\n    ".join(out)

    def figure(self, addr, alt, wide=False):
        if not addr:
            return ""
        if addr.startswith("q:"):
            return f'<div class="db-fig db-fig-q">{qi(addr)}</div>'
        return (f'<div class="db-fig{" db-wide" if wide else ""}"><img src="{esc(self.img(addr))}" alt="{esc(alt)}" '
                f'loading="eager" decoding="async"></div>')

    def crumbs(self, tab=None, name=None, tab_query=""):
        c = [("Интерактивные карты", ""), ("База данных", "db/"), (self.cfg["short"], self.base())]
        if tab:
            # ?tab=items&sec=armor → items/#armor: крошка ведёт на статичную страницу раздела
            m = re.match(r"\?tab=(\w+)(?:&sec=(\w+))?$", tab_query)
            if m and m.group(1) != "tips":
                tab_query = m.group(1) + "/" + (f"#{m.group(2)}" if m.group(2) else "")
            c.append((tab, self.base() + tab_query))
        if name:
            c.append((name, ""))
        return c

    # ---------- страницы записей ----------
    PLATES = {"Урон": "dmg", "Броня": "armor", "Вес": "weight", "Цена": "price", "Уровень (тир)": "tier", "Уровень": "lvl", "Здоровье": "hp",
              "Снижение урона блоком": "block", "Расход маны": "mana"}

    def facts_html(self, facts):
        """Числовые характеристики — крупными плашками (как в окне предмета игры), остальное — списком «ключ — значение»."""
        pl = [(k, v) for k, v in facts if k in self.PLATES]
        rest = [(k, v) for k, v in facts if k not in self.PLATES]
        if len(pl) < 2:   # одна цифра плашкой смотрится сиротой — оставляем списком
            pl, rest = [], facts
        plates = "".join(f'<div class="db-plate db-pl-{self.PLATES[k]}"><b>{v}</b><span>{k}</span></div>' for k, v in pl)
        dl = "<dl class=\"db-facts\">" + "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in rest) + "</dl>" if rest else ""
        return f'<div class="db-info">{f"<div class=db-plates>{plates}</div>" if plates else ""}{dl}</div>'

    def item_page(self, r):
        sec_name = self.meta["sections"].get(r["sec"], "")
        facts = [("Тип", esc(r["sub"] or sec_name))]
        q = r.get("quality")
        if q:
            cls = {"Магический": "db-q-magic", "Сюжетный": "db-q-story", "Хлам": "db-q-junk"}.get(q, "")
            facts.append(("Качество", f'<span class="db-tag {cls}">{esc(q)}</span>'))
        if not q and self.rarity(r) != "common":
            facts.append(("Редкость", f'<span class="db-tag db-q-{ {"magic": "magic", "story": "story", "rare": "rare"}.get(self.rarity(r), "junk") }">{ {"magic": "Зачарованный", "story": "Сюжетный", "rare": "Дорогой"}.get(self.rarity(r), "") }</span>'))
        if r.get("tier"):
            facts.append(("Уровень (тир)", str(r["tier"])))
        st = r.get("stats") or {}
        if st.get("damage"):
            a, b = st["damage"]
            facts.append(("Урон", f"{a:g}–{b:g}" if a != b else f"{a:g}"))
        if st.get("armor"):
            facts.append(("Броня", f"{st['armor']:g}"))
        if st.get("block"):
            facts.append(("Снижение урона блоком", f"{st['block']:g}%"))
        if st.get("mana"):
            facts.append(("Расход маны", f"{st['mana']:g}"))
        if r.get("req"):
            facts.append(("Требования", ", ".join(f"{esc(k)} {v}" for k, v in r["req"].items())))
        if r.get("weight") is not None:
            facts.append(("Вес", f"{r['weight']:g}"))
        if r.get("price") is not None:
            facts.append(("Цена", fmt(r["price"])))
        fish = r.get("fish")
        if fish:
            if fish.get("q"):
                facts.append(("Редкость улова", esc(fish["q"])))
            facts.append(("Вес рыбы", f"{fish['w'][0]:g}–{fish['w'][1]:g} кг"))
            facts.append(("Длина", f"{fish['l'][0]:g}–{fish['l'][1]:g} см"))
        facts += [(esc(k), v) for k, v in r.get("facts") or []]   # готовые пары из сборщика игры (значение — HTML)
        body = [f'<h1>{esc(r["name"])}</h1>']
        if r.get("en") and r["en"] != r["name"]:
            body.append(f'<p class="db-en" lang="en">{esc(r["en"])}</p>')
        rar = self.rarity(r)
        body.append(f'<div class="db-head db-card db-qc-{rar}">{self.figure(r.get("icon"), r["name"])}{self.facts_html(facts)}</div>')
        body.insert(0, self.scene(r["markers"], None))
        if r.get("desc"):
            body.append(f'<p class="db-text">{self.link_effects(r["desc"])}</p>')
        if r.get("flavor"):
            body.append(f'<p class="db-flavor">{r["flavor"]}</p>')
        if r.get("text"):
            body.append(f'<h2>Текст</h2>\n    <div class="db-book">{self.doc_imgs(r["text"])}</div>')
        if r.get("variants"):
            rows = []
            for v in r["variants"]:
                s = v.get("stats") or {}
                val = (f"{s['damage'][0]:g}–{s['damage'][1]:g}" if s.get("damage") else f"{s['armor']:g}" if s.get("armor") else "—")
                req = ", ".join(f"{esc(k)} {n}" for k, n in (v.get("req") or {}).items()) or "—"
                rows.append(f"<tr><td>{v.get('tier') or '—'}</td><td>{val}</td><td>{req}</td><td>{fmt(v['price']) if v.get('price') else '—'}</td></tr>")
            label = "Урон" if st.get("damage") else "Броня"
            body.append('<h2>Варианты по уровням</h2>\n    <div class="db-scroll"><table class="db-table"><thead><tr><th>Тир</th>'
                        f"<th>{label}</th><th>Требования</th><th>Цена</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div>")
        body.append(self.recipes(r))
        R = self.rel()
        effs = self.effects_in(r.get("desc"))
        body.append(self.chip_list("Эффекты", [self.chip("effects", e["slug"], e["name"], e.get("icon") or "", e["type"]) for e in effs]))
        qs = R["item_quests"].get(r["slug"], [])
        body.append(self.chip_list("Упоминается в заданиях", [self.quest_chip(q) for q in qs], len(qs)))
        sets = R["item_sets"].get(r["slug"], [])
        body.append(self.chip_list("Входит в комплекты", [self.chip("sets", s_["slug"], s_["name"], (s_["armor"][1] if len(s_["armor"]) > 1 else s_["armor"][0]).get("icon") or "", f"ур. {s_['level']}" if s_.get("level") else "") for s_ in sets], len(sets)))
        ach = R["item_ach"].get(r["slug"], [])
        body.append(self.chip_list("Нужен для достижений", [self.chip("achievements", a["slug"], a["name"], a.get("icon") or "") for a in ach], len(ach)))
        locs = R["item_locs"].get(r["slug"], [])
        body.append(self.chip_list("Лежит в локациях", [self.chip("locations", l["slug"], l["name"], (self.loc_pic(l["slug"]) or "q:loc"), l["kind"]) for l in locs[:30]], len(locs)))
        body.append(self.where(r["markers"], r["name"]))
        self.add_map_btn(body, r["markers"])
        body.append(self.merge_block(r) if r["slug"] in self.merged()[1] else self.variants_block(r))
        body.append(self.pager("items", self._pages_by_sec[r["sec"]], r))
        tab = "Книги и записки" if r["sec"] == "books" else sec_name or "Предметы"
        query = "?tab=books" if r["sec"] == "books" else f"?tab=items&sec={r['sec']}"
        desc = short(r.get("desc") or r.get("flavor") or r.get("text"), 150)
        meta = f"{r['name']} в {self.cfg['short']}: {(r['sub'] or sec_name).lower()}"
        if st.get("damage"):
            meta += f", урон {st['damage'][0]:g}–{st['damage'][1]:g}"
        if st.get("armor"):
            meta += f", броня {st['armor']:g}"
        meta += ". " + (desc + " " if desc else "") + ("Где найти — метки на карте." if r["markers"] else "")
        return shell(f"{r['name']} — {self.cfg['short']}", meta.strip()[:300], self.base() + f"items/{r['slug']}/",
                     "    " + "\n    ".join(b for b in body if b), self.crumbs(tab, r["name"], query))

    def quest_page(self, r):
        facts = [("Тип", esc(r["type"]))]
        if r.get("level"):
            facts.append(("Рекомендуемый уровень", str(r["level"])))
        facts += [(esc(k), v) for k, v in r.get("facts") or []]
        dl = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in facts)
        body = [f'<h1>{esc(r["name"])}</h1>']
        if r.get("en") and r["en"] != r["name"]:
            body.append(f'<p class="db-en" lang="en">{esc(r["en"])}</p>')
        qi = QUEST_ICON.get(r["type"], "task")
        body.append(f'<div class="db-head db-head-q"><div class="db-fig"><i class="db-qi db-qi-{qi}" aria-hidden="true"></i></div>'
                    f'<dl class="db-facts">{dl}</dl></div>')
        R = self.rel()
        its = R["quest_items"].get(r["slug"], [])
        lm = lambda t: self.link_mentions(t, ("quests", r["slug"]), its)
        body.insert(0, self.scene(r["markers"]))
        if r.get("desc"):
            body.append(f'<p class="db-text">{lm(r["desc"])}</p>')
        if r.get("objs"):
            body.append('<h2>Цели задания</h2>\n    <ul class="db-steps">' + "".join(f"<li>{lm(s)}</li>" for s in r["objs"]) + "</ul>")
        if r.get("steps"):
            body.append('<h2>Как пройти: этапы задания</h2>\n    <ol class="db-steps">' + "".join(f"<li>{lm(s)}</li>" for s in r["steps"]) + "</ol>")
            body.append('<p class="db-note">Этапы — записи журнала задания из файлов игры; ветки и необязательные цели идут подряд.</p>')
        body.append(self.chip_list("Предметы задания", [self.chip("items", x["slug"], x["name"], x.get("icon") or "", x["sub"]) for x in its], len(its)))
        who = R["quest_who"].get(r["slug"], [])
        body.append(self.chip_list("Персонажи и существа", [self.chip(k, x["slug"], x["name"], x.get("image") or "", "Существо" if k == "bestiary" else "Персонаж") for k, x in who], len(who)))
        locs = R["quest_locs"].get(r["slug"], [])
        body.append(self.chip_list("Локации", [self.chip("locations", l["slug"], l["name"], (self.loc_pic(l["slug"]) or "q:loc"), l["kind"]) for l in locs], len(locs)))
        body.append(self.where(r["markers"], r["name"]))
        self.add_map_btn(body, r["markers"])
        body.append(self.similar_chips("quests", r))
        body.append(self.pager("quests", self.data["quests"], r, lambda x: x["type"]))
        meta = f"Задание «{r['name']}» в {self.cfg['short']} ({r['type'].lower()}): "
        meta += short(" ".join(strip(s) for s in r.get("steps", [])[:3]) or r.get("desc"), 200)
        return shell(f"{r['name']} — задание {self.cfg['short']}", meta[:300], self.base() + f"quests/{r['slug']}/",
                     "    " + "\n    ".join(b for b in body if b), self.crumbs("Задания", r["name"], "?tab=quests"))

    def journal_page(self, kind, tab, r):
        body = [f'<h1>{esc(r["name"])}</h1>']
        if r.get("en") and r["en"] != r["name"]:
            body.append(f'<p class="db-en" lang="en">{esc(r["en"])}</p>')
        # факты: раздел, регионы, метки, локации, для существ — уровень и здоровье
        facts = [("Раздел", {"bestiary": "Бестиарий", "characters": "Персонаж", "lore": "Лор"}[kind])]
        maps = list(dict.fromkeys(self.map_names.get(m["map"], "") for m in r.get("markers") or []))
        if maps:
            facts.append(("Регион" if len(maps) == 1 else "Регионы", esc(", ".join(m for m in maps if m))))
        locs = r.get("locs") or []
        if locs:
            ls = ", ".join(f'<a href="/{self.base()}locations/{s_}/">{esc(n)}</a>' for s_, n, _ in locs[:3])
            facts.append(("Где встречается", ls + (f" и ещё {len(locs) - 3}" if len(locs) > 3 else "")))
        st = r.get("stats") or []
        if st:
            rng = lambda a, b: f"{fmt(a)}–{fmt(b)}" if a != b else fmt(a)
            lv = [x["lvl"] for x in st if x["lvl"]]
            if lv:
                facts.append(("Уровень", rng(min(lv), max(lv))))
            facts.append(("Здоровье", rng(min(x["hp"] for x in st), max(x["hp"] for x in st))))
            weak = list(dict.fromkeys(n for x in st for n, _ in x.get("weak", [])))
            if weak:
                facts.append(("Уязвимость", esc(", ".join(weak))))
            imm = list(dict.fromkeys(n for x in st for n, v in x.get("res", []) if v == 0))
            if imm:
                facts.append(("Иммунитет", esc(", ".join(imm))))
        gslug = {g["key"]: g["slug"] for g in self.data["guilds"]}
        facts += [(esc(k), f'<a href="/{self.base()}guilds/#{gslug[r["guild"]]}">{esc(v)}</a>' if k == "Гильдия" and r.get("guild") in gslug else v)
                  for k, v in r.get("facts") or []]
        if r.get("routine"):
            facts.append(("Распорядок", '<a href="#routine">по часам</a>'))
        if r.get("quests"):
            facts.append(("В заданиях", f'<a href="#quests">{len(r["quests"])}</a>'))
        if r.get("markers"):
            n = len(r["markers"])
            facts.append(("На карте", f'<a href="#where">{n} {plural(n, ("метка", "метки", "меток"))}</a>'))
        dl = self.facts_html(facts)
        lm = lambda t: self.link_mentions(t, (kind, r["slug"]))
        text = ([f'<p class="db-text">{lm(r["desc"])}</p>'] if r.get("desc") else []) + [f'<p class="db-text">{lm(m)}</p>' for m in r.get("more") or []]
        body.insert(0, self.scene(r.get("markers"), r.get("image")))
        if r.get("image"):
            body.append(f'<div class="db-hero">{self.figure(r["image"], r["name"], wide=True)}<div class="db-hero-text">{dl}{"".join(text)}</div></div>')
        else:
            if kind == "lore":
                body.append('<div class="db-fig db-fig-icon"><i class="db-qi db-qi-lore" aria-hidden="true"></i></div>')
            elif self.cfg.get({"bestiary": "beast_q", "characters": "person_q"}[kind]):
                q = self.cfg[{"bestiary": "beast_q", "characters": "person_q"}[kind]]
                body.append(f'<div class="db-fig db-fig-icon">{qi(q)}</div>')
            body.append(dl)
            body += text
        if kind == "characters" and r.get("routine"):
            body.append(self.routine_html(r))
        if st and "prot" in st[0]:   # Gothic: защита по типам урона, как на экране персонажа
            heads = [n for n, _ in st[0]["prot"]]
            named = any(x.get("name") for x in st)
            rows = "".join("<tr>" + (f"<td>{esc(x['name'] or r['name'])}</td>" if named else "") + f"<td>{x['lvl'] or '—'}</td><td>{fmt(x['hp'])}</td>"
                           f"<td>{x['str'] or '—'}</td>" + "".join(f"<td>{v or '—'}</td>" for _, v in x["prot"]) + f"<td>{x['xp'] or '—'}</td></tr>" for x in st)
            body.append('<h2>Характеристики</h2>\n    <div class="db-scroll"><table class="db-table"><thead><tr>' + ("<th>Вид</th>" if named else "")
                        + "<th>Уровень</th><th>Здоровье</th><th>Сила</th>" + "".join(f"<th>Защита {esc(h.lower())}</th>" for h in heads)
                        + f"<th>Опыт</th></tr></thead><tbody>{rows}</tbody></table></div>")
            body.append('<p class="db-note">Значения из определений существ в файлах игры. Строки — разновидности существа.</p>')
        elif st:
            rows = []
            for s_ in st:
                dm = lambda xs: ", ".join(f"{esc(n)}: иммунитет" if v == 0 else f"{esc(n)} {v}%" for n, v in xs) or "—"
                rows.append(f"<tr><td>{s_['lvl'] or '—'}</td><td>{fmt(s_['hp'])}</td><td>{s_['dmg']:g}</td><td>{s_['armor'] or '—'}</td>"
                            f"<td>{dm(s_['weak'])}</td><td>{dm(s_['res'])}</td><td>{s_['xp'] or '—'}</td></tr>")
            body.append('<h2>Характеристики</h2>\n    <div class="db-scroll"><table class="db-table"><thead><tr><th>Уровень</th><th>Здоровье</th>'
                        '<th>Урон</th><th>Броня</th><th>Уязвим (урон)</th><th>Устойчив (урон)</th><th>Опыт</th></tr></thead>'
                        f"<tbody>{''.join(rows)}</tbody></table></div>")
            body.append('<p class="db-note">Значения из шаблонов существ в файлах игры, без поправок на сложность. '
                        'Строки — разновидности существа; «уязвим 120%» значит, что этот тип урона проходит на 20% сильнее.</p>')
        if locs:
            lis = "".join(self.chip("locations", s_, n, (self.loc_pic(s_) or "q:loc"), k_) for s_, n, k_ in locs)
            body.append(f'<h2>Где встречается <span class="cp-n">{len(locs)}</span></h2>\n    <ul class="db-links">{lis}</ul>')
        if r.get("quests"):
            lis = "".join(f'<li><a class="db-link" href="/{self.base()}quests/{s_}/"><i class="db-qi db-qi-{QUEST_ICON.get(t, "task")}" aria-hidden="true"></i>'
                          f'<span>{esc(n)}<small>{esc(t)}</small></span></a></li>' for s_, n, t in r["quests"])
            body.append(f'<h2 id="quests">Упоминается в заданиях <span class="cp-n">{len(r["quests"])}</span></h2>\n    <ul class="db-links">{lis}</ul>')
        body.append(self.mentioned_block(kind, r["slug"]))
        body.append(self.where(r["markers"], r["name"]))
        self.add_map_btn(body, r["markers"])
        body.append(self.similar_chips(kind, r))
        body.append(self.pager(kind, self.data[kind], r))
        what = {"bestiary": "бестиарий", "characters": "персонаж", "lore": "лор"}[kind]
        meta = f"{r['name']} — {what} {self.cfg['short']}. " + short(r.get("desc"), 220)
        og = self.img(r.get("image")) or None
        return shell(f"{r['name']} — {tab.lower()} {self.cfg['short']}", meta[:300], self.base() + f"{kind}/{r['slug']}/",
                     "    " + "\n    ".join(b for b in body if b), self.crumbs(tab, r["name"], f"?tab={kind}"), og=og)

    def loc_pic(self, slug):
        """Картинка локации для плашки: первый скриншот из попапа (полный адрес) или пусто."""
        if not hasattr(self, "_loc_pics"):
            self._loc_pics = {}
            for l in self.data["locations"]:
                sh = self.shot_list(l["markers"])
                if sh:
                    self._loc_pics[l["slug"]] = sh[0][0]
        return self._loc_pics.get(slug, "")
    def location_page(self, r):
        facts = [("Тип", esc(r["kind"]))]
        if r.get("en") and r["en"] != r["name"]:
            facts.append(("В оригинале", f'<span lang="en">{esc(r["en"])}</span>'))
        facts += [(esc(k), v.replace('href="../', f'href="/{self.base()}locations/')) for k, v in r.get("facts") or []]
        dl = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in facts)
        body = [self.scene(r.get("markers"), r.get("image")), f'<h1>{esc(r["name"])}</h1>']
        desc = f'<p class="db-text">{self.link_mentions(r["desc"], ("locations", r["slug"]))}</p>' if r.get("desc") else ""   # Gothic: текст глоссария игры
        if r.get("image"):
            body.append(f'<div class="db-hero">{self.figure(r["image"], r["name"], wide=True)}<div class="db-hero-text"><dl class="db-facts">{dl}</dl>{desc}</div></div>')
        else:
            body.append(f'<div class="db-head db-head-q"><div class="db-fig"><i class="db-qi db-qi-loc" aria-hidden="true"></i></div><dl class="db-facts">{dl}</dl></div>' + desc)
        if r.get("children"):
            lis = "".join(self.chip("locations", s, n, self.loc_pic(s) or "q:loc", k_) for s, n, k_ in r["children"])
            body.append(f'<h2>Места внутри <span class="cp-n">{len(r["children"])}</span></h2>\n    <ul class="db-links">{lis}</ul>')
        best = {b["slug"]: b for b in self.data["bestiary"]}
        chars = {c["slug"]: c for c in self.data["characters"]}
        if r["enemies"]:
            lis = "".join(self.chip(k, s, n, (best.get(s) or {}).get("image") or self.cfg.get("beast_q", "")) for k, s, n in r["enemies"])
            body.append(f'<h2>Противники <span class="cp-n">{len(r["enemies"])}</span></h2>\n    <ul class="db-links">{lis}</ul>')
        if r["people"]:
            lis = "".join(self.chip(k, s, n, (chars.get(s) or {}).get("image") or self.cfg.get("person_q", "")) for k, s, n in r["people"])
            body.append(f'<h2>Персонажи <span class="cp-n">{len(r["people"])}</span></h2>\n    <ul class="db-links">{lis}</ul>')
        if r["items"]:
            lis = "".join(self.chip("items", s, n, ic, sub) for s, n, ic, sub in r["items"])
            body.append(f'<h2>Предметы <span class="cp-n">{len(r["items"])}</span></h2>\n    <ul class="db-links">{lis}</ul>'
                        '\n    <p class="db-note">Предметы, которые разложены в этой локации вручную (без случайной добычи).</p>')
        if r["quests"]:
            lis = "".join(f'<li><a href="/{self.base()}quests/{s}/">{esc(n)}</a><small>{esc(t)}</small></li>' for s, n, t in r["quests"])
            body.append(f'<h2>Упоминается в заданиях <span class="cp-n">{len(r["quests"])}</span></h2>\n    <ul class="db-where">{lis}</ul>')
        body.append(self.mentioned_block("locations", r["slug"]))
        body.append(self.where(r["markers"], r["name"]))
        self.add_map_btn(body, r["markers"])
        body.append(self.similar_chips("locations", r))
        body.append(self.pager("locations", self.data["locations"], r, lambda x: x["kind"]))
        parts = []
        if r["enemies"]:
            parts.append("противники: " + ", ".join(n for _, _, n in r["enemies"][:5]))
        if r["items"]:
            parts.append(f"предметов: {len(r['items'])}")
        meta = f"{r['name']} — {r['kind'].lower()} в {self.cfg['short']}. " + "; ".join(parts) + ("." if parts else "") + (" Метки на карте." if r["markers"] else "")
        sh = self.shot_list(r["markers"])
        return shell(f"{r['name']} — {r['kind'].lower()} {self.cfg['short']}", meta[:300], self.base() + f"locations/{r['slug']}/",
                     "    " + "\n    ".join(b for b in body if b), self.crumbs("Локации", r["name"], "?tab=locations"), og=sh[0][0] if sh else None)

    @staticmethod
    def talent_card(nd):
        req = []
        if nd.get("after"):
            req.append("после " + " или ".join(f"«{esc(x)}»" for x in [nd["after"]] + (nd.get("also") or [])))
        if nd.get("req"):
            req.append(f"очков в дереве: {nd['req']}")
        lv = nd["levels"]
        if len(lv) > 1:
            ranks = "<ol class=\"db-ranks\">" + "".join(f"<li>{d or '—'}</li>" for d in lv) + "</ol>"
        else:
            ranks = f'<p>{lv[0] if lv else ""}</p>'
        return (f'<section class="db-tal" id="{esc(nd["slug"])}" style="--d:{nd["depth"]}"><h3>{esc(nd["name"])}'
                f'{f"<small>{esc(nd["en"])}</small>" if nd.get("en") else ""}</h3>'
                f'{f"<p class=\"db-note\">{"; ".join(req)}</p>" if req else ""}{ranks}</section>')

    def talent_fragment(self, t):
        """Схема дерева для вкладки «Таланты» каталога: вставляется js/db-catalog.js по выбору дерева.
        Узлы ведут на страницу дерева; карточки для подсказок — в <template> (в DOM не попадают)."""
        tree = talent_tree(t, self.img, f"/{self.base()}talents/{t['slug']}/")
        if not tree:
            return ""
        cards = "".join(self.talent_card(nd) for st in t["subtrees"] for nd in st["talents"])
        return TREE_STAR + tree.replace('<div class="db-tree" ', f'<div class="db-tree" data-page="/{self.base()}talents/{t["slug"]}/" ', 1) + f'<template class="db-tree-cards">{cards}</template>'

    def talent_page(self, t):
        n = sum(len(st["talents"]) for st in t["subtrees"])
        body = [f'<h1>Таланты: {esc(t["name"])}</h1>']
        facts = [("Ветви", ", ".join(esc(st["name"]) for st in t["subtrees"] if st["name"]) or "—"), ("Талантов", str(n))]
        if t.get("flag"):
            facts.append(("Открывается", "по ходу сюжета"))
        dl = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in facts)
        body.append(f'<div class="db-head">{self.figure(t.get("icon"), t["name"])}<dl class="db-facts">{dl}</dl></div>')
        other = " · ".join(f'<a href="/{self.base()}talents/{o["slug"]}/">{esc(o["name"])}</a>' for o in self.data["talents"] if o is not t)
        body.append(f'<p class="db-note">Другие деревья: {other}</p>')
        tree = talent_tree(t, self.img)
        if tree:
            body.append(TREE_STAR)
            body.append(tree)
            body.append('<p class="db-note">Раскладка — как на экране персонажа в игре. Нажмите на узел — название и ранги таланта. Кнопки над схемой приближают ветвь; на телефоне можно просто нажать на ветвь.</p>')
        lst = []
        for st in t["subtrees"]:
            lst.append(f'<h2>{esc(st["name"] or "Ветвь")} <span class="cp-n">{len(st["talents"])}</span></h2>')
            cards = [self.talent_card(nd) for nd in st["talents"]]
            lst.append('<div class="db-tals">' + "".join(cards) + "</div>")
        # под схемой список прячется под спойлер (открывается сам, если ссылка ведёт на талант, — js/db-tree.js)
        body.append(f'<details class="db-spoiler"{"" if tree else " open"}><summary><span>Все таланты списком</span><small>{n}</small></summary>'
                    + "".join(lst) + "</details>")
        body.append('<p class="db-note">Описания рангов — из файлов игры; числа подставлены из параметров таланта. «?» — значение считается в игре на лету.</p>')
        meta = f"Дерево талантов «{t['name']}» в {self.cfg['short']}: {pn(n, 'talent')} по ветвям — " + ", ".join(st["name"] for st in t["subtrees"] if st["name"]) + ". Что даёт каждый ранг."
        return shell(f"Таланты «{t['name']}» — {self.cfg['short']}", meta[:300], self.base() + f"talents/{t['slug']}/",
                     "    " + "\n    ".join(body), self.crumbs("Таланты", t["name"], "?tab=talents"), og=self.img(t.get("icon")) or None,
                     scripts='\n    <script src="/js/db-tree.js?v=4" defer></script>')

    def effect_page(self, r):
        facts = [("Тип", esc(r["type"]))]
        dl = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in facts)
        body = [f'<h1>{esc(r["name"])}</h1>']
        if r.get("en") and r["en"] != r["name"]:
            body.append(f'<p class="db-en" lang="en">{esc(r["en"])}</p>')
        body.append(f'<div class="db-head">{self.figure(r.get("icon"), r["name"])}<dl class="db-facts">{dl}</dl></div>')
        if r.get("desc"):
            body.append(f'<p class="db-text">{r["desc"]}</p>')
        its = self.rel()["effect_items"].get(r["slug"], [])
        body.append(self.chip_list("Предметы с этим эффектом", [self.chip("items", x["slug"], x["name"], x.get("icon") or "", x["sub"]) for x in its[:60]], len(its)))
        body.append(self.pager("effects", self.data["effects"], r, lambda x: x["type"]))
        meta = f"Эффект «{r['name']}» в {self.cfg['short']} ({r['type'].lower()}). " + short(r.get("desc"), 220)
        return shell(f"{r['name']} — эффект {self.cfg['short']}", meta[:300], self.base() + f"effects/{r['slug']}/",
                     "    " + "\n    ".join(b for b in body if b), self.crumbs("Эффекты", r["name"], "?tab=effects"))

    def tips_page(self):
        tips = self.data["tips"]
        title = self.cfg.get("tips_title", "Обучающие подсказки")
        lead = self.cfg.get("tips_lead", "").format(n=len(tips), game=esc(self.cfg["game"]))
        body = [f'<h1>{esc(title)}</h1>',
                f'<p class="cp-lead">{lead}</p>' if lead else f'<p class="cp-lead">Все {len(tips)} обучающих сообщений {esc(self.cfg["game"])} — как в игре. Клавиши указаны по умолчанию: сначала клавиатура и мышь, через «/» — геймпад (Xbox · PlayStation). Если вы меняли управление, смотрите свои настройки.</p>']
        for t in tips:
            figs, text = split_figs(t["text"])
            body.append(f'<section class="db-tip" id="{esc(t["slug"])}"><h2>{esc(t["name"])}</h2>{self.doc_imgs(figs)}<p class="db-text">{text}</p></section>')
        meta = f"{title} {self.cfg['short']}: " + ", ".join(t["name"] for t in tips[:8]) + " и другие — полный текст на русском."
        return shell(f"{title} — {self.cfg['short']}", meta[:300], self.base() + "tips/",
                     "    " + "\n    ".join(body), self.crumbs("Подсказки", None, "?tab=tips")[:-1] + [("Подсказки", "")])

    # ---------- достижения, комплекты, метки игры ----------
    def achievement_page(self, r):
        facts = [("Получили", f"{r['pct']:g}% игроков Steam" if r.get("pct") is not None else "—")]
        if r.get("hidden"):
            facts.append(("Тип", "Скрытое — в игре описание видно только после получения"))
        for label, n in r["progress"]:
            facts.append(("Условие", f"{esc(label)}: {fmt(n)}"))
        dl = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in facts)
        body = [f'<h1>{esc(r["name"])}</h1>', f'<p class="db-en" lang="en">{esc(r["en"])}</p>',
                f'<div class="db-head">{self.figure(r.get("icon"), r["name"])}<dl class="db-facts">{dl}</dl></div>',
                f'<p class="db-text">{esc(r["desc"])}</p>']
        if r["items"]:
            body.append(f'<h2>Нужно найти <span class="cp-n">{len(r["items"])}</span></h2>\n    <ul class="db-links">'
                        + "".join(self.chip("items", i["slug"], i["name"], i.get("icon") or "") for i in r["items"]) + "</ul>")
        if r["enemies"]:
            body.append('<h2>Противник</h2>\n    <ul class="db-links">'
                        + "".join(self.chip("bestiary", e["slug"], e["name"], e.get("image") or "") for e in r["enemies"]) + "</ul>")
        if r["weapons"]:
            body.append('<h2>Оружие, которым засчитывается</h2>\n    <ul class="db-links">'
                        + "".join(self.chip("items", i["slug"], i["name"], i.get("icon") or "") for i in r["weapons"]) + "</ul>")
        body.append('<p class="db-note">Название и описание — из русской версии Steam; условия, счётчики и предметы — из файлов игры, '
                    'доля игроков — глобальная статистика Steam.</p>')
        meta = f"Достижение «{r['name']}» в {self.cfg['short']}: {r['desc']} Как получить" + (f", получили {r['pct']:g}% игроков." if r.get("pct") is not None else ".")
        return shell(f"{r['name']} — достижение {self.cfg['short']}", meta[:300], self.base() + f"achievements/{r['slug']}/",
                     "    " + "\n    ".join(body), self.crumbs("Достижения", r["name"], "?tab=achievements"))

    def set_page(self, r):
        facts = [("Регион", esc(r["region"])), ("Стиль боя", esc(r["role"]))]
        if r.get("level"):
            facts.append(("Уровень героя", str(r["level"])))
        dl = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in facts)
        body = [f'<h1>Комплект «{esc(r["name"])}»</h1>', f'<dl class="db-facts">{dl}</dl>',
                f'<p class="db-text">Набор снаряжения из файлов игры: так разработчики экипируют героя-{esc(r["role"].split()[0])}а '
                f'{r["level"]}-го уровня для региона «{esc(r["region"])}». Это ориентир, а не бонус за комплект — в игре нет бонусов за ношение набора целиком.</p>'
                if r.get("level") else ""]
        def note(i):
            return i["sub"] + (f" · тир {i['tier']}" if i.get("tier") else "")
        body.append(f'<h2>Броня и украшения <span class="cp-n">{len(r["armor"])}</span></h2>\n    <ul class="db-links">'
                    + "".join(self.chip("items", i["slug"], i["name"], i.get("icon") or "", note(i)) for i in r["armor"]) + "</ul>")
        if r["gear"]:
            body.append(f'<h2>Оружие и магия <span class="cp-n">{len(r["gear"])}</span></h2>\n    <ul class="db-links">'
                        + "".join(self.chip("items", i["slug"], i["name"], i.get("icon") or "", note(i)) for i in r["gear"]) + "</ul>")
        other = " · ".join(f'<a href="/{self.base()}sets/{o["slug"]}/">{esc(o["name"])}</a>' for o in self.data["sets"] if o is not r)
        body.append(f'<p class="db-note">Другие комплекты: {other}</p>')
        meta = (f"Комплект снаряжения {self.cfg['short']} «{r['name']}» (уровень {r['level']}): "
                + ", ".join(i["name"] for i in r["armor"][:6]) + " и оружие — из файлов игры.")
        return shell(f"Комплект «{r['name']}» — {self.cfg['short']}", meta[:300], self.base() + f"sets/{r['slug']}/",
                     "    " + "\n    ".join(b for b in body if b), self.crumbs("Комплекты", r["name"], "?tab=sets"))

    def markers_page(self):
        cnt = {}
        for m in self.markers.values():
            cnt[m.get("category")] = cnt.get(m.get("category"), 0) + 1
        folder = self.cfg["folder"]
        def cat_link(k):
            name = self.cat_names.get(k, k)
            n = cnt.get(k, 0)
            if os.path.exists(os.path.join(ROOT, folder, "c", k.replace("_", "-"), "index.html")):
                return f'<a href="/{folder}/c/{k.replace("_", "-")}/">{esc(name)}</a> <small>{fmt(n)}</small>'
            return f"{esc(name)} <small>{fmt(n)}</small>"
        rows = []
        for t in self.data["markers"]:
            pics = "".join(f'<img src="{esc(self.img(a))}" alt="" title="{esc(lbl)}" width="40" height="40" loading="lazy" decoding="async">'
                           for a, lbl in t["icons"])
            ours = ", ".join(cat_link(k) for k in t["cats"]) or '<span class="db-muted">нет на нашей карте</span>'
            rows.append(f'<tr id="{esc(t["slug"])}"><td class="db-mk-pics">{pics}</td><td><b>{esc(t["name"])}</b><br><small lang="en">{esc(t["en"])}</small></td>'
                        f'<td>{esc(t["desc"])}</td><td>{ours}</td></tr>')
        body = ['<h1>Метки на карте игры</h1>',
                f'<p class="cp-lead">Все {pn(len(self.data["markers"]), "type")} меток, которые {esc(self.cfg["game"])} рисует на своей карте и компасе, — '
                'с иконками из файлов игры (у меток персонажей — варианты «дружественный», «враждебный», «в бою»). '
                'В последней колонке — какие категории нашей интерактивной карты им соответствуют и сколько у нас таких меток.</p>',
                '<div class="db-scroll"><table class="db-table db-mk"><thead><tr><th>Иконки</th><th>Метка игры</th><th>Что отмечает</th>'
                f'<th>Категории нашей карты</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div>',
                '<p class="db-note">Своих названий у этих меток в игре нет (на карте видна только иконка) — названия даны по назначению.</p>',
                self.sec_nav("markers")]
        meta = f"Типы меток карты {self.cfg['short']}: " + ", ".join(t["name"] for t in self.data["markers"][:10]) + " — иконки из игры и категории интерактивной карты."
        return shell(f"Метки на карте игры — {self.cfg['short']}", meta[:300], self.base() + "markers/",
                     "    " + "\n    ".join(body), self.crumbs("Метки игры", None, "?tab=markers")[:-1] + [("Метки игры", "")])

    def spells_page(self):
        if any(r.get("level") is not None and "heal" not in r for r in self.data["spells"]):
            return self.spells_page_tes()
        b = "/" + self.base()
        def link(slug, label):
            return f'<a href="{b}items/{slug}/">{label}</a>' if slug else ""
        def dmg(r):
            if r["heal"]:
                return "Лечение: " + ", ".join(f"{fmt(v)}" + (f" <small>({k}-й круг)</small>" if k else "") for k, v in r["heal"])
            out = []
            for i, (el, base, by) in enumerate(r["dmg"]):
                lvl = f"<small>ступень {i + 1}:</small> " if len(r["dmg"]) > 1 else ""
                tail = ", ".join(f"{fmt(v)} <small>({k}-й круг)</small>" for k, v in by)
                out.append(f"{lvl}{fmt(base)}" + (f" → {tail}" if tail else ""))
            return (f'<small>{esc(r["dmg"][0][0].replace("Урон ", "").strip("()"))}</small><br>' if r["dmg"] else "") + "<br>".join(out) or "—"
        groups, order = {}, []
        for r in self.data["spells"]:
            g = "Руны и свитки" if r["kind"] in ("Руна и свиток", "Только руна", "Только свиток") else r["kind"]
            if g not in groups:
                groups[g] = []; order.append(g)
            groups[g].append(r)
        body = ['<h1>Заклинания</h1>',
                f'<p class="cp-lead">Все {len(self.data["spells"])} заклинаний {esc(self.cfg["game"])} из файлов игры: круг магии, школа, '
                'расход маны и урон по кругам. Урон растёт с вашим кругом магии: «20 → 30 (2-й круг)» значит 20 на минимальном круге и 30 со второго. '
                'У заряжаемых заклинаний (огненный шар, шаровая молния) урон и мана даны по ступеням заряда.</p>',
                '<nav class="db-toc">' + " · ".join(f'<a href="#g{i}">{esc(g)}</a> <small>{len(groups[g])}</small>' for i, g in enumerate(order)) + '</nav>']
        for i, g in enumerate(order):
            rows = []
            for r in groups[g]:
                pic = f'<img src="{esc(self.img(r["icon"]))}" alt="" width="40" height="40" loading="lazy" decoding="async">' if r["icon"] else ""
                src = " · ".join(x for x in (link(r["rune"], "руна"), link(r["scroll"], "свиток")) if x)
                m = r["mana"] or []
                mana = (" + ".join(fmt(x) for x in m) if len(set(m)) > 1 else fmt(m[0])) if m else "—"
                rows.append(f'<tr id="{esc(r["slug"])}"><td class="db-mk-pics">{pic}</td><td><b>{esc(r["name"])}</b><br><small lang="en">{esc(r["en"])}</small>'
                            f'{f"<br><small>{src}</small>" if src else ""}</td>'
                            f'<td>{r["circle"] if r["circle"] else "—"}</td><td>{esc(r["school"] or "—")}</td>'
                            f'<td>{mana}{f"<br><small>{esc(r["use"])}</small>" if r["use"] and m else ""}</td>'
                            f'<td>{dmg(r)}</td><td>{f"{r['range']:g} м" if r["range"] else "—"}</td><td>{esc(r["desc"])}</td></tr>')
            body.append(f'<h2 id="g{i}">{esc(g)} <span class="cp-n">{len(groups[g])}</span></h2>')
            body.append('<div class="db-scroll"><table class="db-table db-mk db-spells"><thead><tr><th></th><th>Заклинание</th><th>Круг</th><th>Школа</th>'
                        f'<th>Мана</th><th>Урон / лечение</th><th>Дальность</th><th>Описание</th></tr></thead><tbody>{"".join(rows)}</tbody></table></div>')
        body += ['<p class="db-note">Круг — требование руны (свиток можно читать без круга). Значения взяты из настроек заклинаний и оружия-заклинаний в файлах игры, без поправок на сложность и защиту цели.</p>',
                 self.sec_nav("spells")]
        meta = f"Заклинания {self.cfg['short']}: круг магии, мана, урон по кругам — " + ", ".join(r["name"] for r in self.data["spells"][:8]) + "."
        return shell(f"Заклинания — {self.cfg['short']}", meta[:300], self.base() + "spells/",
                     "    " + "\n    ".join(body), self.crumbs("Заклинания", None, "?tab=spells")[:-1] + [("Заклинания", "")])

    def spells_page_tes(self):
        b = "/" + self.base()
        groups, order = {}, []
        for r in self.data["spells"]:
            g = r["school"] if r["kind"] == "Заклинание" else "Крики"
            if g not in groups:
                groups[g] = []; order.append(g)
            groups[g].append(r)
        lvl = {"Новичок": 0, "Ученик": 1, "Адепт": 2, "Эксперт": 3, "Мастер": 4}
        order.sort(key=lambda g: (g == "Крики", g))
        body = ['<h1>Заклинания и крики</h1>',
                f'<p class="cp-lead">Все {len(self.data["spells"])} заклинаний из томов и криков {esc(self.cfg["game"])} — из файлов игры: школа, '
                'уровень, базовая стоимость в магии и действие. У криков — три слова силы на драконьем языке с переводом и время восстановления после каждого слова.</p>',
                '<nav class="db-toc">' + " · ".join(f'<a href="#g{i}">{esc(g)}</a> <small>{len(groups[g])}</small>' for i, g in enumerate(order)) + '</nav>']
        for i, g in enumerate(order):
            rows = []
            if g == "Крики":
                for r in groups[g]:
                    words = "<br>".join(f'<b class="sk-dw">{esc(w)}</b> — {esc(t)}' for w, t in r["words"])
                    rec = " / ".join(f"{x:g}" for x in r.get("recovery") or [])
                    rows.append(f'<tr id="{esc(r["slug"])}"><td class="db-mk-pics">{qi(r["icon"])}</td><td><b>{esc(r["name"])}</b>'
                                f'{f"<br><small lang=\"en\">{esc(r["en"])}</small>" if r["en"] else ""}</td><td>{words}</td>'
                                f'<td>{rec or "—"} с</td><td>{self.link_effects(r["desc"])}</td></tr>')
                head = "<th></th><th>Крик</th><th>Слова силы</th><th>Восстановление</th><th>Описание</th>"
            else:
                for r in sorted(groups[g], key=lambda r: (lvl.get(r["level"], 9), r["name"])):
                    tome = f'<br><small><a href="{b}items/{r["tome"]}/">том заклинания</a></small>' if r.get("tome") else ""
                    rows.append(f'<tr id="{esc(r["slug"])}"><td class="db-mk-pics">{qi(r["icon"])}</td><td><b>{esc(r["name"])}</b>'
                                f'{f"<br><small lang=\"en\">{esc(r["en"])}</small>" if r["en"] else ""}{tome}</td>'
                                f'<td>{esc(r["level"] or "—")}</td><td>{r["cost"] or "—"}</td><td>{self.link_effects(r["desc"])}</td></tr>')
                head = "<th></th><th>Заклинание</th><th>Уровень</th><th>Магия</th><th>Действие</th>"
            body.append(f'<h2 id="g{i}">{esc(g)} <span class="cp-n">{len(groups[g])}</span></h2>')
            body.append(f'<div class="db-scroll"><table class="db-table db-mk db-spells"><thead><tr>{head}</tr></thead><tbody>{"".join(rows)}</tbody></table></div>')
        body += ['<p class="db-note">Стоимость — базовая, без навыка и перков школы. Числа в описаниях — сила и длительность из файлов игры.</p>',
                 self.sec_nav("spells")]
        meta = f"Заклинания и крики {self.cfg['short']}: школы магии, уровень, стоимость, слова силы — " + ", ".join(r["name"] for r in self.data["spells"][:8]) + "."
        return shell(f"Заклинания и крики — {self.cfg['short']}", meta[:300], self.base() + "spells/",
                     "    " + "\n    ".join(body), self.crumbs("Заклинания", None, "?tab=spells")[:-1] + [("Заклинания", "")])

    def guilds_page(self):
        b = "/" + self.base()
        gl = {g["key"]: g for g in self.data["guilds"]}
        def gname(t, names):
            n = names.get(t, t)
            return f'<a href="#{gl[t]["slug"]}">{esc(n)}</a>' if t in gl else esc(n)
        REL_ORDER = ("друзья", "нейтральны", "недружелюбны", "враги", "нападают")
        RANK_ORDER = ("старше", "равны", "младше", "презирают")
        RANK_LBL = {"старше": "Выше по рангу", "равны": "Равны", "младше": "Ниже по рангу", "презирают": "Считают отбросами"}
        REL_LBL = {"друзья": "Дружат с", "нейтральны": "Нейтральны к", "недружелюбны": "Недружелюбны к", "враги": "Враждуют с", "нападают": "Нападают на"}
        camps, order = {}, []
        for g in self.data["guilds"]:
            if g["camp"] not in camps:
                camps[g["camp"]] = []; order.append(g["camp"])
            camps[g["camp"]].append(g)
        body = ['<h1>Гильдии и отношения</h1>',
                f'<p class="cp-lead">Как гильдии {esc(self.cfg["game"])} относятся друг к другу — по таблицам отношений из файлов игры. '
                'От отношения зависит, заступятся ли за вас, поднимут ли тревогу и нападут ли при встрече. '
                '«Без гильдии» — так к вам относятся, пока вы не вступили ни в один лагерь. Отношение к своей гильдии в списках не повторяется.</p>',
                '<nav class="db-toc">' + " · ".join(f'<a href="#{g["slug"]}">{esc(g["name"])}</a>' for g in self.data["guilds"]) + '</nav>']
        for camp in order:
            body.append(f'<h2>{esc(camp)}</h2>')
            for g in camps[camp]:
                names = g["names"]
                dl = []
                for k in REL_ORDER:
                    ts = [t for t in g["rel"].get(k, []) if t != g["key"]]
                    if ts:
                        dl.append((REL_LBL[k], ", ".join(gname(t, names) for t in ts)))
                for k in RANK_ORDER:
                    ts = g["rank"].get(k, [])
                    if ts:
                        dl.append((RANK_LBL[k], ", ".join(gname(t, names) for t in ts)))
                if g["protect"]:
                    dl.append(("Заступаются за", ", ".join(gname(t, names) for t in g["protect"])))
                if g["after"]:
                    by = {}
                    for t, v in g["after"].items():
                        by.setdefault(v, []).append(t)
                    dl.append(("После гибели магов огня", "; ".join(f"{esc(v)}: " + ", ".join(gname(t, names) for t in ts) for v, ts in by.items())))
                facts = '<dl class="db-facts">' + "".join(f"<dt>{a}</dt><dd>{v}</dd>" for a, v in dl) + "</dl>" if dl else ""
                mem = ""
                if g["members"]:
                    mem = (f'<p class="db-note">Участники ({len(g["members"])}): '
                           + ", ".join(f'<a href="{b}characters/{s}/">{"<b>" + esc(n) + "</b>" if lead else esc(n)}</a>' for s, n, lead in g["members"])
                           + (" — жирным глава." if any(x[2] for x in g["members"]) else "") + "</p>")
                body.append(f'<section class="db-guild" id="{esc(g["slug"])}"><h3>{esc(g["name"])}</h3>{facts}{mem}</section>')
        body += ['<p class="db-note">Отношения складываются из нескольких правил с разным весом (лагерь, гильдия, особые случаи) — здесь показан итог, '
                 'который действует в начале игры. Личные исключения отдельных NPC и сюжетные события, кроме гибели магов огня, не учтены.</p>',
                 self.sec_nav("guilds")]
        meta = f"Гильдии {self.cfg['short']} и их отношения: кто с кем дружит, кто кого старше по рангу, кто за кого заступается — " + ", ".join(g["name"] for g in self.data["guilds"][:8]) + "."
        return shell(f"Гильдии и отношения — {self.cfg['short']}", meta[:300], self.base() + "guilds/",
                     "    " + "\n    ".join(body), self.crumbs("Гильдии", None, "?tab=guilds")[:-1] + [("Гильдии", "")])

    def routine_html(self, r):
        rt = r.get("routine")
        if not rt:
            return ""
        rows = "".join(f"<tr><td>{esc(t)}</td><td>{esc(a)}</td><td>{esc(p) or '—'}</td></tr>" for t, a, p in rt["day"])
        out = ['<h2 id="routine">Распорядок дня</h2>',
               f'<div class="db-scroll"><table class="db-table db-routine"><thead><tr><th>С</th><th>Занятие</th><th>Где</th></tr></thead><tbody>{rows}</tbody></table></div>']
        if rt.get("rain"):
            out.append('<p class="db-note">В дождь: ' + "; ".join(f"с {esc(t)} — {esc(a.lower())}" + (f" ({esc(p)})" if p else "") for t, a, p in rt["rain"]) + ".</p>")
        out.append('<p class="db-note">Обычный день из файлов игры; по сюжету распорядок меняется.</p>')
        return "\n    ".join(out)

    # ---------- страницы разделов (статичные списки ссылок: по ним поисковики находят все записи) ----------
    def sections(self):
        """[(путь, вкладка, заголовок, описание, лид, [(id группы, имя группы, [(href, имя, подпись)])])]"""
        g, full, b = self.cfg["short"], self.cfg["game"], "/" + self.base()
        host_of = self.merged()[0]
        items = [r for r in self.data["items"] if r["sec"] != "books" and r["slug"] not in host_of]
        books = [r for r in self.data["items"] if r["sec"] == "books" and r["slug"] not in host_of]

        def grouped(rows, key, names=None):
            by = {}
            for r in rows:
                by.setdefault(key(r), []).append(r)
            order = list(names) if names else sorted(by, key=lambda k: -len(by[k]))
            return [(k, (names or {}).get(k, k), by[k]) for k in order if k in by]

        def lst(rows, path, small=lambda r: ""):
            return [(f"{b}{path}/{r['slug']}/", r["name"], small(r)) for r in sorted(rows, key=lambda r: r["name"].lower())]

        secs = self.meta["sections"]
        out = []
        grp = [(k, n, lst(rs, "items", lambda r: r["sub"] + (f" · тир {r['tier']}" if r.get("tier") else "")))
               for k, n, rs in grouped(items, lambda r: r["sec"], secs)]
        out.append(("items", "Предметы", f"Все предметы {full} — оружие, броня, зелья, рецепты",
                    f"Все предметы {full} на русском: {pn(len(items), 'rec')} — оружие, броня, украшения, магия, зелья, материалы и рецепты. "
                    "Характеристики, крафт и где найти на карте.",
                    f"Все {pn(len(items), 'item')} {full} по разделам — названия как в русской версии игры. У записи: характеристики, рецепты и метки на карте.", grp))
        out.append(("books", "Книги и записки", f"Книги и записки {full} — полные тексты",
                    f"Книги и записки {full} — {len(books)} текстов на русском, как в игре, и где их найти на карте.",
                    f"Все {pn(len(books), 'book')} {full} с полным текстом.", [("", "", lst(books, "items"))]))
        qorder = {t: 0 for t in self.meta.get("quest_types") or ("Основное", "Побочное", "Задача")}
        grp = [(QUEST_ICON.get(k, "task"), {"Основное": "Основные задания", "Побочное": "Побочные задания", "Задача": "Задачи"}.get(k, k),
                lst(rs, "quests", lambda r: f"ур. {r['level']}" if r.get("level") else ""))
               for k, _, rs in grouped(self.data["quests"], lambda r: r["type"], qorder)]
        out.append(("quests", "Задания", f"Все задания {full} — основные и побочные квесты",
                    f"Все задания {full} на русском: {len(self.data['quests'])} квестов — основные, побочные и задачи, с этапами из журнала и метками на карте.",
                    f"Все {pn(len(self.data['quests']), 'quest')} {full} — этапы из журнала, награды и места на карте.", grp))
        out.append(("bestiary", "Бестиарий", f"Бестиарий {full} — все враги и монстры",
                    f"Бестиарий {full} — {pn(len(self.data['bestiary']), 'beast')} с характеристиками, уязвимостями и местами обитания.",
                    f"Все существа бестиария {full} — описания из игры, характеристики и где встречаются.",
                    [("", "", lst(self.data["bestiary"], "bestiary"))]))
        out.append(("characters", "Персонажи", f"Персонажи {full}",
                    f"Персонажи {full} — {pn(len(self.data['characters']), 'rec')} журнала на русском и где встретить героев на карте.",
                    f"Все персонажи {full} из журнала игры.", [("", "", lst(self.data["characters"], "characters"))]))
        out.append(("lore", "Лор", f"Лор {full} — записи журнала",
                    f"Лор {full} — {pn(len(self.data['lore']), 'rec')} журнала об Авалоне, его истории и обитателях — текст из игры на русском.",
                    f"Все записи лора {full}.", [("", "", lst(self.data["lore"], "lore"))]))
        grp = [(re.sub(r"\W+", "-", k.lower()).strip("-"), k, lst(rs, "locations", lambda r: f"противников: {len(r['enemies'])}" if r["enemies"] else ""))
               for k, _, rs in grouped(self.data["locations"], lambda r: r["kind"])]
        out.append(("locations", "Локации", f"Локации {full}",
                    f"Локации {full} — {len(self.data['locations'])} {self.cfg.get("loc_text", "мест")} — противники, предметы и задания.",
                    f"Все {pn(len(self.data['locations']), 'loc')} {full} — кто там водится, что лежит и какие задания с ними связаны.", grp))
        n_tal = sum(len(st["talents"]) for t in self.data["talents"] for st in t["subtrees"])
        grp = [(t["slug"], t["name"], [(f"{b}talents/{t['slug']}/#{nd['slug']}", nd["name"], st["name"])
                                       for st in t["subtrees"] for nd in st["talents"]]) for t in self.data["talents"]]
        out.append(("talents", "Таланты", f"Таланты {full} — все деревья навыков",
                    f"Таланты {full} — {pn(len(self.data['talents']), 'tree')}, {pn(n_tal, 'talent')} — что даёт каждый ранг, на русском из файлов игры.",
                    f"Все {pn(n_tal, 'talent')} {full} по деревьям.", grp))
        grp = [(re.sub(r"\W+", "-", k.lower()).strip("-"), k, lst(rs, "effects"))
               for k, _, rs in grouped(self.data["effects"], lambda r: r["type"])]
        out.append(("effects", "Эффекты", f"Эффекты и статусы {full}",
                    f"Эффекты и статусы {full} — {len(self.data['effects'])} баффов, дебаффов и состояний с описаниями из игры.",
                    f"Все эффекты и статусы {full}.", grp))
        ach = self.data["achievements"]
        if ach:
            out.append(("achievements", "Достижения", f"Все достижения {full} — как получить",
                        f"Все {len(ach)} достижений {full} на русском: условия получения, счётчики, нужные предметы и доля игроков Steam.",
                        f"Все {len(ach)} достижений {full} — как получить каждое.",
                        [("", "", [(f"{b}achievements/{r['slug']}/", r["name"], f"{r['pct']:g}%" if r.get("pct") is not None else "") for r in ach])]))
        if self.data["sets"]:
            grp = [(re.sub(r"\W+", "-", k.lower()).strip("-"), k, [(f"{b}sets/{r['slug']}/", r["name"], f"ур. {r['level']}" if r.get("level") else "") for r in rs])
                   for k, _, rs in grouped(self.data["sets"], lambda r: r["region"], {r["region"]: r["region"] for r in self.data["sets"]})]
            out.append(("sets", "Комплекты", f"Комплекты снаряжения {full}",
                        f"Готовые комплекты снаряжения {full} из файлов игры — броня, украшения, оружие и магия для лучника, мага и воина по регионам.",
                        f"Комплекты снаряжения {full} по регионам.", grp))
        return [s for s in out if any(rows for _, _, rows in s[5])]

    def section_page(self, path, tab, title, desc, lead, groups):
        g = self.cfg["short"]
        body = [f"<h1>{esc(tab)} {esc(g)}</h1>", f'<p class="cp-lead">{esc(lead)}</p>',
                f'<div class="cp-actions"><a class="auth-btn cp-open" href="/{self.base()}?tab={path}"><span>Поиск по разделу</span></a>'
                f'<a class="auth-btn cp-open" href="/{self.cfg["folder"]}/"><span>Карта {esc(g)}</span></a></div>']
        if len(groups) > 1:
            body.append('<p class="db-note">' + " · ".join(f'<a href="#{esc(k)}">{esc(n)}</a> {len(rows)}' for k, n, rows in groups) + "</p>")
        for k, n, rows in groups:
            lis = "".join(f'<li><a href="{esc(h)}">{esc(nm)}</a>{f"<small>{esc(sm)}</small>" if sm else ""}</li>' for h, nm, sm in rows)
            if n:
                body.append(f'<h2 id="{esc(k)}">{esc(n)} <span class="cp-n">{len(rows)}</span></h2>')
            body.append(f'<ul class="db-where">{lis}</ul>')
        body.append(self.sec_nav(path))
        return shell(title, desc[:300], self.base() + path + "/", "    " + "\n    ".join(body),
                     self.crumbs() + [(tab, "")], og=f"{SITE}og/{self.cfg['og']}.jpg")

    def sec_nav(self, current=None):
        links = ([(p, t) for p, t, *_ in self._secs] + ([("tips", "Подсказки")] if self.data["tips"] else [])
                 + ([("spells", "Заклинания")] if self.data["spells"] else [])
                 + ([("guilds", "Гильдии")] if self.data["guilds"] else [])
                 + ([("markers", "Метки игры")] if self.data["markers"] else []))
        return ('<nav class="db-secs" aria-label="Разделы базы"><strong>Все разделы списком:</strong> '
                + " · ".join(esc(t) if p == current else f'<a href="/{self.base()}{p}/">{esc(t)}</a>' for p, t in links) + "</nav>")

    # ---------- каталог ----------
    def index_json(self):
        """Сжатый индекс для js/db-catalog.js: по разделам — [имя, en, slug, картинка, подпись, фильтр]."""
        out = {"assets": self.cfg["assets"], "sections": self.meta["sections"], "lists": {}}
        rows = []
        base_of, kids, _ = self.vmap()
        host_of, members, _ = self.merged()
        for r in self.data["items"]:
            sub = r["sub"] + (f" · тир {r['tier']}" if r.get("tier") else "") + (f" · {r['quality']}" if r.get("quality") else "")
            t = r.get("tier") or 0
            st = r.get("stats") or {}
            dmg = st.get("damage") or [0, 0]
            # [8] — характеристики для таблицы: урон от/до, броня, требования, вес, цена (урон/броня 0 — нет; вес/цена null — нет, 0 — ноль)
            num = lambda v: round(v, 2) if v else 0
            num0 = lambda v: None if v is None else round(v, 2)
            rows.append([r["name"], r["en"], self.item_href(r["slug"]).rstrip("/"), r.get("icon") or "", sub, r["sec"],
                         ROMAN[t] if 0 < t < len(ROMAN) else "", QUALITY.get(r.get("quality"), "common"),
                         [num(dmg[0]), num(dmg[1]), num(st.get("armor")), ", ".join(f"{k} {v}" for k, v in (r.get("req") or {}).items()),
                          num0(r.get("weight")), r.get("price")], (re.match(r"items/(dlc\d+|_byoh)/", r.get("icon") or "") or [None, ""])[1],
                         max(0, len(members.get(r["slug"], ())) - (not r.get("_hub"))),   # members, кроме «all», включают саму запись
                         1 if r["slug"] in base_of or r["slug"] in host_of else 0])   # [10] — вариантов у базового предмета, [11] — это вариант
        out["lists"]["items"] = rows
        # номера записей с метками на карте — фильтр «Есть на карте» (js/db-catalog.js)
        out["onmap"] = {"items": [i for i, r in enumerate(self.data["items"]) if r["markers"]]}
        for k in ("quests", "bestiary", "characters", "lore", "locations"):
            out["onmap"][k] = [i for i, r in enumerate(self.data[k]) if r.get("markers")]
        out["lists"]["quests"] = [[r["name"], r["en"], r["slug"], "q:" + QUEST_ICON.get(r["type"], "task"), r["type"] + (f" · ур. {r['level']}" if r.get("level") else ""), r["type"],
                                   f"ур. {r['level']}" if r.get("level") else ""] for r in self.data["quests"]]
        qdef = {"lore": "q:lore", "bestiary": self.cfg.get("beast_q", ""), "characters": self.cfg.get("person_q", "")}
        race = lambda r: next((v for k_, v in r.get("facts") or [] if k_ == "Раса" and v), "")
        for k in ("bestiary", "characters", "lore"):
            out["lists"][k] = [[r["name"], r["en"], r["slug"], r.get("image") or qdef[k],
                                r.get("sub") or " · ".join(x for x in ((race(r) if k == "characters" else ""), short(r.get("desc"), 160)) if x), ""] for r in self.data[k]]
        rows, chips = [], []
        for t in self.data["talents"]:
            chips.append([t["slug"], t["name"]])
            for st in t["subtrees"]:
                for nd in st["talents"]:
                    rows.append([nd["name"], nd["en"], f"{t['slug']}/#{nd['slug']}", t.get("icon") or "",
                                 t["name"] + (f" · {st['name']}" if st["name"] and st["name"] != t["name"] else ""), t["slug"]])
        out["lists"]["talents"] = rows
        out["chips"] = {"talents": chips}
        out["trees"] = {t["slug"]: [t.get("icon") or "", len(t["subtrees"])] for t in self.data["talents"] if talent_tree(t, self.img)}
        out["lists"]["effects"] = [[r["name"], r["en"], r["slug"], r.get("icon") or "", r["type"] + " · " + short(r.get("desc"), 160), r["type"]] for r in self.data["effects"]]
        out["chips"]["effects"] = [[t, t] for t in dict.fromkeys(r["type"] for r in self.data["effects"])]
        def loc_pic(r):
            sh = self.shot_list(r["markers"])
            return "p:" + sh[0][0] if sh else "q:loc"
        out["lists"]["locations"] = [[r["name"], r["en"], r["slug"], loc_pic(r), r["kind"] + (f" · противников: {len(r['enemies'])}" if r["enemies"] else ""), r["kind"]]
                                     for r in self.data["locations"]]
        out["chips"]["locations"] = [[t, t] for t in dict.fromkeys(r["kind"] for r in self.data["locations"])]
        out["lists"]["achievements"] = [[r["name"], r["en"], r["slug"], r.get("icon") or "", (f"{r['pct']:g}% игроков · " if r.get("pct") is not None else "") + short(r["desc"], 160), "hidden" if r["hidden"] else "open",
                                         f"{r['pct']:g}%" if r.get("pct") is not None else ""]
                                        for r in self.data["achievements"]]
        out["chips"]["achievements"] = [["open", "Обычные"], ["hidden", "Скрытые"]]
        out["lists"]["sets"] = [[r["name"], r["en"], r["slug"], (r["armor"][1] if len(r["armor"]) > 1 else r["armor"][0]).get("icon") or "", f"ур. {r['level']} · {pn(len(r['armor']) + len(r['gear']), 'item')}", r["region"], f"ур. {r['level']}" if r.get("level") else ""]
                                for r in self.data["sets"]]
        out["chips"]["sets"] = [[t, t] for t in dict.fromkeys(r["region"] for r in self.data["sets"])]
        out["lists"]["markers"] = [[t["name"], t["en"], "#" + t["slug"], t.get("icon") or "", t["desc"], ""] for t in self.data["markers"]]
        out["lists"]["spells"] = [[r["name"], r["en"], "#" + r["slug"], r.get("icon") or "",
                                   " · ".join(x for x in (r["kind"], f"{r['circle']}-й круг" if r["circle"] else "", r["school"], r.get("level") or "") if x), ""] for r in self.data["spells"]]
        out["lists"]["guilds"] = [[g["name"], g["key"].replace("Human_", "").replace("_", " "), "#" + g["slug"], self.guild_pic(g),
                                   g["camp"] + (f" · участников: {len(g['members'])}" if g["members"] else ""), ""] for g in self.data["guilds"]]
        out["lists"]["tips"] = [[t["name"], t["en"], "#" + t["slug"], "q:tip", short(split_figs(t["text"])[1], 160), ""] for t in self.data["tips"]]
        return json.dumps(out, ensure_ascii=False, separators=(",", ":"))

    def marker_links(self):
        """Метка карты → запись базы ({id: "раздел/адрес"}): кнопка «В базе» в окне метки (app.js карты).
        Если метка у нескольких записей — берётся самая «конкретная» (предмет, существо, персонаж…)."""
        out = {}
        for k in ("items", "bestiary", "characters", "quests", "locations", "lore"):
            for r in self.data[k]:
                for m in r.get("markers") or []:
                    out.setdefault(str(m["id"]), f"{k}/{r['slug']}")
        return json.dumps(out, ensure_ascii=False, separators=(",", ":"))

    def guild_pic(self, g):
        """Картинка гильдии в каталоге — портрет главы (или первого участника) из глоссария."""
        img = {r["slug"]: r.get("image") for r in self.data["characters"]}
        for s, _, lead in sorted(g["members"], key=lambda x: -x[2]):
            if img.get(s):
                return img[s]
        return ""

    def tab_icon(self, k):
        """Картинка вкладки каталога: адрес из …-assets/db или «q:<глиф>» (значок карты)."""
        d = self.data
        first = lambda rows, key="icon": next((r.get(key) for r in rows if r.get(key)), "")
        want = self.cfg.get("tab_pick", {})
        by_name = lambda rows, k, key: next((r[key] for r in rows if r["name"] == want.get(k) and r.get(key)), "")
        pick = {
            "items": by_name(d["items"], "items", "icon") or first(d["items"]),
            "books": first([r for r in d["items"] if r["sec"] == "books"]),
            "bestiary": by_name(d["bestiary"], "bestiary", "image") or first(d["bestiary"], "image"),
            "characters": by_name(d["characters"], "characters", "image") or first(d["characters"], "image"),
            "talents": first(d["talents"]), "effects": first(d["effects"]), "achievements": first(d["achievements"]),
            "sets": next((x.get("icon") for r in d["sets"] for x in r["armor"] if x.get("icon")), ""),
            "markers": first(d["markers"]),
            "spells": first(d["spells"]),
            "guilds": next((self.guild_pic(g) for g in d["guilds"] if self.guild_pic(g)), ""),
        }
        return pick.get(k) or {"quests": "q:main", "locations": "q:loc", "lore": "q:lore", "tips": "q:tip", "bestiary": self.cfg.get("beast_q", ""),
                               "characters": self.cfg.get("person_q", ""), "talents": "q:star"}.get(k, "")

    def hero_head(self):
        """Первый кадр шапки — LCP на телефоне: фон из инлайн-стиля сканер предзагрузки не видит, поэтому preload в <head>."""
        shots = self.cfg.get("hero_shots", [])
        base = self.cfg["popups"]
        host = re.match(r"https?://[^/]+", base)
        out = f'\n    <link rel="preconnect" href="{host.group(0)}">' if host else ""   # без crossorigin: картинки идут без CORS
        if shots:
            out += f'\n    <link rel="preload" as="image" href="{esc(base)}popups/{shots[0]}.webp" fetchpriority="high">'
        return out

    def hero(self, stats):
        """Шапка каталога: сменяющиеся кадры из игры (кен-бёрнс), туман, искры (canvas), рендеры существ — js/db-hero.js.
        Без JS остаётся первый кадр и первое существо."""
        cfg = self.cfg
        shots = [f'{cfg["popups"]}popups/{i}.webp' for i in cfg.get("hero_shots", [])]
        pool = {}
        for kind, label in (("characters", "Персонаж"), ("bestiary", "Существо")):   # бестиарий важнее при совпадении имён
            for r in self.data[kind]:
                if r.get("image"):
                    pool[r["name"]] = (r["image"], f"/{self.base()}{kind}/{r['slug']}/", label)
        beasts = [(n,) + pool[n] for n in cfg.get("hero_beasts", []) if n in pool]
        miss = [n for n in cfg.get("hero_beasts", []) if n not in pool]
        if miss:
            print("  hero: нет картинки/записи для", ", ".join(miss))
        bg = "".join(f'<i class="dbx-shot{" is-on" if i == 0 else ""}" data-src="{esc(u)}"'
                     + (f' style="background-image:url({esc(u)})"' if i == 0 else "") + "></i>" for i, u in enumerate(shots))
        # у всех рендеров data-src: первого выбирает случайно инлайн-скрипт сразу после шапки (до первой отрисовки),
        # ему же ставит src и fetchpriority — браузер не тянет лишнюю картинку. Без JS — первый из списка (<noscript>)
        # hero_sheet: наброски 500×264 — уменьшенная копия не нужна, srcset из одного файла (инлайн-скрипт его ждёт)
        sheet = cfg.get("hero_sheet")
        wh = 'width="500" height="264"' if sheet else 'width="512" height="600"'
        bs = "".join(f'<img class="dbx-beast" data-src="{esc(self.img(a))}" '
                     + (f'data-srcset="{esc(self.img(a))} 500w" sizes="500px" ' if sheet else
                        f'data-srcset="{esc(self.img_small(a, "m"))} 540w, {esc(self.img(a))} 1024w" sizes="(max-width: 700px) 70vw, min(46vw, 520px)" ')
                     + f'alt="" data-name="{esc(n)}" data-href="{esc(h)}" data-kind="{esc(k)}" {wh} decoding="async">'
                     for n, a, h, k in beasts)
        if beasts:
            bs += f'<noscript><img class="dbx-beast is-on" src="{esc(self.img(beasts[0][1]))}" alt="" {wh}></noscript>'
        first = beasts[0] if beasts else None
        st = "".join(f'<a href="/{self.base()}{p}/"><b>{fmt(v)}</b><span>{esc(plural(v, PN_FORMS[t]))}</span></a>' for p, t, v in stats if v)
        g = self.cfg["short"]
        sub = self.cfg["game"].split(":", 1)[1].strip() if ":" in self.cfg["game"] else ""
        if sub.casefold() == g.casefold():   # «The Elder Scrolls V: Skyrim» → подпись «Skyrim» повторяла заголовок
            sub = ""
        # декор и подпись — в .dbx-fx: обрезка по скруглению там, а не на самой шапке. Иначе Safari на iPhone обрезает
        # и закреплённый (position: fixed) поиск внутри шапки — он пропадал и мигал при прокрутке
        cap = f'<a class="dbx-cap" href="{esc(first[2])}"><small>{esc(first[3])}</small>{esc(first[0])}</a>' if first else ""
        if self.cfg.get("hero_fx") == "snow":
            fx = '<div class="dbx-snow" aria-hidden="true">' + "<i></i>" * 14 + "</div>"
        elif self.cfg.get("hero_fx") == "ore":
            fx = '<div class="dbx-barrier" aria-hidden="true"></div><div class="dbx-ore" aria-hidden="true">' + "<i></i>" * 9 + "</div>"
        else:
            fx = '<div class="dbx-fog" aria-hidden="true"><i></i><i></i></div>\n        <canvas class="dbx-embers" aria-hidden="true"></canvas>'
        return f"""    <section class="dbx" aria-labelledby="dbx-h">
        <div class="dbx-fx">
        <div class="dbx-bg" aria-hidden="true">{bg}</div>
        {fx}
        <div class="dbx-beasts{' dbx-sheet' if sheet else ''}" aria-hidden="true">{bs}</div>
        {cap}
        </div>
        <div class="dbx-in">
            <h1 id="dbx-h"><small>База данных</small>{esc(g)}</h1>
            {f'<p class="dbx-sub">{esc(sub)}</p>' if sub else ""}
            <p class="dbx-lead">Всё из файлов игры, на русском — со ссылками на метки карты.</p>
            <label class="dbx-search"><span class="sr-only">Поиск по базе</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
                <input class="db-search" type="search" placeholder="Предмет, задание, существо…" autocomplete="off" enterkeyhint="search">
            </label>
            <nav class="dbx-stats" aria-label="Коротко о базе">{st}<a class="dbx-map" href="/{cfg['folder']}/"><svg class="sp-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg><span>Карта {esc(g)}</span><i aria-hidden="true">→</i></a></nav>
        </div>
    </section>{PICK_BEAST if first else ""}"""

    def tabs(self):
        """Разделы базы: [(ключ, название, число записей)] — вкладки каталога и полоса игры на страницах записей."""
        c = self.meta["counts"]
        books = sum(1 for r in self.data["items"] if r["sec"] == "books")
        n_tal = sum(len(st["talents"]) for t in self.data["talents"] for st in t["subtrees"])
        tabs = [("items", "Предметы", c["items"] - books), ("quests", "Задания", c["quests"]), ("bestiary", "Бестиарий", c["bestiary"]),
                ("characters", "Персонажи", c["characters"]), ("locations", "Локации", len(self.data["locations"])),
                ("talents", "Таланты", n_tal), ("effects", "Эффекты", len(self.data["effects"])),
                ("achievements", "Достижения", len(self.data["achievements"])), ("sets", "Комплекты", len(self.data["sets"])),
                ("lore", "Лор", c["lore"]), ("books", "Книги", books), ("tips", "Подсказки", len(self.data["tips"])),
                ("spells", "Заклинания", len(self.data["spells"])), ("guilds", "Гильдии", len(self.data["guilds"])),
                ("markers", "Метки игры", len(self.data["markers"]))]
        return [t for t in tabs if t[2]]

    def strip_html(self):
        """Полоса игры над страницами записей и списков: название (→ каталог), поиск, карта и все разделы — чтобы не было тупиков."""
        g = self.cfg["short"]
        tabs = "".join(f'<a href="/{self.base()}?tab={k}" data-k="{k}"><span>{esc(n)}</span><small>{fmt(v)}</small></a>' for k, n, v in self.tabs())
        return f"""    <div class="dbs">
        <div class="dbs-top">
            <a class="dbs-game" href="/{self.base()}"><small>База данных</small><b>{esc(g)}</b></a>
            <form class="dbs-search" action="/{self.base()}" role="search">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
                <input type="search" name="q" placeholder="Предмет, задание, существо…" aria-label="Поиск по базе {esc(g)}" autocomplete="off" enterkeyhint="search">
                <button type="submit" class="dbs-go">Найти</button>
            </form>
            <a class="dbs-map" href="/{self.cfg['folder']}/"><svg class="sp-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg><span>Карта</span></a>
        </div>
        <nav class="dbs-tabs" aria-label="Разделы базы {esc(g)}">{tabs}</nav>
    </div>
"""

    def catalog_page(self):
        c = self.meta["counts"]
        tabs = self.tabs()

        def ico(k):
            a = self.tab_icon(k)
            if a.startswith("q:"):
                return f'<i class="db-qi db-qi-{a[2:]}" aria-hidden="true"></i>'
            return f'<img src="{self.img_small(a, "t")}" alt="" width="44" height="44" loading="lazy" decoding="async" class="dbt-{k}">' if a else ""
        # вкладки — настоящие ссылки на страницы разделов (поисковикам), JS перехватывает клик и фильтрует на месте
        tab_html = "".join(f'<a role="tab" href="/{self.base()}{k}/" data-tab="{k}" aria-selected="{"true" if k == "items" else "false"}">'
                           f'{ico(k)}<span>{n}</span><small>{fmt(v)}</small></a>' for k, n, v in tabs)
        g = self.cfg["short"]
        stats = [("items", "item", c["items"]), ("quests", "quest", c["quests"]),
                 ("bestiary", "beast", c["bestiary"]), ("locations", "loc", len(self.data["locations"]))]
        body = f"""{self.hero(stats)}
    <div id="db-app" data-index="/{self.base()}index.json?v={self.ver}" data-base="/{self.base()}">
        <div class="db-tabs" role="tablist" aria-label="Разделы базы">{tab_html}</div>
        <div class="db-bar"><div class="db-chips" hidden></div></div>
        <div class="db-chips db-chips2" hidden></div>
        <div class="db-tools">
            <button type="button" class="db-fbtn" aria-expanded="false" aria-controls="db-fpanel" hidden><svg class="sp-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg><span>Фильтры</span><em class="db-fbadge" hidden></em></button>
            <select class="db-sort" aria-label="Сортировка" hidden>
                <option value="">По названию</option><option value="tier">Сначала высокий тир</option><option value="tier-">Сначала низкий тир</option></select>
            <div class="db-view" role="group" aria-label="Вид списка" hidden><button type="button" data-v="" aria-pressed="true">Плитки</button><button type="button" data-v="table" aria-pressed="false">Таблица</button></div>
        </div>
        <div class="db-fpanel" id="db-fpanel" hidden>
            <div class="db-ff db-ff-q" hidden><span class="db-ff-l">Качество</span><div class="db-seg" role="group" aria-label="Качество" data-key="qc"></div></div>
            <div class="db-ff db-ff-d" hidden><span class="db-ff-l">Дополнение</span><div class="db-seg" role="group" aria-label="Дополнение" data-key="dlc"></div></div>
            <div class="db-ff db-ff-m" hidden><span class="db-ff-l">Карта</span><button type="button" class="db-onmap" aria-pressed="false"><svg class="sp-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg><span>Есть на карте</span></button></div>
            <div class="db-ff db-ff-v" hidden><span class="db-ff-l">Варианты</span><button type="button" class="db-onvar" aria-pressed="false"><span>Показывать зачарованные варианты</span></button></div>
            <button type="button" class="db-freset" hidden><span>Сбросить</span></button>
        </div>
        <p class="db-also" hidden></p>
        <div class="db-treebox" hidden></div>
        <p class="db-count" aria-live="polite"></p>
        <ul class="db-grid is-sk" aria-hidden="true"><li class="db-sk"></li><li class="db-sk"></li><li class="db-sk"></li><li class="db-sk"></li><li class="db-sk"></li><li class="db-sk"></li><li class="db-sk"></li><li class="db-sk"></li><li class="db-sk"></li><li class="db-sk"></li><li class="db-sk"></li><li class="db-sk"></li></ul>
        <noscript><style>.db-grid.is-sk{{display:none}}</style></noscript>
        <noscript><p>Для поиска по каталогу нужен JavaScript — разделы открываются ссылками выше.</p></noscript>
    </div>"""
        desc = (f"База данных {g}: {pn(c['items'], 'item')} с рецептами, {pn(c['quests'], 'quest')} с этапами, бестиарий с характеристиками, "
                f"{pn(len(self.data['locations']), 'loc')}, таланты и эффекты — на русском, из файлов игры, со ссылками на карту.")
        return shell(f"База данных {self.cfg['game']} — предметы, задания, бестиарий на русском", desc, self.base(), body,
                     self.crumbs(), og=f"{SITE}og/{self.cfg['og']}.jpg", loader=True, head=self.hero_head(),
                     scripts=f'\n    <script src="/js/db-hero.js?v={HERO_V}" defer></script>'
                             f'\n    <script src="/js/db-tree.js?v=4" defer></script>\n    <script src="/js/db-catalog.js?v={JS_V}" defer></script>')

    def build(self):
        out = os.path.join(ROOT, "db", self.cfg["slug"])
        for k, path, *_ in KINDS:
            shutil.rmtree(os.path.join(out, path), ignore_errors=True)
        for d in ("tips",) + OPTIONAL:
            shutil.rmtree(os.path.join(out, d), ignore_errors=True)
        host_of = self.merged()[0]
        self._pages_by_sec = {k: [r for r in v if r["slug"] not in host_of] for k, v in self._items_by_sec.items()}
        self._secs = self.sections()
        self.prepass_mentions()
        STRIPS[self.cfg["slug"]] = self.strip_html()
        idx = self.index_json()
        self.ver = hashlib.md5(idx.encode()).hexdigest()[:8]
        INDEX_URL[self.cfg["slug"]] = f"/{self.base()}index.json?v={self.ver}"
        write(os.path.join(out, "index.json"), idx)
        write(os.path.join(out, "marker-links.json"), self.marker_links())
        write(os.path.join(out, "index.html"), self.catalog_page())
        # список уменьшенных копий (img_small) для tools/db_small.sh — только локально, tools/ не в git
        if os.path.isdir(os.path.join(ROOT, "tools")):
            write(os.path.join(ROOT, "tools", f"db_small_{self.cfg['slug']}.txt"),
                  "".join(x + "\n" for x in sorted(SMALL.get(self.cfg["slug"], ()))))
        n, stubs = 1, 0
        def put(p, s):   # ссылки на записи без своей страницы — сразу на строку общей страницы
            write(p, self.relink(s) if p.endswith(".html") else s)
        for r in self.data["items"]:
            if r["slug"] in host_of:
                write(os.path.join(out, "items", r["slug"], "index.html"), self.stub_page(r)); stubs += 1
            else:
                put(os.path.join(out, "items", r["slug"], "index.html"), self.item_page(r)); n += 1
        for r in self.data["quests"]:
            put(os.path.join(out, "quests", r["slug"], "index.html"), self.quest_page(r)); n += 1
        for k, _, tab, _ in KINDS[2:5]:
            for r in self.data[k]:
                put(os.path.join(out, k, r["slug"], "index.html"), self.journal_page(k, tab, r)); n += 1
        for r in self.data["locations"]:
            put(os.path.join(out, "locations", r["slug"], "index.html"), self.location_page(r)); n += 1
        for t in self.data["talents"]:
            put(os.path.join(out, "talents", t["slug"], "index.html"), self.talent_page(t)); n += 1
            frag = self.talent_fragment(t)
            if frag:
                put(os.path.join(out, "talents", t["slug"], "tree.html"), frag)
        for r in self.data["effects"]:
            put(os.path.join(out, "effects", r["slug"], "index.html"), self.effect_page(r)); n += 1
        if self.data["tips"]:
            put(os.path.join(out, "tips", "index.html"), self.tips_page()); n += 1
        for r in self.data["achievements"]:
            put(os.path.join(out, "achievements", r["slug"], "index.html"), self.achievement_page(r)); n += 1
        for r in self.data["sets"]:
            put(os.path.join(out, "sets", r["slug"], "index.html"), self.set_page(r)); n += 1
        if self.data["markers"]:
            put(os.path.join(out, "markers", "index.html"), self.markers_page()); n += 1
        if self.data["spells"]:
            put(os.path.join(out, "spells", "index.html"), self.spells_page()); n += 1
        if self.data["guilds"]:
            put(os.path.join(out, "guilds", "index.html"), self.guilds_page()); n += 1
        shutil.rmtree(os.path.join(out, "books"), ignore_errors=True)
        for sec in self._secs:
            put(os.path.join(out, sec[0], "index.html"), self.section_page(*sec)); n += 1
        if stubs:
            print(f"{self.cfg['slug']}: объединено в общие страницы {stubs} записей (старые адреса — переадресация)")
        return n


HUB_ICONS = {   # значки статистики хаба /db/ (контур, currentColor)
    "items": '<path d="M12 3 4 7.5v9L12 21l8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
    "quests": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    "bestiary": '<path d="M4 4c0 4 2 6 5 6M20 4c0 4-2 6-5 6"/><path d="M9 10h6l1 5-4 5-4-5z"/><path d="M10.5 14h.01M13.5 14h.01"/>',
    "characters": '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5"/><circle cx="16.5" cy="9" r="2.6"/><path d="M15.5 14.2c2.6-.3 4.5 1.3 5 4.8"/>',
    "locations": '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
    "talents": '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/>',
}


def hub_icon(k):
    return (f'<svg class="dbh-ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{HUB_ICONS[k]}</svg>')


def hub(games):
    """/db/ — выбор базы: баннер, карточки игр (обложка 16:9, статистика, «Открыть базу»), связь с картами."""
    cards = []
    for g in games:
        c, href = g.meta["counts"], f"/{g.base()}"
        stats = [("items", pn(c["items"], "item")), ("quests", pn(c["quests"], "quest")),
                 ("bestiary", pn(c["bestiary"], "beast")), ("characters", pn(c["characters"], "char"))]
        if c.get("locations"):
            stats.append(("locations", pn(c["locations"], "loc")))
        if c.get("talents"):
            stats.append(("talents", "Таланты и эффекты"))
        lis = "".join(f'<li>{hub_icon(k)}<span>{esc(t)}</span></li>' for k, t in stats)
        cards.append(f'''      <article class="dbh-card">
        <a class="dbh-cover" href="{href}">{g.banner("dbh-art", lazy=False).replace('sizes="(max-width: 1000px) 100vw, 980px"', 'sizes="(max-width: 760px) 100vw, 360px"')}</a>
        <h3 class="dbh-name"><a href="{href}">{esc(g.cfg["game"])}</a></h3>
        <ul class="dbh-stats">{lis}</ul>
        <a class="bx-btn dbh-open" href="{href}">Открыть базу<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
      </article>''')
    body = f"""    <section class="dbh-hero">
      <img class="dbh-hero-art" src="/img/db-hero-art.webp" srcset="/img/db-hero-art-960.webp 960w, /img/db-hero-art.webp 1672w" sizes="(max-width: 760px) 100vw, 700px" width="1672" height="941" alt="" fetchpriority="high" decoding="async">
      <div class="dbh-hero-text">
        <h1>База <em>данных</em></h1>
        <p>Предметы, задания и персонажи — на русском, как в игре.</p>
        <p>Находите записи и переходите к меткам на карте.</p>
      </div>
      <div class="dbh-cta">
        <a class="bx-btn bx-btn-primary" href="#games">Выбрать игру<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <a class="bx-btn" href="/#games">Все карты</a>
      </div>
    </section>
    <h2 class="dbh-h2" id="games">Выберите игру</h2>
    <div class="dbh-games">
{chr(10).join(cards)}
    </div>
    <p class="dbh-maps">{hub_icon("locations")}<span>Записи связаны с интерактивными картами</span><a class="bx-btn" href="/#games">Все карты<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></p>"""
    return shell("База данных игр: предметы, задания, бестиарий", "База данных игр BroskiPlay: предметы, задания с этапами, бестиарий и персонажи из файлов игр, со ссылками на интерактивные карты.",
                 "db/", body, [("Главная", ""), ("База данных", "db/")],
                 foot='<p class="dbh-foot">Данные из файлов игр · BroskiPlay</p>', main_cls=" dbh")


def all_pages():
    """Пути всех страниц базы (для sitemap и меню)."""
    out = []
    for dp, _, fs in os.walk(os.path.join(ROOT, "db")):
        if "index.html" in fs and os.path.getsize(os.path.join(dp, "index.html")) >= 2000:   # мелкие — переадресации (stub_page)
            out.append(os.path.join(dp, "index.html"))
    return sorted(out)


def main():
    games = [Game(c) for c in DB]
    write(os.path.join(ROOT, "db", "index.html"), hub(games))
    n = 1 + sum(g.build() for g in games)
    print("страниц базы:", n)
    import site_menu
    site_menu.inject_subpages(None)
    print("db/site.css:", build_site_css(), "байт")


if __name__ == "__main__":
    main()
