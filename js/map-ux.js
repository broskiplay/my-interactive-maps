// Удобство карт (общий модуль для всех игр; стили — css/map-ux.css). Подключается ПОСЛЕ js/app.js игры.
//   2) фильтры: кнопка «Только эта» у каждой категории и пресеты («Квесты», «Сундуки и добыча»…);
//   3) полоса «Главная › Игра» и переключатель «Карта | База данных», кнопка «← К записи» после «На карте» из базы.
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
    }

    // --- пресеты ---
    var PRESETS = [
        { id: "quests", label: "Квесты", group: /задани|квест|поручен/i, name: /квест|задани/i },
        { id: "loot", label: "Сундуки и добыча", group: /тайник|сундук|добыч/i, name: /сундук|тайник|контейнер|ящик|клад/i },
        { id: "collect", label: "Коллекции", group: /коллекц/i, name: /дневник|монет|статуэт|книг|письм|документ|записк|фигурк|трофе/i },
        { id: "places", label: "Места", group: /^(локации|места|поселения|интересные места|переместиться)$/i, name: /перемещен|телепорт|поселен|город/i },
        { id: "services", label: "Торговцы и услуги", group: /услуг|служб|торгов|лавка|станци/i, name: /торгов|кузнец|алхим|врач/i }
    ];
    var presetBox = null;
    function presetKeys(E, p, total) {
        var out = [];
        (E.groups || []).forEach(function (g) {
            g.items.forEach(function (c) {
                if (!total[c.key]) return;
                if (p.group.test(g.title) || p.name.test(c.name)) out.push(c.key);
            });
        });
        return out;
    }
    function same(a, b) { if (a.length !== b.length) return false; var s = new Set(b); return a.every(function (k) { return s.has(k); }); }
    function renderPresets(E) {
        var box = document.getElementById("filters-container");
        if (!box || !E.groups) return;
        var total = {};
        try { (E.st.markers || []).forEach(function (m) { total[m.cat] = (total[m.cat] || 0) + 1; }); } catch (e) { /* нет данных */ }
        var list = PRESETS.map(function (p) { return { p: p, keys: presetKeys(E, p, total) }; }).filter(function (x) { return x.keys.length; });
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
                if (b.dataset.id === "all") { apply(E2, new Set()); return; }
                var keys = JSON.parse(b.dataset.keys);
                var cur = visibleKeys(E2);
                if (same(cur, keys)) apply(E2, new Set());                       // повторное нажатие — показать всё
                else apply(E2, new Set(Object.keys(E2.by).filter(function (k) { return keys.indexOf(k) < 0; })));
            });
        }
        presetBox.hidden = !list.length;
        var cur = visibleKeys(E), allOn = E.st.hidden.size === 0;
        presetBox.innerHTML = '<p class="bp-presets-l">Быстрый выбор</p>' +
            '<button type="button" class="bp-chip" data-id="all" aria-pressed="' + allOn + '">Все</button>' +
            list.map(function (x) {
                return '<button type="button" class="bp-chip" data-id="' + x.p.id + '" data-keys=\'' + JSON.stringify(x.keys) + '\' aria-pressed="' + same(cur, x.keys) + '">' + x.p.label + "</button>";
            }).join("");
    }

    var fc = document.getElementById("filters-container");
    if (fc) {
        fc.addEventListener("click", function (e) {
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
            if (e.target.closest("#filters-container .filter-item, #show-all-btn, #hide-all-btn")) setTimeout(decorate, 0);
        });
    }

    // ======================================================================
    // 3. Навигация: главная › игра, «Карта | База данных», «← К записи»
    // ======================================================================
    var DB = { "skyrim-map": "skyrim", "gothic-remake-map": "gothic-remake", "tainted-grail-map": "tainted-grail" };
    var folder = (location.pathname.split("/").filter(Boolean)[0]) || "";
    var slug = DB[folder] || "";
    var gameName = document.title.replace(/^Интерактивная карта\s+/i, "").replace(/\s+[—-]\s+BroskiPlay.*$/i, "").trim();
    (function nav() {
        var head = $(".sidebar-header", sidebar);
        if (!head || $(".bp-nav", sidebar)) return;
        var box = document.createElement("div");
        box.className = "bp-nav";
        var html = '<nav class="bp-crumbs" aria-label="Навигация"><a href="/">Главная</a><span aria-hidden="true">›</span><b>' + gameName.replace(/</g, "&lt;") + "</b></nav>";
        if (slug) {
            var back = null;
            try { back = JSON.parse(sessionStorage.getItem("bp_db_back") || "null"); } catch (e) { /* нет доступа */ }
            var dbUrl = back && back.game === slug && back.url ? back.url : "/db/" + slug + "/";
            html += '<div class="bp-seg" role="group" aria-label="Раздел игры"><span aria-current="page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>Карта</span>' +
                '<a href="' + dbUrl + '"><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>База данных</a></div>';
        }
        box.innerHTML = html;
        head.parentNode.insertBefore(box, head);
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
