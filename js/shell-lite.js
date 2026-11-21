// Шапка сайта на страницах без React (база данных /db/ — каркас вставляет web/scripts/assemble.mjs):
// поиск игры с выпадающим списком (как web/components/shell/game-search.tsx), «/» — фокус, лупа на телефоне.
(function () {
    "use strict";
    var input = document.getElementById("bx-find-input"), data = document.getElementById("bx-games");
    var top = document.getElementById("topbar"), btn = document.getElementById("tb-search");
    if (!input || !data) return;
    var games = [];
    try { games = JSON.parse(data.textContent) || []; } catch (e) { return; }
    var box = input.closest(".bx-find"), list = null, found = games, sel = 0;
    var norm = function (s) { return String(s).toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]+/g, " ").trim(); };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    function mobile(on) {
        if (top) top.classList.toggle("is-search", on);
        if (btn) btn.setAttribute("aria-expanded", String(on));
    }
    function render() {
        if (!list) {
            list = document.createElement("ul");
            list.className = "bx-find-list"; list.id = "bx-find-list";
            list.setAttribute("role", "listbox"); list.setAttribute("aria-label", "Игры");
            box.appendChild(list);
            list.addEventListener("mouseover", function (e) {
                var li = e.target.closest && e.target.closest("li[data-i]");
                if (li) { sel = +li.dataset.i; mark(); }
            });
        }
        list.innerHTML = found.length ? found.map(function (g, i) {
            return '<li id="bx-find-' + esc(g.key) + '" role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '"><a href="' + esc(g.href) + '"><b>' + esc(g.title) + "</b><span>" + esc(g.sub) + "</span></a></li>";
        }).join("") : '<li class="bx-find-empty" role="presentation">Такой игры пока нет</li>';
        list.hidden = false;
        input.setAttribute("aria-expanded", "true");
        mark();
    }
    function mark() {
        if (!list) return;
        [].forEach.call(list.querySelectorAll("li[data-i]"), function (li) { li.setAttribute("aria-selected", String(+li.dataset.i === sel)); });
        if (found[sel]) input.setAttribute("aria-activedescendant", "bx-find-" + found[sel].key); else input.removeAttribute("aria-activedescendant");
    }
    function close() {
        if (list) list.hidden = true;
        input.setAttribute("aria-expanded", "false");
        input.removeAttribute("aria-activedescendant");
    }
    function filter() {
        var n = norm(input.value);
        found = !n ? games : games.filter(function (g) { return norm(g.title + " " + g.key.replace(/-/g, " ") + " " + (g.alias || "")).indexOf(n) >= 0; });
        sel = 0; render();
    }
    input.addEventListener("input", filter);
    input.addEventListener("focus", render);
    input.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            var n = found.length || 1;
            sel = (sel + (e.key === "ArrowDown" ? 1 : n - 1)) % n; render();
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (found[sel]) location.href = found[sel].href;
        } else if (e.key === "Escape") {
            close(); input.blur(); mobile(false);
        }
    });
    document.addEventListener("keydown", function (e) {
        var t = e.target;
        if (e.key === "/" && !e.metaKey && !e.ctrlKey && !(t.closest && t.closest("input, textarea, select, [contenteditable]"))) {
            e.preventDefault(); input.focus();
        }
    });
    document.addEventListener("pointerdown", function (e) {
        if (!box.contains(e.target) && !(btn && btn.contains(e.target))) { close(); mobile(false); }
    });
    if (btn) btn.addEventListener("click", function () {
        var on = !(top && top.classList.contains("is-search"));
        mobile(on);
        if (on) input.focus();
    });
})();
