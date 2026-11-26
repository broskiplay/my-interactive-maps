/* Просмотр скриншотов из попапов карты на странице записи базы (scripts/db_pages.py → .db-shots).
   Клик по картинке — во весь экран; ←/→ листают, Esc / клик по фону закрывают. */
(function () {
    "use strict";
    var figs = [], cur = 0, box = null, img, cap, link, prevFocus = null;

    function build() {
        box = document.createElement("div");
        box.className = "db-lb";
        box.hidden = true;
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", "Просмотр изображения");
        box.innerHTML = '<button type="button" class="db-lb-x" aria-label="Закрыть">×</button>' +
            '<button type="button" class="db-lb-nav db-lb-prev" aria-label="Предыдущее">‹</button>' +
            '<figure><img alt="" referrerpolicy="no-referrer"><figcaption><span></span><a class="db-shot-map">На карте</a></figcaption></figure>' +
            '<button type="button" class="db-lb-nav db-lb-next" aria-label="Следующее">›</button>';
        document.body.appendChild(box);
        img = box.querySelector("img");
        cap = box.querySelector("figcaption span");
        link = box.querySelector("figcaption a");
        box.querySelector(".db-lb-x").addEventListener("click", close);
        box.querySelector(".db-lb-prev").addEventListener("click", function () { show(cur - 1); });
        box.querySelector(".db-lb-next").addEventListener("click", function () { show(cur + 1); });
        box.addEventListener("click", function (e) { if (e.target === box || e.target.tagName === "FIGURE") close(); });
    }
    function show(i) {
        figs = Array.prototype.slice.call(document.querySelectorAll(".db-shots figure"));
        if (!figs.length) return close();
        cur = (i + figs.length) % figs.length;
        var f = figs[cur], s = f.querySelector("img"), a = f.querySelector(".db-shot-map");
        img.src = s.currentSrc || s.src;
        img.alt = s.alt;
        cap.textContent = f.querySelector("figcaption span").textContent;
        link.href = a ? a.href : "#";
        box.querySelectorAll(".db-lb-nav").forEach(function (b) { b.hidden = figs.length < 2; });
    }
    function open(i) {
        if (!box) build();
        prevFocus = document.activeElement;
        show(i);
        box.hidden = false;
        document.documentElement.classList.add("db-lb-on");
        box.querySelector(".db-lb-x").focus();
    }
    function close() {
        if (!box || box.hidden) return;
        box.hidden = true;
        document.documentElement.classList.remove("db-lb-on");
        if (prevFocus) prevFocus.focus();
    }
    document.addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest(".db-shot-open");
        if (!b) return;
        var all = Array.prototype.slice.call(document.querySelectorAll(".db-shots figure"));
        open(all.indexOf(b.closest("figure")));
    });
    document.addEventListener("keydown", function (e) {
        if (!box || box.hidden) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") show(cur - 1);
        else if (e.key === "ArrowRight") show(cur + 1);
    });
})();
