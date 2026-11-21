// Движок карт на MapLibre GL (vendor/maplibre). Подложка и метки рисуются через WebGL: плавный зум и
// перетаскивание без перерисовки canvas на каждом шаге, тысячи меток не тормозят.
//
// Снаружи BPMap выглядит как карта Leaflet: те же зумы (в Leaflet-единицах), координаты [lat, lng],
// события move/moveend/zoom/click/popupopen/popupclose, окно метки и подсказка с той же разметкой
// (.leaflet-popup, .leaflet-tooltip — оформление из css/map-nm.css и css/style.css игр работает как было).
// Поэтому код карты (js/app.js игры, map-core, map-extras, marker-stack) почти не меняется.
//
// Зум: у MapLibre мир на нулевом зуме — 512 px, у Leaflet — 256 px, поэтому zoomMapLibre = zoomLeaflet − 1.
// Наружу всегда отдаётся зум Leaflet: сохранённый вид (…_view2) и настройки карт остаются прежними.
//
// Координаты: crs "mercator" (по умолчанию) — обычные широта/долгота, как L.CRS.EPSG3857;
// crs "simple" — пиксели картинки, как L.CRS.Simple (точка на зуме z = (lng·2^z, −lat·2^z)). Такая карта кладётся
// внутрь мира MapLibre: игровой зум 0 = зум Leaflet SIMPLE_Z0 «мира», центр мира — игровая точка [0, 0].
(function () {
    "use strict";
    const ML = window.maplibregl;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // [lat, lng] | {lat, lng} → {lat, lng}
    const LL = p => Array.isArray(p) ? { lat: +p[0], lng: +p[1] } : { lat: +p.lat, lng: +(p.lng != null ? p.lng : p.lon) };
    // Web Mercator в долях мира (0..1)
    const mercX = lng => (lng + 180) / 360;
    const mercY = lat => { const s = Math.sin(clamp(lat, -85.0511, 85.0511) * Math.PI / 180); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
    const unX = x => x * 360 - 180;
    const unY = y => 360 / Math.PI * Math.atan(Math.exp((0.5 - y) * 2 * Math.PI)) - 90;

    // Система координат карты: перевод игровых [lat, lng] и зума Leaflet в координаты и зум MapLibre и обратно.
    //   ml(p) → [lng, lat] MapLibre, ll(lngLat) → {lat, lng} игры, z(zoomL) → зум MapLibre, zL(zoomML) → зум Leaflet,
    //   u(p), v(p) — доли мира MapLibre (0..1), project(p, z) — как map.project у Leaflet (мировые пиксели игры),
    //   tile(tz, x, y) → [z, x, y] тайла игры по тайлу MapLibre, tz(z) — зум тайла MapLibre по зуму тайла игры
    const SIMPLE_Z0 = 10, SIMPLE_W = 256 * Math.pow(2, SIMPLE_Z0);
    function crsOf(name) {
        if (name === "simple") {
            const u = p => 0.5 + LL(p).lng / SIMPLE_W, v = p => 0.5 - LL(p).lat / SIMPLE_W;
            return {
                u, v,
                ml: p => [unX(u(p)), unY(v(p))],
                ll: q => ({ lat: (0.5 - mercY(q.lat)) * SIMPLE_W, lng: (mercX(q.lng) - 0.5) * SIMPLE_W }),
                z: z => z + SIMPLE_Z0 - 1, zL: z => z - SIMPLE_Z0 + 1,
                project: (p, z) => { const l = LL(p), k = Math.pow(2, z); return { x: l.lng * k, y: -l.lat * k }; },
                tz: z => z + SIMPLE_Z0,
                tile: (tz, x, y) => { const h = Math.pow(2, tz - 1); return [tz - SIMPLE_Z0, x - h, y - h]; }
            };
        }
        const u = p => mercX(LL(p).lng), v = p => mercY(LL(p).lat);
        return {
            u, v,
            ml: p => { const l = LL(p); return [l.lng, l.lat]; },
            ll: q => ({ lat: q.lat, lng: q.lng }),
            z: z => z - 1, zL: z => z + 1,
            project: (p, z) => { const S = 256 * Math.pow(2, z); return { x: u(p) * S, y: v(p) * S }; },
            tz: z => z,
            tile: (tz, x, y) => [tz, x, y]
        };
    }
    const boundsOf = list => {
        // [[s, w], [n, e]] или массив точек → {s, w, n, e}
        const pts = list.map(LL);
        return {
            s: Math.min(...pts.map(p => p.lat)), n: Math.max(...pts.map(p => p.lat)),
            w: Math.min(...pts.map(p => p.lng)), e: Math.max(...pts.map(p => p.lng))
        };
    };

    // Как L.Browser: retina — для чёткости спрайтов, touch — запас под палец при попадании по метке, mobile — без подсказок
    const Browser = {
        retina: (window.devicePixelRatio || 1) > 1,
        touch: !!(window.PointerEvent || "ontouchstart" in window),
        mobile: typeof window.orientation !== "undefined" || /mobile/i.test(navigator.userAgent || "")
    };

    // Смартфон: окно метки открывается под меткой (css/map-nm.css .bp-below)
    const BELOW_MQ = window.matchMedia ? matchMedia("(max-width: 640px), (pointer: coarse) and (max-height: 500px)") : null;
    const belowOn = () => !!(BELOW_MQ && BELOW_MQ.matches);
    const BELOW_TOP = 18;
    const SIDE_GAP = 22; // отступ окна сбоку от метки
    const POPUP_W = 400;
    const popupWidth = mapW => Math.max(240, Math.min(POPUP_W, mapW - 40));

    // Пустой тайл там, где картинки нет (список существующих — в manifest.json карты): без лишних 404 в консоли
    const BLANK_PNG = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="), c => c.charCodeAt(0));
    const tileFns = {};
    let tileSeq = 0, protocolOn = false;
    function tileProtocol() {
        if (protocolOn) return;
        protocolOn = true;
        ML.addProtocol("bptile", async (params, abort) => {
            const m = /^bptile:\/\/(\w+)\/(\d+)\/(\d+)\/(\d+)/.exec(params.url);
            const fn = m && tileFns[m[1]];
            const url = fn && fn(+m[2], +m[3], +m[4]);
            if (!url) return { data: BLANK_PNG.slice().buffer };
            const r = await fetch(url, { signal: abort.signal });
            if (!r.ok) return { data: BLANK_PNG.slice().buffer };
            return { data: await r.arrayBuffer(), cacheControl: r.headers.get("Cache-Control"), expires: r.headers.get("Expires") };
        });
    }

    const el = (tag, cls, parent) => {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (parent) parent.appendChild(e);
        return e;
    };

    // Спрайты читаются пачками — через один общий canvas с willReadFrequently (без предупреждений Canvas2D)
    let readCv = null, readCtx = null;
    function imageData(canvas) {
        const w = canvas.width, h = canvas.height;
        if (!readCv) { readCv = document.createElement("canvas"); readCtx = readCv.getContext("2d", { willReadFrequently: true }); }
        if (readCv.width < w) readCv.width = w;
        if (readCv.height < h) readCv.height = h;
        readCtx.clearRect(0, 0, w, h);
        readCtx.drawImage(canvas, 0, 0);
        return readCtx.getImageData(0, 0, w, h);
    }

    // Цвет фона за краем картинки — как у Leaflet: тот, что задан контейнеру в CSS игры
    function bgOf(container) {
        const c = getComputedStyle(container).backgroundColor;
        return c && !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(c) ? c : "#000";
    }

    // ---------- Карта ----------
    // o: { crs: "mercator" | "simple", minZoom, maxZoom, zoomSnap, center: [lat, lng], zoom, maxBounds: [[s, w], [n, e]], background }
    function create(container, o) {
        const C = crsOf(o.crs), toML = C.z, toL = C.zL, lngLat = C.ml;
        if (typeof container === "string") container = document.getElementById(container);
        container.classList.add("leaflet-container", "bp-map");
        if (Browser.touch) container.classList.add("leaflet-touch");
        let minZ = o.minZoom != null ? o.minZoom : 0, maxZ = o.maxZoom != null ? o.maxZoom : 18;
        let maxB = o.maxBounds ? boundsOf(o.maxBounds) : null;
        // zoomSnap как у Leaflet: setView/flyTo округляют зум до шага, fitBounds — вниз до шага (рамка целиком на экране)
        const snap = o.zoomSnap || 0;
        const limitZoom = z => clamp(snap ? Math.round(z / snap) * snap : z, minZ, maxZ);

        // Границы — как maxBounds у Leaflet: экран не выходит за них; если экран больше границ, карта по центру
        // (родное ограничение MapLibre в этом случае приближало бы карту, и с ПК нельзя было бы отдалить её как раньше)
        function constrain(ll, z) {
            z = clamp(z, toML(minZ), toML(maxZ));
            if (!maxB) return { center: ll, zoom: z };
            const S = 512 * Math.pow(2, z), hw = container.clientWidth / 2, hh = container.clientHeight / 2;
            const x0 = C.u([0, maxB.w]) * S, x1 = C.u([0, maxB.e]) * S, y0 = C.v([maxB.n, 0]) * S, y1 = C.v([maxB.s, 0]) * S;
            let x = mercX(ll.lng) * S, y = mercY(ll.lat) * S;
            x = x1 - x0 < hw * 2 ? (x0 + x1) / 2 : clamp(x, x0 + hw, x1 - hw);
            y = y1 - y0 < hh * 2 ? (y0 + y1) / 2 : clamp(y, y0 + hh, y1 - hh);
            return { center: new ML.LngLat(unX(x / S), unY(y / S)), zoom: z };
        }

        const map = new ML.Map({
            container,
            style: { version: 8, sources: {}, layers: [{ id: "bp-bg", type: "background", paint: { "background-color": o.background || bgOf(container) } }] },
            center: lngLat(o.center || [0, 0]), zoom: toML(o.zoom != null ? o.zoom : minZ),
            minZoom: toML(minZ), maxZoom: toML(maxZ),
            dragRotate: false, pitchWithRotate: false, touchPitch: false, maxPitch: 0,
            renderWorldCopies: false, attributionControl: false, fadeDuration: 0,
            transformConstrain: constrain
        });
        map.touchZoomRotate.disableRotation();
        map.keyboard.disableRotation();

        const M = { bp: true, ml: map, Browser, crs: C };
        let ready = false;
        const queue = [];
        const whenReady = fn => ready ? fn() : queue.push(fn);
        map.on("load", () => { ready = true; queue.splice(0).forEach(fn => fn()); });

        // ----- События (как у Leaflet: несколько типов через пробел) -----
        const handlers = {};
        M.on = (types, fn) => { types.split(/\s+/).forEach(t => { if (t) (handlers[t] = handlers[t] || []).push(fn); }); return M; };
        M.off = (types, fn) => {
            types.split(/\s+/).forEach(t => { const l = handlers[t]; if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); } });
            return M;
        };
        M.once = (type, fn) => { const w = e => { M.off(type, w); fn(e); }; return M.on(type, w); };
        const fire = (type, e) => { const l = handlers[type]; if (l) l.slice().forEach(f => f(Object.assign({ type, target: M }, e))); };
        // Пока крутится колесо (см. ниже), начало и конец движения сообщаем один раз — как Leaflet, а не каждый кадр
        let wheeling = false;
        const EDGE = { movestart: 1, moveend: 1, zoomstart: 1, zoomend: 1 };
        ["move", "moveend", "movestart", "zoom", "zoomend", "zoomstart", "resize"].forEach(t => map.on(t, () => { if (!(wheeling && EDGE[t])) fire(t, {}); }));

        // ----- Камера (зум в единицах Leaflet) -----
        const center = () => C.ll(map.getCenter());
        M.getZoom = () => toL(map.getZoom());
        M.getMinZoom = () => minZ;
        M.getMaxZoom = () => maxZ;
        M.getCenter = center;
        M.getContainer = () => container;
        M.getSize = () => ({ x: container.clientWidth, y: container.clientHeight });
        M.invalidateSize = () => { map.resize(); return M; };
        M.setMaxBounds = b => { maxB = b ? boundsOf(Array.isArray(b) ? b : [b.getSouthWest(), b.getNorthEast()]) : null; map.jumpTo({ center: map.getCenter() }); return M; };
        M.getBounds = () => {
            const b = map.getBounds(), sw = C.ll(b.getSouthWest()), ne = C.ll(b.getNorthEast());
            return {
                contains(p) { const l = LL(p); return l.lat >= sw.lat && l.lat <= ne.lat && l.lng >= sw.lng && l.lng <= ne.lng; },
                getSouth: () => sw.lat, getNorth: () => ne.lat, getWest: () => sw.lng, getEast: () => ne.lng
            };
        };
        M.setView = (ll, z, opt) => {
            wheelStop();
            const cam = { center: lngLat(ll), zoom: toML(limitZoom(z != null ? z : M.getZoom())) };
            opt && opt.animate === false ? map.jumpTo(cam) : map.easeTo(Object.assign(cam, { duration: 250 }));
            return M;
        };
        M.flyTo = (ll, z, opt) => {
            wheelStop();
            map.flyTo({ center: lngLat(ll), zoom: toML(limitZoom(z != null ? z : M.getZoom())), duration: ((opt && opt.duration) || 0.8) * 1000, essential: true });
            return M;
        };
        // Центр и зум — как getBoundsZoom у Leaflet: рамка с отступами помещается в экран, зум вниз до шага zoomSnap
        // (inside — наоборот: экран целиком внутри рамки, зум вверх до шага)
        const camFor = (bounds, p, inside) => {
            const b = boundsOf(bounds);
            p = p || [0, 0];
            const cam = map.cameraForBounds([lngLat([b.s, b.w]), lngLat([b.n, b.e])], { padding: { left: p[0], right: p[0], top: p[1], bottom: p[1] } });
            if (!cam) return null;
            let z = toL(cam.zoom);
            if (inside) {
                const sz = M.getSize(), r = C.project([b.n, b.e], 0), l = C.project([b.s, b.w], 0);
                z = Math.log2(Math.max((sz.x - p[0] * 2) / Math.abs(r.x - l.x), (sz.y - p[1] * 2) / Math.abs(r.y - l.y)));
            }
            if (snap) { z = Math.round(z / (snap / 100)) * (snap / 100); z = inside ? Math.ceil(z / snap) * snap : Math.floor(z / snap) * snap; }
            return { center: cam.center, z };
        };
        M.getBoundsZoom = (bounds, inside, padding) => {
            // padding — как у Leaflet: сумма отступов с двух сторон
            const px = padding ? (padding.x != null ? padding.x : padding[0]) : 0, py = padding ? (padding.y != null ? padding.y : padding[1]) : 0;
            const c = camFor(bounds, [px / 2, py / 2], inside);
            return c ? clamp(c.z, minZ, maxZ) : minZ;
        };
        M.setMinZoom = z => { minZ = z; map.setMinZoom(toML(z)); return M; };
        M.setMaxZoom = z => { maxZ = z; map.setMaxZoom(toML(z)); return M; };
        const fit = (bounds, opt, fly) => {
            wheelStop();
            // opt.cover — стартовый вид: на вертикальном экране телефона карта заполняет экран (по высоте), а не вписывается
            // целиком с пустотой сверху и снизу. На ПК и планшете вбок — обычное «вписать».
            const cover = !!(opt && opt.cover) && container.clientWidth <= 680 && container.clientHeight > container.clientWidth;
            const cam = camFor(bounds, cover ? [0, 0] : opt && opt.padding, cover);
            if (!cam) return M;
            let z = cam.z;
            if (opt && opt.maxZoom != null) z = Math.min(z, opt.maxZoom);
            z = clamp(z, minZ, maxZ);
            const dest = { center: cam.center, zoom: toML(z), duration: opt && opt.duration != null ? opt.duration * 1000 : fly ? 800 : 250, essential: true };
            if (opt && opt.animate === false) map.jumpTo(dest);
            else fly ? map.flyTo(dest) : map.easeTo(dest);
            return M;
        };
        M.fitBounds = (b, opt) => fit(b, opt, false);
        M.flyToBounds = (b, opt) => fit(b, opt, true);
        M.panBy = (off, opt) => { wheelStop(); map.panBy([off[0] != null ? off[0] : off.x, off[1] != null ? off[1] : off.y], { duration: opt && opt.animate === false ? 0 : 250 }); return M; };
        M.isMoving = () => map.isMoving();
        M.whenReady = fn => { whenReady(fn); return M; };

        // ----- Колесо мыши и щипок на трекпаде — плавно, как в MapGenie -----
        // Цель зума копится от каждого шага колеса (0.004 уровня на пиксель прокрутки), карта каждый кадр догоняет её
        // по экспоненте, точка под курсором стоит на месте. Родной зум колесом у MapLibre заметно медленнее.
        // По умолчанию — родной зум MapLibre, ускоренный как у MapGenie (1/150). Свой — по ?wheel=own
        const nativeWheel = !/[?&]wheel=own/.test(location.search);
        if (nativeWheel) map.scrollZoom.setWheelZoomRate(1 / 150); else map.scrollZoom.disable();
        const WHEEL = { speed: 0.004, tau: 80, idle: 140 };
        let wGoal = 0, wAnchor = null, wMouse = null, wRaf = 0, wLast = 0, wIdle = 0;
        function wheelStop() {
            cancelAnimationFrame(wRaf);
            clearTimeout(wIdle);
            wRaf = 0;
            if (!wheeling) return;
            wheeling = false;
            fire("zoomend", {});
            fire("moveend", {});
        }
        function wheelFrame(now) {
            wRaf = 0;
            const dt = Math.min(64, now - wLast);
            wLast = now;
            const cur = M.getZoom();
            let z = cur + (wGoal - cur) * (1 - Math.exp(-dt / WHEEL.tau));
            if (Math.abs(wGoal - z) < 0.002) z = wGoal;
            const S = 512 * Math.pow(2, toML(z));
            const x = mercX(wAnchor.lng) * S - (wMouse.x - container.clientWidth / 2);
            const y = mercY(wAnchor.lat) * S - (wMouse.y - container.clientHeight / 2);
            map.jumpTo({ center: [unX(x / S), unY(y / S)], zoom: toML(z) });
            if (z !== wGoal) wRaf = requestAnimationFrame(wheelFrame);
            else wIdle = setTimeout(wheelStop, WHEEL.idle);
        }
        map.getCanvasContainer().addEventListener("wheel", e => {
            if (nativeWheel || !e.deltaY) return;
            e.preventDefault();
            let d = -e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1);
            if (e.ctrlKey) d *= 8; // щипок на трекпаде приходит как ctrl+wheel с малыми значениями
            d = clamp(d, -240, 240);
            if (!wheeling) {
                map.stop();
                wheeling = true;
                wGoal = M.getZoom();
                fire("movestart", {});
                fire("zoomstart", {});
            }
            clearTimeout(wIdle);
            const r = container.getBoundingClientRect();
            wMouse = { x: e.clientX - r.left, y: e.clientY - r.top };
            const a = map.unproject([wMouse.x, wMouse.y]);
            wAnchor = { lat: a.lat, lng: a.lng };
            wGoal = clamp(wGoal + d * WHEEL.speed, minZ, maxZ);
            if (!wRaf) { wLast = performance.now(); wRaf = requestAnimationFrame(wheelFrame); }
        }, { passive: false });
        map.on("dragstart", wheelStop);

        // ----- Координаты -----
        // Как map.project у Leaflet: «мировые» пиксели при тайле 256 на зуме z
        M.project = (p, z) => C.project(p, z != null ? z : M.getZoom());
        M.latLngToContainerPoint = p => { const q = map.project(lngLat(p)); return { x: q.x, y: q.y }; };
        M.containerPointToLatLng = p => C.ll(map.unproject([p.x != null ? p.x : p[0], p.y != null ? p.y : p[1]]));

        // ----- Слои поверх холста -----
        const panes = {};
        ["labels", "shapes", "tooltip", "popup"].forEach(n => { panes[n] = el("div", "bp-pane bp-pane-" + n, container); });
        const tracked = new Set(); // DOM-элементы, привязанные к координатам: { place() }
        const sync = () => {
            tracked.forEach(t => t.place());
            if (popup) popup.place();
            if (tip) tip.place();
        };
        map.on("move", sync);
        map.on("resize", () => { sync(); if (popup) popup.relayout(); });

        // ----- Кнопки зума (разметка как у L.Control.Zoom) -----
        const corner = el("div", "leaflet-top leaflet-left", container);
        const zc = el("div", "leaflet-control-zoom leaflet-bar leaflet-control", corner);
        const zBtn = (cls, html, title, d) => {
            const a = el("a", cls, zc);
            a.href = "#"; a.title = title; a.setAttribute("role", "button"); a.setAttribute("aria-label", title);
            a.innerHTML = `<span aria-hidden="true">${html}</span>`;
            a.addEventListener("click", e => {
                e.preventDefault();
                if (a.classList.contains("leaflet-disabled")) return;
                map.easeTo({ zoom: clamp(map.getZoom() + d, toML(minZ), toML(maxZ)), duration: 250 });
            });
            a.addEventListener("dblclick", e => e.stopPropagation());
            return a;
        };
        const zin = zBtn("leaflet-control-zoom-in", "+", "Приблизить", 1);
        const zout = zBtn("leaflet-control-zoom-out", "&#x2212;", "Отдалить", -1);
        const zState = () => {
            const z = M.getZoom();
            zin.classList.toggle("leaflet-disabled", z >= maxZ - 1e-6);
            zout.classList.toggle("leaflet-disabled", z <= minZ + 1e-6);
            zin.setAttribute("aria-disabled", String(z >= maxZ - 1e-6));
            zout.setAttribute("aria-disabled", String(z <= minZ + 1e-6));
        };
        M.on("zoomend", zState);
        map.on("load", zState);

        // ----- Окно метки -----
        let popup = null;
        // opts: { latlng, content: строка | () => строка, className, anchor: () => [x, y], offset: [x, y] (по умолчанию [0, 7]),
        //         closeOnClick (true), source — метка-владелец (окно закрывается, когда она пропадает с карты) }
        function Popup(opts) {
            this.opts = opts;
            this._latlng = LL(opts.latlng);
            this.options = { className: opts.className || "", maxHeight: opts.maxHeight };
            const c = this._container = el("div", "leaflet-popup " + (opts.className || ""));
            const wrap = this._wrapper = el("div", "leaflet-popup-content-wrapper", c);
            this._contentNode = el("div", "leaflet-popup-content", wrap);
            const tipC = el("div", "leaflet-popup-tip-container", c);
            el("div", "leaflet-popup-tip", tipC);
            const close = el("a", "leaflet-popup-close-button", c);
            close.href = "#close"; close.setAttribute("role", "button"); close.setAttribute("aria-label", "Закрыть");
            close.innerHTML = '<span aria-hidden="true">&#215;</span>';
            close.addEventListener("click", e => { e.preventDefault(); M.closePopup(); });
            // картинка в окне догружается позже и делает его выше
            c.addEventListener("load", () => { if (this._map) { this.relayout(); this.fitUntil = Date.now() + 1500; this.fit(); } }, true);
        }
        // Сколько пикселей сверху карты занимает плавающая шапка-капсула (#mtb) — окно метки не должно под неё заходить
        const topInset = () => {
            const t = document.getElementById("mtb");
            if (!t) return 0;
            const r = t.getBoundingClientRect();
            if (!r.height) return 0;
            return Math.max(0, Math.round(r.bottom - container.getBoundingClientRect().top) + 10);
        };
        // Насколько карту ещё можно сдвинуть до её границы: down — содержимое вниз (освобождает место над меткой), up — вверх
        const panRoom = () => {
            if (!maxB) return { down: Infinity, up: Infinity };
            const h = container.clientHeight;
            const yTop = map.project(lngLat([maxB.n, maxB.w])).y, yBot = map.project(lngLat([maxB.s, maxB.w])).y;
            if (yBot - yTop <= h) return { down: 0, up: 0 };
            return { down: Math.max(0, -yTop), up: Math.max(0, yBot - h) };
        };
        Popup.prototype = {
            // Где окно относительно метки: "above" — над ней (обычно), "below" — под ней (смартфон или сверху не хватает места),
            // "right"/"left" — сбоку во всю высоту карты (целиком не помещается ни сверху, ни снизу)
            mode() { return belowOn() ? "below" : (this.side || "above"); },
            below() { return this.mode() === "below"; },
            beside() { const m = this.mode(); return m === "right" || m === "left"; },
            // Сторона выбирается до показа окна, с учётом того, насколько карту ещё можно сдвинуть до её края — окно не прыгает
            choose() {
                this.side = null; this.customMax = undefined;
                this.layout();
                if (belowOn() || !this._map) return;
                const p = map.project(lngLat(this._latlng)), size = M.getSize(), room = panRoom(), a = this.anchor(), c = this._container;
                const chrome = c.offsetHeight - this._contentNode.offsetHeight + (parseInt(getComputedStyle(c).marginBottom, 10) || 0);
                const need = this.natH + chrome;
                const pad = this.opts.autoPanPadding || (this.wide() ? [this.padX, 30] : [5, 5]);
                const above = p.y + a[1] - Math.max(pad[1], topInset()) + room.down;
                if (need <= above) return;
                const under = size.y - p.y - BELOW_TOP - 8 + room.up;
                if (need <= under) { this.side = "below"; this.layout(); return; }
                const w = this.width, right = size.x - p.x - SIDE_GAP - 8, left = p.x - SIDE_GAP - 8;
                if (Math.max(right, left) >= w && size.y - topInset() - 8 > Math.max(above, under) + 40) {
                    this.side = right >= w ? "right" : "left"; this.layout(); return;
                }
                if (under > above) { this.side = "below"; this.layout(); }
            },
            isOpen() { return !!this._map; },
            getLatLng() { return this._latlng; },
            setLatLng(ll) { this._latlng = LL(ll); if (this._map) { this.refit = false; this.choose(); this.place(); } return this; },
            render() {
                const c = this.opts.content;
                this._contentNode.innerHTML = typeof c === "function" ? c() : (c || "");
            },
            wide() { return /-popup-wrap/.test(this.opts.className || ""); },
            // Режим «под меткой»: выше этой линии окно не поднимается (метка остаётся видна под шапкой)
            belowTop() { return Math.max(8, topInset()) + 14 + BELOW_TOP; },
            // Рамка окна вокруг содержимого (отступы обёртки, нижнее поле) — чтобы высота содержимого + рамка влезли в экран
            chromeH() {
                const c = this._container, n = this._contentNode;
                const v = c.offsetHeight - n.offsetHeight + (parseInt(getComputedStyle(c).marginBottom, 10) || 0);
                return v > 0 && v < 200 ? v : 40;
            },
            // Как L.Popup._updateLayout; у окон меток (…-popup-wrap) — постоянная ширина и высота по высоте карты
            layout() {
                const s = this._contentNode.style, size = M.getSize();
                let minW = 50, maxW = this.opts.maxWidth || 300, maxH = this.opts.maxHeight;
                if (this.wide()) {
                    minW = maxW = popupWidth(size.x);
                    const cap = this.beside() ? Math.max(200, size.y - topInset() - 8 - 44)
                        // телефон (как у MapGenie): окно целиком между шапкой и низом экрана — метка над ним, текст прокручивается, кнопки внизу
                        : this.below() ? Math.max(160, size.y - this.belowTop() - 8 - this.chromeH())
                        : Math.max(280, Math.min(620, size.y - 100 - topInset()));
                    maxH = this.customMax !== undefined ? Math.min(this.customMax, cap) : cap;
                } else if (this.customMax !== undefined) maxH = this.customMax;
                s.width = ""; s.whiteSpace = "nowrap";
                const w = clamp(this._contentNode.offsetWidth, minW, maxW);
                s.width = (w + 1) + "px"; s.whiteSpace = ""; s.height = "";
                const h = this.natH = this._contentNode.offsetHeight, scrolled = !!maxH && h > maxH;
                if (scrolled) s.height = maxH + "px";
                this._contentNode.classList.toggle("leaflet-popup-scrolled", scrolled);
                this.width = this._container.offsetWidth;
                this.padX = this.wide() && w < POPUP_W ? 12 : 30;
            },
            anchor() {
                if (this.mode() !== "above") return [0, 0];
                const a = this.opts.anchor ? this.opts.anchor() : [0, 0], o = this.opts.offset || [0, 7];
                return [a[0] + o[0], a[1] + o[1]];
            },
            // Левый верхний угол окна в пикселях карты
            box(raw) {
                const p = map.project(lngLat(this._latlng)), c = this._container, a = this.anchor(), m = this.mode();
                const mb = parseInt(getComputedStyle(c).marginBottom, 10) || 0, h = c.offsetHeight + mb;
                if (m === "right" || m === "left") {
                    const size = M.getSize(), t = Math.max(8, topInset());
                    const top = Math.round(Math.max(t, Math.min(p.y - h / 2, size.y - 8 - h)));
                    const left = m === "right" ? Math.round(p.x) + SIDE_GAP : Math.round(p.x) - SIDE_GAP - this.width;
                    return { left, top, w: this.width, h };
                }
                const left = Math.round(p.x) - Math.round(this.width / 2) + a[0];
                let top = m === "below" ? Math.round(p.y) + BELOW_TOP : Math.round(p.y) + a[1] - h;
                // карта упёрлась в край и не сдвигается — окно всё равно целиком на экране (может накрыть метку)
                if (m === "below" && !raw) { const size = M.getSize(); top = Math.max(Math.min(top, size.y - 8 - h), Math.max(8, topInset())); }
                return { left, top, w: this.width, h };
            },
            place() {
                if (!this._map) return;
                const c = this._container, m = this.mode(), b = this.box();
                c.classList.toggle("bp-below", m === "below");
                c.classList.toggle("bp-side", m === "right" || m === "left");
                c.classList.toggle("bp-side-left", m === "left");
                c.style.left = b.left + "px";
                if (m === "above") {
                    const p = map.project(lngLat(this._latlng));
                    c.style.top = "auto"; c.style.bottom = -(Math.round(p.y) + this.anchor()[1]) + "px";
                } else { c.style.bottom = "auto"; c.style.top = b.top + "px"; }
            },
            relayout() { if (this._map) { this.layout(); this.place(); } },
            pan() {
                if (!this._map || this.opts.autoPan === false) return;
                const b = this.box(true), size = M.getSize(), pad = this.opts.autoPanPadding || (this.wide() ? [this.padX, 30] : [5, 5]);
                const padTop = this.below() ? this.belowTop() : Math.max(pad[1], topInset()); // окно (и метка над ним) не уходит под капсулу шапки
                let dx = 0, dy = 0;
                if (b.left + b.w + pad[0] > size.x) dx = b.left + b.w - size.x + pad[0];
                if (b.left - dx - pad[0] < 0) dx = b.left - pad[0];
                if (!this.beside()) { // сбоку окно и так во всю высоту — карту по вертикали не двигаем
                    if (b.top + b.h + pad[1] > size.y) dy = b.top + b.h - size.y + pad[1];
                    if (b.top - dy - padTop < 0) dy = b.top - padTop;
                }
                if (dx || dy) map.panBy([dx, dy], { duration: 250 });
            },
            // Окно выросло после показа (догрузилась картинка) или карта упёрлась в границу:
            // сдвинуть карту → выбрать сторону заново → в крайнем случае ограничить высоту с прокруткой внутри
            fit() {
                if (!this._map) return;
                // пока карта движется, окно подгонки не сгорает: дотянем на moveend
                if (map.isMoving()) { if (this.fitUntil > Date.now()) this.fitUntil = Date.now() + 1500; return; }
                if (!(this.fitUntil > Date.now())) return;
                const mr = container.getBoundingClientRect(), r = this._container.getBoundingClientRect(), m = this.mode();
                const top = mr.top + Math.max(8, topInset()), bot = mr.bottom - 8;
                const over = m === "below" ? r.bottom - bot : m === "above" ? top - r.top : Math.max(r.bottom - bot, top - r.top);
                if (over <= 1) return;
                const h = this._contentNode.offsetHeight;
                if (m === "above" && h > (this.panH || 0) && r.height < mr.height - 16 && panRoom().down > 1) {
                    this.panH = h; this.fitUntil = Date.now() + 1500; this.pan(); setTimeout(() => this.fit(), 400); return;
                }
                if (!this.refit) {
                    this.refit = true; this.choose(); this.place(); this.pan();
                    this.fitUntil = Date.now() + 1500; setTimeout(() => this.fit(), 300); return;
                }
                this.customMax = Math.max(150, Math.floor(h - over));
                this.relayout();
            },
            update() {
                if (!this._map) return this;
                this.render();
                this.refit = false;
                this.choose();
                this.place();
                this.pan();
                this.fitUntil = Date.now() + 1500;
                return this;
            },
            setContent(c) { this.opts.content = c; if (this._map) this.update(); return this; },
            getElement() { return this._container; },
            remove() { if (popup === this) M.closePopup(); }
        };
        M.on("moveend", () => { if (popup) popup.fit(); });
        if (BELOW_MQ) {
            const onBelow = () => { if (popup) popup.update(); };
            BELOW_MQ.addEventListener ? BELOW_MQ.addEventListener("change", onBelow) : BELOW_MQ.addListener(onBelow);
        }

        M.openPopup = opts => {
            M.closePopup();
            const p = new Popup(opts);
            popup = M._popup = p;
            p._map = M;
            panes.popup.appendChild(p._container);
            p.render();
            p.layout();
            p.choose();
            p.place();
            fire("popupopen", { popup: p });
            p.pan();
            p.fitUntil = Date.now() + 1500;
            setTimeout(() => p.fit(), 0);
            // окно выросло позже (догрузилась картинка, раскрылась заметка) — подогнать заново: сдвиг карты или прокрутка текста,
            // иначе на невысоком экране кнопки «Найдено»/флажки уходят за низ экрана
            if (window.ResizeObserver) {
                let lastH = 0;
                p._ro = new ResizeObserver(() => {
                    const h = p._contentNode.offsetHeight;
                    if (popup !== p || Math.abs(h - lastH) < 2) return;
                    lastH = h; p.fitUntil = Date.now() + 1500; p.fit();
                });
                p._ro.observe(p._contentNode);
            }
            return p;
        };
        M.closePopup = () => {
            const p = popup;
            if (!p) return M;
            popup = M._popup = null;
            if (p._ro) p._ro.disconnect();
            p._map = null;
            p._container.remove();
            fire("popupclose", { popup: p });
            return M;
        };
        M.popup = () => popup;
        M.refitPopup = () => { if (popup) { popup.relayout(); popup.fitUntil = Date.now() + 1500; popup.fit(); } };

        // ----- Подсказка (как L.Tooltip direction: "top") -----
        let tip = null;
        M.showTip = (html, ll, offset, className) => {
            if (!tip) {
                const e = el("div", "leaflet-tooltip leaflet-tooltip-top", panes.tooltip);
                e.style.opacity = "1";
                tip = { el: e, ll: null, offset: null, place() {
                    if (!this.ll) return;
                    const p = map.project(lngLat(this.ll)), o = typeof this.offset === "function" ? this.offset() : (this.offset || [0, 0]);
                    // как L.Tooltip (direction: "top"): точка и сдвиг округляются по отдельности
                    // как L.Tooltip._setPosition: половина ширины округляется отдельно (77.5 → 78)
                    const x = Math.round(p.x) - Math.round(this.el.offsetWidth / 2) + o[0], y = Math.round(p.y) - this.el.offsetHeight + o[1];
                    this.el.style.transform = `translate(${x}px, ${y}px)`;
                } };
            }
            tip.el.className = "leaflet-tooltip leaflet-tooltip-top" + (className ? " " + className : "");
            tip.el.innerHTML = html;
            tip.el.style.display = "";
            tip.ll = LL(ll); tip.offset = offset;
            tip.place();
        };
        M.hideTip = () => { if (tip) { tip.el.style.display = "none"; tip.ll = null; } };

        // ----- Подписи (DOM-элемент в точке карты; el — с нулевым размером, содержимое центрирует CSS игры) -----
        M.addLabel = (ll, node) => {
            node.classList.add("bp-dom-label");
            panes.labels.appendChild(node);
            const t = {
                ll: LL(ll), el: node,
                place() { const p = map.project(lngLat(this.ll)); this.el.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px)`; },
                setLatLng(v) { this.ll = LL(v); this.place(); return this; },
                getElement() { return node; },
                remove() { tracked.delete(t); node.remove(); }
            };
            tracked.add(t);
            t.place();
            return t;
        };

        // ----- Служебные фигуры: кружок (DOM), линия и многоугольник (слои GeoJSON) -----
        M.addCircle = (ll, o) => {
            o = o || {};
            const node = el("div", "bp-shape-circle", panes.shapes);
            const r = o.radius || 10, w = o.weight != null ? o.weight : 3, d = r * 2 + w;
            const fillOn = o.fill !== false && (o.fillColor || o.fill);
            node.style.cssText = `width:${d}px;height:${d}px;margin:${-d / 2}px 0 0 ${-d / 2}px;` +
                `border:${w}px ${o.dashArray ? "dashed" : "solid"} ${o.color || "#3388ff"};` +
                (fillOn ? `background:${o.fillColor || o.color || "#3388ff"};` : "") +
                `opacity:${o.opacity != null ? o.opacity : 1}`;
            if (fillOn && o.fillOpacity != null && o.fillOpacity < 1) node.style.background = `color-mix(in srgb, ${o.fillColor || o.color} ${Math.round(o.fillOpacity * 100)}%, transparent)`;
            const t = {
                ll: LL(ll),
                place() { const p = map.project(lngLat(this.ll)); node.style.transform = `translate(${p.x}px, ${p.y}px)`; },
                remove() { tracked.delete(t); node.remove(); }
            };
            tracked.add(t);
            t.place();
            return t;
        };
        let shapeSeq = 0;
        const dash = (o, w) => o.dashArray ? String(o.dashArray).split(/[\s,]+/).map(Number).filter(n => n > 0).map(n => n / w) : undefined;
        const addGeo = (geometry, o, kinds) => {
            const id = "bp-shape-" + (++shapeSeq), ids = [];
            const t = { remove() { whenReady(() => { ids.forEach(l => map.getLayer(l) && map.removeLayer(l)); if (map.getSource(id)) map.removeSource(id); }); } };
            whenReady(() => {
                map.addSource(id, { type: "geojson", data: { type: "Feature", geometry, properties: {} } });
                const before = o.below && map.getLayer("bp-pins") ? "bp-pins" : undefined;
                if (kinds.fill) {
                    map.addLayer({ id: id + "-fill", type: "fill", source: id, paint: { "fill-color": o.fillColor || o.color || "#3388ff", "fill-opacity": o.fillOpacity != null ? o.fillOpacity : 0.2 } }, before);
                    ids.push(id + "-fill");
                }
                const w = o.weight != null ? o.weight : 3, paint = { "line-color": o.color || "#3388ff", "line-width": w, "line-opacity": o.opacity != null ? o.opacity : 1 };
                const da = dash(o, w);
                if (da) paint["line-dasharray"] = da;
                map.addLayer({ id: id + "-line", type: "line", source: id, layout: { "line-join": "round", "line-cap": da ? "butt" : "round" }, paint }, before);
                ids.push(id + "-line");
            });
            return t;
        };
        M.addLine = (lls, o) => addGeo({ type: "LineString", coordinates: lls.map(lngLat) }, o || {}, {});
        // rings — как у L.polygon: первый контур внешний, остальные — дыры; o.below — под метками
        M.addPolygon = (rings, o) => {
            const list = Array.isArray(rings[0]) && Array.isArray(rings[0][0]) ? rings : [rings];
            const coords = list.map(r => { const c = r.map(lngLat); const a = c[0], z = c[c.length - 1]; if (a[0] !== z[0] || a[1] !== z[1]) c.push(a); return c; });
            return addGeo({ type: "Polygon", coordinates: coords }, Object.assign({ below: true }, o), { fill: !o || o.fill !== false });
        };

        // ----- Подложка: тайлы z/x/y (url(z, x, y) → адрес или null, если тайла нет) -----
        // minNative / maxNative — зумы тайлов игры (как minNativeZoom / maxNativeZoom у L.TileLayer);
        // clip — закрыть цветом фона всё за bounds (у краевых тайлов бывают чёрные поля за картой)
        M.addTiles = o => {
            tileProtocol();
            if (o.bounds && !M.tileBounds) M.tileBounds = o.bounds;
            const key = "t" + (++tileSeq);
            tileFns[key] = (tz, x, y) => o.url(...C.tile(tz, x, y));
            whenReady(() => {
                const b = o.bounds ? boundsOf(o.bounds) : null;
                const sw = b && lngLat([b.s, b.w]), ne = b && lngLat([b.n, b.e]);
                map.addSource("bp-" + key, Object.assign({
                    type: "raster", tiles: [`bptile://${key}/{z}/{x}/{y}`], tileSize: o.tileSize || 256,
                    minzoom: C.tz(o.minNative != null ? o.minNative : 0), maxzoom: C.tz(o.maxNative != null ? o.maxNative : 22)
                }, b ? { bounds: [sw[0], sw[1], ne[0], ne[1]] } : {}));
                const first = map.getStyle().layers.find(l => l.id !== "bp-bg");
                map.addLayer({ id: "bp-" + key, type: "raster", source: "bp-" + key, paint: { "raster-fade-duration": 250, "raster-resampling": "linear" } }, first && first.id);
                if (b && o.clip) {
                    const W = [[-180, -85.05], [180, -85.05], [180, 85.05], [-180, 85.05], [-180, -85.05]];
                    const hole = [sw, [ne[0], sw[1]], ne, [sw[0], ne[1]], sw];
                    map.addSource("bp-" + key + "-clip", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [W, hole] } } });
                    map.addLayer({ id: "bp-" + key + "-clip", type: "fill", source: "bp-" + key + "-clip", paint: { "fill-color": o.background || bgOf(container), "fill-antialias": false } }, first && first.id);
                }
            });
            return M;
        };

        // ----- Метки -----
        let pins = null;
        M.addPins = cfg => { M.pinsCfg = cfg; return (pins = Pins(M, map, cfg, whenReady, fire)); };
        // для js/map-layers.js: перерисовка слоя вместе с картой
        M.onMove = fn => { tracked.add({ place: fn }); return M; };

        // Клик и правая кнопка: сначала метка под курсором, потом карта
        const eventLL = e => C.ll(e.lngLat);
        map.on("click", e => {
            const m = pins && pins.hit(e.point);
            if (m) { pins.emit("click", m, e.originalEvent); return; }
            if (popup && popup.opts.closeOnClick !== false) M.closePopup();
            fire("click", { latlng: eventLL(e), containerPoint: { x: e.point.x, y: e.point.y }, originalEvent: e.originalEvent });
        });
        map.on("dblclick", e => { if (pins && pins.hit(e.point)) e.preventDefault(); });
        map.on("contextmenu", e => {
            const m = pins && pins.hit(e.point);
            if (m) { e.originalEvent.preventDefault(); pins.emit("contextmenu", m, e.originalEvent); return; }
            fire("contextmenu", { latlng: eventLL(e), originalEvent: e.originalEvent });
        });
        map.on("mousemove", e => { if (pins && !(e.originalEvent.buttons & 1)) pins.hover(pins.hit(e.point)); });
        map.getCanvasContainer().addEventListener("mouseleave", () => { if (pins) pins.hover(null); });

        M.remove = () => { map.remove(); };
        window.BPMap.last = M;
        window.dispatchEvent(new CustomEvent("bp:map", { detail: M }));
        return M;
    }

    // ---------- Метки: символы WebGL из готовых спрайтов ----------
    // cfg: {
    //   geoms: [PIN, DOT] — формы (w, h, cx, cy, r, ax, ay, hover); остриё (ax, ay) совпадает с координатой метки
    //   geom(m), scale(zoomLeaflet) — размер на зуме, list() — видимые метки, pos(m) — [lat, lng], id(m)
    //   sprite(m) → { key, draw: () => canvas }, ratio — плотность спрайтов (2 на Retina)
    //   lit(m) — подсвечена (над остальными, со свечением), glow() → canvas свечения, glowR, glowScale(g)
    //   badges(m) → { flag, note } | null, badgeSprite(kind) → canvas (плотность badgeRatio, радиус badgeR)
    //   hit(g) → { dy, r } — круг попадания по «головке» (в единицах спрайта), tol — запас под палец, px
    // }
    function Pins(M, map, cfg, whenReady, fireMap) {
        const C = M.crs, toML = C.z, toL = C.zL;
        const geoms = cfg.geoms, gi = g => Math.max(0, geoms.indexOf(g));
        const minZ = Math.floor(toML(M.getMinZoom())), maxZ = Math.ceil(toML(M.getMaxZoom()));
        const sizeStops = f => { const out = []; for (let z = minZ; z <= maxZ; z++) out.push(z, f(cfg.scale(toL(z)), z)); return out; };
        const zoomExpr = f => ["interpolate", ["linear"], ["zoom"], ...sizeStops(f)];
        const byGeom = (fn, fallback) => {
            const e = ["match", ["get", "g"]];
            geoms.forEach((g, i) => e.push(i, fn(g)));
            e.push(fallback);
            return e;
        };
        const listeners = {};
        const images = new Map(); // key → draw
        let items = [], index = new Map(), hovered = null, hoverSrc = null;

        const addImage = (key, draw, ratio) => {
            if (images.has(key)) return;
            images.set(key, { draw, ratio });
            map.addImage(key, imageData(draw()), { pixelRatio: ratio });
        };

        const setup = () => {
            ["bp-pins", "bp-lit", "bp-hover", "bp-badges"].forEach(id => map.addSource(id, { type: "geojson", data: { type: "FeatureCollection", features: [] }, maxzoom: maxZ, buffer: 128, tolerance: 0 }));
            const pinLayout = (extra) => Object.assign({
                "icon-image": ["get", "i"], "icon-anchor": "top-left",
                "icon-offset": byGeom(g => ["literal", [-g.ax, -g.ay]], ["literal", [0, 0]]),
                "icon-size": zoomExpr(s => s),
                "icon-allow-overlap": true, "icon-ignore-placement": true, "icon-padding": 0,
                "symbol-z-order": "viewport-y"
            }, extra);
            const hideHovered = { "icon-opacity": ["case", ["boolean", ["feature-state", "h"], false], 0, 1] };
            map.addLayer({ id: "bp-pins", type: "symbol", source: "bp-pins", layout: pinLayout(), paint: hideHovered });
            if (cfg.glow) {
                addImage("bp-glow", () => cfg.glow(), cfg.ratio || 1);
                map.addLayer({
                    id: "bp-glow", type: "symbol", source: "bp-lit",
                    layout: {
                        "icon-image": "bp-glow", "icon-anchor": "center",
                        "icon-size": ["interpolate", ["linear"], ["zoom"], ...sizeStops(s => ["*", s, ["get", "gs"]])],
                        "icon-offset": byGeom(g => ["literal", [0, -(g.ay - g.cy) / (cfg.glowScale ? cfg.glowScale(g) : 1)]], ["literal", [0, 0]]),
                        "icon-allow-overlap": true, "icon-ignore-placement": true, "symbol-z-order": "viewport-y"
                    }
                });
            }
            map.addLayer({ id: "bp-pins-lit", type: "symbol", source: "bp-lit", layout: pinLayout(), paint: hideHovered });
            // Значки «Важно»/«Позже» (справа сверху) и заметки (слева сверху) — поверх всех меток.
            // Размер — как в MapExtras.badges: радиус max(5.5, 0.56·r·k), центр на ±0.76·r·k от центра «головки».
            if (cfg.badgeSprite) {
                const bR = cfg.badgeR || 7, br = cfg.badgeRatio || 3;
                ["star", "later", "note"].forEach(k => addImage("bp-badge-" + k, () => cfg.badgeSprite(k), br));
                geoms.forEach((g, i) => [1, -1].forEach(side => {
                    map.addLayer({
                        id: `bp-badges-${i}-${side > 0 ? "f" : "n"}`, type: "symbol", source: "bp-badges",
                        filter: ["all", ["==", ["get", "g"], i], ["==", ["get", "s"], side]],
                        layout: {
                            "icon-image": ["concat", "bp-badge-", ["get", "b"]], "icon-anchor": "center",
                            "icon-size": zoomExpr(k => Math.max(5.5, 0.56 * g.r * k) / bR),
                            "icon-allow-overlap": true, "icon-ignore-placement": true
                        },
                        paint: {
                            "icon-translate": zoomExpr(k => ["literal", [side * 0.76 * g.r * k, (g.cy - g.ay) * k - 0.76 * g.r * k]])
                        }
                    });
                }));
            }
            map.addLayer({
                id: "bp-hover", type: "symbol", source: "bp-hover",
                layout: pinLayout({ "icon-size": ["interpolate", ["linear"], ["zoom"], ...sizeStops(s => ["*", s, ["get", "hs"]])] })
            });
            api.refresh();
        };

        const feature = (it, n) => ({ type: "Feature", id: n, geometry: { type: "Point", coordinates: it.c }, properties: { i: it.key, g: it.g, gs: it.gs, hs: it.hs } });

        const api = {
            refresh() {
                if (!map.getSource("bp-pins")) return api;
                const list = cfg.list(), pinsF = [], litF = [], badgeF = [];
                items = []; index = new Map();
                for (const m of list) {
                    const p = LL(cfg.pos(m)), g = cfg.geom(m), sp = cfg.sprite(m);
                    addImage(sp.key, sp.draw, cfg.ratio || 1);
                    const it = {
                        m, c: C.ml(p), ux: C.u(p), uy: C.v(p), geom: g, g: gi(g), key: sp.key,
                        lit: !!(cfg.lit && cfg.lit(m)), gs: cfg.glowScale ? cfg.glowScale(g) : 1, hs: g.hover || 1
                    };
                    it.n = it.lit ? litF.length : pinsF.length;
                    (it.lit ? litF : pinsF).push(feature(it, it.n));
                    items.push(it);
                    index.set(m, it);
                    const b = cfg.badges && cfg.badges(m);
                    if (b && b.flag) badgeF.push({ type: "Feature", geometry: { type: "Point", coordinates: it.c }, properties: { g: it.g, s: 1, b: b.flag } });
                    if (b && b.note) badgeF.push({ type: "Feature", geometry: { type: "Point", coordinates: it.c }, properties: { g: it.g, s: -1, b: "note" } });
                }
                map.getSource("bp-pins").setData({ type: "FeatureCollection", features: pinsF });
                map.getSource("bp-lit").setData({ type: "FeatureCollection", features: litF });
                map.getSource("bp-badges").setData({ type: "FeatureCollection", features: badgeF });
                // наведённая метка могла пропасть или смениться спрайтом
                // номера объектов поменялись: старое «скрыть наведённую» снимаем
                map.removeFeatureState({ source: "bp-pins" });
                map.removeFeatureState({ source: "bp-lit" });
                if (hovered) {
                    const it = index.get(hovered.m), prev = hovered;
                    hovered = null; hoverSrc = null;
                    setHover(it || null, true);
                    if (!it) { map.getContainer().classList.remove("bp-pin-hover"); emit("mouseout", prev.m); }
                }
                // окно метки закрывается, когда метка пропадает с карты (как у Leaflet)
                const pop = M.popup();
                if (pop && pop.opts.source && !index.has(pop.opts.source)) M.closePopup();
                return api;
            },
            // перерисовать все спрайты (например, когда догрузился шрифт иконок)
            redrawSprites() {
                images.forEach((v, key) => { if (map.hasImage(key)) map.updateImage(key, imageData(v.draw())); });
                return api;
            },
            has: m => index.has(m),
            // точка метки на экране (px от левого верхнего угла карты) или null, если метки на карте нет
            screen(m) {
                const it = index.get(m);
                if (!it) return null;
                const p = map.project(it.c);
                return { x: p.x, y: p.y };
            },
            // метка под точкой экрана: подсвеченные сверху, затем самая южная (её спрайт нарисован поверх)
            hit(pt) {
                if (!items.length) return null;
                const z = map.getZoom(), S = 512 * Math.pow(2, z), c = map.getCenter();
                const cx = mercX(c.lng) * S - map.getCanvas().clientWidth / 2, cy = mercY(c.lat) * S - map.getCanvas().clientHeight / 2;
                const k = cfg.scale(toL(z)), tol = cfg.tol || 0;
                let best = null;
                for (const it of items) {
                    const h = cfg.hit ? cfg.hit(it.geom) : { dy: it.geom.ay - it.geom.cy, r: it.geom.r + 1 };
                    const x = it.ux * S - cx, y = it.uy * S - cy - h.dy * k;
                    const dx = pt.x - x, dy = pt.y - y, R = h.r * k + tol;
                    if (dx * dx + dy * dy > R * R) continue;
                    if (!best || it.lit > best.lit || (it.lit === best.lit && y >= best.y)) best = { it, lit: it.lit, y };
                }
                return best ? best.it.m : null;
            },
            // наведение по метке (или null)
            hover(m) {
                const it = m ? index.get(m) || null : null;
                if ((it && it.m) === (hovered && hovered.m)) return;
                const prev = hovered;
                setHover(it, false);
                if (prev) emit("mouseout", prev.m);
                if (it) emit("mouseover", it.m);
            },
            on(type, fn) { (listeners[type] = listeners[type] || []).push(fn); return api; },
            emit: (type, m, e) => emit(type, m, e)
        };
        const emit = (type, m, e) => (listeners[type] || []).forEach(f => f(m, e));
        // Наведённая метка рисуется в отдельном слое крупнее (g.hover), исходная на это время прячется
        function setHover(it) {
            if (!map.getSource("bp-hover")) return;
            if (hovered && hoverSrc) map.setFeatureState({ source: hoverSrc, id: hovered.n }, { h: false });
            hovered = it; hoverSrc = null;
            map.getContainer().classList.toggle("bp-pin-hover", !!it);
            if (it) {
                hoverSrc = it.lit ? "bp-lit" : "bp-pins";
                map.setFeatureState({ source: hoverSrc, id: it.n }, { h: true });
            }
            map.getSource("bp-hover").setData({ type: "FeatureCollection", features: it ? [feature(it, 0)] : [] });
        }
        whenReady(setup);
        return api;
    }

    window.BPMap = { create, Browser, popupWidth, belowOn };
})();
