// Верхнее меню карты (разметка — scripts/site_menu.py, стили — css/map-nm.css «Верхнее меню карты»):
// «бургер» на узких экранах, закрытие по Esc и клику вне меню.
(function () {
    "use strict";
    var bar = document.getElementById("mtb");
    if (!bar) return;
    var burger = document.getElementById("mtb-burger");
    var dds = [].slice.call(bar.querySelectorAll(".mtb-dd"));
    function setOpen(dd, open) {
        var b = dd.querySelector(".mtb-link"), m = dd.querySelector(".mtb-menu");
        m.hidden = !open;
        b.setAttribute("aria-expanded", String(open));
    }
    function closeAll(except) { dds.forEach(function (d) { if (d !== except) setOpen(d, false); }); }
    function closePanel() { bar.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Открыть меню"); }
    dds.forEach(function (dd) {
        dd.querySelector(".mtb-link").addEventListener("click", function (e) {
            e.preventDefault();
            var open = dd.querySelector(".mtb-menu").hidden;
            closeAll(dd); setOpen(dd, open);
        });
    });
    burger.addEventListener("click", function () {
        var open = !bar.classList.contains("is-open");
        if (open && phone()) collapseSidebar();
        bar.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
        if (!open) closeAll();
    });
    // на телефоне боковая панель и меню не открыты вместе: меню открывается — панель сворачивается, панель открывается — меню закрывается
    var sidebar = document.getElementById("sidebar"), toggle = document.getElementById("sidebar-toggle-btn");
    var phone = function () { return window.matchMedia && matchMedia("(max-width: 700px)").matches; };
    var collapseSidebar = function () { if (sidebar && toggle && !sidebar.classList.contains("collapsed")) toggle.click(); };
    if (sidebar && window.MutationObserver) new MutationObserver(function () {
        if (phone() && !sidebar.classList.contains("collapsed")) { closeAll(); closePanel(); }
    }).observe(sidebar, { attributes: true, attributeFilter: ["class"] });
    // кнопка «Меню сайта» в шапке боковой панели (видна только на телефоне)
    var side = document.getElementById("mtb-side-btn");
    if (side) side.addEventListener("click", function (e) { e.stopPropagation(); collapseSidebar(); bar.classList.add("is-open"); burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Закрыть меню"); });
    document.addEventListener("click", function (e) {
        if (!bar.contains(e.target)) { closeAll(); closePanel(); }
        else if (!e.target.closest(".mtb-dd")) closeAll();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeAll(); closePanel(); } });
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
