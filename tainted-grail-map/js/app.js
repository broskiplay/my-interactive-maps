// Карты Tainted Grail: The Fall of Avalon
// tiles — папка тайлов MapGenie (z8..z13); rect — область самой карты внутри региона
// тайлов в долях [x0, y0, x1, y1] (от левого верхнего угла).
// Тайлы и картинки из окон меток лежат в репозитории tainted-grail-assets (GitHub Pages):
// tiles/<карта>/<zoom Leaflet>/<строка>/<столбец>.webp и popups/<id>.webp.
// В данных меток поле img — путь вида popups/<id>.webp; ссылки http(s) остаются как есть.
const ASSETS_ROOT = "https://broskiplay.github.io/tainted-grail-assets";
const MAPS = [
    { id: "horns-of-the-south", name: "Рога Юга", tiles: "horns-of-the-south", rect: [0.2217, 0.2202, 0.7783, 0.7798] },
    { id: "cuanacht", name: "Кунахт", tiles: "cuanacht", rect: [0.1484, 0.2949, 0.8516, 0.7051] },
    { id: "forlorn-swords", name: "Забытые мечи", tiles: "forlorn", rect: [0.2222, 0.2217, 0.7773, 0.7783] },
    { id: "sarras", name: "Саррас", dlc: true, tiles: "sarras", rect: [0.2217, 0.2202, 0.7808, 0.7798] }
];

// Регион тайлов: тайл 127/127 на z8, на z13 это квадрат 8192×8192 px.
// Координаты Leaflet = пиксели z13 (lat вверх). Метки в JSON лежат в системе MapGenie:
// lat/lng растянуты на всю область карты, поэтому переводим по границам разброса меток.
const REGION = 8192;
const DATA_BOUNDS = { lat: [624.72, 7262.37], lng: [983.28, 6555.2] };

// У карты можно задать свой `fit: [u0, v0, u1, v1]` — какую долю области карты (rect) занимают метки
// (0..1 слева-снизу). По умолчанию метки растянуты на всю область.
function markerPos(m, rect, fit = [0, 0, 1, 1]) {
    const u0 = (m.lng - DATA_BOUNDS.lng[0]) / (DATA_BOUNDS.lng[1] - DATA_BOUNDS.lng[0]);
    const v0 = (m.lat - DATA_BOUNDS.lat[0]) / (DATA_BOUNDS.lat[1] - DATA_BOUNDS.lat[0]);
    const u = fit[0] + u0 * (fit[2] - fit[0]);
    const v = fit[1] + v0 * (fit[3] - fit[1]);
    const xFrac = rect[0] + u * (rect[2] - rect[0]);
    const yFrac = rect[3] - v * (rect[3] - rect[1]);
    return [(1 - yFrac) * REGION, xFrac * REGION];
}

// Категории меток (key = имя иконки icon-<key> из MapGenie)
const CATEGORIES = [
    { title: "Локации", items: [
        { key: "fast_travel", name: "Быстрое перемещение", color: "#3b82c4" },
        { key: "transition", name: "Переход", color: "#7a5cc4" },
        { key: "shrine", name: "Святилище", color: "#5c8fb0" },
        { key: "stash", name: "Тайник", color: "#a8794a" },
        { key: "dungeon", name: "Подземелье", color: "#8a6a9a" },
        { key: "location", name: "Место", color: "#6a8a9a" },
        { key: "statue", name: "Статуя", color: "#9a8a6a" }
    ] },
    { title: "Службы и удобства", items: [
        { key: "alchemy_station", name: "Алхимический стол", color: "#4a9a8a" },
        { key: "cooking_pot", name: "Котёл", color: "#c87a3a" },
        { key: "grindstone", name: "Точило", color: "#7a8a96" },
        { key: "bed", name: "Кровать", color: "#6a7ab0" },
        { key: "bounty_board", name: "Доска объявлений", color: "#a06a4a" },
        { key: "merchant", name: "Торговец", color: "#c49a3a" },
        { key: "blacksmith", name: "Кузнец", color: "#8a7a6a" }
    ] },
    { title: "Сбор и находки", items: [
        { key: "mineral", name: "Руда и минералы", color: "#5a8fa8" },
        { key: "plant", name: "Растения", color: "#4f9a4f" },
        { key: "chest", name: "Сундук", color: "#3a9aa8" },
        { key: "lore_entry", name: "Записи и книги", color: "#9a7ac4" },
        { key: "supplies", name: "Припасы", color: "#b08a4a" },
        { key: "recipe", name: "Рецепт", color: "#b0704a" },
        { key: "tool", name: "Инструмент", color: "#7a8a8a" },
        { key: "lumbering_spot", name: "Место рубки", color: "#7a6a3a" },
        { key: "item", name: "Предметы", color: "#8a9a6a" },
        { key: "relic", name: "Реликвии", color: "#b05a8a" }
    ] },
    { title: "Снаряжение", items: [
        { key: "armor", name: "Броня", color: "#6a8a6a" },
        { key: "melee_weapon", name: "Оружие ближнего боя", color: "#a05a4a" },
        { key: "ranged_weapon", name: "Дальнобойное оружие", color: "#a07a3a" },
        { key: "magic_weapon", name: "Магия", color: "#8a5ac4" },
        { key: "ring", name: "Кольца и амулеты", color: "#c49a3a" }
    ] },
    { title: "Задания", items: [
        { key: "main_quest", name: "Основное задание", color: "#d4a017" },
        { key: "side_quest", name: "Побочное задание", color: "#3f9f6a" },
        { key: "misc_quest", name: "Прочее задание", color: "#4f8f8f" },
        { key: "quest_item", name: "Квестовый предмет", color: "#c8a03a" }
    ] },
    { title: "Существа", items: [
        { key: "boss", name: "Босс", color: "#b83a3a" },
        { key: "enemy", name: "Враг", color: "#8a3a3a" },
        { key: "npc", name: "Персонаж", color: "#5a7ab0" },
        { key: "horse", name: "Лошадь", color: "#8a6a4a" }
    ] },
    { title: "Прочее", items: [
        { key: "easter_egg", name: "Пасхалка", color: "#c4569a" },
        { key: "miscellaneous", name: "Разное", color: "#8a7a64" }
    ] }
];
const CAT_BY_KEY = Object.fromEntries(CATEGORIES.flatMap(g => g.items).map(c => [c.key, c]));

// Категории взяты из иконок MapGenie; неизвестные ключи попадают в «Разное»
function refineCategory(m) {
    return CAT_BY_KEY[m.category] ? m.category : "miscellaneous";
}

const state = { loaded: false, raw: null, adding: false, map: null, mapId: null, hidden: new Set(), markers: [], found: new Set(), layers: {}, hideFound: false };
try { state.hideFound = !!localStorage.getItem("tg_hide_found"); } catch (e) { /* localStorage недоступен */ }
// Выбор категорий в сайдбаре запоминается между заходами (общий для всех карт игры)
try { state.hidden = new Set((JSON.parse(localStorage.getItem("tg_hidden_cats")) || []).filter(k => CAT_BY_KEY[k])); } catch (e) { /* localStorage недоступен */ }

const mapHref = (id, marker) => `${MAP_HOME}${id}/` + (marker == null ? "" : `?marker=${encodeURIComponent(marker)}`);
function currentMapId() {
    const id = urlMapId();
    return MAPS.some(m => m.id === id) ? id : MAPS[0].id;
}

// Описания MapGenie содержат markdown: **жирный**, [названия квестов], переносы \r\n
function formatDesc(desc) {
    return escapeHtml(desc || "")
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/\[([^\]]+)\]/g, "<i>$1</i>")
        .replace(/\r?\n/g, "<br>");
}

const foundKey = () => "tg_found_" + state.mapId;

// ---------- Облако: users/{uid}/mapProgress|customMarkers/tg_<карта> ----------
// Если документ в облаке есть — он главный (так удаления не «воскресают» со старых устройств).
const cloud = { db: null, user: null };
const cloudRef = (col, uid = cloud.user.uid) => cloud.db.collection("users").doc(uid).collection(col).doc("tg_" + state.mapId);

async function cloudPull() {
    if (!cloud.db || !cloud.user || !state.loaded) return;
    const uid = cloud.user.uid;
    try {
        const [prog, cm] = await Promise.all([cloudRef("mapProgress", uid).get(), cloudRef("customMarkers", uid).get()]);
        if (!cloud.user || cloud.user.uid !== uid) return;
        if (prog.exists && Array.isArray(prog.data().foundIds)) {
            state.found = mergeLocalEdits(new Set(prog.data().foundIds.map(String)));
            try { localStorage.setItem(foundKey(), JSON.stringify([...state.found])); } catch (e) { /* localStorage недоступен */ }
        } else if (state.found.size) cloudPush("mapProgress", { foundIds: [...state.found] });
        if (marks.fromCloud(prog.exists ? prog.data() : null)) setTimeout(() => cloudPush("mapProgress", { foundIds: [...state.found] }), 0);
        if (cm.exists && Array.isArray(cm.data().markers)) {
            const mine = cm.data().markers.filter(m => m && m.pos && CAT_BY_KEY[m.cat]).map(m => ({ ...m, user: true }));
            state.markers = state.markers.filter(m => !m.user).concat(mine);
            saveUserMarkers(false);
        } else if (state.markers.some(m => m.user)) saveUserMarkers();
        buildMarkers();
        renderFilters();
        cloud.base = null;
        extrasAfterPull();
    } catch (err) { console.warn("Не удалось загрузить из Firestore:", err); }
}

function renderMapSwitch() {
    // Выпадающий список карт: переход на страницу /<игра>/<id>/
    const box = document.getElementById("map-switch");
    box.innerHTML = `<select class="map-select" aria-label="Выбор карты">${MAPS.map(m =>
        `<option value="${m.id}"${m.id === state.mapId ? " selected" : ""}>${escapeHtml(m.name)}${m.dlc ? " (DLC)" : ""}</option>`).join("")}</select>`;
    box.querySelector("select").addEventListener("change", e => { location.href = mapHref(e.target.value); });
}

function counts() {
    const total = {}, done = {};
    state.markers.forEach(m => {
        total[m.cat] = (total[m.cat] || 0) + 1;
        if (state.found.has(String(m.id))) done[m.cat] = (done[m.cat] || 0) + 1;
    });
    return { total, done };
}

function renderFilters() {
    { const own = state.markers.filter(x => !x.user); renderRegionProgress(own.reduce((n, x) => n + (state.found.has(String(x.id)) ? 1 : 0), 0), own.length); }
    const q = document.getElementById("search-input").value.trim().toLowerCase();
    const { total, done } = counts();
    pruneLocate(total);
    document.getElementById("filters-container").innerHTML = locateClearBtn() + CATEGORIES.map(group => {
        const items = group.items.filter(c => total[c.key] > 0 && (c.name.toLowerCase().includes(q)));
        if (!items.length) return "";
        return `<div class="filter-group"><div class="filter-group-title">${group.title}</div>` +
            items.map(c => `<div class="filter-row"><button type="button" class="filter-item${state.hidden.has(c.key) ? " disabled" : ""}" data-cat="${c.key}"><span class="filter-name"><i class="tg-filter-icon icon-${c.key}" style="background:${c.color}"></i>${c.name}</span><span class="filter-count">${done[c.key] || 0}/${total[c.key] || 0}</span></button>${locateBtn(c, total)}</div>`).join("") +
            `</div>`;
    }).join("");
}

// ---------- Метки на canvas ----------
// Тысяча DOM-элементов с тенями и поворотом перерисовывается при каждом сдвиге и зуме, поэтому карта
// дёргалась. Метки рисуются одним canvas из готовых спрайтов: панорамирование — это сдвиг одного слоя.
// Спрайт: размер w×h, остриё капельки в точке (ax, ay) — она совпадает с координатой метки.
const PIN = { w: 48, h: 64, cx: 24, cy: 26, r: 14, ax: 24, ay: 46, hover: 1.15 };

// Как у `.tg-marker.found`: цвет на 70% к серому
function desaturate(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const gray = r * 0.3 + g * 0.59 + b * 0.11;
    const mix = v => Math.round(v + (gray - v) * k);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function buildPinSprite(cat, found) {
    const k = L.Browser.retina ? 2 : 1;
    const color = CAT_BY_KEY[cat].color;
    const canvas = document.createElement("canvas");
    canvas.width = PIN.w * k; canvas.height = PIN.h * k;
    const ctx = getCtx(canvas);
    ctx.scale(k, k);

    ctx.save();
    ctx.translate(PIN.cx, PIN.cy);
    ctx.rotate(-Math.PI / 4);
    NMPin.drop(ctx, r => teardropPath(ctx, r), PIN.r, found ? desaturate(color, 0.7) : color, k, "rgba(255,255,255,.85)"); // объёмный пин: ../js/nm-pin.js
    ctx.restore();

    ctx.font = "15px icomoon";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(iconGlyph(cat), PIN.cx, PIN.cy);

    if (!found) return canvas;
    ctx.font = "700 11px sans-serif";
    ctx.shadowColor = "#000"; ctx.shadowBlur = 3 * k;
    ctx.fillStyle = "#9be29b";
    ctx.fillText("✓", PIN.cx, PIN.cy - 20);

    // Выполненные — полупрозрачные целиком (opacity .45 у `.tg-marker.found`)
    const faded = document.createElement("canvas");
    faded.width = canvas.width; faded.height = canvas.height;
    const fctx = getCtx(faded);
    fctx.globalAlpha = 0.45;
    fctx.drawImage(canvas, 0, 0);
    return faded;
}

// Слой рисует метки в порядке «север → юг»: южные поверх северных, как раньше у DOM-маркеров (z-index по y)
const PinCanvas = L.Canvas.extend({
    // Как L.Canvas._initContainer, но контекст создаётся с учётом SOFTWARE_CANVAS (родной берёт ускоренный)
    _initContainer() {
        const container = this._container = document.createElement("canvas");
        L.DomEvent.on(container, "mousemove", this._onMouseMove, this);
        L.DomEvent.on(container, "click dblclick mousedown mouseup contextmenu", this._onClick, this);
        L.DomEvent.on(container, "mouseout", this._handleMouseOut, this);
        container._leaflet_disable_events = true;
        this._ctx = getCtx(container);
    },
    // Плавный зум. Leaflet по умолчанию масштабирует готовый canvas целиком: метки при этом раздуваются
    // и размываются, а по окончании зума «схлопываются» обратно. Вместо этого рисуем метки в каждом кадре
    // в промежуточных позициях (линейно от старой к конечной — так же интерполируется transform у тайлов),
    // размер остаётся прежним.
    // Прогресс берём не из своего таймера, а у служебного элемента с тем же CSS-переходом, что и у тайлов
    // (класс leaflet-zoom-animated): в Chrome переход идёт на compositor-потоке, и свой таймер расходится
    // с тайлами — метки «плывут» относительно карты.
    _onAnimZoom(ev) {
        this._stopZoomAnim();
        const map = this._map, origin = map._getNewPixelOrigin(ev.center, ev.zoom), items = [];
        for (let o = this._drawFirst; o; o = o.next) {
            const l = o.layer;
            // round — как в latLngToLayerPoint, чтобы последний кадр совпал с итоговой позицией без сдвига
            const to = map.project(l._latlng, ev.zoom)._round()._subtract(origin);
            items.push({ l, x0: l._point.x, y0: l._point.y, dx: to.x - l._point.x, dy: to.y - l._point.y });
        }
        const probe = this._zoomProbe(), target = map.getZoomScale(ev.zoom, this._zoom);
        L.DomUtil.setTransform(probe, L.point(0, 0), 1);
        void probe.offsetWidth; // зафиксировать начальное состояние, иначе перехода не будет
        L.DomUtil.setTransform(probe, L.point(0, 0), target);

        const t0 = performance.now();
        const tick = now => {
            const elapsed = performance.now() - t0;
            const scale = parseFloat((getComputedStyle(probe).transform || "").replace(/^matrix(3d)?\(/, ""));
            const p = Math.abs(target - 1) > 1e-6 && isFinite(scale)
                ? Math.min(1, Math.max(0, (scale - 1) / (target - 1)))
                : easeZoom(Math.min(1, elapsed / ZOOM_ANIM_MS));
            this._drawInterpolated(items, p);
            this._zoomRaf = elapsed < ZOOM_ANIM_MS + 100 ? requestAnimationFrame(tick) : null;
        };
        this._zoomRaf = requestAnimationFrame(tick);
    },
    _zoomProbe() {
        if (!this._probe) {
            this._probe = L.DomUtil.create("div", "leaflet-zoom-animated", this._container.parentNode);
            this._probe.style.cssText = "position:absolute;left:0;top:0;width:1px;height:1px;visibility:hidden;pointer-events:none";
        }
        return this._probe;
    },
    _drawInterpolated(items, p) {
        const b = this._bounds, m = 50, visible = [];
        this._redrawBounds = null;
        this._clear();
        for (const it of items) {
            const x = it.x0 + it.dx * p, y = it.y0 + it.dy * p;
            if (x < b.min.x - m || x > b.max.x + m || y < b.min.y - m || y > b.max.y + m) continue;
            visible.push({ l: it.l, x, y });
        }
        visible.sort((a, c) => litRank(a.l) - litRank(c.l) || a.y - c.y);
        visible.forEach(v => v.l._drawAt(this._ctx, v.x, v.y));
    },
    _stopZoomAnim() {
        if (this._zoomRaf) { cancelAnimationFrame(this._zoomRaf); this._zoomRaf = null; }
    },
    onRemove() {
        this._stopZoomAnim();
        if (this._probe) { L.DomUtil.remove(this._probe); this._probe = null; }
        L.Canvas.prototype.onRemove.call(this);
    },

    // Canvas размером с экран, перерисовывается на каждом шаге перетаскивания (событие move). Стандартный
    // Leaflet рисует canvas с большим запасом и обновляет только по окончании движения: на больших Retina-экранах
    // это сотни МБ видеопамяти (Chrome начинал мерцать целой страницей), а на краях при сдвиге было пусто.
    getEvents() {
        const events = L.Canvas.prototype.getEvents.call(this);
        events.move = this._onMove;
        return events;
    },
    _onZoom() {}, // щипок на тач-экране идёт через move, масштабировать готовый canvas не нужно
    _onMove() {
        const map = this._map;
        if (!map || map._animatingZoom) return;
        if (this._zoom !== map.getZoom()) {
            for (const id in this._layers) this._layers[id]._project();
        }
        this._update();
    },
    // Как L.Canvas._update, но canvas пересоздаётся (и очищается) только при смене размера, а не на каждом шаге
    _update() {
        const map = this._map;
        if (map._animatingZoom && this._bounds) return;
        this._stopZoomAnim();
        if (this._probe) L.DomUtil.setTransform(this._probe, L.point(0, 0), 1);

        L.Renderer.prototype._update.call(this);

        const b = this._bounds, size = b.getSize(), k = L.Browser.retina ? 2 : 1, c = this._container;
        L.DomUtil.setPosition(c, b.min);
        if (c.width !== k * size.x || c.height !== k * size.y) {
            c.width = k * size.x;
            c.height = k * size.y;
            c.style.width = size.x + "px";
            c.style.height = size.y + "px";
        }
        this._ctx.setTransform(k, 0, 0, k, -b.min.x * k, -b.min.y * k);
        this.fire("update");
    },
    // Пока идёт анимация зума, обычные перерисовки пропускаем: после зума moveend перерисует всё сразу
    _redraw() {
        if (this._zoomRaf) { this._redrawRequest = null; this._redrawBounds = null; return; }
        L.Canvas.prototype._redraw.call(this);
    },
    _draw() {
        const bounds = this._redrawBounds, ctx = this._ctx;
        ctx.save();
        if (bounds) {
            const size = bounds.getSize();
            ctx.beginPath();
            ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
            ctx.clip();
        }
        const visible = [];
        for (let o = this._drawFirst; o; o = o.next) {
            const layer = o.layer;
            if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) visible.push(layer);
        }
        visible.sort((a, b) => litRank(a) - litRank(b) || a._point.y - b._point.y);
        this._drawing = true;
        visible.forEach(layer => layer._updatePath());
        this._drawing = false;
        ctx.restore();
    }
});

const PinMarker = L.CircleMarker.extend({
    options: { radius: 1, bubblingMouseEvents: false },
    _updateBounds() {
        const p = this._point, m = 10; // запас под увеличение при наведении
        this._pxBounds = L.bounds(
            [p.x - PIN.ax - m, p.y - PIN.ay - m],
            [p.x + PIN.w - PIN.ax + m, p.y + PIN.h - PIN.ay + m]
        );
    },
    _empty() { return !this._renderer._bounds.intersects(this._pxBounds); },
    _containsPoint(pt) {
        // Круг по «головке» капельки; на тач-экранах с запасом под палец
        const tol = L.Browser.touch ? 8 : 0;
        return pt.distanceTo(L.point(this._point.x, this._point.y - PIN.r)) <= PIN.r + 1 + tol;
    },
    _updatePath() {
        if (!this._renderer._drawing || this._empty()) return;
        this._drawAt(this._renderer._ctx, this._point.x, this._point.y);
    },
    _drawAt(ctx, x, y) {
        const s = pinSprite(this.options.cat, this.options.found);
        const k = this.options.hover ? PIN.hover : 1;
        ctx.globalAlpha = 1;
        if (litRank(this)) drawGlow(ctx, x, y, PIN, k);
        ctx.drawImage(s, x - PIN.ax * k, y - PIN.ay * k, PIN.w * k, PIN.h * k);
        MapExtras.badges(ctx, x + (PIN.cx - PIN.ax) * k, y + (PIN.cy - PIN.ay) * k, PIN.r * k, this.options.mid);
    },
    // Попап всегда над остриём метки, а не там, куда попал клик (поведение L.Marker)
    _getPopupAnchor() { return [0, -36]; },
    openPopup() { return L.Layer.prototype.openPopup.call(this, this._latlng); }
});

// Спрайты с иконками можно рисовать только после загрузки шрифта иконок
if (document.fonts) {
    document.fonts.load("15px icomoon").catch(() => {}).then(() => {
        pinSprites.clear();
        redrawPins();
    });
}

// Подсказка с названием метки (раньше — атрибут title у DOM-маркера); на тач-экранах не нужна
const hoverTip = L.tooltip({ direction: "top", offset: [0, -36], opacity: 1, className: "tg-tip" });

function popupHtml(m) {
    const c = CAT_BY_KEY[m.cat];
    const done = state.found.has(String(m.id));
    return `<div class="tg-popup">
        <div class="tg-popup-cat" style="color:${c.color}">${c.name}</div>
        <h3>${escapeHtml(m.title || "Без названия")}</h3>
        ${m.img ? `<img class="tg-popup-img" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(popupImgUrl(m.img))}" data-full="${escapeHtml(popupImgUrl(m.img))}" alt="" title="Открыть изображение" onerror="this.remove()">` : ""}
        ${m.desc ? `<p>${formatDesc(m.desc)}</p>` : ""}
        ${m.user ? `<button type="button" class="tg-del-btn" data-id="${m.id}">Удалить свою метку</button>` : ""}
        ${marks.html(m.id)}
        <button type="button" class="tg-done-btn${done ? " is-done" : ""}" data-id="${m.id}">${done ? "✓ Выполнено — отменить" : "Отметить выполненным"}</button>
    </div>`;
}

function toast(text) {
    const el = document.getElementById("tg-toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2200);
}

// Метки, стоящие «друг в друге» (при сильном сближении на карте): в попапе появляются стрелки для переключения между ними (../js/marker-stack.js)
const markerStack = MarkerStack.init({ map: () => state.map, markers: () => state.markers, render: popupHtml, radius: () => 1.6 * PIN.r });

function toggleFound(id) {
    id = String(id);
    state.found.has(id) ? state.found.delete(id) : state.found.add(id);
    saveFound();
    if (state.found.has(id)) window.dispatchEvent(new CustomEvent("bp:found", { detail: { map: state.mapId, count: state.found.size } })); // окошко «Поддержать» (js/support-toast.js)
    const m = state.markers.find(x => String(x.id) === id);
    if (m && m._leaflet) {
        m._leaflet.options.found = state.found.has(id);
        // у подсвеченной категории свечение шире границ метки — перерисовываем весь слой, чтобы ореол не остался
        locateCats.has(m.cat) ? redrawPins() : m._leaflet.redraw();
        markerStack.refresh(m);
    }
    applyFoundVisibility();
    renderFilters();
}

function applyVisibility() {
    Object.entries(state.layers).forEach(([key, layer]) => {
        const shown = state.map.hasLayer(layer);
        if (catHidden(key) && shown) state.map.removeLayer(layer);
        else if (!catHidden(key) && !shown) state.map.addLayer(layer);
    });
    try { localStorage.setItem("tg_hidden_cats", JSON.stringify([...state.hidden])); } catch (e) { /* localStorage недоступен */ }
    settings.touch();
}

function buildMarkers() {
    Object.values(state.layers).forEach(l => state.map.removeLayer(l));
    state.layers = {};
    state.markers.forEach(m => {
        if (!state.layers[m.cat]) state.layers[m.cat] = L.layerGroup();
        m._leaflet = new PinMarker(m.pos, { renderer: pinRenderer, cat: m.cat, found: state.found.has(String(m.id)), mid: String(m.id) })
            .bindPopup(() => markerStack.html(m), { maxWidth: 300, maxHeight: 380, className: "tg-popup-wrap", autoPanPadding: [30, 30], keepInView: false })
            .addTo(state.layers[m.cat]);
        m._leaflet.on("mouseover", () => {
            m._leaflet.options.hover = true;
            m._leaflet.redraw();
            if (m.title && !L.Browser.mobile) state.map.openTooltip(hoverTip.setContent(escapeHtml(m.title)), m._leaflet.getLatLng());
        });
        m._leaflet.on("remove", () => { m._leaflet.options.hover = false; });
        m._leaflet.on("mouseout", () => {
            m._leaflet.options.hover = false;
            m._leaflet.redraw();
            state.map.closeTooltip(hoverTip);
        });
        // Правая кнопка мыши — быстро отметить найденным
        m._leaflet.on("contextmenu", e => {
            L.DomEvent.preventDefault(e.originalEvent);
            L.DomEvent.stopPropagation(e.originalEvent);
            const wasFound = state.found.has(String(m.id));
            toggleFound(m.id);
            toast(wasFound ? "Отметка снята" : "Отмечено найденным: " + (m.title || "метка"));
        });
    });
    applyFoundVisibility();
    applyVisibility();
}

function closeLightbox() { const lb = document.getElementById("tg-lightbox"); if (lb) lb.remove(); }
function openLightbox(src) {
    closeLightbox();
    const lb = document.createElement("div");
    lb.id = "tg-lightbox";
    lb.innerHTML = `<img src="${escapeHtml(src)}" alt=""><button type="button" aria-label="Закрыть">×</button>`;
    lb.addEventListener("click", closeLightbox);
    document.body.appendChild(lb);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

document.addEventListener("click", e => {
    const img = e.target.closest(".tg-popup-img");
    if (img) { openLightbox(img.dataset.full || img.src); return; }
    const del = e.target.closest(".tg-del-btn");
    if (del) { deleteUserMarker(del.dataset.id); return; }
    if (e.target.closest("#tg-add-save")) { saveNewMarker(); return; }
    const btn = e.target.closest(".tg-done-btn");
    if (btn) { toggleFound(btn.dataset.id); return; }
    if (e.target.closest(".locate-clear")) { clearLocate(); return; }
    const loc = e.target.closest(".filter-locate");
    if (loc) { locateCategory(loc.dataset.locate); return; }
    const item = e.target.closest(".filter-item");
    if (!item) return;
    const n = item.dataset.cat;
    state.hidden.has(n) ? state.hidden.delete(n) : state.hidden.add(n);
    item.classList.toggle("disabled");
    applyVisibility();
});
document.getElementById("show-all-btn").addEventListener("click", () => setAll(true));
document.getElementById("hide-all-btn").addEventListener("click", () => setAll(false));
if (state.hideFound) {
    const b = document.getElementById("hide-found-btn");
    b.setAttribute("aria-pressed", "true");
    b.textContent = "Показать отмеченные";
}
document.getElementById("hide-found-btn").addEventListener("click", e => {
    state.hideFound = !state.hideFound;
    e.currentTarget.setAttribute("aria-pressed", state.hideFound);
    e.currentTarget.textContent = state.hideFound ? "Показать отмеченные" : "Скрыть отмеченные";
    try { localStorage.setItem("tg_hide_found", state.hideFound ? "1" : ""); } catch (err) { /* localStorage недоступен */ }
    settings.touch();
    applyFoundVisibility();
});
document.getElementById("search-input").addEventListener("input", renderFilters);

document.getElementById("sidebar-toggle-btn").addEventListener("click", toggleSidebar);
document.getElementById("sidebar-collapse-mobile").addEventListener("click", toggleSidebar);

state.mapId = currentMapId();
try { localStorage.setItem("tg_last_map", state.mapId); } catch (e) { /* localStorage недоступен */ }
const mapCfg = MAPS.find(m => m.id === state.mapId);
const mapBounds = [
    [(1 - mapCfg.rect[3]) * REGION, mapCfg.rect[0] * REGION],
    [(1 - mapCfg.rect[1]) * REGION, mapCfg.rect[2] * REGION]
];
// Большой запас вокруг карты: иначе maxBounds ограничивает автопрокрутку попапа и карта «отпрыгивает» назад
const pad = 3000;
state.map = L.map("map", {
    crs: L.CRS.Simple, minZoom: -3, maxZoom: 0, zoomSnap: 0.25, bounceAtZoomLimits: false, attributionControl: false,
    scrollWheelZoom: false, // вместо него — плавный зум из ../js/smooth-zoom.js
    // Без плавного появления тайлов: при смене уровня новые тайлы проявлялись из прозрачности (~200 мс), и карта мигала
    fadeAnimation: false,
    maxBounds: [[mapBounds[0][0] - pad, mapBounds[0][1] - pad], [mapBounds[1][0] + pad, mapBounds[1][1] + pad]]
});
state.map.fitBounds(mapBounds);
const pinRenderer = new PinCanvas({ padding: 0.05 });
enableSmoothWheelZoom(state.map);

// Тайлы (репозиторий tainted-grail-assets): tiles/<карта>/<zoom Leaflet>/<строка от верха региона>/<столбец>.webp
// (уровень Leaflet 0 = z13 исходной сетки).
const LocalTiles = L.TileLayer.extend({
    getTileUrl(c) {
        const row = Math.pow(2, c.z + 5) + c.y;
        return `${ASSETS_ROOT}/tiles/${mapCfg.id}/${c.z}/${row}/${c.x}.webp`;
    },
    // Краевые тайлы содержат чёрные поля за пределами карты: рисуем на canvas только часть внутри mapBounds
    createTile(c, done) {
        const size = this.getTileSize().x;
        const canvas = L.DomUtil.create("canvas", "leaflet-tile");
        canvas.width = size; canvas.height = size;
        const draw = img => {
            const tb = this._tileCoordsToBounds(c);
            const k = Math.pow(2, c.z);
            const left = Math.max(0, (mapBounds[0][1] - tb.getWest()) * k);
            const right = Math.min(size, (mapBounds[1][1] - tb.getWest()) * k);
            const top = Math.max(0, (tb.getNorth() - mapBounds[1][0]) * k);
            const bottom = Math.min(size, (tb.getNorth() - mapBounds[0][0]) * k);
            if (right > left && bottom > top) {
                getCtx(canvas).drawImage(img, left, top, right - left, bottom - top, left, top, right - left, bottom - top);
            }
            done(null, canvas);
        };
        // Сбой сети на мобильном не должен оставлять тайл пустым навсегда: повторяем с паузой
        const load = attempt => {
            const img = new Image();
            img.onload = () => draw(img);
            img.onerror = () => {
                if (attempt < 3) setTimeout(() => load(attempt + 1), 400 * Math.pow(2, attempt));
                else done(null, canvas);
            };
            img.src = this.getTileUrl(c);
        };
        load(0);
        return canvas;
    }
});
new LocalTiles("", { tileSize: 256, minZoom: -3, maxZoom: 0, maxNativeZoom: -1, minNativeZoom: -3, bounds: mapBounds, noWrap: true, errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" }).addTo(state.map);

// ---------- Свои метки (хранятся в браузере пользователя) ----------
const userKey = () => "tg_user_" + state.mapId;
function loadUserMarkers() {
    try {
        return (JSON.parse(localStorage.getItem(userKey())) || []).filter(m => m && m.pos && CAT_BY_KEY[m.cat])
            .map(m => ({ ...m, user: true }));
    } catch (e) { return []; }
}
function saveUserMarkers(push = true) {
    const list = state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }));
    try { localStorage.setItem(userKey(), JSON.stringify(list)); } catch (e) { /* localStorage недоступен */ }
    if (push) cloudPush("customMarkers", { markers: list });
}

state.map.on("click", e => {
    if (!state.adding) return;
    pendingPos = [e.latlng.lat, e.latlng.lng];
    const opts = CATEGORIES.map(g => `<optgroup label="${g.title}">${g.items.map(c => `<option value="${c.key}">${c.name}</option>`).join("")}</optgroup>`).join("");
    L.popup({ className: "tg-popup-wrap", closeOnClick: false })
        .setLatLng(e.latlng)
        .setContent(`<div class="tg-popup tg-add-form">
            <h3>Новая метка</h3>
            <select id="tg-add-cat">${opts}</select>
            <input type="text" id="tg-add-title" placeholder="Название" maxlength="80">
            <textarea id="tg-add-desc" placeholder="Описание (необязательно)" maxlength="500" rows="3"></textarea>
            <button type="button" class="tg-done-btn" id="tg-add-save">Сохранить</button>
        </div>`)
        .openOn(state.map);
});

function saveNewMarker() {
    if (!pendingPos) return;
    const m = {
        id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        title: document.getElementById("tg-add-title").value.trim() || "Моя метка",
        desc: document.getElementById("tg-add-desc").value.trim(),
        cat: document.getElementById("tg-add-cat").value,
        pos: pendingPos, user: true
    };
    pendingPos = null;
    state.markers.push(m);
    saveUserMarkers();
    state.map.closePopup();
    setAddMode(false);
    buildMarkers();
    renderFilters();
}

function deleteUserMarker(id) {
    const m = state.markers.find(x => String(x.id) === String(id) && x.user);
    if (!m || !confirm("Удалить эту метку?")) return;
    state.map.closePopup();
    state.markers = state.markers.filter(x => x !== m);
    state.found.delete(String(m.id));
    saveFound();
    saveUserMarkers();
    buildMarkers();
    renderFilters();
}
document.getElementById("add-marker-btn").addEventListener("click", () => setAddMode(!state.adding));
document.addEventListener("keydown", e => { if (e.key === "Escape" && state.adding) setAddMode(false); });

function exportProgress() {
    const payload = {
        app: "tainted_grail_map_progress",
        map: state.mapId,
        updatedAt: new Date().toISOString(),
        foundCount: state.found.size,
        found: [...state.found],
        ...marks.exportFields(),
        customMarkers: state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }))
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    a.download = `tainted_grail_${state.mapId}_progress_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setIoStatus(`Сохранено: ${payload.found.length} отметок, ${payload.customMarkers.length} своих меток.`);
}
async function importProgress(file) {
    try {
        const data = JSON.parse(await file.text());
        if (!data || data.app !== "tainted_grail_map_progress" || !Array.isArray(data.found)) throw new Error("это не файл прогресса Tainted Grail");
        if (data.map && data.map !== state.mapId) throw new Error("файл относится к другой карте");
        const known = new Set(state.markers.map(m => String(m.id)));
        const before = state.found.size;
        data.found.map(String).forEach(id => state.found.add(id));
        const notesAdded = marks.merge(data);
        let added = 0;
        (Array.isArray(data.customMarkers) ? data.customMarkers : []).forEach(m => {
            if (!m || !Array.isArray(m.pos) || !CAT_BY_KEY[m.cat] || !isFinite(m.pos[0]) || !isFinite(m.pos[1]) || known.has(String(m.id))) return;
            state.markers.push({ id: String(m.id), title: String(m.title || "Моя метка").slice(0, 80), desc: String(m.desc || "").slice(0, 500), cat: m.cat, pos: [+m.pos[0], +m.pos[1]], user: true });
            added++;
        });
        saveFound();
        if (added) saveUserMarkers();
        buildMarkers();
        renderFilters();
        setIoStatus(`Импортировано: +${state.found.size - before} отметок, +${added} своих меток${notesAdded ? `, +${notesAdded} заметок и флажков` : ""}.`);
    } catch (err) {
        setIoStatus("Ошибка импорта: " + (err.message || "неверный файл"));
    }
}
document.getElementById("export-progress-btn").addEventListener("click", exportProgress);
document.getElementById("import-progress-btn").addEventListener("click", () => document.getElementById("import-progress-input").click());
document.getElementById("import-progress-input").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0];
    if (f) importProgress(f);
    e.target.value = "";
});

// ---------- Загрузочный экран (средневековая тема Tainted Grail) ----------
const loaderShownAt = performance.now();

// Основные метки карты
function buildBase() {
    return ((state.raw && state.raw.markers) || [])
        .filter(m => isFinite(m.lat) && isFinite(m.lng))
        .map(m => ({ ...m, cat: refineCategory(m), pos: markerPos(m, mapCfg.rect, mapCfg.fit) }))
        .filter(m => m.cat);
}

renderMapSwitch();
// ---------- Заметки к меткам, настройки показа в облаке, прогресс по регионам (../js/map-extras.js) ----------
const marks = MapExtras.marks({
    key: kind => "tg_" + kind + "_" + state.mapId, map: () => state.map, markers: () => state.markers,
    onSave: () => cloudPush("mapProgress", { foundIds: [...state.found] }),
    onChange: () => redrawPins(),
    onFilter: () => { applyVisibility(); applyFoundVisibility(); redrawPins(); }
});
const settings = MapExtras.settingsSync({
    pfx: "tg", cloud: () => cloud,
    read: () => ({ hidden: [...state.hidden], hideFound: state.hideFound }),
    apply: applySettings
});
// Выбор категорий и «Скрыть отмеченные», пришедшие с другого устройства
function applySettings(s) {
    state.hidden = new Set(s.hidden.filter(k => CAT_BY_KEY[k]));
    state.hideFound = s.hideFound;
    try { localStorage.setItem("tg_hide_found", state.hideFound ? "1" : ""); } catch (e) { /* localStorage недоступен */ }
    const b = document.getElementById("hide-found-btn");
    b.setAttribute("aria-pressed", String(state.hideFound));
    b.textContent = state.hideFound ? "Показать отмеченные" : "Скрыть отмеченные";
    renderFilters();
    applyVisibility();
    applyFoundVisibility();
}
const regionProgress = MapExtras.mapsProgress({
    anchor: document.getElementById("map-switch"), storeKey: "tg_regions_open",
    maps: MAPS.map(m => ({ id: m.id, name: m.name, file: `tainted_grail_${m.id}_markers.json`, href: mapHref(m.id) })),
    currentId: state.mapId, foundKey: id => "tg_found_" + id, cloud: () => cloud, cloudDocId: id => "tg_" + id
});
const renderRegionProgress = (found, total) => regionProgress.render({ found, total });
// Фильтр «Мои отметки», режим «только карта», горячие клавиши, правка места метки, последняя карта для главной
marks.filterUI(document.getElementById("hide-found-btn").closest(".btn-group"));
MapExtras.hotkeys({ map: () => state.map, focus: focusView });
MapExtras.recordVisit("tainted", state.mapId);
MapExtras.setContext({
    map: () => state.map,
    marker: id => state.markers.find(x => String(x.id) === String(id) && !x.user),
    toData: p => {
        // обратное к markerPos: пиксели карты → координаты MapGenie из файла меток
        const r = mapCfg.rect, fit = mapCfg.fit || [0, 0, 1, 1];
        const xFrac = p.lng / REGION, yFrac = 1 - p.lat / REGION;
        const u = (xFrac - r[0]) / (r[2] - r[0]), v = (r[3] - yFrac) / (r[3] - r[1]);
        const u0 = (u - fit[0]) / (fit[2] - fit[0]), v0 = (v - fit[1]) / (fit[3] - fit[1]);
        return { lat: +(DATA_BOUNDS.lat[0] + v0 * (DATA_BOUNDS.lat[1] - DATA_BOUNDS.lat[0])).toFixed(2), lng: +(DATA_BOUNDS.lng[0] + u0 * (DATA_BOUNDS.lng[1] - DATA_BOUNDS.lng[0])).toFixed(2) };
    },
});

loadFound();
renderFilters();
document.getElementById("map-empty").style.display = "none";

fetch(`data/tainted_grail_${state.mapId}_markers.json`)
    .then(r => r.json())
    .then(d => {
        state.raw = d;
        state.markers = buildBase().concat(loadUserMarkers());
        state.loaded = true;
        cloud.base = new Set(state.found);
        marks.snapshot();
        buildMarkers();
        renderFilters();
        cloudPull();
        hideMapLoader();
        applyUrlCategory(); // ?cat=<категория>
    })
    .catch(() => {
        hideMapLoader();
        const el = document.getElementById("map-empty");
        el.textContent = "Не удалось загрузить метки (откройте страницу через веб-сервер, а не file://)";
        el.style.display = "grid";
    });

// ---------- Вход через Google (тот же Firebase-проект, что и у Stellar Blade) ----------
const GOOGLE_BTN_HTML = '<svg class="google-icon" width="14" height="14" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span>Войти</span>';

function initAuth() {
    const btn = document.getElementById("auth-btn");
    const statusEl = document.getElementById("auth-status");
    const avatar = document.getElementById("auth-avatar");
    btn.innerHTML = GOOGLE_BTN_HTML;
    const lazy = window.BPFirebase; // ../js/firebase-lazy.js: Firebase грузится по требованию, а не в <head>
    if (!lazy) return;
    let auth = null, ready = null;

    function start() {
        if (ready) return ready;
        ready = lazy.load().then(firebase => {
            if (!firebase.apps.length) firebase.initializeApp({
                apiKey: "AIzaSyBZ29h18Z1k0gE4dAEca5JH8yePQgxhaII",
                authDomain: "broskiplaymaps.firebaseapp.com",
                projectId: "broskiplaymaps",
                appId: "1:418362476965:web:59ce4e677b1a0a84d7404c"
            });
            auth = firebase.auth();
            if (typeof firebase.firestore === "function") cloud.db = firebase.firestore();
            auth.onAuthStateChanged(onUser);
            return auth;
        }).catch(err => {
            console.warn("Firebase не загружен — вход через Google недоступен, карта работает локально.", err);
            ready = null;
            return null;
        });
        return ready;
    }

    function onUser(user) {
        lazy.setSignedIn(!!user);
        cloud.user = user;
        if (user) {
            cloudPull();
            statusEl.innerHTML = `<b>${escapeHtml(user.displayName || user.email || "Google")}</b><br><span class="auth-online">● Облако активно</span>`;
            btn.textContent = "Выйти";
            btn.classList.add("logout");
            if (user.photoURL) {
                avatar.referrerPolicy = "no-referrer";
                avatar.onload = () => { avatar.style.display = "block"; avatar.parentElement.classList.add("has-avatar"); };
                avatar.onerror = () => { avatar.style.display = "none"; avatar.parentElement.classList.remove("has-avatar"); };
                avatar.src = user.photoURL;
            }
        } else {
            statusEl.innerHTML = "<b>Локальный режим</b><br><span>Синхронизация выключена</span>";
            btn.innerHTML = GOOGLE_BTN_HTML;
            btn.classList.remove("logout");
            avatar.style.display = "none";
            avatar.parentElement.classList.remove("has-avatar");
        }
    }

    btn.addEventListener("click", async () => {
        if (auth && auth.currentUser) { auth.signOut(); return; }
        if (!auth) btn.classList.add("is-loading");
        const a = auth || await start();
        btn.classList.remove("is-loading");
        if (!a) { alert("Вход через Google сейчас недоступен: Firebase не загрузился. Проверьте интернет и попробуйте ещё раз."); return; }
        if (a.currentUser) return; // сессия восстановилась сама, пока грузился Firebase
        a.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(err => {
            // Окно могли заблокировать, если Firebase догружался дольше, чем браузер помнит нажатие
            if (err && (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request")) {
                const label = btn.querySelector("span");
                if (label) label.textContent = "Ещё раз";
                return;
            }
            if (err && err.code === "auth/popup-closed-by-user") return;
            alert("Ошибка входа через Google: " + err.message);
        });
    });
    // Намерение войти: качаем Firebase заранее, чтобы к клику он был готов
    ["pointerenter", "touchstart", "focus"].forEach(type => btn.addEventListener(type, () => { start(); }, { once: true, passive: true }));
    // Уже входил — поднимаем сессию и облако после загрузки карты
    lazy.afterLoad(() => lazy.hasSavedSession().then(saved => { if (saved) start(); }));
}
initAuth();
