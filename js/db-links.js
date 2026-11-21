/* Страницы записей базы (/db/<игра>/<раздел>/<запись>/), подключает scripts/db_pages.py → shell():
   1) «← К списку»: если пришли из каталога, ссылка возвращает к тем же вкладке, фильтрам и поиску
      (адрес каталога кладёт js/db-catalog.js в sessionStorage "bp_db_back");
   2) подсказка при наведении на ссылку другой записи (как в каталоге): имя, английское имя, подпись, картинка.
      Данные — тот же index.json, что у каталога (<meta name="db-index">), грузится при первом наведении. */
(function () {
    "use strict";
    var main = document.querySelector("main.db");
    if (!main) return;
    var m = location.pathname.match(/^\/db\/([^/]+)\//);
    if (!m) return;
    var game = m[1], base = "/db/" + game + "/";

    // ---------- «← К списку» ----------
    try {
        var back = JSON.parse(sessionStorage.getItem("bp_db_back") || "null");
        if (back && back.game === game && back.url) {
            var crumbs = main.querySelector(".db-crumbs");
            var a = document.createElement("a");
            a.className = "db-back";
            a.href = back.url;
            a.innerHTML = '<span aria-hidden="true">←</span> <span></span>';
            a.lastChild.textContent = back.label ? "К списку: " + back.label : "К списку";
            if (crumbs) crumbs.after(a);
        }
    } catch (e) {}

    // ---------- вкладки полосы игры: в каталог на ту же вкладку; если пользователь только что был в ней — с теми же фильтрами и поиском ----------
    try {
        var back2 = JSON.parse(sessionStorage.getItem("bp_db_back") || "null");
        if (back2 && back2.game === game && back2.url) {
            var bq = new URLSearchParams(back2.url.split("?")[1] || ""), bt = bq.get("tab") || "items";
            document.querySelectorAll(".dbs-tabs a[data-k]").forEach(function (t) {
                if (t.getAttribute("data-k") === bt) t.href = back2.url;
            });
        }
    } catch (e) {}

    // ---------- «Недавно смотрели»: запоминаем запись (показывает js/db-catalog.js) ----------
    try {
        var h1 = main.querySelector("h1"), key = "bp_db_recent_" + game;
        if (h1 && /^\/db\/[^/]+\/[a-z]+\/[^/]+\/?$/.test(location.pathname)) {
            var list = JSON.parse(localStorage.getItem(key) || "[]").filter(function (r) { return r.u !== location.pathname; });
            list.unshift({ n: h1.textContent.trim(), u: location.pathname });
            localStorage.setItem(key, JSON.stringify(list.slice(0, 12)));
        }
    } catch (e) {}

    // ---------- длинные списки ссылок: первые 12, остальное под кнопкой (в HTML всё остаётся — для поиска и ссылок) ----------
    main.querySelectorAll("ul.db-links").forEach(function (ul) {
        var li = ul.children;
        if (li.length < 20) return;
        var LIM = 12, hid = [];
        for (var i = LIM; i < li.length; i++) { li[i].hidden = true; hid.push(li[i]); }
        var b = document.createElement("button");
        b.type = "button"; b.className = "db-more";
        b.textContent = "Показать все " + li.length;
        b.addEventListener("click", function () { hid.forEach(function (x) { x.hidden = false; }); b.remove(); });
        ul.after(b);
    });

    // ---------- оглавление длинной страницы: справа, подсвечивает раздел, который читаешь ----------
    (function toc() {
        var hs = Array.prototype.filter.call(main.querySelectorAll("h2"), function (h) { return h.textContent.trim(); });
        if (hs.length < 3 || !window.IntersectionObserver) return;
        var nav = document.createElement("nav");
        nav.className = "db-toc"; nav.setAttribute("aria-label", "Разделы страницы");
        var links = [];
        hs.forEach(function (h, i) {
            if (!h.id) h.id = "s" + (i + 1);
            var a = document.createElement("a");
            a.href = "#" + h.id;
            var cnt = h.querySelector(".cp-n");
            a.textContent = h.firstChild.textContent.trim();
            if (cnt) { var n = document.createElement("small"); n.textContent = cnt.textContent; a.appendChild(n); }
            nav.appendChild(a); links.push(a);
        });
        main.appendChild(nav);
        var io = new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                if (!e.isIntersecting) return;
                var i = hs.indexOf(e.target);
                links.forEach(function (a, j) { a.classList.toggle("is-on", j === i); });
            });
        }, { rootMargin: "-20% 0px -70% 0px" });
        hs.forEach(function (h) { io.observe(h); });
    })();

    // ---------- подсказки у ссылок на записи ----------
    if (!(window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches)) return;
    var meta = document.querySelector('meta[name="db-index"]');
    var idxUrl = meta && meta.content;
    if (!idxUrl) return;
    var idx = null, loading = null, tip = null, cur = null;
    var KINDS = ["items", "quests", "bestiary", "characters", "lore", "locations", "effects", "achievements", "sets"];

    function load() {
        if (!loading) loading = fetch(idxUrl).then(function (r) { return r.json(); }).then(function (j) {
            idx = {};
            KINDS.forEach(function (k) {
                var map = idx[k] = {};
                (j.lists[k] || []).forEach(function (r) { map[r[2]] = r; });
            });
            idx.assets = j.assets;
        }).catch(function () { idx = false; });
        return loading;
    }
    function rowFor(href) {
        var p = (href || "").replace(location.origin, "").match(/^\/db\/[^/]+\/([a-z]+)\/([^/#?]+)\/?$/);
        if (!p || !idx || !idx[p[1]]) return null;
        return idx[p[1]][p[2]] || null;
    }
    function pic(r) {
        var v = r[3];
        if (!v || v.indexOf("q:") === 0) return null;
        var img = document.createElement("img");
        img.src = v.indexOf("p:") === 0 ? v.slice(2) : idx.assets + v + ".webp";
        img.alt = "";
        img.referrerPolicy = "no-referrer";
        img.onerror = function () { img.remove(); };
        return img;
    }
    function show(a) {
        var r = rowFor(a.getAttribute("href"));
        if (!r || a !== cur) return;
        if (!tip) { tip = document.createElement("div"); tip.setAttribute("role", "tooltip"); document.body.appendChild(tip); }
        tip.className = "db-tt db-ctt db-ltt";
        tip.innerHTML = '<div class="db-tt-h"><b></b><small></small></div><p></p>';
        tip.querySelector("b").textContent = r[0];
        var en = tip.querySelector("small");
        if (r[1] && r[1] !== r[0]) en.textContent = r[1]; else en.remove();
        var p = tip.querySelector("p"), cap = (r[4] || "").split(" · ");
        if (cap[0]) cap.forEach(function (c, i) {
            var s = document.createElement("span");
            s.textContent = c;
            if (i === cap.length - 1 && r[7] && /\/items\//.test(a.getAttribute("href"))) s.className = "db-qc-" + r[7];
            p.appendChild(s);
        }); else p.remove();
        var im = pic(r);
        if (im) tip.insertBefore(Object.assign(document.createElement("span"), { className: "db-ltt-pic" }), tip.firstChild).appendChild(im);
        if (cap.join("").length > 60) tip.classList.add("is-long");
        tip.hidden = false;
        var rc = a.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
        var x = Math.min(Math.max(8, rc.left + rc.width / 2 - tw / 2), innerWidth - tw - 8);
        var y = rc.top - th - 10;
        if (y < 70) y = rc.bottom + 10;
        tip.style.left = x + "px"; tip.style.top = y + "px";
    }
    function hide() { if (tip) tip.hidden = true; cur = null; }
    var SEL = 'a[href^="' + base + '"]';
    main.addEventListener("mouseover", function (e) {
        var a = e.target.closest(SEL);
        if (!a || a === cur || a.closest(".db-crumbs, .db-secs, .db-back")) return;
        cur = a;
        if (idx) show(a); else if (idx !== false) load().then(function () { if (idx) show(a); });
    });
    main.addEventListener("mouseout", function (e) {
        var a = e.target.closest(SEL);
        if (a && a === cur && !a.contains(e.relatedTarget)) hide();
    });
    window.addEventListener("scroll", hide, { passive: true });
})();
