// Кнопка «Наверх» на длинных страницах базы данных: появляется после двух экранов прокрутки.
(function () {
    "use strict";
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "db-top"; btn.setAttribute("aria-label", "Наверх"); btn.title = "Наверх";
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>';
    var on = false, ticking = false;
    function update() {
        ticking = false;
        var show = window.scrollY > window.innerHeight * 1.2 && document.documentElement.scrollHeight > window.innerHeight * 2.2;
        if (show !== on) { on = show; btn.classList.toggle("is-on", show); }
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    btn.addEventListener("click", function () {
        var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
    });
    document.body.appendChild(btn);
})();

// «На карте»: запоминаем, откуда пришли, — на карте появится кнопка «← К записи» (js/map-ux.js).
document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="-map/"]');
    var m = location.pathname.match(/^\/db\/([^/]+)\//);
    if (!a || !m || !/[?&]marker=/.test(a.getAttribute("href") || "")) return;
    try {
        var h1 = document.querySelector("main.db h1");
        localStorage.setItem("bp_from_db", JSON.stringify({
            game: m[1], url: location.pathname + location.search, at: Date.now(),
            title: h1 ? h1.textContent.trim().slice(0, 60) : ""
        }));
    } catch (x) { /* localStorage недоступен */ }
}, true);
