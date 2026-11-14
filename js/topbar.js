// Верхнее меню главной (разметка — в index.html, на других страницах — scripts/site_menu.py, стили — css/style.css «Верхнее меню»).
//   • «Игры»: список строится из карточек библиотеки — игра с одной картой открывает её сразу, с несколькими раскрывает карточку;
//   • «Обновления»: «Что нового» и «Журнал исправлений»; точка повторяет непрочитанное из блока «Что нового», клик раскрывает его;
//   • поиск игры (кнопка или клавиша /), «бургер» на узких экранах, закрытие по Esc и клику вне меню.
(function () {
    "use strict";
    var bar = document.getElementById("topbar");
    if (!bar) return;
    var $ = function (id) { return document.getElementById(id); };
    var burger = $("tb-burger");
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var scrollTo = function (el) { el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); };
    var dds = [].slice.call(bar.querySelectorAll(".tb-dd"));
    var parts = function (dd) { return { btn: dd.querySelector(".tb-dd-btn"), menu: dd.querySelector(".tb-menu") }; };

    // --- список игр из карточек библиотеки ---
    var cards = [].slice.call(document.querySelectorAll("#games-container > details.game-dropdown"));
    var gamesMenu = $("tb-games-menu");
    if (gamesMenu) cards.forEach(function (card) {
        var t = card.querySelector(".game-title"), b = card.querySelector(".game-badge");
        if (!t) return;
        var links = card.querySelectorAll("a.map-link");
        var a = document.createElement("a");
        // одна карта — сразу на неё; несколько (или ни одной) — прокрутка к карточке игры и её раскрытие
        var single = links.length === 1 ? links[0].getAttribute("href") : "";
        a.href = single || "#games-heading";
        a.innerHTML = "<span></span><small></small>";
        a.firstChild.textContent = t.textContent.trim();
        a.lastChild.textContent = b ? b.textContent.trim() : "";
        if (!single) a.addEventListener("click", function (e) {
            e.preventDefault(); closeAll(); closePanel();
            card.open = true; scrollTo(card);
        });
        gamesMenu.appendChild(a);
    });
    var staticGames = gamesMenu && gamesMenu.children.length > 0; // на других страницах список игр может быть уже в разметке
    if (!cards.length && !staticGames && $("tb-games")) $("tb-games").hidden = true;

    function setOpen(dd, open) {
        var p = parts(dd);
        p.menu.hidden = !open;
        p.btn.setAttribute("aria-expanded", String(open));
    }
    function closeAll(except) { dds.forEach(function (d) { if (d !== except) setOpen(d, false); }); }
    function closePanel() { bar.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Открыть меню"); }
    dds.forEach(function (dd) {
        var p = parts(dd);
        p.btn.addEventListener("click", function (e) {
            if (dd.id === "tb-games" && !cards.length && !staticGames) return;
            e.preventDefault();
            var open = p.menu.hidden;
            closeAll(dd); setOpen(dd, open);
        });
    });
    burger.addEventListener("click", function () {
        var open = !bar.classList.contains("is-open");
        bar.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
        if (!open) closeAll();
    });
    document.addEventListener("click", function (e) {
        if (!bar.contains(e.target)) { closeAll(); if (bar.classList.contains("is-open")) closePanel(); }
        else if (!e.target.closest(".tb-dd")) closeAll();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { var open = dds.filter(function (d) { return !parts(d).menu.hidden; })[0]; closeAll(); if (open) parts(open).btn.focus(); closePanel(); return; }
        // «/» — к поиску игры (как на многих сайтах), если пользователь не печатает
        var tag = (e.target && e.target.tagName) || "";
        if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag) && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); search(); }
    });
    // ссылки меню закрывают мобильную панель
    bar.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest(".tb-nav a:not(.tb-dd-btn), .tb-menu a");
        if (a) { closeAll(); closePanel(); }
    });

    // --- «Что нового»: точка и раскрытие блока ---
    var up = $("updates"), upLink = $("tb-updates"), dot = bar.querySelector("#tb-upd .tb-dot"), srcDot = up && up.querySelector(".updates-dot");
    function syncDot() { if (dot) dot.hidden = !srcDot || srcDot.hidden; }
    if (srcDot) { syncDot(); new MutationObserver(syncDot).observe(srcDot, { attributes: true, attributeFilter: ["hidden"] }); }
    if (up && upLink) upLink.addEventListener("click", function () { var d = up.querySelector("details"); if (d) d.open = true; });

    // --- поиск игры ---
    function search() {
        var input = $("game-search-input");
        if (!input) { location.href = "/?search=1"; return; } // не главная: поиск игры — на главной
        closePanel(); closeAll();
        scrollTo($("games-heading") || input);
        setTimeout(function () { input.focus({ preventScroll: true }); }, reduce ? 0 : 350);
    }
    var sbtn = $("tb-search");
    if (sbtn && sbtn.tagName === "BUTTON") sbtn.addEventListener("click", search);
    if (/[?&]search=1\b/.test(location.search) && $("game-search-input")) setTimeout(search, 300);

    function stuck() { bar.classList.toggle("is-stuck", window.scrollY > 6); }
    addEventListener("scroll", stuck, { passive: true }); stuck();
})();

// Установка как приложение и работа без сети — js/pwa.js. Событие установки ловим сразу: оно может прийти раньше, чем загрузится файл.
(function () {
    if (window.bpPwaLoader) return;
    window.bpPwaLoader = true;
    window.addEventListener("beforeinstallprompt", function (e) {
        if (window.bpPwa) return; // js/pwa.js уже слушает сам
        e.preventDefault(); window.bpInstallEvt = e;
    });
    var s = document.createElement("script");
    s.src = "/js/pwa.js?v=3"; s.async = true;
    document.head.appendChild(s);
})();
