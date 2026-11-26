/* Общие мелочи базы данных (scripts/db_pages.py → shell()): работает на каталоге игры и на страницах записей.
   1) «Случайная запись» — кнопка в полосе игры / шапке каталога (случайный раздел, затем случайная запись из index.json);
   2) «Недавно смотрели» внизу страницы записи (список кладёт js/db-links.js);
   3) сцена за заголовком: размытый кадр из игры, лёгкий параллакс при прокрутке (не при «меньше движения»). */
(function () {
    "use strict";
    var m = location.pathname.match(/^\/db\/([^/]+)\//);
    if (!m) return;
    var game = m[1], base = "/db/" + game + "/";
    var app = document.getElementById("db-app");
    var meta = document.querySelector('meta[name="db-index"]');
    var idxUrl = (app && app.getAttribute("data-index")) || (meta && meta.content) || "";

    // ---------- случайная запись ----------
    var KINDS = ["items", "quests", "bestiary", "characters", "locations", "lore", "effects"];
    function go(btn) {
        if (!idxUrl) return;
        btn.disabled = true;
        fetch(idxUrl).then(function (r) { return r.json(); }).then(function (j) {
            var ks = KINDS.filter(function (k) { return (j.lists[k] || []).length; });
            var k = ks[Math.floor(Math.random() * ks.length)], rows = j.lists[k].filter(function (r) { return r[2].indexOf("#") < 0; });
            var r = rows[Math.floor(Math.random() * rows.length)];
            location.href = base + k + "/" + r[2] + "/";
        }).catch(function () { btn.disabled = false; });
    }
    function rndBtn(cls) {
        var b = document.createElement("button");
        b.type = "button"; b.className = cls; b.setAttribute("aria-label", "Случайная запись"); // на телефоне подпись скрыта CSS
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/><circle cx="15" cy="9" r="1.1"/><circle cx="9" cy="15" r="1.1"/></svg><span>Случайная запись</span>';
        b.addEventListener("click", function () { go(b); });
        return b;
    }
    var top = document.querySelector(".dbs-top .dbs-map"), st = document.querySelector(".dbx-acts");
    if (top) top.before(rndBtn("dbs-rnd"));
    else if (st) st.appendChild(rndBtn("dbs-rnd dbx-rnd"));

    // ---------- «Недавно смотрели» под записью ----------
    var main = document.querySelector("main.db");
    if (main && /^\/db\/[^/]+\/[a-z]+\/[^/]+\/?$/.test(location.pathname)) {
        var rows = [];
        try { rows = JSON.parse(localStorage.getItem("bp_db_recent_" + game) || "[]"); } catch (e) {}
        rows = rows.filter(function (r) { return r.u !== location.pathname; }).slice(0, 8);
        if (rows.length) {
            var box = document.createElement("div");
            box.className = "db-recent db-recent-end";
            box.innerHTML = '<span class="db-recent-h">Недавно смотрели</span><span class="db-recent-l"></span>';
            var l = box.lastChild;
            rows.forEach(function (r) { var a = document.createElement("a"); a.href = r.u; a.textContent = r.n; l.appendChild(a); });
            var copy = main.querySelector(".db-copy");
            if (copy) copy.before(box); else main.appendChild(box);
        }
    }

    // ---------- сцена за заголовком ----------
    var sc = document.querySelector(".db-scene[data-src]");
    if (sc) {
        var im = new Image();
        im.referrerPolicy = "no-referrer";
        im.onload = function () {
            sc.style.backgroundImage = 'url("' + im.src + '")';
            sc.classList.add("is-on");
        };
        im.src = sc.getAttribute("data-src");
        if (!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
            var ticking = false;
            addEventListener("scroll", function () {
                if (ticking || scrollY > 700) return;
                ticking = true;
                requestAnimationFrame(function () { sc.style.setProperty("--py", (scrollY * 0.28).toFixed(1) + "px"); ticking = false; });
            }, { passive: true });
        }
    }

    // ---------- копирование: ссылка / название / ID записи (на страницах записей) ----------
    var em = location.pathname.match(/^\/db\/[^/]+\/([a-z]+)\/([^/]+)\/?$/), h1 = em && document.querySelector("main.db h1");
    var toastEl = null, toastT = 0;
    function toast(t) {
        if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "db-toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
        toastEl.textContent = t; toastEl.classList.add("is-on");
        clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 1800);
    }
    function copy(text, ok) {
        function fallback() {
            var ta = document.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
            document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); toast(ok); } catch (e) { prompt("Скопируйте:", text); }
            ta.remove();
        }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast(ok); }, fallback); else fallback();
    }
    if (h1) {
        var bar = document.createElement("div");
        bar.className = "db-copybar"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Копировать");
        var canon = (document.querySelector('link[rel="canonical"]') || {}).href || location.origin + location.pathname;
        [["Ссылка", "Ссылка скопирована", canon], ["Название", "Название скопировано", h1.textContent.trim()], ["ID", "ID скопирован", em[1] + "/" + em[2]]].forEach(function (b) {
            var bt = document.createElement("button");
            bt.type = "button"; bt.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg><span></span>';
            bt.lastChild.textContent = b[0]; bt.title = "Копировать: " + b[0].toLowerCase();
            bt.addEventListener("click", function () { copy(b[2], b[1]); });
            bar.appendChild(bt);
        });
        var mb = document.querySelector("main.db .db-mapbtn");
        if (mb) mb.appendChild(bar); else h1.after(bar);
    }

    // ---------- липкая полоса разделов: при прокрутке вниз полоса игры (поиск + разделы) остаётся сверху в компактном виде ----------
    var strip = document.querySelector("main.db .dbs");
    if (strip && "IntersectionObserver" in window) {
        var fix = document.createElement("div");
        fix.className = "dbs-fix"; fix.setAttribute("aria-hidden", "true");
        var g = strip.querySelector(".dbs-game"), tb = strip.querySelector(".dbs-tabs");
        if (g && tb) {
            var ga = g.cloneNode(true); ga.tabIndex = -1;
            var tc = tb.cloneNode(true); tc.removeAttribute("aria-label");
            tc.querySelectorAll("a").forEach(function (a) { a.tabIndex = -1; });
            fix.appendChild(ga); fix.appendChild(tc);
            document.body.appendChild(fix);
            var cur = tc.querySelector("[aria-current]"); if (cur) cur.scrollIntoView({ inline: "center", block: "nearest" });
            // полоса уходит под шапку сайта — считаем «ушла», когда скрылась за ней, а не за краем экрана
            var topH = (document.getElementById("topbar") || {}).offsetHeight || 0;
            new IntersectionObserver(function (e) {
                var out = !e[0].isIntersecting && e[0].boundingClientRect.top < topH;
                fix.classList.toggle("is-on", out);
                fix.removeAttribute("aria-hidden"); if (!out) fix.setAttribute("aria-hidden", "true");
            }, { threshold: 0, rootMargin: -topH + "px 0px 0px 0px" }).observe(strip);
        }
    }
})();
