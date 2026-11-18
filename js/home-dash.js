// Главная: панель «Ваш прогресс», блок «Новое и скоро», счётчики в первом экране, кнопка «Продолжить» в hero.
// Данные только реальные: прогресс — window.bpProgress (js/script.js), избранное/последняя карта — localStorage, даты — GAME_FRESH.
(function () {
    "use strict";
    var container = document.getElementById("games-container");
    if (!container) return;
    var $ = function (id) { return document.getElementById(id); };
    var read = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    var fmt = function (n) { return Number(n).toLocaleString("ru-RU"); };
    var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    var plural = function (n, a, b, c) { var m = n % 100, d = n % 10; return m > 10 && m < 15 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c; };
    var cards = [].slice.call(container.querySelectorAll(":scope > details.game-dropdown"));
    var themeOf = function (c) { var m = /theme-(\S+)/.exec(c.className); return m ? m[1] : ""; };
    var titleOf = function (c) { var t = c.querySelector(".game-title"); return t ? t.textContent.trim() : ""; };
    var accentOf = function (c) { return getComputedStyle(c).getPropertyValue("--game-accent").trim(); };
    var cardOf = function (t) { return container.querySelector("details.theme-" + t); };
    var fresh = typeof GAME_FRESH !== "undefined" ? GAME_FRESH : {};

    // ---------- счётчики под первым экраном ----------
    var stats = $("hd-stats");
    function renderStats() {
        if (!stats) return;
        var maps = 0, marks = 0;
        cards.forEach(function (c) {
            maps += +c.dataset.maps || 1;
            var t = c.querySelector(".game-progress-count"), m = t && /^[\d\s ]+/.exec(t.textContent);
            if (m) marks += parseInt(m[0].replace(/\D/g, ""), 10) || 0;
        });
        var set = function (k, v) { var el = stats.querySelector('[data-k="' + k + '"]'); if (el) el.textContent = v; };
        set("games", cards.length); set("maps", maps);
        set("marks", marks ? fmt(Math.floor(marks / 1000) * 1000) + "+" : "");
    }

    // ---------- «Продолжить» в hero и панель прогресса ----------
    function lastMap() {
        var list = read("bp_recent", []), store = window.bpProgress && window.bpProgress.maps;
        if (!Array.isArray(list) || !store) return null;
        for (var i = 0; i < list.length; i++) {
            var r = list[i], info = r && store.get(r.game + "/" + r.map);
            if (info && info.href) { var c = cardOf(r.game); return { href: info.href, name: info.name, game: r.game, title: c ? titleOf(c) : "", found: info.found, total: info.total }; }
        }
        return null;
    }
    function renderHero(last) {
        var cta = document.querySelector(".vx-cta"), old = $("hd-continue");
        if (old) old.remove();
        if (!cta || !last) return;
        var a = document.createElement("a");
        a.id = "hd-continue"; a.className = "sp-btn sp-pill hd-continue"; a.href = last.href;
        a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>Продолжить: ' + esc(last.title || last.name);
        cta.prepend(a);
    }
    // Достижения считаются из реального прогресса; дата получения запоминается в bp_ach (только на этом устройстве)
    function achievements(rows, found, favN, done) {
        var maxPct = rows.reduce(function (m, r) { return Math.max(m, r.p.total ? r.p.found / r.p.total : 0); }, 0);
        var defs = [
            ["first", "Первая находка", "Отметьте первую метку", found >= 1],
            ["f100", "Следопыт", "100 найденных меток", found >= 100],
            ["f500", "Исследователь", "500 найденных меток", found >= 500],
            ["f1000", "Картограф", "1 000 найденных меток", found >= 1000],
            ["f5000", "Хранитель миров", "5 000 найденных меток", found >= 5000],
            ["g3", "Путешественник", "Прогресс в 3 играх", rows.length >= 3],
            ["half", "На полпути", "50% в одной из игр", maxPct >= .5],
            ["full", "Стопроцентник", "Игра пройдена на 100%", done >= 1],
            ["fav", "Любимчик", "Добавьте игру в избранное", favN >= 1]
        ];
        var got = read("bp_ach", {}), now = new Date().toISOString().slice(0, 10), ch = false;
        defs.forEach(function (d) { if (d[3] && !got[d[0]]) { got[d[0]] = now; ch = true; } });
        if (ch) try { localStorage.setItem("bp_ach", JSON.stringify(got)); } catch (e) {}
        return defs.map(function (d) { return { id: d[0], name: d[1], hint: d[2], on: !!got[d[0]] || d[3], date: got[d[0]] }; });
    }
    function renderMe() {
        var box = $("hd-me");
        if (!box) return;
        var prog = (window.bpProgress && window.bpProgress.games) || {}, favs = read("bp_fav", []);
        var rows = cards.map(function (c) { return { c: c, p: prog[themeOf(c)] }; }).filter(function (r) { return r.p && r.p.found > 0; });
        var last = lastMap();
        renderHero(last);
        if (!rows.length) { box.hidden = true; try { localStorage.removeItem("bp_prog"); } catch (e) {} return; }
        var found = 0, total = 0;
        rows.forEach(function (r) { found += r.p.found; });
        cards.forEach(function (c) { var p = prog[themeOf(c)]; if (p) total += p.total; });
        var pct = function (p) { return p.total ? Math.round(p.found / p.total * 100) : 0; };
        rows.sort(function (a, b) { return pct(b.p) - pct(a.p) || b.p.found - a.p.found; });
        var done = rows.filter(function (r) { return r.p.found >= r.p.total; }).length;
        var all = total ? Math.round(found / total * 100) : 0;
        var favN = Array.isArray(favs) ? favs.filter(function (t) { return cardOf(t); }).length : 0;
        var bars = rows.slice(0, 3).map(function (r) {
            var p = pct(r.p), acc = accentOf(r.c);
            return '<li' + (acc ? ' style="--pa:' + esc(acc) + '"' : "") + '><span class="hd-bar-name">' + esc(titleOf(r.c)) + '</span><b>' + p + '%</b><span class="hd-bar"><i style="width:' + p + '%"></i></span></li>';
        }).join("");
        var ach = achievements(rows, found, favN, done), earned = ach.filter(function (a) { return a.on; });
        var latestA = earned.slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); })[0];
        var achHtml = '<div class="hd-ach"><div class="hd-ach-h"><h3>Достижения <small>' + earned.length + " из " + ach.length + "</small></h3>" + (latestA ? "<span>Последнее: " + esc(latestA.name) + "</span>" : "") + '</div><ul>' +
            ach.map(function (a) { return '<li class="' + (a.on ? "is-on" : "") + '" title="' + esc(a.hint) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 20h8M10 17h4"/></svg><b>' + esc(a.name) + "</b><small>" + esc(a.hint) + "</small></li>"; }).join("") + "</ul></div>";
        // Блок «Ваш прогресс» перенесён в личный кабинет: здесь только сохраняем сводку, её рисует js/sb.js
        box.hidden = true;
        try {
            localStorage.setItem("bp_prog", JSON.stringify({
                t: Date.now(), all: all, found: found, total: total, done: done, fav: favN,
                games: rows.map(function (r) { return { id: themeOf(r.c), title: titleOf(r.c), found: r.p.found, total: r.p.total, accent: accentOf(r.c) || "" }; }),
                last: last ? { href: last.href, title: last.title, name: last.name } : null
            }));
        } catch (e) {}
    }

    // ---------- «Новое и скоро» ----------
    function renderPulse() {
        var box = $("hd-pulse");
        if (!box) return;
        var now = Date.now(), WEEKS = 3 * 7 * 864e5, day = function (d) { return new Date(d + "T00:00:00").getTime(); };
        var fmtDay = function (d) { return new Date(d + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" }); };
        var added = [], upd = [], soon = [];
        Object.keys(fresh).forEach(function (t) {
            var f = fresh[t], c = cardOf(t); if (!c) return;
            if (f.release && now < new Date(f.release + "T00:00:00+03:00").getTime()) { soon.push({ t: t, c: c, d: f.release }); return; }
            if (f.added && now - day(f.added) < WEEKS * 2) added.push({ t: t, c: c, d: f.added });
            else if (f.updated && now - day(f.updated) < WEEKS * 2) upd.push({ t: t, c: c, d: f.updated });
        });
        added.sort(function (a, b) { return b.d.localeCompare(a.d); }); upd.sort(function (a, b) { return b.d.localeCompare(a.d); });
        var col = function (title, ico, items, tag) {
            if (!items.length) return "";
            return '<section class="hd-col"><h3>' + ico + title + "</h3><ul>" + items.slice(0, 3).map(function (i) {
                var acc = accentOf(i.c), href = (i.c.querySelector("a.map-link") || {}).getAttribute ? i.c.querySelector("a.map-link").getAttribute("href") : "#games-heading";
                return '<li' + (acc ? ' style="--pa:' + esc(acc) + '"' : "") + '><a href="' + esc(href) + '"><i class="hd-dot"></i><span>' + esc(titleOf(i.c)) + "</span><time>" + (tag === "soon" ? fmtDay(i.d) : fmtDay(i.d)) + "</time></a></li>";
            }).join("") + "</ul></section>";
        };
        var ic = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
        var html = col("Новые игры", ic("M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"), added) +
            col("Недавно обновлены", ic("M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4"), upd) +
            col("Скоро на сайте", ic("M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"), soon, "soon");
        box.hidden = !html;
        box.innerHTML = html ? '<div class="hd-head"><h2 id="hd-pulse-h">Новое и скоро</h2><a class="hd-more" href="#updates">Все обновления →</a></div><div class="hd-cols">' + html + "</div>" : "";
    }

    // ---------- «Что нового» тремя вкладками: новости / обновления / исправления (по тексту записей) ----------
    function renderTabs() {
        var body = document.querySelector("#updates .updates-body"), list = body && body.querySelector(".updates-list");
        if (!list || body.querySelector(".hd-tabs")) return;
        var kind = function (t) {
            if (/исправлен|ошибк|координат|поправлен/i.test(t)) return "fix";
            if (/нов(ая|ые) (карта|игр)|скоро|добавлен[аы]? (карта|игра)|карты? .*откро/i.test(t)) return "news";
            return "upd";
        };
        var names = { all: "Все", news: "Новости", upd: "Обновления", fix: "Исправления" }, n = { all: 0, news: 0, upd: 0, fix: 0 };
        list.querySelectorAll(".update-entry li").forEach(function (li) { var k = kind(li.textContent); li.dataset.k = k; n.all++; n[k]++; });
        var bar = document.createElement("div");
        bar.className = "hd-tabs"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Тип записей");
        bar.innerHTML = Object.keys(names).map(function (k) { return '<button type="button" data-k="' + k + '" aria-pressed="' + (k === "all") + '">' + names[k] + " <small>" + n[k] + "</small></button>"; }).join("");
        list.before(bar);
        bar.addEventListener("click", function (e) {
            var b = e.target.closest("button"); if (!b) return;
            var k = b.dataset.k;
            bar.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
            list.querySelectorAll(".update-entry").forEach(function (en) {
                var any = false;
                en.querySelectorAll("li").forEach(function (li) { var on = k === "all" || li.dataset.k === k; li.hidden = !on; any = any || on; });
                en.hidden = !any;
            });
        });
    }

    // ---------- фон первого экрана: арт последней добавленной игры за превью карты ----------
    function renderHeroArt() {
        var hero = document.querySelector(".vx-hero");
        if (!hero || hero.querySelector(".hd-art")) return;
        var pick = null, now = Date.now();
        Object.keys(fresh).forEach(function (t) {
            var f = fresh[t]; if (!f.added || !cardOf(t)) return;
            if (f.release && now < new Date(f.release + "T00:00:00+03:00").getTime()) return;
            if (!pick || f.added > fresh[pick].added) pick = t;
        });
        var c = pick && cardOf(pick), img = c && c.querySelector(".game-banner-art, .game-banner img");
        if (!img) return;
        var link = c.querySelector("a.map-link"), href = link ? link.getAttribute("href") : "#games-heading";
        var art = document.createElement("a");
        art.className = "hd-art"; art.href = href; art.style.setProperty("--pa", accentOf(c) || "#c7ff3f");
        art.setAttribute("aria-label", "Новинка: " + titleOf(c) + " — открыть карту");
        art.innerHTML = '<img src="' + esc(img.currentSrc || img.src) + '" alt="" decoding="async" loading="lazy"><span class="hd-art-tag"><i>Новинка</i>' + esc(titleOf(c)) + " →</span>";
        hero.prepend(art);
    }

    function init() { renderHeroArt(); renderTabs(); renderStats(); renderMe(); renderPulse(); }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
    document.addEventListener("bp:progress", renderMe);
    addEventListener("bp:fav", renderMe);
    addEventListener("pageshow", function (e) { if (e.persisted) renderMe(); });
})();
