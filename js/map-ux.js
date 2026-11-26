// Удобство карт (общий модуль для всех игр; стили — css/map-ux.css). Подключается ПОСЛЕ js/app.js игры.
//   2) фильтры: кнопка «Только эта» у каждой категории и «Сбросить фильтры»;
//   3) переключатель «Карта | База данных», кнопка «← К записи» после «На карте» из базы.
// Модуль работает поверх движка игры и ничего в нём не ломает: нужных функций нет — соответствующая часть просто не включается.
(function () {
    "use strict";
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    var store = {
        get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* нет доступа */ } },
        json: function (k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
    };

    // ======================================================================
    // 2. Фильтры: «Только эта» и пресеты
    // ======================================================================
    function cats() { try { return typeof CATEGORIES !== "undefined" ? CATEGORIES : null; } catch (e) { return null; } }
    function eng() { // движок игры: состояние и функции перерисовки (если они есть)
        try {
            if (typeof state === "undefined" || !(state.hidden instanceof Set)) return null;
            if (typeof CAT_BY_KEY === "undefined" || typeof renderFilters !== "function" || typeof applyVisibility !== "function") return null;
            return { st: state, by: CAT_BY_KEY, groups: cats() };
        } catch (e) { return null; }
    }
    function visibleKeys(E) { return Object.keys(E.by).filter(function (k) { return !E.st.hidden.has(k); }); }
    function apply(E, hiddenSet) { E.st.hidden = hiddenSet; renderFilters(); applyVisibility(); }
    function onlyKey(E) { var v = visibleKeys(E); return v.length === 1 ? v[0] : null; }

    var ONLY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"/></svg>';
    function decorate() {
        var box = document.getElementById("filters-container");
        var E = eng();
        try { sbDecorate(); } catch (e) { /* компактная панель не должна ломать фильтры */ }
        if (!box || !E) return;
        var only = onlyKey(E);
        [].forEach.call(box.querySelectorAll(".filter-row"), function (row) {
            var item = row.querySelector(".filter-item");
            if (!item) return;
            var b = row.querySelector(".bp-only");
            if (!b) {
                b = document.createElement("button");
                b.type = "button"; b.className = "bp-only";
                b.innerHTML = ONLY_SVG;
                row.appendChild(b);
            }
            var name = (item.querySelector(".filter-name") || item).textContent.trim();
            var on = only === item.dataset.cat;
            b.classList.toggle("is-on", on);
            b.setAttribute("aria-pressed", String(on));
            b.title = on ? "Показать все категории" : "Показать только эту категорию";
            b.setAttribute("aria-label", (on ? "Показать все категории" : "Показать только: ") + (on ? "" : name));
        });
        renderPresets(E);
        try { sbDecorate(); } catch (e) { /* см. выше */ }
    }

    // --- место бывшей «Сбросить фильтры» (кнопка убрана) ---
    var presetBox = null;
    // фильтры изменены: скрыты категории, включено «Скрыть найденные» или подсветка
    // набор по умолчанию: категории с hidden: true и DEFAULT_HIDDEN игры (если есть)
    function defaultHidden(E) {
        var out = new Set();
        (E.groups || []).forEach(function (g) { g.items.forEach(function (c) { if (c.hidden) out.add(c.key); }); });
        try { if (typeof DEFAULT_HIDDEN !== "undefined") Array.from(DEFAULT_HIDDEN).forEach(function (k) { out.add(k); }); } catch (e) { /* нет списка */ }
        out.forEach(function (k) { if (!E.by[k]) out.delete(k); });
        return out;
    }
    function filtersChanged(E) {
        var hf = document.getElementById("hide-found-btn");
        return !same(Array.from(E.st.hidden), Array.from(defaultHidden(E))) || !!E.st.hideFound || (hf && hf.getAttribute("aria-pressed") === "true") || !!document.querySelector("#filters-container .locate-clear");
    }
    // особые ограничения игры: уровень существ, источники предмета (Dimraeth)
    function levelOn() { var c = document.getElementById("lv-clear"); return c && !c.hidden ? c : null; }
    function focusOn() { var b = document.getElementById("focus-banner"); return b && !b.hidden ? b : null; }
    function resetFilters(E) {
        var lv = levelOn(), fo = focusOn();
        if (lv) lv.click();
        if (fo) { var fcb = document.getElementById("focus-clear"); if (fcb) fcb.click(); }
        var hf = document.getElementById("hide-found-btn");
        if (E.st.hideFound || (hf && hf.getAttribute("aria-pressed") === "true")) hf.click();
        var lc = document.querySelector("#filters-container .locate-clear");
        if (lc) lc.click();
        apply(E, defaultHidden(E));
    }
    function same(a, b) { if (a.length !== b.length) return false; var s = new Set(b); return a.every(function (k) { return s.has(k); }); }
    // активные фильтры одной строкой: что ограничено + «Сбросить» (видно и при закрытых «Дополнительных фильтрах»)
    // чип ограничения — кнопка: нажатие снимает именно это ограничение
    function chip(t, act) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "bp-chip bp-chip-on"; b.dataset.act = act;
        b.title = "Снять: " + t; b.setAttribute("aria-label", "Снять ограничение: " + t);
        var l = document.createElement("span"); l.className = "bp-chip-t"; l.textContent = t;
        var x = document.createElement("span"); x.className = "bp-chip-x"; x.setAttribute("aria-hidden", "true");
        b.appendChild(l); b.appendChild(x);
        return b;
    }
    function present(E) {
        return [].map.call(document.querySelectorAll("#filters-container .filter-row:not([hidden]) .filter-item"), function (x) { return x.dataset.cat; });
    }
    function dropRestriction(E, act) {
        var def = defaultHidden(E), h;
        if (act === "only") { apply(E, def); return; }
        if (act === "extra") { h = new Set(E.st.hidden); present(E).forEach(function (k) { if (!def.has(k)) h.delete(k); }); apply(E, h); return; }
        if (act === "unhid") { h = new Set(E.st.hidden); present(E).forEach(function (k) { if (def.has(k)) h.add(k); }); apply(E, h); return; }
        if (act === "found") { var hf = document.getElementById("hide-found-btn"); if (hf) hf.click(); return; }
        if (act === "locate") { var lc = document.querySelector("#filters-container .locate-clear"); if (lc) lc.click(); return; }
        if (act === "level") { var lv = levelOn(); if (lv) lv.click(); }
    }
    function renderActive(E, row) {
        var chips = row.querySelector(".bp-sb-chips");
        var def = defaultHidden(E), extra = 0, shown = 0, total = 0;
        var unhid = 0;
        present(E).forEach(function (k) { total++; if (!E.st.hidden.has(k)) { shown++; if (def.has(k)) unhid++; } else if (!def.has(k)) extra++; });
        var list = [];
        var only = onlyKey(E);
        // чипа «Только: …» нет — режим снимается повторным двойным нажатием или кнопкой в строке категории
        // «Скрыто категорий» и «Включены скрытые по умолчанию» не показываем
        var lv = levelOn();
        if (lv) {
            var lo = (document.getElementById("lv-lo") || {}).value, hi = (document.getElementById("lv-hi") || {}).value;
            list.push(["Уровень " + (lo || "1") + "–" + (hi || "∞"), "level"]);
        }
        var changed = list.length > 0; // кнопки «Сбросить фильтры» нет — каждое ограничение снимается своим чипом
        chips.textContent = "";
        list.forEach(function (t) { chips.appendChild(chip(t[0], t[1])); });
        row.classList.toggle("is-on", changed);
        if (!row.__bp) {
            row.__bp = true;
            row.addEventListener("click", function (e) {
                var E2 = eng();
                if (!E2) return;
                var c = e.target.closest(".bp-chip-on");
                if (c) { dropRestriction(E2, c.dataset.act); setTimeout(decorate, 0); return; }
                if (e.target.closest(".bp-chip-reset")) resetFilters(E2);
            });
            // особые фильтры меняются вне renderFilters — пересчитаем строку после их ввода
            ["lv-lo", "lv-hi", "lv-clear", "focus-clear"].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) ["input", "change", "click"].forEach(function (ev) { el.addEventListener(ev, function () { setTimeout(decorate, 0); }); });
            });
            var fb = document.getElementById("focus-banner");
            if (fb && window.MutationObserver) new MutationObserver(function () { setTimeout(decorate, 0); }).observe(fb, { attributes: true, attributeFilter: ["hidden"] });
        }
    }
    function renderPresets(E) {
        var box = document.getElementById("filters-container");
        if (!box || !E.groups) return;
        var row = document.querySelector("#sidebar .bp-sb-active");
        if (row) { renderActive(E, row); return; }
        if (!presetBox) {
            presetBox = document.createElement("div");
            presetBox.className = "bp-presets";
            presetBox.setAttribute("role", "group");
            presetBox.setAttribute("aria-label", "Быстрые наборы категорий");
            box.parentNode.insertBefore(presetBox, box);
            presetBox.addEventListener("click", function (e) {
                var b = e.target.closest(".bp-chip");
                var E2 = eng();
                if (!b || !E2) return;
                if (b.dataset.id === "reset") resetFilters(E2);
            });
        }
        presetBox.hidden = true; // «Сбросить фильтры» убрана
        presetBox.innerHTML = "";
    }

    var fc = document.getElementById("filters-container");
    if (fc) {
        fc.addEventListener("click", function (e) {
            var gt = e.target.closest(".bp-gt");
            if (gt) {
                e.stopPropagation();
                var Eg = eng();
                if (!Eg) return;
                var keys = [].map.call(gt.closest(".filter-group").querySelectorAll(".filter-row:not([hidden]) .filter-item"), function (x) { return x.dataset.cat; });
                var anyShown = keys.some(function (k) { return !Eg.st.hidden.has(k); });
                var next = new Set(Eg.st.hidden);
                keys.forEach(function (k) { if (anyShown) next.add(k); else next.delete(k); });
                apply(Eg, next);
                return;
            }
            var b = e.target.closest(".bp-only");
            if (!b) return;
            e.stopPropagation();
            var E = eng();
            var item = b.closest(".filter-row").querySelector(".filter-item");
            if (!E || !item) return;
            var key = item.dataset.cat;
            if (onlyKey(E) === key) apply(E, new Set());
            else apply(E, new Set(Object.keys(E.by).filter(function (k) { return k !== key; })));
        }, true);
        // renderFilters вызывает движок игры; оборачиваем его, чтобы кнопки появлялись сразу, без «мигания»
        if (typeof window.renderFilters === "function" && !window.renderFilters.__bp) {
            var orig = window.renderFilters;
            window.renderFilters = function () { var r = orig.apply(this, arguments); try { decorate(); } catch (e) { /* не мешаем движку */ } return r; };
            window.renderFilters.__bp = true;
        } else if (window.MutationObserver) {
            new MutationObserver(function () { decorate(); }).observe(fc, { childList: true });
        }
        decorate();
        // «Скрыть все / Показать все» и клики по категориям идут мимо renderFilters — обновим пометки после них
        document.addEventListener("click", function (e) {
            if (e.target.closest("#filters-container .filter-item, #show-all-btn, #hide-all-btn, #hide-found-btn")) setTimeout(decorate, 0);
        });
    }

    // ======================================================================
    // 3. Навигация: главная › игра, «Карта | База данных», «← К записи»
    // ======================================================================
    var DB = { "skyrim-map": "skyrim", "gothic-remake-map": "gothic-remake", "tainted-grail-map": "tainted-grail" };
    var folder = (location.pathname.split("/").filter(Boolean)[0]) || "";
    var slug = DB[folder] || "";
        (function nav() {
        var head = $(".sidebar-header", sidebar);
        var ready = $(".bp-nav a[data-bp-db]", sidebar);
        if (ready) { // вкладки собраны общим шаблоном (web/components/map/map-sidebar.ts): только вернуть к последней записи базы
            var bk = null;
            try { bk = JSON.parse(sessionStorage.getItem("bp_db_back") || "null"); } catch (e) { /* нет доступа */ }
            if (bk && bk.game === slug && bk.url) ready.href = bk.url;
            return;
        }
        if (!head || $(".bp-nav", sidebar)) return;
        var box = document.createElement("div");
        box.className = "bp-nav";
        // хлебные крошки убраны (компактная шапка): остаётся только переключатель «Карта | База данных»
        if (!slug) return;
        var html = "";
        {
            var back = null;
            try { back = JSON.parse(sessionStorage.getItem("bp_db_back") || "null"); } catch (e) { /* нет доступа */ }
            var dbUrl = back && back.game === slug && back.url ? back.url : "/db/" + slug + "/";
            html += '<div class="bp-seg" role="group" aria-label="Раздел игры"><span aria-current="page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>Карта</span>' +
                '<a href="' + dbUrl + '"><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>База данных</a></div>';
        }
        box.innerHTML = html;
        head.parentNode.insertBefore(box, head.nextSibling); // всегда сразу под логотипом
    })();

    // ======================================================================
    // 5. Компактная панель (css/map-ux.css, раздел 5): выбор карты → закреплённый поиск → прогресс одной строкой →
    //    действия в одну строку → быстрые наборы → категории «иконка · название · найдено/всего».
    //    Узлы только переставляются: id и обработчики движков игр не меняются.
    // ======================================================================
    // sbDecorate вызывается ещё до объявления переменных ниже — ключ считаем на месте
    function groupsKey() { return "bp_sb_groups:" + (location.pathname.split("/").filter(Boolean)[0] || ""); }
    function collapsedSet() { var a = store.json(groupsKey()); return new Set(Array.isArray(a) ? a : []); }
    function groupName(g) {
        var t = g.querySelector(".filter-group-title");
        if (!t) return "";
        var c = t.cloneNode(true);
        [].forEach.call(c.querySelectorAll(".filter-hint, .bp-gcol"), function (n) { n.remove(); });
        return c.textContent.trim();
    }
    function chev() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'; }
    function dots() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>'; }
    // вызывается после каждой перерисовки категорий движком (decorate)
    function rowCount(row) {
        var m = (($(".filter-count", row) || {}).textContent || "").match(/(\d+)\s*\/\s*(\d+)/);
        return m ? [+m[1], +m[2]] : null;
    }
    function sbDecorate() {
        var box = document.getElementById("filters-container");
        if (!box) return;
        var closed = collapsedSet();
        // категории, которых нет на текущей карте (0 меток), не показываем — во всех играх одинаково
        [].forEach.call(box.querySelectorAll(".filter-row"), function (row) {
            var c = rowCount(row);
            row.hidden = !!c && c[1] === 0;
        });
        [].forEach.call(box.querySelectorAll(".filter-group"), function (g) {
            var t = g.querySelector(".filter-group-title");
            if (!t) return;
            var rows = [].filter.call(g.querySelectorAll(".filter-row"), function (r) { return !r.hidden; });
            g.hidden = !rows.length;
            // счётчик группы «найдено/всего» — сумма видимых строк (одинаково во всех играх)
            var sum = rows.reduce(function (a, r) { var c = rowCount(r) || [0, 0]; return [a[0] + c[0], a[1] + c[1]]; }, [0, 0]);
            var hint = t.querySelector(".filter-hint");
            if (!hint) { hint = document.createElement("span"); hint.className = "filter-hint"; t.appendChild(document.createTextNode(" ")); t.appendChild(hint); }
            if (hint.textContent !== sum[0] + "/" + sum[1]) hint.textContent = sum[0] + "/" + sum[1];
            // видимость группы: у игр без своей кнопки — общая (.bp-gt)
            if (!g.querySelector(".group-toggle")) {
                if (!t.parentNode.classList.contains("filter-group-head")) { // строка заголовка как у остальных игр
                    var hd = document.createElement("div");
                    hd.className = "filter-group-head";
                    t.parentNode.insertBefore(hd, t);
                    hd.appendChild(t);
                }
                var gt = document.createElement("button");
                gt.type = "button"; gt.className = "group-toggle bp-gt";
                t.insertAdjacentElement("afterend", gt);
            }
            var own = g.querySelector(".bp-gt");
            if (own) {
                var E = eng(), shown = E && rows.some(function (r) { var it = $(".filter-item", r); return it && !E.st.hidden.has(it.dataset.cat); });
                own.textContent = shown ? "скрыть" : "показать";
            }
            var name = groupName(g);
            var b = t.querySelector(".bp-gcol");
            if (!b) {
                b = document.createElement("button");
                b.type = "button"; b.className = "bp-gcol"; b.innerHTML = chev();
                t.insertBefore(b, t.firstChild);
            }
            var shut = closed.has(name);
            g.classList.toggle("is-collapsed", shut);
            b.setAttribute("aria-expanded", String(!shut));
            b.setAttribute("aria-label", (shut ? "Развернуть группу: " : "Свернуть группу: ") + name);
        });
        [].forEach.call(box.querySelectorAll(".filter-row"), function (row) {
            [].forEach.call(row.querySelectorAll(":scope > .filter-locate, :scope > .bp-only"), function (x) { x.classList.add("bp-ra"); });
            var it = row.querySelector(".filter-item");
            if (it && !it.title) it.title = "Двойное нажатие — только эта категория";
            var old = row.querySelector(".bp-rm"); if (old) old.remove();
        });
    }
    // зоны/области (кнопки .zone-btn движка) → компактный выпадающий список; выбор нажимает исходную кнопку
    function zoneSelect(sw) {
        var sel = document.createElement("select");
        var label = sw.getAttribute("aria-label") || "Перейти к зоне";
        sel.className = "map-select bp-zone-select";
        sel.setAttribute("aria-label", label);
        sw.classList.add("bp-zone-src");
        var sync = function () {
            var btns = [].slice.call(sw.querySelectorAll(".zone-btn"));
            var sig = btns.map(function (b) { return b.dataset.zone; }).join("|");
            if (sel.dataset.sig !== sig) {
                sel.dataset.sig = sig;
                sel.textContent = "";
                var ph = document.createElement("option");
                ph.value = ""; ph.textContent = label + "…";
                sel.appendChild(ph);
                btns.forEach(function (b) {
                    var o = document.createElement("option");
                    o.value = b.dataset.zone; o.textContent = b.textContent.trim();
                    sel.appendChild(o);
                });
            }
            var a = sw.querySelector(".zone-btn.active");
            sel.value = a ? a.dataset.zone : "";
        };
        sel.addEventListener("change", function () {
            var v = sel.value;
            var b = v && [].filter.call(sw.querySelectorAll(".zone-btn"), function (x) { return x.dataset.zone === v; })[0];
            if (b) b.click();
        });
        sync();
        if (window.MutationObserver) new MutationObserver(sync).observe(sw, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
        sw.parentNode.insertBefore(sel, sw.nextSibling);
    }

    (function compactSidebar() {
        document.documentElement.classList.add("bp-sb");
        if (/[?&]sb=2col\b/.test(location.search)) document.documentElement.classList.add("bp-sb-2col"); // тест двух колонок (460 px)
        // один контейнер прокрутки во всех играх: где .scroll-body нет — оборачиваем всё содержимое панели
        var built = sidebar.getAttribute("data-bp-sb") === "2"; // собрана общим шаблоном при сборке — узлы уже на местах
        var body = $(".scroll-body", sidebar);
        if (!body) {
            body = document.createElement("div");
            body.className = "scroll-body";
            while (sidebar.firstChild) body.appendChild(sidebar.firstChild);
            sidebar.appendChild(body);
        }
        var section = $(".section", body);
        var search = $(".search-wrap", body);
        // подпись под логотипом («Интерактивная карта» и т. п.) не нужна: заголовок страницы уже это говорит
        [].forEach.call(body.querySelectorAll(".sidebar-header .brand > span"), function (s) { s.hidden = true; });

        // выбор карты — сверху, сразу под шапкой; поиск — под ним, вне .section, чтобы sticky работал на всю высоту
        if (built) {
            [].forEach.call(body.querySelectorAll(".bp-sb-maps .zone-switch"), zoneSelect);
            var inp0 = $("#search-input", search);
            if (inp0) inp0.placeholder = "Поиск метки или категории…";
            // поле «Карта»/«Область» без выбора (один вариант) не показываем
            [].forEach.call(body.querySelectorAll(".bp-sb-field"), function (f) { // скрытый самой игрой блок (hidden) остаётся скрытым
                var check = function () {
                    var n = f.querySelectorAll("option:not([value='']), .zone-btn, .map-btn, a[href], button:not(.zone-btn)").length;
                    var none = n < (f.dataset.kind === "map" ? 2 : 1);
                    f.classList.toggle("bp-sb-none", none);
                };
                check();
                if (window.MutationObserver) new MutationObserver(check).observe(f, { childList: true, subtree: true });
            });
        } else if (section && search) {
            var maps = document.createElement("div");
            maps.className = "bp-sb-maps";
            [].forEach.call(section.querySelectorAll(":scope > :is(.map-switch, .region-select, #zone-block, .zone-switch)"), function (n) {
                var prev = n.previousElementSibling;
                if (prev && prev.classList.contains("section-label")) prev.classList.add("bp-sb-label");
                maps.appendChild(n);
            });
            [].forEach.call(maps.querySelectorAll(".zone-switch"), zoneSelect);
            if (maps.children.length) section.parentNode.insertBefore(maps, section);
            search.classList.add("bp-sb-search");
            section.parentNode.insertBefore(search, section);
            var inp = $("#search-input", search);
            if (inp) inp.placeholder = "Поиск метки или категории…";
        }

        // прогресс: «Найдено 125 / 1467 · 9%» и тонкая полоса; подробности по локациям — по раскрытию (region-progress)
        var card = $(".progress-card", body);
        if (card) {
            card.classList.add("bp-sb-prog");
            // строка и пояснение уже есть, если панель собрана шаблоном (web/components/map/map-sidebar.ts)
            var line = $(".bp-prog-line", card), note = $(".bp-prog-note", card);
            if (!line) {
                line = document.createElement("div");
                line.className = "bp-prog-line";
                card.insertBefore(line, card.firstChild);
            }
            if (!note) {
                note = document.createElement("div");
                note.className = "bp-prog-note";
                note.hidden = true;
                card.appendChild(note);
            }
            var cnt = $("#progress-count", card), val = $("#progress-value", card);
            var num = function (x) { return x.replace(/[\s ]/g, ""); };
            var upd = function () {
                var t = cnt ? cnt.textContent : "";
                var m = t.match(/(\d[\d\s ]*)\s*(?:из|\/)\s*(\d[\d\s ]*)/);
                var pct = val ? val.textContent.trim() : "";
                line.textContent = m ? "Найдено " + num(m[1]) + " / " + num(m[2]) + (pct ? " · " + pct : "") : (t || ("Найдено " + pct));
                // пояснение из скобок («без заданий и служб») — иначе общий итог не сходится со счётчиками категорий
                var ex = t.match(/\(([^)]+)\)/);
                var nt = t ? "В подсчёте: эта карта, " + (ex ? ex[1].trim() : "все категории") + "." : "";
                if (!t) return; // счётчик ещё пуст: заготовка держит высоту до данных игры
                if (note.textContent !== nt) note.textContent = nt;
                note.hidden = !nt;
                card.title = t;
            };
            upd();
            if (window.MutationObserver) {
                var mo = new MutationObserver(upd);
                [cnt, val].forEach(function (n) { if (n) mo.observe(n, { childList: true, characterData: true, subtree: true }); });
            }
        }

        // действия одной строкой: «Показать/скрыть все», «Скрыть найденные», компактная «＋» рядом с «Ещё»
        var group = $(".btn-group", body), act = $(".bp-act-row", body), add = $("#add-marker-btn", body);
        if (group) {
            group.classList.add("bp-sb-actions");
            if (act) group.appendChild(act);
            else if (add) group.appendChild(add);
        }
        if (add) { add.title = "Добавить свою метку"; add.setAttribute("aria-label", "Добавить свою метку"); }

        // особые фильтры игры (подсказка поиска, фильтр уровня) — в свёрнутый блок «Дополнительные фильтры»
        var extra = section && !built ? [].slice.call(body.querySelectorAll(".bp-sb-search .search-hint, .section > .search-hint, .section > .level-filter")) : [];
        if (extra.length) {
            var more = document.createElement("details");
            more.className = "bp-sb-more";
            more.innerHTML = "<summary>Дополнительные фильтры</summary>";
            extra.forEach(function (n) { more.appendChild(n); });
            section.insertBefore(more, group && group.parentNode === section ? group.nextSibling : null);
            var vis = function () { more.hidden = extra.every(function (n) { return n.hidden; }); };
            vis();
            if (window.MutationObserver) extra.forEach(function (n) { new MutationObserver(vis).observe(n, { attributes: true, attributeFilter: ["hidden"] }); });
        }
        var hf = $("#hide-found-btn", body);
        if (hf) {
            var label = function () {
                var on = hf.getAttribute("aria-pressed") === "true" || /показать/i.test(hf.textContent);
                var want = on ? "Показать найденные" : "Скрыть найденные";
                if (hf.textContent !== want) hf.textContent = want;
            };
            label();
            if (window.MutationObserver) new MutationObserver(label).observe(hf, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed"] });
        }

        // категории: сворачивание групп (состояние в localStorage) и двойное нажатие строки
        var fc = document.getElementById("filters-container");
        if (fc) {
            fc.addEventListener("click", function (e) {
                var g = e.target.closest(".bp-gcol, .filter-group-title");
                if (g && !e.target.closest(".group-toggle") && fc.contains(g)) {
                    var grp = g.closest(".filter-group"), name = groupName(grp);
                    if (!name) return;
                    var set = collapsedSet();
                    if (set.has(name)) set.delete(name); else set.add(name);
                    store.set(groupsKey(), JSON.stringify([].concat(Array.from(set))));
                    sbDecorate();
                    return;
                }
            });
            // двойное нажатие по строке — «только эта категория» (повторно — показать все).
            // Один обработчик для мыши и касания; свой dblclick движков игр гасим, чтобы не было двух разных действий.
            var lastTap = { key: "", t: 0 };
            window.addEventListener("dblclick", function (e) {
                if (e.target.closest && e.target.closest("#filters-container .filter-item")) { e.stopImmediatePropagation(); e.preventDefault(); }
            }, true);
            window.addEventListener("click", function (e) {
                var it = e.target.closest && e.target.closest("#filters-container .filter-item");
                if (!it) return;
                var now = Date.now(), key = it.dataset.cat || "";
                if (!key || lastTap.key !== key || now - lastTap.t > 450) { lastTap = { key: key, t: now }; return; }
                lastTap = { key: "", t: 0 };
                setTimeout(function () { // после второго переключения движком (состояние вернулось к исходному)
                    var E = eng();
                    if (!E || !E.by[key]) return;
                    if (onlyKey(E) === key) apply(E, new Set());
                    else apply(E, new Set(Object.keys(E.by).filter(function (k) { return k !== key; })));
                    decorate();
                }, 0);
            }, true);
            sbDecorate();
        }

        // поиск по названиям категорий: совпавшие категории — первыми в выпадающем списке
        var res = document.getElementById("search-results"), input = document.getElementById("search-input");
        if (res && input && window.MutationObserver) {
            var hits = function () {
                if (res.querySelector(".bp-cat-hits")) return;
                var q = input.value.trim().toLowerCase(), E = eng();
                if (q.length < 2 || !E || !E.groups) return;
                var total = {};
                try { (E.st.markers || []).forEach(function (mk) { total[mk.cat] = (total[mk.cat] || 0) + 1; }); } catch (err) { /* нет данных */ }
                var list = [];
                E.groups.forEach(function (g) { g.items.forEach(function (c) { if (total[c.key] && String(c.name).toLowerCase().indexOf(q) >= 0) list.push(c); }); });
                if (!list.length) return;
                var div = document.createElement("div");
                div.className = "bp-cat-hits";
                div.innerHTML = '<p class="bp-cat-hits-l">Категории</p>' + list.slice(0, 6).map(function (c) {
                    return '<button type="button" class="bp-cat-hit" role="option" data-cat="' + String(c.key).replace(/"/g, "&quot;") + '"><i style="background:' + (c.color || "var(--sp-accent)") + '"></i><span></span><em>' + total[c.key] + "</em></button>";
                }).join("");
                list.slice(0, 6).forEach(function (c, i) { div.querySelectorAll(".bp-cat-hit span")[i].textContent = c.name; });
                res.insertBefore(div, res.firstChild);
                res.classList.add("open");
            };
            new MutationObserver(hits).observe(res, { childList: true });
            res.addEventListener("click", function (e) {
                var b = e.target.closest(".bp-cat-hit");
                if (!b) return;
                e.stopPropagation();
                var E = eng();
                if (!E) return;
                input.value = "";
                input.dispatchEvent(new Event("input", { bubbles: true }));
                apply(E, new Set(Object.keys(E.by).filter(function (k) { return k !== b.dataset.cat; })));
                var row = document.querySelector('#filters-container .filter-item[data-cat="' + b.dataset.cat + '"]');
                if (row) row.scrollIntoView({ block: "center" });
            }, true);
        }
    })();

    // ======================================================================
    // 4. Общая раскладка (css/map-base.css): кнопки «Слои» и «Только карта» — в одной группе справа вверху,
    //    верхнее меню кончается левее неё; в окне метки кнопки закреплены внизу, текст прокручивается.
    // ======================================================================
    (function topRight() {
        // группа — последний элемент верхнего ряда (#mtb): одна строка flex, никаких отступов «на глаз»
        var tr = document.createElement("div");
        tr.className = "bp-tr";
        var bar = document.getElementById("mtb");
        (bar || document.body).appendChild(tr);
        if (!bar) tr.classList.add("bp-tr-solo");
        function gather() {
            var layers = document.querySelector("body > .bp-layers-btn"), focus = document.querySelector("body > .bp-focus-btn:not(.bp-layers-btn)");
            if (layers) tr.appendChild(layers);
            if (focus) tr.appendChild(focus);
        }
        gather();
        if (window.MutationObserver) new MutationObserver(gather).observe(document.body, { childList: true });
    })();

    (function popupFoot() {
        function split(content) {
            // корень — единственный ребёнок, кроме полосы стопки «1 из N» (.ms-nav остаётся сверху, не прокручивается)
            var kids = [].filter.call(content.children, function (k) { return !k.classList.contains("ms-nav"); });
            var rootEl = kids[0];
            if (!rootEl || kids.length !== 1 || rootEl.querySelector(":scope > .bp-pop-body")) return;
            var done = rootEl.querySelector(':scope > [class*="-done-btn"][data-id]');
            if (!done) return;
            var foot = document.createElement("div"), body = document.createElement("div");
            foot.className = "bp-pop-foot"; body.className = "bp-pop-body";
            var marks = rootEl.querySelector(":scope > .bp-marks");
            var del = rootEl.querySelector(':scope > [class*="-del-btn"]');
            [].slice.call(rootEl.childNodes).forEach(function (n) { if (n !== done && n !== marks && n !== del) body.appendChild(n); });
            if (del) foot.appendChild(del);
            if (marks) foot.appendChild(marks);
            foot.appendChild(done);
            rootEl.classList.add("bp-pop-root");
            rootEl.append(body, foot);
        }
        function scan(n) {
            if (n.nodeType !== 1) return;
            if (n.classList.contains("leaflet-popup-content")) split(n);
            else [].forEach.call(n.querySelectorAll(".leaflet-popup-content"), split);
        }
        if (!window.MutationObserver) return;
        new MutationObserver(function (list) {
            list.forEach(function (r) {
                if (r.target.classList && r.target.classList.contains("leaflet-popup-content")) split(r.target);
                else r.addedNodes.forEach(scan);
            });
        }).observe(document.body, { childList: true, subtree: true });
    })();

    (function backToDb() {
        if (!slug || !/[?&]marker=/.test(location.search)) return;
        var f = store.json("bp_from_db");
        if (!f || f.game !== slug || !f.url || Date.now() - (f.at || 0) > 6 * 3600 * 1000) return;
        var a = document.createElement("a");
        a.className = "bp-back-db";
        a.href = f.url;
        a.innerHTML = '<span aria-hidden="true">←</span><span></span><button type="button" aria-label="Скрыть подсказку">×</button>';
        a.children[1].textContent = f.title ? "К записи: " + f.title : "Назад в базу данных";
        a.querySelector("button").addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); a.remove(); });
        document.body.appendChild(a);
    })();
})();
