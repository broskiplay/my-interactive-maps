#!/usr/bin/env python3
"""Меню сайта: верхнее меню на страницах карт и на остальных страницах (категории, журнал исправлений, политика).

Запускается из scripts/category_pages.py (после страниц категорий):
    • index.html — убирает старый пункт «Гайды» (между <!-- guides-menu:start --> и <!-- guides-menu:end -->;
      гайды сняты с сайта 2026-11-12, архив — github.com/broskiplay/guides-games);
    • <игра>-map/index.html — верхнее меню карты между <!-- mtb:start --> и <!-- mtb:end --> (перед боковой панелью):
      «Главная», «Игры», Twitch / YouTube / «Поддержать» и вход через Google.
      Кнопки соцсетей и блок входа лежат в scripts/mtb_parts.html (раньше стояли в боковой панели; id у входа прежние,
      поэтому js/app.js работает как раньше). Цвета берутся из палитры игры (css/map-nm.css, html[data-game]).
Скрипт идемпотентный. Страницы локаций (<игра>/<карта>/) копирует scripts/map_pages.py — запускать после него нельзя, до него — нужно.
"""
import os
import re

from seo import ROOT, GAMES

PARTS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mtb_parts.html"), encoding="utf-8").read()
SOCIAL = PARTS.split("<!-- social -->")[1].split("<!-- auth -->")[0].strip()
AUTH = PARTS.split("<!-- auth -->")[1].strip()
HOME_BLOCK = re.compile(r"[ \t]*<!-- guides-menu:start[^>]*-->.*?<!-- guides-menu:end -->\n?", re.S)
MTB_BLOCK = re.compile(r"([ \t]*)<!-- mtb:start[^>]*-->.*?<!-- mtb:end -->\n?", re.S)
SIDE_HOME = re.compile(r"[ \t]*<!-- side-home:start[^>]*-->.*?<!-- side-home:end -->\n?", re.S)
SIDE_BLOCK = re.compile(r"([ \t]*)<!-- mtb-side:start[^>]*-->.*?<!-- mtb-side:end -->\n?", re.S)
TOPBAR_BLOCK = re.compile(r"<!-- topbar:start[^>]*-->.*?<!-- topbar:end -->", re.S)


def read(p):
    return open(p, encoding="utf-8").read()


def write(p, s):
    with open(p, "w", encoding="utf-8") as f:
        f.write(s)


# короткие названия для списка «Игры» в верхнем меню карты (две колонки на телефоне)
MENU_NAMES = {
    "oblivion-remake": "Oblivion Remastered", "skyrim": "Skyrim", "witcher3": "Ведьмак 3", "tainted-grail": "Tainted Grail",
    "gothic-remake": "Gothic Remake", "rdr2": "Red Dead Redemption 2",
}
CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'


def games_menu(folder):
    """«Игры»: выпадающий список всех карт; текущая помечена aria-current (стили — css/map-nm.css .mtb-dd / .mtb-menu)."""
    items = "".join(
        '<a href="/%s/"%s>%s</a>' % (f, ' aria-current="true"' if f == folder else "", MENU_NAMES.get(slug, name))
        for slug, f, name in GAMES)
    return ('<div class="mtb-dd"><button type="button" class="mtb-link" aria-expanded="false" aria-controls="mtb-games" aria-haspopup="true">'
            f'Игры{CHEVRON}</button><div class="mtb-menu" id="mtb-games" hidden>{items}'
            '<a class="mtb-all" href="/#games-heading">Все игры на главной</a></div></div>')


def mtb_block(folder, index=None):
    social = re.sub(r'class="social-btn ', 'class="mtb-social social-btn ', SOCIAL)
    return f'''<!-- mtb:start — верхнее меню карты: генерируется python3 scripts/site_menu.py, не править вручную -->
<header class="mtb" id="mtb">
    <a class="mtb-pill mtb-home" href="/" aria-label="BroskiPlay — на главную"><img src="/icons/logo-badge-96.png" width="30" height="30" alt=""><span>Главная</span></a>
    <button type="button" class="mtb-burger mtb-pill" id="mtb-burger" aria-expanded="false" aria-controls="mtb-panel" aria-label="Открыть меню"><span></span><span></span><span></span></button>
    <div class="mtb-panel" id="mtb-panel">
        <nav class="mtb-pill mtb-nav" aria-label="Разделы сайта">
            {games_menu(folder)}
            <a class="mtb-link" href="/db/">База данных</a>
        </nav>
        <div class="mtb-pill mtb-actions">
            {social}
            {AUTH}
        </div>
    </div>
</header>
<!-- mtb:end -->
'''


def inject(index=None):
    # главная: пункта «Гайды» больше нет
    p = os.path.join(ROOT, "index.html")
    write(p, HOME_BLOCK.sub("", read(p)))
    # карты
    for _, folder, _ in GAMES:
        p = os.path.join(ROOT, folder, "index.html")
        s = read(p)
        block = mtb_block(folder, index)
        if MTB_BLOCK.search(s):
            s = MTB_BLOCK.sub(lambda _: block, s, count=1)
        else:
            a = re.search(r'([ \t]*)<div id="sidebar">', s)
            s = s[:a.start()] + block + "\n" + s[a.start():]
        write(p, s)
    inject_side_buttons()
    inject_subpages(index)
    print("меню: главная и", len(GAMES), "карт")


SIDE_BTN = ('<!-- mtb-side:start — кнопка меню сайта для телефона (генерируется scripts/site_menu.py) -->\n'
            '        <button type="button" class="mtb-side-btn" id="mtb-side-btn" aria-label="Меню сайта: игры, вход"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
            '<span>Меню сайта</span><small>игры · вход</small></button>\n        <!-- mtb-side:end -->\n')


def inject_side_home(s):
    """Убирает кнопку «Главная» из шапки панели (пробовали 2026-11-11, пользователь отказался); пустая строка на её месте тоже уходит."""
    return SIDE_HOME.sub("", s)


def inject_side_buttons():
    for _, folder, _ in GAMES:
        p = os.path.join(ROOT, folder, "index.html")
        s = read(p)
        s = inject_side_home(s)
        if SIDE_BLOCK.search(s):
            s = SIDE_BLOCK.sub(lambda _: SIDE_BTN, s, count=1)
        else:
            a = re.search(r'([ \t]*)<div class="header-top-row">', s)
            s = s[:a.start()] + "        " + SIDE_BTN + s[a.start():]
        write(p, s)


# ---------- верхнее меню на остальных страницах (категории, журнал исправлений, политика) ----------
def _block(s, start_pat, tag):
    m = re.search(start_pat, s)
    a = m.start(); depth = 0
    for t in re.finditer(r"<(/?)" + tag + r"\b[^>]*>", s[a:]):
        depth += -1 if t.group(1) else 1
        if depth == 0:
            return s[a:a + t.end()]
    raise ValueError(start_pat)


def subpage_bar(index, home_html):
    """Полное верхнее меню для страниц не-главных: те же классы и стили, что на главной (css/style.css «Верхнее меню»)."""
    auth = _block(home_html, r'<div class="auth-card">', "div")
    auth = auth.replace('<a class="auth-info" href="./cabinet/"', '<a class="auth-info" href="/cabinet/"')
    auth = re.sub(r"\n\s*", "\n                    ", auth)
    social = re.sub(r'class="social-btn ', 'class="social-btn tb-social ', SOCIAL)
    return f'''<!-- topbar:start — верхнее меню сайта: генерируется python3 scripts/site_menu.py, не править вручную -->
<header class="topbar" id="topbar">
    <div class="topbar-inner">
        <a class="tb-brand" href="/" aria-label="BroskiPlay — на главную"><img src="/icons/logo-badge-96.png" width="34" height="34" alt=""><span>BroskiPlay</span></a>
        <button type="button" class="tb-burger" id="tb-burger" aria-expanded="false" aria-controls="tb-panel" aria-label="Открыть меню"><span></span><span></span><span></span></button>
        <div class="tb-panel" id="tb-panel">
            <nav class="tb-nav" aria-label="Разделы сайта">
                <a class="tb-link" href="/db/">База данных</a>
                <div class="tb-dd" id="tb-upd">
                    <a class="tb-link tb-dd-btn" href="/#updates" aria-haspopup="true" aria-expanded="false" aria-controls="tb-upd-menu">Обновления<span class="tb-dot" hidden></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></a>
                    <div class="tb-menu" id="tb-upd-menu" hidden><a href="/#updates" id="tb-updates"><span>Что нового</span><small>новое на сайте</small></a><a href="/fixes/"><span>Журнал исправлений</span><small>правки меток</small></a></div>
                </div>
                <a class="tb-link tb-opt" href="/#community">Сообщество</a>
            </nav>
            <div class="tb-actions">
                {social}
                <a class="tb-icon" id="tb-search" href="/?search=1" aria-label="Найти игру" title="Найти игру"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg></a>
                <div class="ui-controls tb-theme"></div>
                {auth}
            </div>
        </div>
    </div>
</header>
<script src="/ui-feedback.js?v=5" defer></script>
<script src="/js/firebase-lazy.js?v=1" defer></script>
<script src="/js/auth-lite.js?v=2" defer></script>
<script src="/js/topbar.js?v=9" defer></script>
<!-- topbar:end -->'''


def inject_subpages(index):
    home = read(os.path.join(ROOT, "index.html"))
    bar = subpage_bar(index, home)
    pages = [os.path.join(ROOT, "fixes", "index.html"), os.path.join(ROOT, "updates", "index.html"), os.path.join(ROOT, "privacy.html")]
    for g in GAMES:
        d = os.path.join(ROOT, g[1], "c")
        if os.path.isdir(d):
            pages += [os.path.join(d, x, "index.html") for x in sorted(os.listdir(d)) if os.path.exists(os.path.join(d, x, "index.html"))]
    for dp, _, fs in os.walk(os.path.join(ROOT, "db")):  # база данных (scripts/db_pages.py)
        if "index.html" in fs:
            pages.append(os.path.join(dp, "index.html"))
    n = 0
    for p in pages:
        s = read(p)
        if TOPBAR_BLOCK.search(s):
            write(p, TOPBAR_BLOCK.sub(lambda _: bar, s, count=1)); n += 1
    print("верхнее меню на страницах:", n)
