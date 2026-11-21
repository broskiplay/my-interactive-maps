// Рекламная сеть Яндекса (РСЯ). Место под блок — <div class="bp-slot" data-bp-slot="<место>"></div>.
// ID блоков (R-A-…) выдаёт partner.yandex.ru → «Площадки» → «RTB-блоки». Пустой ID — место убирается,
// код РСЯ не грузится. Только на broskiplay.ru и только когда блок подъезжает к экрану (не мешает PSI).
// Включено 21.11.2026.
(function () {
    var BLOCKS = {
        home: "R-A-20460414-1",      // главная, между библиотекой игр и финальным блоком
        db: "R-A-20460414-2",        // страницы базы /db/, внизу
        category: "R-A-20460414-3",
        updates: "R-A-20460414-1",  // «Что нового», внизу
        fixes: "R-A-20460414-1",    // журнал исправлений, внизу
        cabinet: "R-A-20460414-4",  // кабинет, вертикальные 300×600 по бокам (только экраны от 1600px)
        cabinet_m: "R-A-20460414-5", // кабинет, адаптивный внизу (экраны уже 1600px)
        map_top: "R-A-20460414-6",  // карты: Top Ad (липкий сверху, крестик Яндекса) — формат Яндекса только для телефонов
        map_top_d: "R-A-20460414-8"             // карты на десктопе: адаптивный RTB-блок полосой внизу карты, от сайдбара до края. Пусто — нет
    };
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
    var AUTO = { db: 1, category: 1, cabinet: 1, cabinet_m: 1 };
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

    function init() {
        mapTopAd();
        autoPlace(document.querySelectorAll(".bp-slot[data-bp-slot]"));
        var slots = document.querySelectorAll(".bp-slot[data-bp-slot]");
        var todo = [], seen = {};
        for (var i = 0; i < slots.length; i++) {
            var el = slots[i], id = BLOCKS[el.getAttribute("data-bp-slot")];
            if (!id || !(live || abTest)) { el.remove(); continue; }
            if (!live) continue;
            el.id = "bps-" + i;
            seen[id] = (seen[id] || 0) + 1;   // один блок несколько раз на странице — разные pageNumber
            todo.push({ el: el, id: id, n: seen[id] });
        }
        if (todo.length || (abTest && slots.length)) adblockCheck();
        if (!todo.length) return;
        var st = document.createElement("style");  // стиль здесь, чтобы не поднимать ?v= у spatial.css на всех страницах
        st.textContent = ".bp-slot{display:block;width:100%;max-width:970px;min-height:250px;margin:32px auto;overflow:hidden;border-radius:16px}";
        document.head.appendChild(st);

        window.yaContextCb = window.yaContextCb || [];
        var loaded = false;
        function render(t) {
            window.yaContextCb.push(function () {
                var o = { blockId: t.id, renderTo: t.el.id };
                if (seen[t.id] > 1) o.pageNumber = t.n;
                Ya.Context.AdvManager.render(o);
            });
            if (loaded) return;
            loaded = true;
            if (document.querySelector('script[src="https://yandex.ru/ads/system/context.js"]')) return;
            var s = document.createElement("script");
            s.src = "https://yandex.ru/ads/system/context.js";
            s.async = true;
            document.head.appendChild(s);
        }
        if (!("IntersectionObserver" in window)) { todo.forEach(render); return; }
        var io = new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                if (!e.isIntersecting) return;
                io.unobserve(e.target);
                todo.forEach(function (t) { if (t.el === e.target) render(t); });
            });
        }, { rootMargin: "600px 0px" });
        todo.forEach(function (t) { io.observe(t.el); });
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
