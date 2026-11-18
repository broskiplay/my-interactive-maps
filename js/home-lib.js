// Главная: надстройка над библиотекой игр (разметку карточек генерирует scripts/prerender_home.py, прогресс считает js/script.js).
//   • избранные игры: звёздочка на карточке (bp_fav), избранное идёт первым в библиотеке и в меню «Игры» (js/topbar.js);
//   • сортировка и фильтры: Все · Новые · С прогрессом · Недавние · А–Я (bp_home_sort), рядом с переключателем «Сетка / Список»;
//   • выпадающее меню «Мой прогресс» в верхней панели: общий итог и прогресс по каждой игре (данные — window.bpProgress из script.js).
(function () {
    "use strict";
    var container = document.getElementById("games-container");
    if (!container || document.body.classList.contains("games-page")) return;
    var $ = function (id) { return document.getElementById(id); };
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cards = [].slice.call(container.querySelectorAll(":scope > details.game-dropdown"));
    cards.forEach(function (c, i) { c.dataset.i = i; });   // исходный порядок: по нему сортирует и меню «Игры»
    var themeOf = function (c) { var m = /theme-(\S+)/.exec(c.className); return m ? m[1] : ""; };
    var titleOf = function (c) { var t = c.querySelector(".game-title"); return t ? t.textContent.trim() : ""; };
    var read = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    var write = function (k, v) { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch (e) { /* без хранилища — только на время визита */ } };
    var smooth = function (el) { el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); };
    var pct = function (p) { return p && p.total ? Math.round(p.found / p.total * 100) : 0; };
    var progress = function () { return (window.bpProgress && window.bpProgress.games) || {}; };

    // ---------- избранное ----------
    var favs = read("bp_fav", []); if (!Array.isArray(favs)) favs = [];
    var isFav = function (c) { return favs.indexOf(themeOf(c)) >= 0; };
    var starSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.2 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.4 2.8 1-6-4.3-4.2 6-.9z"/></svg>';
    cards.forEach(function (card) {
        var banner = card.querySelector(".game-banner");
        if (!banner || banner.querySelector(".game-fav")) return;
        var b = document.createElement("button");
        b.type = "button"; b.className = "game-fav"; b.innerHTML = starSvg;
        banner.appendChild(b);
    });
    function syncStars() {
        cards.forEach(function (card) {
            var b = card.querySelector(".game-fav"); if (!b) return;
            var on = isFav(card);
            b.setAttribute("aria-pressed", String(on));
            b.setAttribute("aria-label", (on ? "Убрать из избранного: " : "В избранное: ") + titleOf(card));
            b.title = on ? "Убрать из избранного" : "В избранное";
            card.classList.toggle("is-fav", on);
        });
    }
    container.addEventListener("click", function (e) {
        var b = e.target.closest(".game-fav"); if (!b) return;
        e.preventDefault(); e.stopPropagation();   // кнопка лежит в summary: карточка не раскрывается
        var t = themeOf(b.closest("details.game-dropdown")), i = favs.indexOf(t);
        if (i >= 0) favs.splice(i, 1); else favs.push(t);
        write("bp_fav", favs); syncStars(); layout();
        dispatchEvent(new Event("bp:fav"));
    });

    // ---------- сортировка и фильтры ----------
    var MODES = [
        ["all", "Все"], ["new", "Новые"], ["mine", "С прогрессом"], ["recent", "Недавние"], ["db", "С базой данных"], ["soon", "Скоро"], ["az", "А–Я"]
    ];
    var mode = read("bp_home_sort", "all"); if (!MODES.some(function (m) { return m[0] === mode; })) mode = "all";
    var bar = document.createElement("div");
    bar.className = "lib-sort"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Сортировка и фильтры библиотеки");
    bar.innerHTML = MODES.map(function (m) { return '<button type="button" data-mode="' + m[0] + '" aria-pressed="false">' + m[1] + "</button>"; }).join("");
    var toggle = document.querySelector(".game-search .view-toggle"), search = document.querySelector(".game-search");
    if (toggle) toggle.before(bar); else if (search) search.appendChild(bar);
    var empty = document.createElement("p");
    empty.className = "lib-empty"; empty.hidden = true;
    container.before(empty);

    function freshDate(c) {   // дата добавления / обновления из GAME_FRESH (js/script.js)
        var info = typeof GAME_FRESH !== "undefined" && GAME_FRESH[themeOf(c)];
        return info ? (info.updated || info.added || "") : "";
    }
    function layout() {
        var recent = read("bp_recent", []); if (!Array.isArray(recent)) recent = [];
        var rank = function (c) { var t = themeOf(c); for (var i = 0; i < recent.length; i++) if (recent[i] && recent[i].game === t) return i; return -1; };
        var prog = progress(), shown = cards.slice();
        var idx = function (c) { return +c.dataset.i; };
        if (mode === "mine") shown = shown.filter(function (c) { return prog[themeOf(c)] && prog[themeOf(c)].found > 0; });
        var DB = ["skyrim", "gothic", "tainted"], F = typeof GAME_FRESH !== "undefined" ? GAME_FRESH : {};
        if (mode === "db") shown = shown.filter(function (c) { return DB.indexOf(themeOf(c)) >= 0; });
        if (mode === "soon") shown = shown.filter(function (c) { var f = F[themeOf(c)]; return f && f.release && Date.now() < new Date(f.release + "T00:00:00+03:00").getTime(); });
        if (mode === "recent") shown = shown.filter(function (c) { return rank(c) >= 0; });
        var key = {
            all: function (a, b) { return idx(a) - idx(b); },
            "new": function (a, b) { return freshDate(b).localeCompare(freshDate(a)) || idx(a) - idx(b); },
            mine: function (a, b) { return pct(prog[themeOf(b)]) - pct(prog[themeOf(a)]) || idx(a) - idx(b); },
            recent: function (a, b) { return rank(a) - rank(b); },
            db: function (a, b) { return idx(a) - idx(b); },
            soon: function (a, b) { return idx(a) - idx(b); },
            az: function (a, b) { return titleOf(a).localeCompare(titleOf(b), "ru"); }
        }[mode];
        var order = cards.slice().sort(function (a, b) {
            return (isFav(b) - isFav(a)) || key(a, b);
        });
        var now = [].slice.call(container.children).filter(function (el) { return cards.indexOf(el) >= 0; });
        if (order.some(function (c, i) { return c !== now[i]; })) order.forEach(function (c) { container.appendChild(c); });   // двигаем карточки, только если порядок изменился
        var tail = container.querySelector(":scope > .game-suggest-banner");
        if (tail && tail !== container.lastElementChild) container.appendChild(tail);   // баннер «Предложить игру» всегда в конце сетки
        cards.forEach(function (c) { c.classList.toggle("is-filtered", shown.indexOf(c) < 0); });
        bar.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.mode === mode)); });
        var none = shown.length === 0;
        empty.hidden = !none;
        if (none) empty.textContent = mode === "mine" ? "Пока нет игр с отмеченными метками: найденное на картах появится здесь." : mode === "soon" ? "Анонсированных игр пока нет." : mode === "db" ? "Баз данных пока нет." : "Вы ещё не открывали карты на этом устройстве.";
        if (typeof fitSuggestBanner === "function") fitSuggestBanner();
    }
    bar.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        mode = b.dataset.mode; write("bp_home_sort", mode); layout();
    });

    // ---------- «Мой прогресс» в верхней панели ----------
    var nav = document.querySelector("#topbar .tb-nav"), dd = null, ddBtn = null, ddMenu = null;
    function fmt(n) { return n.toLocaleString("ru-RU"); }
    function renderProgressMenu() {
        return; // «Мой прогресс» заменён ссылкой «Кабинет» в меню (2026-11-18)
        if (!nav) return;
        var prog = progress(), rows = cards.map(function (c) { return { c: c, p: prog[themeOf(c)] }; }).filter(function (r) { return r.p && r.p.found > 0; });
        if (!rows.length) { if (dd) dd.hidden = true; return; }
        if (!dd) {
            dd = document.createElement("div");
            dd.className = "tb-dd tb-prog"; dd.id = "tb-prog";
            dd.innerHTML = '<a class="tb-link tb-dd-btn tb-prog-btn" href="#games-heading" aria-haspopup="true" aria-expanded="false" aria-controls="tb-prog-menu"><span>Мой прогресс</span><b class="tb-prog-pct"></b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></a><div class="tb-menu tb-prog-menu" id="tb-prog-menu" hidden></div>';
            var games = $("tb-games-link"), after = games ? games.closest(".tb-dd") || games : null;
            if (after && after.parentNode === nav) after.after(dd); else nav.appendChild(dd);
            ddBtn = dd.querySelector(".tb-prog-btn"); ddMenu = dd.querySelector(".tb-prog-menu");
            ddBtn.addEventListener("click", function (e) {
                e.preventDefault();
                var open = ddMenu.hidden;
                if (open) [].slice.call(document.querySelectorAll("#topbar .tb-dd-btn[aria-expanded=true]")).forEach(function (b) { if (b !== ddBtn) b.click(); });
                setOpen(open);
            });
            ddMenu.addEventListener("click", function (e) {
                var a = e.target.closest("a[data-theme-id]"); if (!a) return;
                e.preventDefault(); setOpen(false);
                var card = container.querySelector("details.theme-" + a.dataset.themeId);
                if (card) { card.open = true; smooth(card); }
            });
            document.addEventListener("click", function (e) { if (!dd.contains(e.target)) setOpen(false); });
            document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ddMenu.hidden) { setOpen(false); ddBtn.focus(); } });
        }
        dd.hidden = false;
        var found = 0, total = 0;
        rows.forEach(function (r) { found += r.p.found; });
        cards.forEach(function (c) { var p = prog[themeOf(c)]; if (p) total += p.total; });
        rows.sort(function (a, b) { return pct(b.p) - pct(a.p) || b.p.found - a.p.found; });
        var done = rows.filter(function (r) { return r.p.found >= r.p.total; }).length;
        ddBtn.querySelector(".tb-prog-pct").textContent = total ? Math.round(found / total * 100) + "%" : "";
        var esc = function (s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); };
        ddMenu.innerHTML = '<div class="prog-sum"><strong>' + fmt(found) + '</strong><span>меток найдено в ' + rows.length + " " + (rows.length === 1 ? "игре" : "играх") + (done ? ", завершено: " + done : "") + "</span></div>" +
            rows.map(function (r) {
                var p = pct(r.p), acc = getComputedStyle(r.c).getPropertyValue("--game-accent").trim();
                return '<a href="#games-heading" data-theme-id="' + esc(themeOf(r.c)) + '"' + (acc ? ' style="--pa:' + esc(acc) + '"' : "") + "><span class=\"prog-name\">" + esc(titleOf(r.c)) + '</span><span class="prog-n">' + fmt(r.p.found) + " / " + fmt(r.p.total) + '</span><span class="prog-bar" aria-hidden="true"><i style="width:' + p + '%"></i></span><span class="prog-pct">' + p + "%</span></a>";
            }).join("");
    }
    function setOpen(open) {
        if (!ddMenu) return;
        ddMenu.hidden = !open;
        ddBtn.setAttribute("aria-expanded", String(open));
    }

    syncStars();
    function init() { layout(); renderProgressMenu(); }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
    document.addEventListener("DOMContentLoaded", function () { });   // js/topbar.js (bpLastMap) подключён после этого файла
    document.addEventListener("bp:progress", function () { layout(); renderProgressMenu(); });
    addEventListener("pageshow", function (e) { if (e.persisted) { favs = read("bp_fav", []); syncStars(); layout(); } });
})();
