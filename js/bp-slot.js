// Рекламная сеть Яндекса (РСЯ). Место под блок — <div class="bp-slot" data-bp-slot="<место>"></div>.
// ID блоков (R-A-…) выдаёт partner.yandex.ru → «Площадки» → «RTB-блоки». Пустой ID — место убирается,
// код РСЯ не грузится. Только на broskiplay.ru и только когда блок подъезжает к экрану (не мешает PSI).
// Включено 21.11.2026.
(function () {
    var BLOCKS = {
        home: "R-A-20460414-1",      // главная, между библиотекой игр и финальным блоком
        games: "R-A-20460414-1",     // /games/: в середине сетки игр (JS ставит между рядами; меньше 6 карточек — прячет)
        games_end: "R-A-20460414-1", // /games/: в конце, после «Не нашли свою игру?»
        db: "R-A-20460414-2",        // страницы базы /db/, внизу
        category: "R-A-20460414-3",
        updates: "R-A-20460414-1",  // «Что нового», внизу
        fixes: "R-A-20460414-1",    // журнал исправлений, внизу
        cabinet: "R-A-20460414-4",  // кабинет, вертикальные 300×600 по бокам (только экраны от 1600px)
        cabinet_m: "R-A-20460414-5", // кабинет, адаптивный внизу (экраны уже 1600px)
        map_top: "R-A-20460414-6",  // карты: Top Ad (липкий сверху, крестик Яндекса) — формат Яндекса только для телефонов
        map_top_d: "R-A-20460414-8",            // карты на десктопе: адаптивный RTB-блок полосой внизу карты, от сайдбара до края. Пусто — нет
        floor: "R-A-20460414-20",   // Floor Ad: липкая полоса снизу на телефонах (главная, база, категории)
        db_side: "R-A-20460414-4",  // база на широком десктопе: липкие вертикальные по бокам контента (блок кабинета)
        cs2: "R-A-20460414-1"       // CS 2: экран выбора карты, под карточками
    };
    var FLOOR = { home: 1, games: 1, db: 1, category: 1 };
    var h = location.hostname;
    var live = h === "broskiplay.ru" || h === "www.broskiplay.ru";
    var abTest = /[?&]bp-ab=1/.test(location.search);  // проверка окна вне прода: ?bp-ab=1
    var devOff = false;  // режим создателя из кабинета: реклама у себя выключена (только этот браузер)
    try { devOff = localStorage.getItem("bp_dev_ads") === "off"; } catch (e) {}
    if (devOff && !abTest) live = false;

    // Карты: Top Ad — один показ за загрузку страницы. Закрыли — до обновления страницы не возвращается
    // (флаг на window переживает переходы между картами без перезагрузки).
    function mapTopAd() {
        var desk = window.matchMedia && matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
        var id = desk ? BLOCKS.map_top_d : BLOCKS.map_top;
        var map = document.querySelector(".bx-app-map .bx-map");
        if (!id || !live || window.__bpTopAd || !map) return;
        window.__bpTopAd = 1;
        var o = { blockId: id, type: "topAd" };
        if (desk) {  // Top Ad у Яндекса только для телефонов — на десктопе полоса во всю ширину карты внизу с крестиком
            var st = document.createElement("style");
            st.textContent = ".bp-mtop{position:absolute;left:var(--sidebar-width);right:0;bottom:0;z-index:30;transition:left .3s ease;padding:8px 48px 8px 8px;"
                + "background:rgba(13,17,27,.88);border-top:1px solid rgba(255,255,255,.12);backdrop-filter:blur(10px);visibility:hidden}" /* sp-ok: плашка рекламы в js, без токенов */
                + "body:has(#sidebar.collapsed) .bp-mtop{left:0}.bp-mtop.on{visibility:visible}.bp-mtop>div{width:100%;height:120px;overflow:hidden;border-radius:10px}"
                + ".bp-mtop-x{position:absolute;top:8px;right:12px;width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,.2);"
                + "background:#0d111b;cursor:pointer;display:grid;place-items:center;padding:0}"  /* sp-ok: плашка рекламы в js */
                + ".bp-mtop-x::before{content:\"\";width:10px;height:10px;background:#fff;" /* sp-ok: значок крестика */
                + "-webkit-mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M1 1l8 8M9 1L1 9' stroke='%23000' stroke-width='1.6'/%3E%3C/svg%3E\") center/contain no-repeat;"
                + "mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M1 1l8 8M9 1L1 9' stroke='%23000' stroke-width='1.6'/%3E%3C/svg%3E\") center/contain no-repeat}";
            document.head.appendChild(st);
            var box = document.createElement("div");
            box.className = "bp-mtop";
            box.innerHTML = '<div id="bp-mtop-ad"></div><button class="bp-mtop-x" type="button" aria-label="Закрыть рекламу"></button>';
            box.lastChild.onclick = function () { box.remove(); };
            map.appendChild(box);
            o = { blockId: id, renderTo: "bp-mtop-ad",
                onRender: function () { box.classList.add("on"); },
                onError: function () { box.remove(); } };
        }
        window.yaContextCb = window.yaContextCb || [];
        window.yaContextCb.push(function () { Ya.Context.AdvManager.render(o); });
        if (document.querySelector('script[src="https://yandex.ru/ads/system/context.js"]')) return;
        var s = document.createElement("script");
        s.src = "https://yandex.ru/ads/system/context.js";
        s.async = true;
        document.head.appendChild(s);
    }

    // Авторасстановка РСЯ (Яндекс сам вставляет блоки в контент) — только на страницах с этими местами.
    var AUTO_PAGE = "20460414";
    var AUTO = { cabinet: 1, cabinet_m: 1 };   // база и категории — свои блоки в середине и внизу, без авторасстановки
    function autoPlace(slots) {
        if (!live || !AUTO_PAGE) return;
        for (var i = 0, on = false; i < slots.length; i++) if (AUTO[slots[i].getAttribute("data-bp-slot")]) on = true;
        if (!on || document.querySelector('script[src="https://yandex.ru/ads/system/ap-loader.js"]')) return;
        if (!document.querySelector('script[src="https://yandex.ru/ads/system/context.js"]')) {
            var c = document.createElement("script");
            c.src = "https://yandex.ru/ads/system/context.js";
            c.async = true;
            document.head.appendChild(c);
        }
        var a = document.createElement("script");
        a.setAttribute("data-page-id", AUTO_PAGE);
        a.src = "https://yandex.ru/ads/system/ap-loader.js";
        a.async = true;
        document.head.appendChild(a);
    }

    function loadContext() {
        if (document.querySelector('script[src="https://yandex.ru/ads/system/context.js"]')) return;
        var s = document.createElement("script");
        s.src = "https://yandex.ru/ads/system/context.js";
        s.async = true;
        document.head.appendChild(s);
    }
    function push(o) {
        window.yaContextCb = window.yaContextCb || [];
        window.yaContextCb.push(function () { Ya.Context.AdvManager.render(o); });
        loadContext();
    }
    var phone = window.matchMedia && matchMedia("(max-width: 1023px), (pointer: coarse)").matches;

    // Floor Ad: липкая полоса снизу на телефонах (крестик Яндекса), один раз за загрузку.
    function floorAd(kind) {
        if (!live || !phone || !FLOOR[kind] || !BLOCKS.floor || window.__bpFloor) return;
        window.__bpFloor = 1;
        push({ blockId: BLOCKS.floor, type: "floorAd", platform: "touch" });
    }

    // Середина длинной страницы базы/категории: перед заголовком раздела, ближайшим к середине.
    function midSlot(kind, bottom) {
        var main = bottom.closest("main"), vh = innerHeight;
        if (!main || main.offsetHeight < vh * 3) return;   // мало контента — только нижний блок
        var mTop = main.getBoundingClientRect().top + scrollY, mid = main.offsetHeight / 2, best = null, bd = 1e9;
        var bTop = bottom.getBoundingClientRect().top + scrollY - mTop;
        [].forEach.call(main.querySelectorAll("h2"), function (h) {
            if (h.closest("nav,table,details:not([open]),.bp-slot") || !h.offsetParent) return;
            var y = h.getBoundingClientRect().top + scrollY - mTop;
            if (y < vh || bTop - y < vh) return;   // не на первом экране и не рядом с нижним блоком
            if (Math.abs(y - mid) < bd) { bd = Math.abs(y - mid); best = h; }
        });
        if (!best) return;
        var el = best;   // поднимаемся до обёртки, которая начинается этим заголовком
        while (el.parentNode !== main && el.parentNode.firstElementChild === el) el = el.parentNode;
        var s = document.createElement("div");
        s.className = "bp-slot";
        s.setAttribute("data-bp-slot", kind);
        el.parentNode.insertBefore(s, el);
    }

    // База на широком десктопе: липкие вертикальные блоки по бокам контента (до 300×600, от 160 в ширину), если помещаются.
    function sideSlot(bottom) {
        if (phone || !BLOCKS.db_side) return;
        var main = bottom.closest("main");
        if (!main) return;
        function edges() {   // края контента вместе с плавающим оглавлением раздела (.db-toc), чтобы не налезать
            var r = main.getBoundingClientRect(), l = r.left, x = r.right;
            [].forEach.call(document.querySelectorAll(".db-toc"), function (el) { var b = el.getBoundingClientRect(); if (b.width) { x = Math.max(x, b.right); l = Math.min(l, b.left); } });
            return { l: l, r: x };
        }
        function w(gap) { return Math.min(300, gap - 48); }
        var e = edges();
        if (w(Math.min(e.l, innerWidth - e.r)) < 160) return;
        var sides = ["l", "r"].map(function (k) {
            var s = document.createElement("div");
            s.className = "bp-slot bp-side";
            s.setAttribute("data-bp-slot", "db_side");
            document.body.appendChild(s);
            return { k: k, el: s };
        });
        function pos() {
            var e = edges(), top = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--bx-top-h")) || 72;
            var sw = w(Math.min(e.l, innerWidth - e.r));
            sides.forEach(function (o) {
                var s = o.el.style;
                s.display = sw < 160 ? "none" : "";
                s.width = sw + "px";
                s.top = (top + 24) + "px";
                s.left = (o.k === "l" ? e.l - 24 - sw : e.r + 24) + "px";
            });
        }
        pos();
        addEventListener("resize", pos);
        addEventListener("load", pos);
        setTimeout(pos, 1500);   // оглавление раздела строит скрипт базы позже
    }

    // Главная: баннер посередине каталога, между рядами карточек; переставляется после фильтров/сортировки.
    // park — /games/: при коротком списке (фильтр, поиск) место в середине прячется, иначе встанет вплотную к блоку в конце
    function homeSlot(slot, park) {
        var box = document.getElementById("games-container");
        if (!box) return;
        var home = { parent: slot.parentNode, next: slot.nextSibling }, busy = false, t;
        function place() {
            busy = true;
            var vis = [].filter.call(box.children, function (c) { return c.matches("details.game-dropdown") && !c.classList.contains("is-filtered") && c.offsetParent; });
            slot.classList.toggle("bp-park", !!park && vis.length < 6);
            if (vis.length < 6) { if (slot.parentNode !== home.parent) home.parent.insertBefore(slot, home.next); }
            else {
                var cols = vis.filter(function (c) { return c.offsetTop === vis[0].offsetTop; }).length || 1;
                var at = vis[cols * Math.floor(Math.ceil(vis.length / cols) / 2)];
                if (at && slot.nextElementSibling !== at) box.insertBefore(slot, at);
            }
            setTimeout(function () { busy = false; }, 0);
        }
        place();
        if (window.MutationObserver) new MutationObserver(function () { if (!busy) { clearTimeout(t); t = setTimeout(place, 50); } })
            .observe(box, { childList: true, attributes: true, attributeFilter: ["class", "style", "hidden"], subtree: true });   // фильтр/поиск меняют карточки
        addEventListener("resize", function () { clearTimeout(t); t = setTimeout(place, 150); });
    }

    var io = null, ioTodo = [], nth = {};
    function render(t) {
        var o = { blockId: t.id, renderTo: t.el.id, onError: function () { t.el.remove(); } };  // нет показа — убрать пустое место
        if (t.n > 1) o.pageNumber = t.n;
        push(o);
    }
    function queue(el) {
        var id = BLOCKS[el.getAttribute("data-bp-slot")];
        if (el.hasAttribute("data-bp-on")) return 0;
        if (!id || !(live || abTest)) { el.remove(); return 0; }
        if (!live) return 0;
        el.setAttribute("data-bp-on", "");
        el.id = el.id || "bps-" + Math.random().toString(36).slice(2, 9);
        nth[id] = (nth[id] || 0) + 1;   // один блок несколько раз на странице — разные pageNumber
        var t = { el: el, id: id, n: nth[id] };
        if (!("IntersectionObserver" in window)) { render(t); return 1; }
        io = io || new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                if (!e.isIntersecting) return;
                io.unobserve(e.target);
                ioTodo.forEach(function (x) { if (x.el === e.target) render(x); });
            });
        }, { rootMargin: "600px 0px" });
        ioTodo.push(t);
        io.observe(el);
        return 1;
    }
    // Место, появившееся после загрузки (экран выбора карты CS 2): window.bpSlot(el)
    window.bpSlot = function (el) { if (el) queue(el); };

    function init() {
        mapTopAd();
        var onMap = !!document.querySelector(".bx-app-map");
        var first = document.querySelector(".bp-slot[data-bp-slot]"), kind = first && first.getAttribute("data-bp-slot");
        if (live && first && (kind === "db" || kind === "category")) {
            midSlot(kind, first);
            if (kind === "db") sideSlot(first);
        }
        if ((live || abTest) && first && (kind === "home" || kind === "games")) homeSlot(first, kind === "games");
        if (!onMap) floorAd(kind);
        autoPlace(document.querySelectorAll(".bp-slot[data-bp-slot]"));
        var slots = document.querySelectorAll(".bp-slot[data-bp-slot]"), n = 0;
        var st = document.createElement("style");  // стиль здесь, чтобы не поднимать ?v= у spatial.css на всех страницах
        st.textContent = ".bp-slot{display:block;width:100%;max-width:970px;min-height:250px;margin:32px auto;overflow:hidden;border-radius:16px}"
            + ".games-container>.bp-slot{grid-column:1/-1;max-width:none;margin:6px 0}.bp-slot.bp-park{display:none}"
            + ".bp-slot.bp-side{position:fixed;z-index:1;width:300px;min-height:600px;margin:0}";
        document.head.appendChild(st);
        for (var i = 0; i < slots.length; i++) n += queue(slots[i]);
        if (!onMap && (n || (abTest && slots.length))) adblockCheck();
    }

    // Окно «включён блокировщик»: при каждой загрузке страницы с рекламой, без запоминания закрытия.
    function adblockCheck() {
        if (/bot|crawl|spider|slurp|lighthouse|pagespeed|yandex(?!browser)|google(?!.*chrome)/i.test(navigator.userAgent) && !abTest) return;
        function run() {
            setTimeout(function () {
                if (abTest) return showAdblock();
                if (navigator.onLine === false) return;
                var bait = document.createElement("div");
                bait.className = "adsbox ad-banner ad-placement pub_300x250 textads";
                bait.setAttribute("aria-hidden", "true");
                bait.style.cssText = "position:absolute;left:-9999px;top:0;width:1px;height:1px";
                bait.innerHTML = "&nbsp;";
                document.body.appendChild(bait);
                setTimeout(function () {
                    var cs = getComputedStyle(bait);
                    var hidden = !bait.isConnected || bait.offsetHeight === 0 || cs.display === "none" || cs.visibility === "hidden";
                    if (bait.parentNode) bait.parentNode.removeChild(bait);
                    if (hidden) return showAdblock();
                    if (!window.fetch) return;
                    fetch("https://yandex.ru/ads/system/context.js", { mode: "no-cors", cache: "force-cache", credentials: "omit" })
                        .then(function () {}, function () { if (navigator.onLine !== false) showAdblock(); });
                }, 100);
            }, 2500);
        }
        if (document.readyState === "complete") run();
        else window.addEventListener("load", run);
    }

    function showAdblock() {
        if (document.getElementById("bp-ab")) return;
        var st = document.createElement("style");
        st.textContent =
            "#bp-ab{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,8,14,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font-family:Manrope,system-ui,sans-serif;animation:bpAbIn .2s ease-out}" +
            "@keyframes bpAbIn{from{opacity:0}to{opacity:1}}" +
            "#bp-ab .bp-ab-box{position:relative;box-sizing:border-box;width:100%;max-height:calc(100vh - 32px);overflow:auto;max-width:460px;padding:28px 24px 20px;border-radius:20px;background:linear-gradient(160deg,rgba(26,33,50,.96),rgba(13,17,27,.97));border:1px solid rgba(199,255,63,.28);box-shadow:0 0 0 1px rgba(84,220,255,.08),0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(199,255,63,.08);color:#dfe6f3}" +
            "#bp-ab h2{margin:0 32px 12px 0;font:700 20px/1.3 Unbounded,Manrope,sans-serif;color:#fff}" +
            "#bp-ab p{margin:0 0 12px;font-size:15px;line-height:1.55;color:#b9c3d6}" +
            "#bp-ab .bp-ab-btns{display:flex;flex-direction:column;gap:10px;margin-top:20px}" +
            "#bp-ab button{font:600 15px/1 Manrope,system-ui,sans-serif;border-radius:12px;padding:14px 16px;cursor:pointer;border:1px solid transparent}" +
            "#bp-ab .bp-ab-ok{background:#c7ff3f;color:#0d111b;box-shadow:0 0 24px rgba(199,255,63,.25)}" +
            "#bp-ab .bp-ab-ok:hover{filter:brightness(1.08)}" +
            "#bp-ab .bp-ab-skip{background:rgba(255,255,255,.04);color:#dfe6f3;border-color:rgba(255,255,255,.12)}" +
            "#bp-ab .bp-ab-skip:hover{border-color:rgba(84,220,255,.5)}" +
            "#bp-ab .bp-ab-x{position:absolute;top:14px;right:14px;width:36px;height:36px;padding:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1)}" +
            "#bp-ab .bp-ab-x svg{display:block;width:16px;height:16px;stroke:#dfe6f3}" +
            "#bp-ab .bp-ab-x:hover{border-color:rgba(84,220,255,.5)}" +
            "#bp-ab .bp-ab-note{margin:16px 0 0;font-size:13px;text-align:center;color:#8a95ab}" +
            "#bp-ab .bp-ab-note a{color:#54dcff;text-decoration:none}" +
            "#bp-ab .bp-ab-note a:hover{text-decoration:underline}" +
            "#bp-ab button:focus-visible,#bp-ab a:focus-visible{outline:2px solid #54dcff;outline-offset:2px}";
        document.head.appendChild(st);
        var w = document.createElement("div");
        w.id = "bp-ab";
        w.innerHTML =
            '<div class="bp-ab-box" role="dialog" aria-modal="true" aria-labelledby="bp-ab-t">' +
            '<button type="button" class="bp-ab-x" aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
            '<h2 id="bp-ab-t">Похоже, у вас включён блокировщик рекламы</h2>' +
            "<p>BroskiPlay — бесплатный проект, который я делаю один. Реклама помогает оплачивать хостинг и время на новые карты и обновления. Её немного.</p>" +
            "<p>Пожалуйста, добавьте broskiplay.ru в исключения блокировщика и обновите страницу.</p>" +
            '<div class="bp-ab-btns"><button type="button" class="bp-ab-ok">Я отключил — обновить</button>' +
            '<button type="button" class="bp-ab-skip">Продолжить без отключения</button></div>' +
            '<p class="bp-ab-note">Поддержать проект можно и <a href="https://www.donationalerts.com/r/broskiplay" target="_blank" rel="noopener">донатом</a></p>' +
            "</div>";
        var prevOverflow = document.documentElement.style.overflow;
        function close() {
            w.remove();
            document.documentElement.style.overflow = prevOverflow;
            document.removeEventListener("keydown", onKey);
        }
        function onKey(e) { if (e.key === "Escape") close(); }
        w.querySelector(".bp-ab-ok").onclick = function () { location.reload(); };
        w.querySelector(".bp-ab-skip").onclick = close;
        w.querySelector(".bp-ab-x").onclick = close;
        w.addEventListener("click", function (e) { if (e.target === w) close(); });
        document.addEventListener("keydown", onKey);
        document.body.appendChild(w);
        document.documentElement.style.overflow = "hidden";
        w.querySelector(".bp-ab-ok").focus();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
