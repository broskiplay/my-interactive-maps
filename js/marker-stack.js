// Переключатель меток, стоящих «друг в друге».
// Метки на canvas перекрываются, и нижнюю нельзя кликнуть. При открытии попапа собираем все видимые метки в радиусе
// перекрытия и добавляем над содержимым полоску «‹ 2 из 3 ›»: кнопки листают метки прямо в открытом попапе.
//
// Подключение (одна карта — один вызов):
//   const markerStack = MarkerStack.init({ map: () => state.map, markers: () => state.markers, render: popupHtml, radius: m => 22 });
//   layer.bindPopup(() => markerStack.html(m), …);      // вместо () => popupHtml(m)
//   markerStack.refresh(m);                              // вместо layer.setPopupContent(popupHtml(m)) — перерисовать открытый попап (popup.update())
// Метка попадает в группу, если её слой на карте (m._leaflet._map) и расстояние до остальных на экране ≤ radius(m), px.
// Карта на MapLibre (js/bp-map.js) передаёт point(m) — точку метки на экране или null, если метки на карте нет.
(function () {
    "use strict";
    let cfg = null;
    let cur = null; // { origin, list, i, popup }

    function point(m) {
        if (!m) return null;
        if (cfg.point) return cfg.point(m);
        return (m._leaflet && m._leaflet._map && m._leaflet._point) || null;
    }
    function visible(m) { return !!point(m); }

    function group(m) {
        const p0 = point(m);
        if (!p0) return [m];
        const near = [];
        cfg.markers().forEach(o => {
            const p = o !== m && point(o);
            if (!p) return;
            const d = Math.hypot(p0.x - p.x, p0.y - p.y);
            if (d <= Math.max(cfg.radius(m), cfg.radius(o))) near.push({ o, d });
        });
        near.sort((a, b) => a.d - b.d || String(a.o.id).localeCompare(String(b.o.id)));
        return [m].concat(near.map(n => n.o));
    }

    function paint() {
        const m = cur.list[cur.i], n = cur.list.length;
        const body = cfg.render(m);
        if (n < 2) return body;
        return `<div class="ms-nav" role="group" aria-label="Метки в одной точке">` +
            `<button type="button" class="ms-btn" data-ms="-1" aria-label="Предыдущая метка" title="Предыдущая метка">‹</button>` +
            `<span class="ms-count">${cur.i + 1} из ${n}<small>метки рядом</small></span>` +
            `<button type="button" class="ms-btn" data-ms="1" aria-label="Следующая метка" title="Следующая метка">›</button>` +
            `</div>` + body;
    }

    // Содержимое попапа метки m (Leaflet вызывает при открытии и при popup.update()).
    // Пока попап открыт, группа и текущая метка хранятся в cur — перерисовка не пересобирает группу заново.
    function html(m) {
        if (!(cur && cur.popup && cur.popup._map && cur.origin === m)) cur = { origin: m, list: group(m), i: 0, popup: null };
        return paint();
    }

    function step(dir) {
        if (!cur || !cur.popup) return;
        const n = cur.list.length;
        let i = cur.i;
        for (let k = 0; k < n; k++) {
            i = (i + dir + n) % n;
            if (i === cur.i) return;
            const m = cur.list[i];
            // метка могла пропасть с карты (скрыта категория/«найденные») — пропускаем
            if (visible(m) || m === cur.origin) break;
        }
        cur.i = i;
        cur.popup.update(); // Leaflet заново вызовет html(origin), который отрисует cur.list[cur.i]
    }

    function refresh(m) {
        if (cur && cur.popup && cur.popup._map && cur.list[cur.i] === m) cur.popup.update();
    }

    function init(options) {
        cfg = Object.assign({ radius: () => 22 }, options);
        const bind = () => {
            const map = cfg.map();
            if (!map || map._msBound) return !!map;
            map._msBound = true;
            map.on("popupopen", e => { if (cur && !cur.popup) cur.popup = e.popup; });
            // Содержимое попапа остаётся функцией слоя (листаем через popup.update()), поэтому при закрытии достаточно сбросить состояние
            map.on("popupclose", e => { if (cur && cur.popup === e.popup) cur = null; });
            return true;
        };
        const api = {
            html(m) { bind(); return html(m); },
            refresh
        };
        document.addEventListener("click", e => {
            const b = e.target.closest && e.target.closest(".ms-btn");
            if (!b || !cur) return;
            e.preventDefault();
            step(+b.dataset.ms || 1);
        });
        // Стрелки ← → на клавиатуре, пока открыт попап с группой (если фокус не в поле ввода)
        document.addEventListener("keydown", e => {
            if (!cur || !cur.popup || cur.list.length < 2 || e.altKey || e.ctrlKey || e.metaKey) return;
            if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
            if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); e.stopPropagation(); }
            else if (e.key === "ArrowRight") { step(1); e.preventDefault(); e.stopPropagation(); }
        }, true);
        return api;
    }

    window.MarkerStack = { init };
})();
