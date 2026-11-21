// Главная: надстройка над библиотекой игр (разметку карточек генерирует scripts/prerender_home.py, прогресс считает js/script.js).
//   • избранные игры: звёздочка на карточке (bp_fav), избранное идёт первым в библиотеке и в меню «Игры» (js/topbar.js);
//   • фильтры (Все · Новые · С прогрессом, в «Ещё» — Недавние · С базой данных · Скоро; bp_home_filter) и отдельная сортировка (bp_home_order),
//     рядом с переключателем «Сетка / Список»;
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
        b.classList.remove("is-pop"); void b.offsetWidth; b.classList.add("is-pop");   // короткая «вспышка» звезды (css/home-v3.css)
        dispatchEvent(new Event("bp:fav"));
    });

    // ---------- фильтры и сортировка ----------
    // Фильтр (что показать) и сортировка (в каком порядке) — независимы: bp_home_filter и bp_home_order.
    // Основные фильтры видны всегда, дополнительные — в меню «Ещё»; сортировка — отдельное меню справа.
    var FILTERS = [["all", "Все"], ["new", "Новые"], ["mine", "С прогрессом"]];
    var MORE = [["recent", "Недавние"], ["db", "С базой данных"], ["soon", "Скоро"]];
    var ORDERS = [["default", "По умолчанию"], ["fresh", "Сначала новые"], ["progress", "По прогрессу"], ["az", "По названию"]];
    var NEW_DAYS = 14;   // «Новые»: игра добавлена или обновлена за последние две недели (даты — GAME_FRESH в js/script.js)
    var has = function (list, v) { return list.some(function (m) { return m[0] === v; }); };
    var raw = function (k) { try { return String(localStorage.getItem(k) || "").replace(/^"|"$/g, ""); } catch (e) { return ""; } };
    var filter = raw("bp_home_filter"), order = raw("bp_home_order");
    if (!filter && !order) {   // прежняя единая настройка bp_home_sort: «А–Я» была сортировкой, остальное — фильтрами
        var old = raw("bp_home_sort");
        if (old === "az") order = "az"; else filter = old;
    }
    if (!has(FILTERS, filter) && !has(MORE, filter)) filter = "all";
    if (!has(ORDERS, order)) order = "default";
    var chev = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    var tick = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
    var item = function (m, kind) { return '<button type="button" role="menuitemradio" data-' + kind + '="' + m[0] + '" aria-checked="false"><span>' + m[1] + "</span>" + tick + "</button>"; };
    var bar = document.createElement("div");
    bar.className = "lib-sort"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Фильтры библиотеки");
    bar.innerHTML = FILTERS.map(function (m) { return '<button type="button" data-filter="' + m[0] + '" aria-pressed="false">' + m[1] + "</button>"; }).join("") +
        '<div class="lib-dd lib-more"><button type="button" class="lib-dd-btn" aria-haspopup="true" aria-expanded="false" aria-controls="lib-more-menu"><span>Ещё</span>' + chev + "</button>" +
        '<div class="lib-menu" id="lib-more-menu" role="menu" aria-label="Другие фильтры" hidden>' + MORE.map(function (m) { return item(m, "filter"); }).join("") + "</div></div>";
    var sorter = document.createElement("div");
    sorter.className = "lib-dd lib-order";
    sorter.innerHTML = '<button type="button" class="lib-dd-btn" aria-haspopup="true" aria-expanded="false" aria-controls="lib-order-menu"><span class="lib-order-label">Сортировка</span>' + chev + "</button>" +
        '<div class="lib-menu" id="lib-order-menu" role="menu" aria-label="Сортировка" hidden>' + ORDERS.map(function (m) { return item(m, "order"); }).join("") + "</div>";
    var toggle = document.querySelector(".game-search .view-toggle"), search = document.querySelector(".game-search");
    if (toggle) { toggle.before(bar); toggle.before(sorter); } else if (search) { search.appendChild(bar); search.appendChild(sorter); }
    var moreBtn = bar.querySelector(".lib-more .lib-dd-btn"), orderBtn = sorter.querySelector(".lib-dd-btn");
    var empty = document.createElement("p");
    empty.className = "lib-empty"; empty.hidden = true;
    container.before(empty);

    // выпадающие меню «Ещё» и «Сортировка»: одно открытое, клик вне и Escape закрывают, стрелки ходят по пунктам
    var dds = [bar.querySelector(".lib-more"), sorter];
    function openDd(dd, open, focusItem) {
        var btn = dd.querySelector(".lib-dd-btn"), menu = dd.querySelector(".lib-menu");
        if (open) dds.forEach(function (d) { if (d !== dd) openDd(d, false); });
        menu.hidden = !open; btn.setAttribute("aria-expanded", String(open)); dd.classList.toggle("is-open", open);
        if (open && focusItem) (menu.querySelector('[aria-checked="true"]') || menu.querySelector("button")).focus();
    }
    dds.forEach(function (dd) {
        var btn = dd.querySelector(".lib-dd-btn"), menu = dd.querySelector(".lib-menu");
        btn.addEventListener("click", function () { openDd(dd, menu.hidden, false); });
        btn.addEventListener("keydown", function (e) { if (e.key === "ArrowDown") { e.preventDefault(); openDd(dd, true, true); } });
        menu.addEventListener("keydown", function (e) {
            var items = [].slice.call(menu.querySelectorAll("button")), i = items.indexOf(document.activeElement);
            if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus(); }
            if (e.key === "Escape" || e.key === "Tab") { openDd(dd, false); if (e.key === "Escape") { e.stopPropagation(); btn.focus(); } }
        });
    });
    document.addEventListener("click", function (e) { dds.forEach(function (dd) { if (!dd.contains(e.target)) openDd(dd, false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") dds.forEach(function (dd) { openDd(dd, false); }); });

    var dayMs = 864e5, F = typeof GAME_FRESH !== "undefined" ? GAME_FRESH : {};
    function freshDate(c) {   // дата добавления / обновления из GAME_FRESH (js/script.js)
        var info = F[themeOf(c)];
        return info ? (info.updated || info.added || "") : "";
    }
    var isSoon = function (c) { var f = F[themeOf(c)]; return !!(f && f.release && Date.now() < new Date(f.release + "T00:00:00+03:00").getTime()); };
    var isNew = function (c) { var d = freshDate(c); return !!d && !isSoon(c) && Date.now() - new Date(d + "T00:00:00+03:00").getTime() < NEW_DAYS * dayMs; };
    function layout() {
        var recent = read("bp_recent", []); if (!Array.isArray(recent)) recent = [];
        var rank = function (c) { var t = themeOf(c); for (var i = 0; i < recent.length; i++) if (recent[i] && recent[i].game === t) return i; return -1; };
        var prog = progress(), idx = function (c) { return +c.dataset.i; };
        var DB = ["skyrim", "gothic", "tainted"];
        var keep = {
            all: function () { return true; },
            "new": isNew,
            mine: function (c) { return prog[themeOf(c)] && prog[themeOf(c)].found > 0; },
            recent: function (c) { return rank(c) >= 0; },
            db: function (c) { return DB.indexOf(themeOf(c)) >= 0; },
            soon: isSoon
        }[filter];
        var shown = cards.filter(keep);
        var byDate = function (a, b) { return freshDate(b).localeCompare(freshDate(a)); };
        var key = {
            // «По умолчанию» подстраивается под фильтр: недавние — по времени открытия, новые — по дате, с прогрессом — по проценту
            "default": filter === "recent" ? function (a, b) { return rank(a) - rank(b); } : filter === "new" ? byDate : filter === "mine" ? function (a, b) { return pct(prog[themeOf(b)]) - pct(prog[themeOf(a)]); } : function () { return 0; },
            fresh: byDate,
            progress: function (a, b) { return pct(prog[themeOf(b)]) - pct(prog[themeOf(a)]) || ((prog[themeOf(b)] || {}).found || 0) - ((prog[themeOf(a)] || {}).found || 0); },
            az: function (a, b) { return titleOf(a).localeCompare(titleOf(b), "ru"); }
        }[order];
        var sorted = cards.slice().sort(function (a, b) {
            return (isFav(b) - isFav(a)) || key(a, b) || idx(a) - idx(b);
        });
        var now = [].slice.call(container.children).filter(function (el) { return cards.indexOf(el) >= 0; });
        if (sorted.some(function (c, i) { return c !== now[i]; })) sorted.forEach(function (c) { container.appendChild(c); });   // двигаем карточки, только если порядок изменился
        var tail = container.querySelector(":scope > .game-suggest-banner");
        if (tail && tail !== container.lastElementChild) container.appendChild(tail);   // баннер «Предложить игру» всегда в конце сетки
        cards.forEach(function (c) { c.classList.toggle("is-filtered", shown.indexOf(c) < 0); });
        bar.querySelectorAll("[data-filter][aria-pressed]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === filter)); });
        bar.querySelectorAll("[data-filter][aria-checked]").forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.filter === filter)); });
        sorter.querySelectorAll("[data-order]").forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.order === order)); });
        // «Ещё» показывает выбранный в нём фильтр и подсвечивается, как активный
        var moreOn = MORE.filter(function (m) { return m[0] === filter; })[0];
        moreBtn.querySelector("span").textContent = moreOn ? moreOn[1] : "Ещё";
        moreBtn.classList.toggle("is-on", !!moreOn);
        moreBtn.setAttribute("aria-label", moreOn ? "Другие фильтры, выбрано: " + moreOn[1] : "Другие фильтры");
        var ord = ORDERS.filter(function (m) { return m[0] === order; })[0];
        sorter.querySelector(".lib-order-label").textContent = order === "default" ? "Сортировка" : ord[1];
        orderBtn.classList.toggle("is-on", order !== "default");
        orderBtn.setAttribute("aria-label", "Сортировка: " + ord[1].toLowerCase());
        var none = shown.length === 0;
        empty.hidden = !none;
        if (none) empty.textContent = filter === "mine" ? "Пока нет игр с отмеченными метками: найденное на картах появится здесь." : filter === "soon" ? "Анонсированных игр пока нет." : filter === "db" ? "Баз данных пока нет." : filter === "new" ? "За последние две недели новых игр и обновлений не было." : "Вы ещё не открывали карты на этом устройстве.";
        if (typeof fitSuggestBanner === "function") fitSuggestBanner();
        var q = $("game-search-input");   // пересчитать «Найдено: N из M» под новый фильтр
        if (q && q.value.trim()) q.dispatchEvent(new Event("input"));
    }
    bar.addEventListener("click", function (e) {
        var b = e.target.closest("[data-filter]"); if (!b) return;
        filter = b.dataset.filter; write("bp_home_filter", filter); write("bp_home_order", order);
        openDd(dds[0], false); layout();
        if (b.getAttribute("role") === "menuitemradio") moreBtn.focus();
    });
    sorter.addEventListener("click", function (e) {
        var b = e.target.closest("[data-order]"); if (!b) return;
        order = b.dataset.order; write("bp_home_order", order); write("bp_home_filter", filter);
        openDd(sorter, false); layout(); orderBtn.focus();
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

    // ---------- сводка для личного кабинета: расчёт и достижения — js/progress-core.js (кабинет пересчитывает её и сам) ----------
    var cardOf = function (t) { return cards.filter(function (c) { return themeOf(c) === t; })[0]; };
    var summaryTimer = 0;
    function saveSummary() {
        clearTimeout(summaryTimer);
        if (!window.BPP) return;
        summaryTimer = setTimeout(function () {
            var prog = progress();
            var rows = cards.filter(function (c) { return prog[themeOf(c)]; }).map(function (c) {
                var p = prog[themeOf(c)];
                return { id: themeOf(c), title: titleOf(c), found: p.found, total: p.total, accent: getComputedStyle(c).getPropertyValue("--game-accent").trim() };
            });
            var recent = read("bp_recent", []), maps = window.bpProgress && window.bpProgress.maps, last = null;
            (Array.isArray(recent) ? recent : []).some(function (r) {
                var info = r && maps && maps.get(r.game + "/" + r.map), c = r && cardOf(r.game);
                if (info && info.href) last = { href: info.href, name: info.name, title: c ? titleOf(c) : "" };
                return !!last;
            });
            BPP.saveSummary(rows, last, favs.filter(function (t) { return cardOf(t); }).length);
        }, 300);
    }

    syncStars();
    function init() { layout(); renderProgressMenu(); }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
    document.addEventListener("DOMContentLoaded", function () { });   // js/topbar.js (bpLastMap) подключён после этого файла
    document.addEventListener("bp:progress", function () { layout(); renderProgressMenu(); saveSummary(); });
    addEventListener("bp:fav", saveSummary);
    addEventListener("pageshow", function (e) { if (e.persisted) { favs = read("bp_fav", []); syncStars(); layout(); } });
})();
