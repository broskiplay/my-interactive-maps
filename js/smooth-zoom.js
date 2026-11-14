// Плавный зум колесом мыши и трекпадом — как в MapLibre (MapGenie).
// Стандартный Leaflet зумит рывками: ждёт паузу в прокрутке и затем одним CSS-переходом переключает уровень.
// Здесь цель зума копится от каждого шага колеса, а карта каждый кадр догоняет её по экспоненте; точка под
// курсором остаётся на месте. Кадры идут через map._move — тем же путём, что и щипок на тач-экране.
// Использование: в L.map отключить scrollWheelZoom, затем enableSmoothWheelZoom(map).
(function () {
    function enableSmoothWheelZoom(map, opts) {
        const o = Object.assign({ speed: 0.004, tau: 80, idle: 140 }, opts);
        const el = map.getContainer();
        let goal = 0, anchor = null, mouse = null, raf = 0, last = 0, zooming = false, idleTimer = 0;

        function finish() {
            cancelAnimationFrame(raf);
            clearTimeout(idleTimer);
            raf = 0;
            if (!zooming) return;
            zooming = false;
            map._moveEnd(true);
        }

        function frame(now) {
            raf = 0;
            const dt = Math.min(64, now - last);
            last = now;
            const cur = map.getZoom();
            let z = cur + (goal - cur) * (1 - Math.exp(-dt / o.tau));
            if (Math.abs(goal - z) < 0.002) z = goal;
            // Точка anchor (под курсором в начале шага) должна остаться под курсором и при новом масштабе
            const shift = mouse.subtract(map.getSize().divideBy(2));
            const center = map._limitCenter(map.unproject(map.project(anchor, z).subtract(shift), z), z, map.options.maxBounds);
            map._move(center, z);
            if (z !== goal) raf = requestAnimationFrame(frame);
            else idleTimer = setTimeout(finish, o.idle);
        }

        function onWheel(e) {
            if (!e.deltaY) return;
            e.preventDefault();
            e.stopPropagation();
            // Идёт обычная зум-анимация Leaflet (кнопки +/−, двойной клик) — не мешаем ей
            if (map._animatingZoom) return;
            let d = -e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1);
            if (e.ctrlKey) d *= 8; // щипок на трекпаде приходит как ctrl+wheel с малыми значениями
            d = Math.max(-240, Math.min(240, d));
            if (!zooming) {
                map._stop();
                map._moveStart(true, false);
                zooming = true;
                goal = map.getZoom();
            }
            clearTimeout(idleTimer);
            mouse = map.mouseEventToContainerPoint(e);
            anchor = map.containerPointToLatLng(mouse);
            goal = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), goal + d * o.speed));
            if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
        }

        // Перетаскивание или программный перелёт (flyTo, setView, кнопки) прерывают плавный зум
        map.on("dragstart zoomanim", () => { if (zooming) finish(); });
        el.addEventListener("wheel", onWheel, { passive: false });
    }
    window.enableSmoothWheelZoom = enableSmoothWheelZoom;
})();
