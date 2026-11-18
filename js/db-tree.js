/* Дерево талантов (/db/<игра>/talents/<дерево>/ и вкладка «Таланты» каталога).
   Попап таланта (стекло Spatial UI) собирается из карточки таланта: на странице или в <template class="db-tree-cards"> рядом со схемой.
   Мышь: наведение — подсказка, клик — закреплённый попап со ссылкой на карточку. Палец: в общем виде на узком экране
   нажатие приближает ветвь, дальше нажатие на узел — попап-шторка снизу; страница никуда не прыгает.
   Кнопки над схемой приближают ветвь (плавная анимация viewBox). window.dbTreeInit(root) — для вставленных схем. */
(function () {
    "use strict";
    var tt = null, pinned = null;
    var hoverMq = window.matchMedia ? matchMedia("(hover: hover) and (pointer: fine)") : { matches: true };
    var narrowMq = window.matchMedia ? matchMedia("(max-width: 700px)") : { matches: false };

    function nodeId(node) { return (node.getAttribute("href") || "").split("#")[1] || ""; }

    function findCard(node) {
        var id = nodeId(node);
        if (!id) return null;
        var tpl = node.closest(".db-tree");
        tpl = tpl && tpl.parentNode && tpl.parentNode.querySelector("template.db-tree-cards");
        return (tpl && tpl.content.querySelector('[id="' + id + '"]')) || document.getElementById(id);
    }

    function ensureTip() {
        if (tt) return tt;
        tt = document.createElement("div");
        tt.className = "db-tt";
        tt.setAttribute("role", "dialog");
        tt.hidden = true;
        tt.addEventListener("click", function (e) {
            if (e.target.closest(".db-tt-x")) { e.preventDefault(); hide(true); }
            else if (e.target.closest("a")) {
                var same = e.target.closest("a").getAttribute("href") === location.hash;
                hide(true);
                if (same) setTimeout(function () { mark(true); });
            }
        });
        document.body.appendChild(tt);
        return tt;
    }

    function fill(node, pin) {
        var card = findCard(node);
        if (!card) return false;
        ensureTip();
        var h = card.querySelector("h3"), en = h && h.querySelector("small");
        var req = card.querySelector("p.db-note"), ranks = card.querySelector("ol.db-ranks"), one = card.querySelector("p:not(.db-note)");
        tt.innerHTML = '<div class="db-tt-h"><b></b>' + (en ? "<small></small>" : "") + "</div>"
            + (req ? '<p class="db-tt-req"></p>' : "") + (ranks ? ranks.outerHTML : one ? one.outerHTML : "")
            + (pin ? '<button type="button" class="db-tt-x" aria-label="Закрыть">×</button><a class="db-tt-go"></a>' : "");
        tt.querySelector("b").textContent = h ? h.firstChild.textContent : "";
        if (en) tt.querySelector(".db-tt-h small").textContent = en.textContent;
        if (req) tt.querySelector(".db-tt-req").textContent = req.textContent;
        if (pin) {
            var go = tt.querySelector(".db-tt-go"), href = node.getAttribute("href") || "";
            go.href = href;
            go.textContent = href.charAt(0) === "#" ? "Карточка в списке ↓" : "На странице дерева →";
            tt.setAttribute("aria-label", tt.querySelector("b").textContent);
        }
        tt.classList.toggle("is-pinned", !!pin);
        tt.classList.toggle("is-sheet", !!pin && narrowMq.matches);
        tt.hidden = false;
        return true;
    }

    function place(node) {
        if (!tt || tt.hidden || tt.classList.contains("is-sheet")) { if (tt) { tt.style.left = tt.style.top = ""; } return; }
        var r = node.getBoundingClientRect(), w = tt.offsetWidth, hgt = tt.offsetHeight, W = window.innerWidth, H = window.innerHeight;
        function clamp(p) { return [Math.max(8, Math.min(p[0], W - w - 8)), Math.max(8, Math.min(p[1], H - hgt - 8))]; }
        var cx = r.left + r.width / 2 - w / 2, cy = r.top + r.height / 2 - hgt / 2;
        // кандидаты: сверху, справа, слева, снизу; выбирается тот, что закрывает меньше узлов схемы
        // (в высоких деревьях попап сверху лёг бы на следующие таланты цепочки, и по ним нельзя было бы нажать)
        var cand = [[cx, r.top - hgt - 12, r.top - hgt - 12 >= 8], [r.right + 12, cy, r.right + 12 + w <= W - 8],
                    [r.left - 12 - w, cy, r.left - 12 - w >= 8], [cx, r.bottom + 12, r.bottom + 12 + hgt <= H - 8]];
        var svg = node.ownerSVGElement, pts = [];
        if (svg) svg.querySelectorAll(".db-tn").forEach(function (o) {
            if (o === node) return;
            var b = o.getBoundingClientRect();
            pts.push([b.left + b.width / 2, b.top + b.height / 2, b.width / 2]);
        });
        var best = null, bestScore = Infinity;
        cand.forEach(function (c, i) {
            var p = clamp(c), s = (c[2] ? 0 : 1000) + i * 0.1;
            pts.forEach(function (q) { if (q[0] + q[2] > p[0] && q[0] - q[2] < p[0] + w && q[1] + q[2] > p[1] && q[1] - q[2] < p[1] + hgt) s += 10; });
            if (s < bestScore) { bestScore = s; best = p; }
        });
        tt.style.left = best[0] + "px"; tt.style.top = best[1] + "px";
    }

    function hover(node) {
        if (pinned || !hoverMq.matches) return;
        if (fill(node, false)) place(node);
    }

    function pin(node) {
        if (pinned) pinned.classList.remove("is-pin");
        if (!fill(node, true)) return;
        pinned = node;
        node.classList.add("is-pin");
        place(node);
    }

    function hide(force) {
        if (!tt || (pinned && !force)) return;
        tt.hidden = true;
        if (pinned) { pinned.classList.remove("is-pin"); pinned = null; }
    }

    function animate(svg, to, ratio) {
        var from = svg.getAttribute("viewBox").split(/\s+/).map(Number), t0 = null, dur = 380;
        if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) dur = 0;
        if (ratio) svg.style.aspectRatio = ratio;
        function step(ts) {
            if (t0 === null) t0 = ts;
            var k = dur ? Math.min(1, (ts - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
            svg.setAttribute("viewBox", from.map(function (v, i) { return (v + (to[i] - v) * e).toFixed(1); }).join(" "));
            if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function init(root) {
        (root || document).querySelectorAll(".db-tree:not([data-init])").forEach(setup);
    }

    function setup(box) {
        var svg = box.querySelector("svg"), tabs = box.querySelector(".db-tree-tabs");
        if (!svg) return;
        box.setAttribute("data-init", "");
        var full = box.getAttribute("data-vb").split(" ").map(Number);

        function zoom(b) {
            tabs.querySelectorAll("button").forEach(function (x) { x.classList.toggle("is-on", x === b); });
            var sub = b.getAttribute("data-sub");
            box.classList.toggle("is-zoom", sub !== null);
            svg.querySelectorAll("[data-sub]").forEach(function (el) { el.classList.toggle("is-sub", el.getAttribute("data-sub") === sub); });
            var bb = b.getAttribute("data-box").split(" ").map(Number), ratio = full[2] + " / " + full[3];
            if (sub !== null) {
                // на широком экране ветвь вписывается в пропорции холста (высота панели не прыгает);
                // на телефоне — в свои пропорции, чтобы узлы стали крупными и в них было легко попасть
                var ar = narrowMq.matches ? Math.max(bb[2] / bb[3], 0.9) : full[2] / full[3];
                var cx = bb[0] + bb[2] / 2, cy = bb[1] + bb[3] / 2, w = bb[2], h = bb[3];
                if (w / h > ar) h = w / ar; else w = h * ar;
                bb = [cx - w / 2, cy - h / 2, w, h];
                ratio = w.toFixed(0) + " / " + h.toFixed(0);
            }
            hide(true);
            animate(svg, bb, ratio);
        }

        if (tabs) {
            tabs.hidden = false;
            tabs.addEventListener("click", function (e) {
                var b = e.target.closest("button");
                if (b) zoom(b);
            });
        }
        svg.querySelectorAll(".db-tn").forEach(function (a) {
            a.addEventListener("mouseenter", function () { hover(a); });
            a.addEventListener("mouseleave", function () { hide(false); });
            a.addEventListener("focus", function () { hover(a); });
            a.addEventListener("blur", function () { hide(false); });
        });
        // клик по схеме: никаких переходов по якорю — попап на месте; в общем виде на телефоне — сначала приближение ветви
        svg.addEventListener("click", function (e) {
            var a = e.target.closest(".db-tn"), part = e.target.closest("[data-sub]");
            if (a) e.preventDefault();
            if (tabs && narrowMq.matches && !box.classList.contains("is-zoom") && part) {
                var b = tabs.querySelector('button[data-sub="' + part.getAttribute("data-sub") + '"]');
                if (b) { e.preventDefault(); zoom(b); return; }
            }
            if (!a) return;
            if (pinned === a) hide(true); else pin(a);
        });
    }

    // ссылка на талант (#slug): открыть спойлер со списком, прокрутить к карточке, подсветить узел на схеме
    function mark(force) {
        var id = decodeURIComponent(location.hash.slice(1));
        document.querySelectorAll(".db-tn.is-hl").forEach(function (a) { a.classList.remove("is-hl"); });
        if (!id) return;
        document.querySelectorAll('.db-tn[href="#' + CSS.escape(id) + '"]').forEach(function (a) { a.classList.add("is-hl"); });
        var card = document.getElementById(id), det = card && card.closest("details");
        if (card && card.classList.contains("db-tal") && (force || (det && !det.open))) {
            if (det) det.open = true;
            requestAnimationFrame(function () { card.scrollIntoView({ block: "start" }); });
        }
    }

    document.addEventListener("click", function (e) {
        if (pinned && tt && !tt.contains(e.target) && !e.target.closest(".db-tn")) hide(true);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(true); });
    window.addEventListener("hashchange", mark);
    window.addEventListener("scroll", function () { if (pinned) place(pinned); else hide(false); }, { passive: true });
    window.addEventListener("resize", function () { hide(true); });
    window.dbTreeInit = function (root) { init(root); mark(); };
    init(document);
    mark();
})();
