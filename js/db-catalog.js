/* Каталог базы данных (/db/<игра>/): вкладки, поиск, фильтры. Индекс строит scripts/db_pages.py → index.json:
   lists[раздел] = [[имя, en, slug, картинка, подпись, фильтр, значок, качество], …].
   Подпись не печатается на карточке (меньше текстового шума) — она в подсказке при наведении.
   [8] у предметов — характеристики для вида «Таблица»: [урон от, урон до, броня, требования, вес, цена].
   onmap[раздел] — номера записей с метками на карте (фильтр «Есть на карте»).
   Состояние живёт в адресе (?tab=&sec=&t=&sort=&q=&qc=&m=1&v=table). */
(function () {
    "use strict";
    var app = document.getElementById("db-app");
    if (!app) return;
    var PAGE = 72;
    var tabs = app.querySelectorAll(".db-tabs [data-tab]");
    var search = document.querySelector(".db-search");
    var chipsBox = app.querySelector(".db-chips");
    var chips2 = app.querySelector(".db-chips2");
    var sortSel = app.querySelector(".db-sort");
    // фильтры (качество, дополнение, «Есть на карте», варианты) — в раскрывающейся панели под кнопкой «Фильтры»
    var fBtn = app.querySelector(".db-fbtn"), fBadge = app.querySelector(".db-fbadge"), fPanel = app.querySelector(".db-fpanel");
    // «Есть на карте» и «Сбросить фильтры» — сразу в панели инструментов, остальное — в раскрывающейся панели
    var ffQ = fPanel.querySelector(".db-ff-q"), ffD = fPanel.querySelector(".db-ff-d"), ffV = fPanel.querySelector(".db-ff-v");
    var mapBtn = app.querySelector(".db-onmap"), varBtn = fPanel.querySelector(".db-onvar"), resetBtn = app.querySelector(".db-freset");
    var sortBox = app.querySelector(".db-sortbox") || sortSel, headEl = app.querySelector(".dbc-h"), qClear = app.querySelector(".db-qclear");
    var QUALITY_OPTS = [["", "Любое"], ["common", "Обычные"], ["magic", "Магические"], ["story", "Сюжетные"], ["junk", "Хлам"]];
    var viewBox = app.querySelector(".db-view"), alsoEl = app.querySelector(".db-also");
    // таблица прокручивается внутри своего блока (на телефоне — вбок), страница не уезжает
    var table = document.createElement("div");
    table.className = "db-tablewrap";
    table.tabIndex = 0;
    table.setAttribute("role", "region");
    table.setAttribute("aria-label", "Таблица предметов");
    table.hidden = true;
    var countEl = app.querySelector(".db-count");
    var grid = app.querySelector(".db-grid");
    var base = app.getAttribute("data-base");
    var treeBox = app.querySelector(".db-treebox"), treeKey = null, treeCache = {};
    var ver = (app.getAttribute("data-index").split("?v=")[1] || "");
    var idx = null, state = { tab: "items", sec: "", t: "", sort: "", q: "", qc: "", m: "", v: "", dlc: "", var: "" }, shown = PAGE, moreBtn = null;
    var DLC_NAMES = { dlc01: "Dawnguard", dlc02: "Dragonborn", _byoh: "Hearthfire" };
    // оружие и броня удобнее таблицей (урон, вес, цена в столбцах); явный выбор «Плитки» хранится как v=tiles
    var AUTO_TABLE = { weapons: 1, armor: 1 };
    function viewIsTable() { return state.v === "table" || (state.v === "" && isItems() && !!AUTO_TABLE[state.sec]); }
    // список под схемами талантов — под спойлером (как на странице дерева); на остальных вкладках обёртка «плоская»
    var spoil = document.createElement("details"), spoilSum = document.createElement("summary"), wasFold = null;
    spoil.className = "db-spoiler db-gridwrap";
    spoilSum.innerHTML = "<span>Все таланты списком</span><small></small>";
    spoil.appendChild(spoilSum);
    grid.parentNode.insertBefore(spoil, grid);
    spoil.appendChild(grid);
    grid.after(table);
    var MAP_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>';
    var QUEST_TYPES = ["Основное", "Побочное", "Задача"];
    var QUEST_LABELS = { "Основное": "Основные", "Побочное": "Побочные", "Задача": "Поручения" };
    // вид карточки по разделу: плитка с иконкой, портрет в полный рост, кадр места, строка
    var VIEW = { items: "tile", books: "row", sets: "tile", bestiary: "fig", characters: "fig", locations: "scene" };

    function readUrl() {
        var p = new URLSearchParams(location.search);
        state.tab = p.get("tab") || "items";
        state.sec = p.get("sec") || "";
        state.q = p.get("q") || "";
        state.t = p.get("t") || "";
        state.sort = p.get("sort") || "";
        state.qc = p.get("qc") || "";
        state.m = p.get("m") || "";
        state.v = p.get("v") || "";
        state.dlc = p.get("dlc") || "";
        state.var = p.get("var") || "";
    }
    function writeUrl() {
        var p = new URLSearchParams();
        if (state.tab !== "items") p.set("tab", state.tab);
        if (state.sec) p.set("sec", state.sec);
        if (state.t) p.set("t", state.t);
        if (state.sort) p.set("sort", state.sort);
        if (state.q) p.set("q", state.q);
        if (state.qc) p.set("qc", state.qc);
        if (state.m) p.set("m", state.m);
        if (state.v) p.set("v", state.v);
        if (state.dlc) p.set("dlc", state.dlc);
        if (state.var) p.set("var", state.var);
        var s = p.toString();
        history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
        rememberBack();
    }
    function norm(s) { return (s || "").toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]+/g, " ").trim(); }

    function listFor(tab) {
        if (tab === "books") return { kind: "items", rows: idx.lists.items.filter(function (r) { return r[5] === "books"; }) };
        if (tab === "items") return { kind: "items", rows: idx.lists.items.filter(function (r) { return r[5] !== "books"; }) };
        return { kind: tab, rows: idx.lists[tab] || [] };
    }

    function renderChips(rows) {
        var opts = [];
        if (state.tab === "items") {
            var have = {};
            rows.forEach(function (r) { have[r[5]] = (have[r[5]] || 0) + 1; });
            Object.keys(idx.sections).forEach(function (k) { if (have[k] && k !== "books") opts.push([k, idx.sections[k], have[k]]); });
        } else if (idx.chips && idx.chips[state.tab]) {
            idx.chips[state.tab].forEach(function (c) {
                var n = rows.filter(function (r) { return r[5] === c[0]; }).length;
                if (n) opts.push([c[0], c[1], n]);
            });
        } else if (state.tab === "quests") {
            QUEST_TYPES.forEach(function (t) {
                var n = rows.filter(function (r) { return r[5] === t; }).length;
                if (n) opts.push([t, QUEST_LABELS[t], n]);
            });
        }
        fillChips(chipsBox, opts, rows.length, "sec");
    }
    function typeOf(r) { return (r[4] || "").split(" · ")[0]; }
    // второй ряд — тип предмета внутри раздела (Одноручное / Двуручное / Луки…): раньше он стоял подписью на каждой карточке
    function renderChips2(rows) {
        var opts = [];
        if (state.tab === "items" && state.sec) {
            var have = {}, order = [];
            rows.forEach(function (r) { var t = typeOf(r); if (!have[t]) order.push(t); have[t] = (have[t] || 0) + 1; });
            if (order.length > 1) order.sort(function (a, b) { return have[b] - have[a]; }).forEach(function (t) { opts.push([t, t, have[t]]); });
        }
        else if (state.tab === "bestiary" || state.tab === "characters") {
            // раса / вид: короткие подписи, у которых есть хотя бы несколько записей
            var cnt = {}, ord = [];
            rows.forEach(function (r) { var t = typeOf(r); if (!t || t.length > 24) return; if (!cnt[t]) ord.push(t); cnt[t] = (cnt[t] || 0) + 1; });
            ord.filter(function (t) { return cnt[t] >= 3; }).sort(function (x, y) { return cnt[y] - cnt[x]; }).slice(0, 18).forEach(function (t) { opts.push([t, t, cnt[t]]); });
        }
        if (!opts.length) state.t = "";
        fillChips(chips2, opts, rows.length, "t");
    }
    function fillChips(box, opts, total, key) {
        box.hidden = !opts.length;
        box.innerHTML = "";
        if (!opts.length) return;
        [["", "Все", total]].concat(opts).forEach(function (o) {
            var b = document.createElement("button");
            b.type = "button";
            b.innerHTML = "<span></span><small></small>";
            b.firstChild.textContent = o[1];
            b.lastChild.textContent = o[2];
            b.setAttribute("aria-pressed", String(state[key] === o[0]));
            b.addEventListener("click", function () { state[key] = o[0]; if (key === "sec") state.t = ""; shown = PAGE; render(); });
            box.appendChild(b);
        });
    }

    function pic(r, kind) {
        var v = r[3];
        if (v && v.indexOf("q:") === 0) {
            var qi = document.createElement("i");
            qi.className = "db-qi db-qi-" + v.slice(2);
            qi.setAttribute("aria-hidden", "true");
            return qi;
        }
        if (!v) {
            var ph = document.createElement("span");
            ph.className = "db-noimg";
            ph.setAttribute("aria-hidden", "true");
            ph.textContent = kind === "quests" ? "!" : "•";
            return ph;
        }
        var img = document.createElement("img");
        if (v.indexOf("p:") === 0) { img.src = v.slice(2); img.referrerPolicy = "no-referrer"; }   // кадр из попапа метки карты
        else img.src = idx.assets + v + ".webp";
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.onerror = function () { img.onerror = null; if (img.parentNode) img.parentNode.replaceChild(noPic(kind === "items" && r[5] === "books" ? "books" : kind), img); };
        return img;
    }
    // картинка не загрузилась — значок раздела из вкладки (или точка, если значка нет)
    function noPic(tab) {
        var ph = document.createElement("span"), ico = app.querySelector('.db-tabs [data-tab="' + tab + '"] img, .db-tabs [data-tab="' + tab + '"] .db-qi');
        ph.className = "db-noimg";
        ph.setAttribute("aria-hidden", "true");
        if (ico) { ico = ico.cloneNode(false); ico.classList.add("db-fb"); ico.removeAttribute("width"); ico.removeAttribute("height"); if (ico.tagName === "IMG") ico.onerror = function () { ph.textContent = "•"; }; ph.appendChild(ico); }
        else ph.textContent = "•";
        return ph;
    }
    // подпись плитки предмета: урон/броня и цена — чтобы похожие предметы отличались без перехода на страницу
    function statLine(r) {
        var st = r[8], out = [];
        if (!st) return "";
        if (st[1]) out.push("Урон " + (st[0] !== st[1] ? st[0] + "–" + st[1] : st[1]));
        else if (st[2]) out.push("Броня " + st[2]);
        if (st[5] != null) out.push(st[5].toLocaleString("ru-RU") + " з.");
        return out.join(" · ");
    }
    // имя с подсветкой найденного фрагмента (поиск без учёта регистра и ё/е)
    function fillName(el, name) {
        var q = state.q;
        if (!q || q.length < 2) { el.textContent = name; return; }
        var low = name.toLowerCase().replace(/ё/g, "е"), at = low.indexOf(q.toLowerCase().replace(/ё/g, "е"));
        if (at < 0) { el.textContent = name; return; }
        el.appendChild(document.createTextNode(name.slice(0, at)));
        var mk = document.createElement("mark"); mk.textContent = name.slice(at, at + q.length); el.appendChild(mk);
        el.appendChild(document.createTextNode(name.slice(at + q.length)));
    }
    function card(kind, r, tab) {
        var view = VIEW[tab] || VIEW[kind] || "row";
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "db-card db-v-" + view + (r[7] ? " db-qc-" + r[7] : "");
        a.href = base + kind + "/" + r[2] + (r[2].indexOf("#") >= 0 ? "" : "/");
        a._row = r;
        var p = document.createElement("span");
        p.className = "db-pic";
        p.appendChild(pic(r, kind));
        if (r[10] && view === "tile") { var vb = document.createElement("em"); vb.className = "db-vcount"; vb.textContent = "+" + r[10]; vb.title = r[10] + " " + plural(r[10], "вариант", "варианта", "вариантов"); p.appendChild(vb); }
        if (r[6] && view === "tile") { var tb = document.createElement("em"); tb.className = "db-tier"; tb.textContent = r[6]; p.appendChild(tb); }
        if (r._m) { var mk = document.createElement("em"); mk.className = "db-onmap-b"; mk.title = "Есть на карте"; mk.innerHTML = MAP_SVG + '<span class="sr-only">Есть на карте</span>'; p.appendChild(mk); }
        a.appendChild(p);
        var b = document.createElement("b"); fillName(b, r[0]); a.appendChild(b);
        if (view === "tile" && r[8]) { var cp = statLine(r); if (cp) { var sm = document.createElement("small"); sm.className = "db-stat"; sm.textContent = cp; a.appendChild(sm); } }
        if (view === "row" && state.tab === "characters" && r[4]) { /* раса — в подсказке */ }
        if (view === "scene" && r[5]) { var k = document.createElement("small"); k.textContent = r[5]; a.appendChild(k); }
        if (view === "row" && r[6]) { var m = document.createElement("small"); m.className = "db-meta"; m.textContent = r[6]; a.appendChild(m); }
        if (view === "row" && tab === "effects" && r[5]) a.setAttribute("data-k", r[5]);
        li.appendChild(a);
        return li;
    }

    // ---------- подсказка при наведении (мышь): подпись записи, английское имя, качество ----------
    var tip = null, tipFor = null;
    var hoverOk = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    function showTip(a) {
        var r = a._row;
        if (!r) return;
        if (!tip) { tip = document.createElement("div"); tip.className = "db-tt db-ctt"; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip); }
        tipFor = a;
        tip.innerHTML = '<div class="db-tt-h"><b></b><small></small></div><p></p>';
        tip.querySelector("b").textContent = r[0];
        var en = tip.querySelector("small");
        if (r[1] && r[1] !== r[0]) en.textContent = r[1]; else en.remove();
        var cap = (r[4] || "").split(" · ");
        var para = tip.querySelector("p");
        if (cap[0]) cap.forEach(function (c, i) {
            var s = document.createElement("span");
            s.textContent = c;
            if (i === cap.length - 1 && r[7] && state.tab !== "quests") s.className = "db-qc-" + r[7];
            para.appendChild(s);
        }); else para.remove();
        tip.hidden = false;
        tip.className = "db-tt db-ctt" + (cap.join("").length > 60 ? " is-long" : "");
        var rc = a.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
        var x = Math.min(Math.max(8, rc.left + rc.width / 2 - tw / 2), innerWidth - tw - 8);
        var y = rc.top - th - 10;
        if (y < 70) y = rc.bottom + 10;
        tip.style.left = x + "px"; tip.style.top = y + "px";
    }
    function hideTip() { if (tip) tip.hidden = true; tipFor = null; }
    if (hoverOk) {
        [grid, table].forEach(function (box) {
            box.addEventListener("mouseover", function (e) { var a = e.target.closest(".db-card, .db-tlink"); if (a && a !== tipFor) showTip(a); else if (!a) hideTip(); });
            box.addEventListener("mouseleave", hideTip);
            box.addEventListener("focusin", function (e) { var a = e.target.closest(".db-card, .db-tlink"); if (a) showTip(a); });
            box.addEventListener("focusout", hideTip);
        });
        window.addEventListener("scroll", hideTip, { passive: true });
    }

    // вкладка «Таланты»: без фильтра — плитки деревьев, с выбранным деревом — его схема с ветвями (tree.html от db_pages.py)
    function renderTree(rows) {
        if (!treeBox) return;
        if (state.tab !== "talents" || !idx.trees) { treeBox.hidden = true; treeKey = null; return; }
        treeBox.hidden = false;
        var key = state.sec || "";
        if (key !== treeKey) {
            treeKey = key;
            if (!key) treeTiles();
            else if (treeCache[key]) showTree(key);
            else {
                treeBox.innerHTML = '<p class="db-count">Загрузка схемы…</p>';
                fetch(base + "talents/" + key + "/tree.html?v=" + ver).then(function (r) { if (!r.ok) throw 0; return r.text(); })
                    .then(function (html) { treeCache[key] = html; if (treeKey === key) { showTree(key); found(); } })
                    .catch(function () { if (treeKey === key) treeBox.innerHTML = '<p class="db-count">Схема не загрузилась — <a href="' + base + 'talents/' + key + '/">откройте страницу дерева</a>.</p>'; });
            }
        }
        found();
        function found() {
            var q = norm(state.q), hit = {};
            if (q) rows.forEach(function (r) { hit[r[2].split("#")[1]] = 1; });
            treeBox.querySelectorAll(".db-tn").forEach(function (a) { a.classList.toggle("is-found", !!hit[(a.getAttribute("href") || "").split("#")[1]]); });
            treeBox.classList.toggle("is-search", !!q);
        }
    }
    function treeTiles() {
        var ul = document.createElement("ul");
        ul.className = "db-trees";
        idx.chips.talents.forEach(function (c) {
            var tr = idx.trees[c[0]];
            if (!tr) return;
            var n = idx.lists.talents.filter(function (r) { return r[5] === c[0]; }).length;
            var li = document.createElement("li"), b = document.createElement("button");
            b.type = "button";
            if (tr[0]) { var img = document.createElement("img"); img.src = idx.assets + tr[0] + ".webp"; img.alt = ""; img.width = 40; img.height = 40; img.loading = "lazy"; b.appendChild(img); }
            var t = document.createElement("span"), nm = document.createElement("b"), sm = document.createElement("small");
            nm.textContent = c[1]; sm.textContent = n + " " + plural(n, "талант", "таланта", "талантов") + " · " + tr[1] + " " + plural(tr[1], "ветвь", "ветви", "ветвей");
            t.appendChild(nm); t.appendChild(sm); b.appendChild(t);
            b.addEventListener("click", function () { state.sec = c[0]; shown = PAGE; render(); treeBox.scrollIntoView({ block: "nearest" }); });
            li.appendChild(b); ul.appendChild(li);
        });
        treeBox.innerHTML = '<p class="db-trees-h">Схемы деревьев — как на экране персонажа. Выберите дерево:</p>';
        treeBox.appendChild(ul);
    }
    function showTree(key) {
        treeBox.innerHTML = treeCache[key] + '<p class="db-note">Нажмите на узел — название и ранги таланта. Кнопки над схемой приближают ветвь; на телефоне можно просто нажать на ветвь.</p>';
        if (window.dbTreeInit) window.dbTreeInit(treeBox);
    }
    function plural(n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; }

    // ---------- фильтры над списком: качество, «Есть на карте», вид ----------
    function isItems() { return state.tab === "items"; }
    function hasMap() { return !!(idx.onmap && idx.onmap[state.tab === "books" ? "items" : state.tab]); }
    function baseRows(l) {
        var rows = l.rows;
        if (state.m && hasMap()) rows = rows.filter(function (r) { return r._m; });
        if (state.qc && isItems()) rows = rows.filter(function (r) { return r[7] === state.qc; });
        if (state.dlc && isItems()) rows = rows.filter(function (r) { return r[9] === state.dlc; });
        // «Арбалет горения», «Арбалет душ»… свёрнуты в «Арбалет»; при поиске и по кнопке в фильтрах показываются все
        if (!state.var && !norm(state.q)) rows = rows.filter(function (r) { return !r[11]; });
        return rows;
    }
    function hit(r, q) { return norm(r[0]).indexOf(q) >= 0 || norm(r[1]).indexOf(q) >= 0; }

    // ---------- поиск по всем разделам: «Ещё найдено: Задания 3 · Персонажи 1» + числа на вкладках ----------
    function renderAlso(q, here) {
        var other = [];
        tabs.forEach(function (b) {
            var k = b.getAttribute("data-tab"), sm = b.querySelector("small");
            if (!sm.hasAttribute("data-n")) sm.setAttribute("data-n", sm.textContent);
            if (!q) { sm.textContent = sm.getAttribute("data-n"); b.classList.remove("is-zero"); return; }
            var n = 0;
            if (idx.lists[k] || k === "books") listFor(k).rows.forEach(function (r) { if (hit(r, q)) n++; });
            sm.textContent = n;
            b.classList.toggle("is-zero", !n);
            if (n && k !== state.tab) other.push([k, b.querySelector("span").textContent, n]);
        });
        alsoEl.hidden = !other.length;
        alsoEl.innerHTML = "";
        if (!other.length) return;
        alsoEl.appendChild(document.createTextNode(here ? "Ещё найдено: " : "Здесь ничего, но нашлось: "));
        other.forEach(function (o, i) {
            if (i) alsoEl.appendChild(document.createTextNode(" · "));
            var bt = document.createElement("button");
            bt.type = "button";
            bt.innerHTML = "<span></span> <small></small>";
            bt.firstChild.textContent = o[1];
            bt.lastChild.textContent = o[2];
            bt.addEventListener("click", function () { switchTab(o[0]); });
            alsoEl.appendChild(bt);
        });
        alsoEl.classList.toggle("is-loud", !here);
    }

    // ---------- вид «Таблица» (предметы): сортировка по клику на заголовок ----------
    var COLS = [
        ["name", "Название"], ["type", "Тип"], ["tier", "Тир", function (r) { return tierN(r); }, function (r) { return r[6]; }],
        ["dmg", "Урон", function (r) { return r[8] ? r[8][1] : 0; }, function (r) { return r[8] && r[8][1] ? (r[8][0] !== r[8][1] ? r[8][0] + "–" + r[8][1] : r[8][1]) : ""; }],
        ["armor", "Броня", function (r) { return r[8] ? r[8][2] : 0; }, function (r) { return r[8] && r[8][2] || ""; }],
        ["req", "Требования", null, function (r) { return r[8] ? r[8][3] : ""; }],
        ["weight", "Вес", function (r) { return r[8] ? r[8][4] : null; }, function (r) { return r[8] && r[8][4] != null ? String(r[8][4]).replace(".", ",") : ""; }],
        ["price", "Цена", function (r) { return r[8] ? r[8][5] : null; }, function (r) { return r[8] && r[8][5] != null ? r[8][5].toLocaleString("ru-RU") : ""; }],
        ["map", "Карта", function (r) { return r._m ? 1 : 0; }, function (r) { return r._m ? "На карте" : "—"; }]
    ];
    function colOf(key) { for (var i = 0; i < COLS.length; i++) if (COLS[i][0] === key) return COLS[i]; return null; }
    var coll = new Intl.Collator("ru"), byName = function (a, b) { return coll.compare(a[0], b[0]); };
    function sortRows(rows) {
        if (!state.sort) return rows.slice().sort(byName);
        var asc = /-$/.test(state.sort), c = colOf(state.sort.replace(/-$/, ""));
        if (!c || !c[2]) return rows.slice().sort(byName);
        var f = c[2], nul = c[0] === "weight" || c[0] === "price";   // у веса и цены 0 — значение, пусто — null
        var empty = function (v) { return c[0] === "map" ? false : nul ? v == null : !v; };   // у «Карты» 0 — «без метки», не пусто
        return rows.slice().sort(function (a, b) {
            var x = f(a), y = f(b), ex = empty(x), ey = empty(y);
            if (ex !== ey) return ex ? 1 : -1;            // пустые — всегда в конце
            return (ex ? 0 : asc ? x - y : y - x) || byName(a, b);
        });
    }
    function renderTable(rows) {
        var cols = COLS.filter(function (c) {
            if (c[0] === "name" || c[0] === "type") return true;
            if (c[0] === "map") return hasMap();
            return rows.some(function (r) { return !!c[3](r); });
        });
        var tb = document.createElement("table");
        tb.className = "db-table db-itable";
        var tr = tb.createTHead().insertRow();
        cols.forEach(function (c) {
            var th = document.createElement("th");
            var cur = state.sort.replace(/-$/, "") === c[0] || (!state.sort && c[0] === "name");
            if (c[0] === "name" || c[2]) {
                var bt = document.createElement("button");
                bt.type = "button";
                bt.textContent = c[1];
                bt.setAttribute("data-col", c[0]);
                if (cur) { bt.className = "is-on"; th.setAttribute("aria-sort", c[0] === "name" ? "ascending" : /-$/.test(state.sort) ? "ascending" : "descending"); }
                bt.addEventListener("click", function () {
                    state.sort = c[0] === "name" ? "" : state.sort === c[0] ? c[0] + "-" : c[0];
                    shown = PAGE; render();
                    // таблица пересоздана — возвращаем фокус на тот же заголовок
                    var nb = table.querySelector('button[data-col="' + c[0] + '"]');
                    if (nb) nb.focus();
                });
                th.appendChild(bt);
            } else th.textContent = c[1];
            if (c[2] && c[0] !== "map") th.className = "is-num";
            tr.appendChild(th);
        });
        var body = tb.createTBody();
        rows.slice(0, shown).forEach(function (r) {
            var row = body.insertRow();
            row.className = "db-qc-" + (r[7] || "common");
            cols.forEach(function (c) {
                var td = row.insertCell();
                if (c[0] === "name") {
                    var a = document.createElement("a");
                    a.className = "db-tlink";
                    a.href = base + "items/" + r[2] + (r[2].indexOf("#") >= 0 ? "" : "/");
                    a._row = r;
                    var p = document.createElement("span"); p.className = "db-pic"; p.appendChild(pic(r, "items"));
                    a.appendChild(p);
                    var nm = document.createElement("span"); fillName(nm, r[0]); a.appendChild(nm);
                    if (r[10]) { var vb = document.createElement("em"); vb.className = "db-vbadge"; vb.textContent = r[10] + " " + plural(r[10], "вариант", "варианта", "вариантов"); a.appendChild(vb); }
                    td.appendChild(a);
                } else if (c[0] === "type") td.textContent = typeOf(r);
                else if (c[0] === "map") {
                    td.className = r._m ? "db-tmap is-on" : "db-tmap";
                    if (r._mu) { var ma = document.createElement("a"); ma.className = "db-tmapgo"; ma.href = r._mu; ma.innerHTML = MAP_SVG + "<span>На карте</span>"; ma.setAttribute("aria-label", "Показать «" + r[0] + "» на карте"); td.appendChild(ma); }
                    else td.textContent = c[3](r);
                }
                else { td.textContent = c[3](r); if (c[2]) td.className = "is-num"; }
            });
        });
        table.innerHTML = "";
        table.appendChild(tb);
    }

    // список сортировки: набор зависит от того, что есть в выбранных предметах
    var SORTS = [["", "По названию"], ["tier", "Тир: высокий сначала"], ["tier-", "Тир: низкий сначала"], ["dmg", "Урон: больше сначала"], ["armor", "Броня: больше сначала"],
                 ["price", "Цена: дороже сначала"], ["price-", "Цена: дешевле сначала"], ["weight-", "Вес: легче сначала"], ["weight", "Вес: тяжелее сначала"],
                 ["map", "Сначала есть на карте"], ["map-", "Сначала без метки"]];
    var sortKey = "";
    function fillSort(rows) {
        var has = function (i) { return rows.some(function (r) { return r[8] && (i >= 4 ? r[8][i] != null : r[8][i]); }); };
        var avail = { "": 1, tier: rows.some(function (r) { return r[6]; }), "tier-": rows.some(function (r) { return r[6]; }), dmg: has(1), armor: has(2), price: has(5), "price-": has(5), weight: has(4), "weight-": has(4), map: hasMap(), "map-": hasMap() };
        var key = SORTS.filter(function (o) { return avail[o[0]]; }).map(function (o) { return o[0]; }).join("|");
        if (key !== sortKey) {
            sortKey = key;
            sortSel.innerHTML = "";
            SORTS.forEach(function (o) {
                if (!avail[o[0]]) return;
                var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; sortSel.appendChild(op);
            });
        }
        if (state.sort && !avail[state.sort]) state.sort = "";
        sortSel.value = state.sort;
    }
    // сегменты в панели фильтров: один выбранный вариант, «Любое» сбрасывает
    function fillSeg(el, opts, key) {
        var sig = opts.map(function (o) { return o[0]; }).join("|");
        if (el._sig !== sig) {
            el._sig = sig;
            el.innerHTML = "";
            opts.forEach(function (o) {
                var b = document.createElement("button");
                b.type = "button"; b.setAttribute("data-v", o[0]);
                var sp = document.createElement("span"); sp.textContent = o[1]; b.appendChild(sp);
                el.appendChild(b);
            });
        }
        el.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === (state[key] || ""))); });
    }
    var segQ = ffQ.querySelector(".db-seg"), segD = ffD.querySelector(".db-seg");
    // «Из какого дополнения» — только если в списке есть предметы дополнений (по пути картинки; у Skyrim: Dawnguard / Dragonborn / Hearthfire)
    function syncDlc(rows) {
        var have = {};
        rows.forEach(function (r) { if (r[9]) have[r[9]] = (have[r[9]] || 0) + 1; });
        var keys = Object.keys(DLC_NAMES).filter(function (k) { return have[k]; });
        ffD.hidden = !keys.length || !isItems();
        fillSeg(segD, [["", "Любое"]].concat(keys.map(function (k) { return [k, DLC_NAMES[k]]; })), "dlc");
    }
    fPanel.addEventListener("click", function (e) {
        var b = e.target.closest(".db-seg button");
        if (!b) return;
        state[b.parentNode.getAttribute("data-key")] = b.getAttribute("data-v");
        shown = PAGE; render();
    });
    fBtn.addEventListener("click", function () { setPanel(fBtn.getAttribute("aria-expanded") !== "true"); });
    function setPanel(open) { fBtn.setAttribute("aria-expanded", String(open)); fPanel.hidden = !open || fBtn.hidden; }
    // на смартфоне панель — нижняя шторка: «Готово» и тап вне шторки закрывают её
    var doneBtn = document.createElement("button");
    doneBtn.type = "button"; doneBtn.className = "db-fdone"; doneBtn.textContent = "Готово";
    fPanel.appendChild(doneBtn);
    doneBtn.addEventListener("click", function () { setPanel(false); });
    document.addEventListener("click", function (e) {
        if (fPanel.hidden || !window.matchMedia("(max-width: 700px)").matches) return;
        if (!e.target.isConnected || fPanel.contains(e.target) || fBtn.contains(e.target)) return;   // isConnected: кнопки панели перерисовываются по клику
        setPanel(false);
    });
    function resetFilters(all) { state.qc = state.dlc = state.m = state.var = ""; if (all) state.sec = state.t = ""; shown = PAGE; render(); }
    function clearSearch() { clearTimeout(t); search.value = ""; state.q = ""; shown = PAGE; render(); search.focus(); }
    resetBtn.addEventListener("click", function () { resetFilters(false); });
    if (qClear) qClear.addEventListener("click", clearSearch);
    varBtn.addEventListener("click", function () { state.var = state.var ? "" : "1"; shown = PAGE; render(); });

    function render() {
        if (!idx) return;
        writeUrl();
        tabs.forEach(function (b) { if (b.getAttribute("data-tab") === state.tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
        if (qClear) qClear.hidden = !search.value;
        var l = listFor(state.tab);
        var tableOk = isItems() && state.tab === "items";
        if (!tableOk) state.v = "";
        if (!isItems()) state.qc = "";
        if (!hasMap()) state.m = "";
        ffQ.hidden = !isItems();
        fillSeg(segQ, QUALITY_OPTS, "qc");
        mapBtn.hidden = !hasMap();
        mapBtn.setAttribute("aria-pressed", String(!!state.m));
        var hasVars = isItems() && l.rows.some(function (r) { return r[11]; });
        if (!hasVars) state.var = "";
        ffV.hidden = !hasVars;
        varBtn.setAttribute("aria-pressed", String(!!state.var));
        viewBox.hidden = !tableOk;
        var asTable = tableOk && viewIsTable();
        viewBox.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String((b.getAttribute("data-v") === "table") === asTable)); });
        if (!isItems()) state.dlc = "";
        syncDlc(l.rows);
        var nAct = (state.qc ? 1 : 0) + (state.dlc ? 1 : 0) + (state.m ? 1 : 0) + (state.var ? 1 : 0);
        fBtn.hidden = ffQ.hidden && ffD.hidden && ffV.hidden;
        var nPanel = nAct - (state.m ? 1 : 0);   // число на «Фильтры» — только то, что включено внутри панели
        fBadge.hidden = !nPanel; fBadge.textContent = nPanel;
        resetBtn.hidden = !nAct;
        setPanel(fBtn.getAttribute("aria-expanded") === "true");
        var all = baseRows(l);
        renderChips(all);
        var q = norm(state.q), rows = all;
        if (state.sec) rows = rows.filter(function (r) { return r[5] === state.sec; });
        renderChips2(rows);
        if (state.t) rows = rows.filter(function (r) { return typeOf(r) === state.t; });
        // сортировка: список работает и в плитках, и в таблице (там же — клик по заголовку столбца)
        sortBox.hidden = !isItems();
        if (!isItems()) state.sort = "";
        fillSort(rows);
        rows = sortRows(rows);
        if (q) rows = rows.filter(function (r) { return hit(r, q); });
        if (q && !state.sort) rows = rows.slice().sort(function (a, b) { return (norm(a[0]).indexOf(q) === 0 ? 0 : 1) - (norm(b[0]).indexOf(q) === 0 ? 0 : 1); });
        renderAlso(q, rows.length > 0);
        renderTree(rows);
        var fold = state.tab === "talents" && !q && !!idx.trees;
        if (fold !== wasFold) spoil.open = !fold;
        wasFold = fold;
        spoil.classList.toggle("is-flat", !fold);
        spoilSum.querySelector("small").textContent = rows.length;
        spoilSum.querySelector("span").textContent = state.sec ? "Таланты дерева списком" : "Все таланты списком";
        var filtered = q || state.m || state.qc || state.dlc;
        // заголовок списка: раздел → подраздел → тип; счётчик объясняет, что считается: записи списка и варианты внутри групп
        headEl.textContent = [tabName(state.tab), state.sec && chipName(), state.t].filter(Boolean).join(" · ");
        countEl.innerHTML = "";
        var nV = rows.filter(function (r) { return r[11]; }).length;
        var hidV = !state.var && !q && rows.length && !fold ? l.rows.filter(function (r) {
            return r[11] && (!state.sec || r[5] === state.sec) && (!state.t || typeOf(r) === state.t) && (!state.dlc || r[9] === state.dlc) && (!state.qc || r[7] === state.qc) && (!state.m || r._m);
        }).length : 0;
        if (rows.length && !fold) {
            var nb = document.createElement("b");
            nb.textContent = (filtered ? "Найдено: " : "") + num(rows.length) + (filtered ? "" : " " + plural(rows.length, "запись", "записи", "записей"));
            countEl.appendChild(nb);
            var vt = hidV ? "ещё " + num(hidV) + " " + plural(hidV, "вариант", "варианта", "вариантов") + " внутри групп"
                : nV ? "включая " + num(nV) + " " + plural(nV, "вариант", "варианта", "вариантов") : "";
            if (vt) countEl.appendChild(document.createTextNode(" · " + vt));
            if (hidV || (nV && state.var)) {
                var sv = document.createElement("button");
                sv.type = "button"; sv.className = "db-showvar";
                sv.textContent = hidV ? "Показать варианты" : "Свернуть варианты";
                sv.setAttribute("aria-pressed", String(!hidV));
                sv.addEventListener("click", function () { state.var = hidV ? "1" : ""; shown = PAGE; render(); });
                countEl.appendChild(sv);
            }
        }
        grid.className = "db-grid db-g-" + (VIEW[state.tab] || VIEW[l.kind] || "row");
        grid.removeAttribute("aria-hidden");   // каркас-заглушка был скрыт от дикторов, настоящий список — нет
        grid.innerHTML = "";
        grid.hidden = asTable && rows.length > 0;
        table.hidden = !asTable || !rows.length;
        if (!rows.length) grid.appendChild(emptyBox(q));
        if (asTable && rows.length) renderTable(rows);
        else {
            var frag = document.createDocumentFragment();
            rows.slice(0, shown).forEach(function (r) { frag.appendChild(card(l.kind, r, state.tab)); });
            grid.appendChild(frag);
        }
        if (moreBtn) moreBtn.remove();
        moreBtn = null;
        if (rows.length > shown) {
            moreBtn = document.createElement("button");
            moreBtn.type = "button";
            moreBtn.className = "db-more";
            moreBtn.textContent = "Показать ещё (" + (rows.length - shown) + ")";
            moreBtn.addEventListener("click", function () { shown += PAGE * 2; render(); });
            (asTable ? table : grid).after(moreBtn);
        }
        backLabel = [tabName(state.tab), state.sec && chipName(), state.t, state.q && "«" + state.q + "»"].filter(Boolean).join(" · ");
        rememberBack();
    }

    // пустая выдача: почему пусто и что сделать — снять фильтры, очистить поиск, перейти в раздел с находками (db-also)
    function emptyBox(q) {
        var li = document.createElement("li"), f = state.m || state.qc || state.dlc || state.sec || state.t, where = tabName(state.tab);
        li.className = "db-empty";
        var h = document.createElement("b"), p = document.createElement("p"), acts = document.createElement("div");
        h.textContent = q ? "По запросу «" + state.q + "» ничего нет" : "С этими фильтрами ничего нет";
        p.textContent = q && f ? "Поиск идёт внутри раздела «" + where + "» с выбранными фильтрами — снимите их или измените запрос."
            : q ? (alsoEl.hidden ? "Ни в одном разделе нет такого названия — проверьте написание или введите часть слова." : "В разделе «" + where + "» такого нет — совпадения нашлись в других разделах (выше).")
            : "В разделе «" + where + "» нет записей, подходящих под все выбранные условия.";
        acts.className = "db-empty-acts";
        function btn(label, fn) { var b = document.createElement("button"); b.type = "button"; b.textContent = label; b.addEventListener("click", fn); acts.appendChild(b); }
        if (f) btn("Сбросить фильтры", function () { resetFilters(true); });
        if (q) btn("Очистить поиск", clearSearch);
        li.appendChild(h); li.appendChild(p); if (acts.childNodes.length) li.appendChild(acts);
        return li;
    }
    function num(n) { return n.toLocaleString("ru-RU"); }

    // ---------- «← К списку» на странице записи (js/db-links.js): адрес и подпись текущего списка ----------
    var backLabel = "";
    function tabName(k) { var b = app.querySelector('.db-tabs [data-tab="' + k + '"] span'); return b ? b.textContent : ""; }
    function chipName() { var b = chipsBox.querySelector('button[aria-pressed="true"] span'); return b ? b.textContent : ""; }
    function rememberBack() {
        try { sessionStorage.setItem("bp_db_back", JSON.stringify({ game: base.split("/")[2], url: location.pathname + location.search, label: backLabel })); } catch (e) {}
    }
    function switchTab(k) {
        state.tab = k; state.sec = ""; state.t = ""; shown = PAGE; hideTip(); render();
    }

    var ROMAN_N = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };
    function tierN(r) { return ROMAN_N[r[6]] || 0; }
    // вкладки — ссылки на страницы разделов; обычный клик фильтрует на месте, Ctrl/⌘-клик открывает страницу раздела
    tabs.forEach(function (b) {
        b.addEventListener("click", function (e) {
            if (!idx || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;   // без каталога — обычный переход по ссылке
            e.preventDefault();
            switchTab(b.getAttribute("data-tab"));
        });
    });
    sortSel.addEventListener("change", function () { state.sort = sortSel.value; shown = PAGE; render(); });
    mapBtn.addEventListener("click", function () { state.m = state.m ? "" : "1"; shown = PAGE; render(); });
    viewBox.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-v]");
        if (b) { state.v = b.getAttribute("data-v") || "tiles"; shown = PAGE; hideTip(); render(); }
    });
    var t = null;
    search.addEventListener("input", function () {
        clearTimeout(t);
        if (qClear) qClear.hidden = !search.value;
        t = setTimeout(function () { state.q = search.value.trim(); shown = PAGE; render(); }, 120);
    });
    search.addEventListener("keydown", function (e) { if (e.key === "Escape" && search.value && (!sugList || sugList.hidden)) { e.preventDefault(); clearSearch(); } });
    var sugList = null;

    // поиск закреплён над результатами средствами CSS (.db-qbox — position: sticky под шапкой сайта):
    // печатают далеко внизу списка — подтянуть начало результатов под строку поиска
    search.addEventListener("input", function () {
        var box = search.closest(".db-qbox"), head = app.querySelector(".dbc-head");
        if (!box || !head) return;
        var y = head.getBoundingClientRect().top - (box.getBoundingClientRect().bottom + 12);
        if (y < -40) window.scrollBy(0, y);
    });

    // ---------- подсказки под строкой поиска: лучшие совпадения по всем разделам, стрелки ↑↓ и Enter внутри списка ----------
    (function suggest() {
        var box = search && search.closest(".db-qbox");
        if (!box) return;
        var list = document.createElement("div"), items = [], cur = -1;
        sugList = list;
        list.id = "db-sug";
        search.setAttribute("aria-controls", "db-sug");
        list.className = "db-sug"; list.hidden = true; list.setAttribute("role", "listbox");
        box.appendChild(list);
        // тот же состав и то же сравнение, что у каталога (hit): все вкладки по порядку, книги — своей группой
        function find(q) {
            var out = [];
            tabs.forEach(function (b) {
                var k = b.getAttribute("data-tab"), l = listFor(k), hits = [];
                l.rows.forEach(function (r) {
                    if (!hit(r, q)) return;
                    var at = norm(r[0]).indexOf(q);
                    hits.push([at === 0 ? 0 : at < 0 ? 2 : 1, r]);
                });
                hits.sort(function (x, y) { return x[0] - y[0] || (x[1][0] < y[1][0] ? -1 : 1); });
                if (hits.length) out.push({ tab: k, kind: l.kind, n: hits.length, rows: hits.slice(0, k === "items" ? 4 : 2).map(function (h) { return h[1]; }) });
            });
            return out;
        }
        function label(kind, r) {
            if (kind === "items") return r[5] === "books" ? "Книги" : (idx.sections[r[5]] || "Предметы");
            var b = app.querySelector('.db-tabs [data-tab="' + kind + '"] span');
            return b ? b.textContent : kind;
        }
        function hide() { list.hidden = true; cur = -1; }
        function paint() {
            var q = norm(search.value);
            if (!idx || q.length < 2) return hide();
            var groups = find(q);
            list.innerHTML = ""; items = [];
            if (!groups.length) return hide();
            groups.forEach(function (g) {
                g.rows.forEach(function (r) {
                    if (items.length >= 14) return;   // много разделов — список не длиннее экрана
                    var a = document.createElement("a");
                    a.className = "db-sug-i"; a.setAttribute("role", "option");
                    a.href = base + g.kind + "/" + r[2] + (r[2].indexOf("#") >= 0 ? "" : "/");
                    var p = document.createElement("span"); p.className = "db-pic"; p.appendChild(pic(r, g.kind));
                    var nm = document.createElement("b"); fillName(nm, r[0]);
                    var kd = document.createElement("small"); kd.textContent = label(g.kind, r);
                    a.appendChild(p); a.appendChild(nm); a.appendChild(kd);
                    list.appendChild(a); items.push(a);
                });
            });
            var all = document.createElement("button");
            all.type = "button"; all.className = "db-sug-all";
            var tot = groups.reduce(function (n, g) { return n + g.n; }, 0);
            all.textContent = "Показать все совпадения в каталоге: " + tot;
            all.addEventListener("click", function () {
                hide(); search.blur();
                // все совпадения: снять раздел и фильтры, остаться на вкладке, если в ней есть находки, иначе — на самую богатую
                var g = groups.filter(function (x) { return x.tab === state.tab; })[0] || groups.slice().sort(function (x, y) { return y.n - x.n; })[0];
                clearTimeout(t);
                state.q = search.value.trim(); state.tab = g.tab;
                state.sec = state.t = state.qc = state.dlc = state.m = ""; shown = PAGE; hideTip(); render();
                app.querySelector(".dbc-head").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
            });
            list.appendChild(all);
            cur = -1; list.hidden = false;
        }
        function mark(i) {
            items.forEach(function (a, j) { a.classList.toggle("is-cur", j === i); a.setAttribute("aria-selected", String(j === i)); });
            cur = i;
        }
        search.addEventListener("input", function () { setTimeout(paint, 140); });
        search.addEventListener("focus", paint);
        search.addEventListener("blur", function () { setTimeout(hide, 160); });
        search.addEventListener("keydown", function (e) {
            if (list.hidden) return;
            if (e.key === "ArrowDown") { e.preventDefault(); mark((cur + 1) % items.length); }
            else if (e.key === "ArrowUp") { e.preventDefault(); mark(cur <= 0 ? items.length - 1 : cur - 1); }
            else if (e.key === "Enter" && cur >= 0) { e.preventDefault(); location.href = items[cur].href; }
            else if (e.key === "Escape") hide();
        });
        list.addEventListener("mousedown", function (e) { e.preventDefault(); });
    })();

    // ---------- «Недавно смотрели»: записи, которые человек открывал (кладёт js/db-links.js) ----------
    (function recent() {
        var game = (base.match(/\/db\/([^/]+)\//) || [])[1];
        var rows = [];
        try { rows = JSON.parse(localStorage.getItem("bp_db_recent_" + game) || "[]"); } catch (e) {}
        if (!rows.length) return;
        var box = document.createElement("div");
        box.className = "db-recent";
        box.innerHTML = '<span class="db-recent-h">Недавно смотрели</span><span class="db-recent-l"></span><button type="button" class="db-recent-x" aria-label="Очистить историю">Очистить</button>';
        var l = box.querySelector(".db-recent-l");
        rows.slice(0, 8).forEach(function (r) {
            var a = document.createElement("a");
            a.href = r.u; a.textContent = r.n;
            l.appendChild(a);
        });
        box.querySelector(".db-recent-x").addEventListener("click", function () {
            try { localStorage.removeItem("bp_db_recent_" + game); } catch (e) {}
            box.remove();
        });
        var mainCol = app.querySelector(".dbc-main") || app;
        mainCol.appendChild(box);   // под списком: над результатами — только поиск и фильтры
    })();

    readUrl();
    search.value = state.q;
    countEl.textContent = "Загрузка каталога…";
    fetch(app.getAttribute("data-index")).then(function (r) { return r.json(); }).then(function (j) {
        idx = j;
        Object.keys(idx.onmap || {}).forEach(function (k) { var rows = idx.lists[k] || [], go = (idx.mapgo || {})[k] || []; idx.onmap[k].forEach(function (i, j) { if (rows[i]) { rows[i]._m = 1; if (go[j]) rows[i]._mu = go[j]; } }); });
        render(); doneLoader();
    })
        .catch(function () {
            // ошибка — отдельное состояние: каркас-заглушка убирается, есть кнопка повтора; разделы слева работают ссылками
            grid.className = "db-grid"; grid.removeAttribute("aria-hidden"); grid.innerHTML = "";
            spoil.open = true; spoil.classList.add("is-flat");   // сообщение не должно прятаться в закрытом спойлере
            var li = document.createElement("li"); li.className = "db-empty is-error";
            li.innerHTML = "<b>Каталог не загрузился</b><p>Проверьте соединение и обновите страницу. Разделы слева открываются и без каталога.</p><div class=\"db-empty-acts\"><button type=\"button\">Обновить страницу</button></div>";
            li.querySelector("button").addEventListener("click", function () { location.reload(); });
            grid.appendChild(li);
            countEl.textContent = ""; doneLoader();
        });

    // загрузочный экран как у карты (db_pages.map_loader): не меньше 0,8 с, один раз за сессию
    function doneLoader() {
        var el = document.getElementById("db-loader");
        try { sessionStorage.setItem("bp_db_seen", "1"); } catch (e) {}
        if (!el) return;
        var t0 = window.__dbLoaderAt || 0;
        setTimeout(function () {
            el.classList.add("is-done");
            setTimeout(function () { el.remove(); }, 700);
        }, Math.max(0, 800 - (performance.now() - t0)));
    }
})();
