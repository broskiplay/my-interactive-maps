// Зум картинки в лайтбоксе и защита от зума всей страницы на телефонах.
// Проблема: щипок по открытой картинке (#xx-lightbox) приближал не картинку, а весь интерфейс, и после закрытия
// страница оставалась увеличенной. Здесь:
//  1) на страницах карт браузерный зум страницы щипком отключён (у карты и картинки свой зум);
//  2) в лайтбоксе щипок, колесо мыши и тап по картинке зумят саму картинку, палец/мышь двигают её;
//  3) если страница всё же оказалась увеличенной — при закрытии лайтбокса масштаб сбрасывается.
// Лайтбоксы создают app.js каждой игры (div с id, оканчивающимся на "-lightbox", прямо в body) — скрипт
// подхватывает их сам через MutationObserver, правки в app.js не нужны.
(function () {
    "use strict";
    var MAX = 6, TAP_ZOOM = 2.5;

    // --- 1. Без зума страницы щипком (Android: touch-action; iOS Safari: gesture-события и touchmove)
    // На страницах-статьях (<html data-page-zoom="keep">) зум страницы оставляем, блокируем его только пока открыт лайтбокс.
    var KEEP = document.documentElement.getAttribute("data-page-zoom") === "keep";
    function free() { return KEEP && !document.querySelector('body > [id$="-lightbox"]'); }
    if (!KEEP) document.documentElement.style.touchAction = "pan-x pan-y";
    ["gesturestart", "gesturechange"].forEach(function (t) {
        document.addEventListener(t, function (e) { if (!free()) e.preventDefault(); }, { passive: false });
    });
    document.addEventListener("touchmove", function (e) {
        if (free()) return;
        if (e.touches.length > 1 || (e.scale !== undefined && e.scale !== 1)) e.preventDefault();
    }, { passive: false });

    // --- 3. Сброс уже случившегося зума страницы
    function resetPageZoom() {
        var vv = window.visualViewport;
        if (!vv || vv.scale <= 1.01) return;
        var meta = document.querySelector('meta[name="viewport"]');
        if (!meta) return;
        var orig = meta.getAttribute("content");
        // в viewport карт уже есть maximum-scale=1 (от авто-зума iPhone) — меняем запись, чтобы браузер перечитал её
        meta.setAttribute("content", orig.replace(/,\s*maximum-scale=[^,]*/, "") + ", maximum-scale=1.0");
        setTimeout(function () { meta.setAttribute("content", orig); }, 350);
    }
    // iPhone увеличивает страницу при фокусе в поле ввода со шрифтом меньше 16 px (поиск, заметка, сообщение об ошибке),
    // а щипок по странице выше запрещён — уменьшить обратно нельзя. Поэтому, когда поле теряет фокус, зум сбрасываем.
    document.addEventListener("focusout", function (e) {
        var t = e.target;
        if (!KEEP && t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) setTimeout(resetPageZoom, 60);
    });

    // --- 2. Зум картинки
    function setup(lb) {
        var img = lb.querySelector("img");
        if (!img || lb._lbZoom) return;
        lb._lbZoom = true;
        lb.style.touchAction = "none";
        img.style.touchAction = "none";
        img.style.transformOrigin = "0 0";
        img.style.willChange = "transform";
        img.style.cursor = "zoom-in";
        img.draggable = false;

        var s = 1, tx = 0, ty = 0;
        var pts = new Map(), drag = null, pinch = null, moved = false;

        function base() { // положение картинки без трансформации
            var r = img.getBoundingClientRect();
            return { x: r.left - tx, y: r.top - ty, w: img.offsetWidth, h: img.offsetHeight };
        }
        function clamp() {
            if (s <= 1) { s = 1; tx = 0; ty = 0; return; }
            if (s > MAX) s = MAX;
            var b = base(), vw = window.innerWidth, vh = window.innerHeight;
            var W = b.w * s, H = b.h * s, L = b.x + tx, T = b.y + ty;
            L = W <= vw ? (vw - W) / 2 : Math.min(0, Math.max(vw - W, L));
            T = H <= vh ? (vh - H) / 2 : Math.min(0, Math.max(vh - H, T));
            tx = L - b.x; ty = T - b.y;
        }
        function apply(anim) {
            img.style.transition = anim ? "transform .22s ease" : "none";
            img.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + s + ")";
            img.style.cursor = s > 1 ? "grab" : "zoom-in";
        }
        // точка экрана (cx, cy) остаётся под пальцем/курсором при смене масштаба с s0/tx0/ty0 на ns
        function zoomAround(cx, cy, ns, s0, tx0, ty0, b) {
            tx = cx - b.x - (cx - b.x - tx0) * ns / s0;
            ty = cy - b.y - (cy - b.y - ty0) * ns / s0;
            s = ns;
        }

        lb.addEventListener("pointerdown", function (e) {
            pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (pts.size === 1) { moved = false; drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty }; }
            if (pts.size === 2) {
                var p = Array.from(pts.values());
                pinch = {
                    d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1,
                    mx: (p[0].x + p[1].x) / 2, my: (p[0].y + p[1].y) / 2,
                    s: s, tx: tx, ty: ty, b: base()
                };
                moved = true;
            }
        });
        lb.addEventListener("pointermove", function (e) {
            if (!pts.has(e.pointerId)) return;
            pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (pinch && pts.size >= 2) {
                var p = Array.from(pts.values());
                var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
                var mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2;
                var ns = Math.max(0.6, Math.min(MAX * 1.2, pinch.s * d / pinch.d));
                zoomAround(pinch.mx, pinch.my, ns, pinch.s, pinch.tx, pinch.ty, pinch.b);
                tx += mx - pinch.mx; ty += my - pinch.my;
                apply(false);
            } else if (drag) {
                var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
                if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
                if (s > 1 && moved) {
                    tx = drag.tx + dx; ty = drag.ty + dy;
                    img.style.cursor = "grabbing";
                    apply(false);
                }
            }
        });
        function up(e) {
            if (!pts.delete(e.pointerId)) return;
            if (pts.size === 1) { // один палец остался после щипка — продолжаем им тянуть
                var p = pts.values().next().value;
                pinch = null;
                drag = { x: p.x, y: p.y, tx: tx, ty: ty };
            } else if (pts.size === 0) {
                pinch = null; drag = null;
                clamp(); apply(true);
            }
        }
        lb.addEventListener("pointerup", up);
        lb.addEventListener("pointercancel", up);

        // Клик идёт до обработчика закрытия (он висит на самом лайтбоксе, а мы — в фазе захвата)
        lb.addEventListener("click", function (e) {
            if (moved) { moved = false; e.stopImmediatePropagation(); return; } // это был жест, а не тап
            if (e.target !== img) return; // тап по фону или × — закрываем как раньше
            e.stopImmediatePropagation();
            if (s > 1) { s = 1; tx = 0; ty = 0; }
            else { zoomAround(e.clientX, e.clientY, TAP_ZOOM, s, tx, ty, base()); clamp(); }
            apply(true);
        }, true);

        lb.addEventListener("wheel", function (e) {
            e.preventDefault();
            var ns = Math.max(1, Math.min(MAX, s * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002))));
            zoomAround(e.clientX, e.clientY, ns, s, tx, ty, base());
            clamp(); apply(false);
        }, { passive: false });

        // Поворот экрана — сброс (по ширине: высота на телефоне «прыгает» из-за адресной строки)
        var vw0 = window.innerWidth;
        function onResize() { if (window.innerWidth !== vw0) { vw0 = window.innerWidth; s = 1; tx = 0; ty = 0; apply(false); } }
        window.addEventListener("resize", onResize);
        lb._lbCleanup = function () { window.removeEventListener("resize", onResize); };
    }

    function watch() {
        new MutationObserver(function (muts) {
            muts.forEach(function (m) {
                m.addedNodes.forEach(function (n) { if (n.id && /-lightbox$/.test(n.id)) setup(n); });
                m.removedNodes.forEach(function (n) {
                    if (!n.id || !/-lightbox$/.test(n.id)) return;
                    if (n._lbCleanup) n._lbCleanup();
                    if (!KEEP) resetPageZoom();
                });
            });
        }).observe(document.body, { childList: true });
    }
    if (document.body) watch(); else document.addEventListener("DOMContentLoaded", watch);
})();
