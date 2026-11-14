// Интерактивная карта TES IV: Oblivion Remastered (Сиродил и Дрожащие острова). Данные и тайлы — из MapGenie.
// Категории и иконки — в categories.js. Здесь: карта, метки, прогресс, облако.

// ---------- Карты и координаты ----------
// Координаты меток — обычные широта/долгота (Web Mercator, как у MapGenie): L.CRS.EPSG3857.
// Тайлы и картинки из окон меток лежат в репозитории oblivion-remake-assets (GitHub Pages):
// tiles/<карта>/<z>/<x>/<y>.webp (список существующих — manifest.json в той же папке) и popups/<id>.webp.
// В данных меток поле img — путь вида popups/<id>.webp; ссылки http(s) остаются как есть.
const ASSETS_ROOT = "https://broskiplay.github.io/oblivion-remake-assets";
const MAPS = {
    "cyrodiil": {
        id: "cyrodiil", name: "Сиродил", markersFile: "data/oblivion_cyrodiil_markers.json", tiles: `${ASSETS_ROOT}/tiles/cyrodiil`,
        tileMaxZ: 13, minZoom: 10, start: [0.79792, -0.85591], startZoom: 11, play: [[0.36, -1.2], [1.19, -0.25]]
    },
    "shivering-isles": {
        id: "shivering-isles", name: "Дрожащие острова", markersFile: "data/oblivion_shivering-isles_markers.json", tiles: `${ASSETS_ROOT}/tiles/shivering-isles`,
        tileMaxZ: 13, minZoom: 11, start: [0.7142, -0.76109], startZoom: 12, play: [[0.32, -1.0], [1.06, -0.38]]
    }
};
const MAP_ORDER = ["cyrodiil", "shivering-isles"];
const MAP_BOUNDS = [[0, -1.4], [1.4, 0]];   // сетка тайлов MapGenie
const TILE_MIN_Z = 8;
const BLANK_TILE = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const mapHref = (id, marker) => `${MAP_HOME}${id}/` + (marker == null ? "" : `?marker=${encodeURIComponent(marker)}`);
function pickMapId() {
    const q = urlMapId();
    if (q && MAPS[q]) return q;
    try { const last = localStorage.getItem("ob_last_map"); if (last && MAPS[last]) return last; } catch (e) { /* localStorage недоступен */ }
    return MAP_ORDER[0];
}
const state = {
    loaded: false, raw: null, adding: false, map: null, mapId: pickMapId(), xlinks: {},
    hidden: new Set(), markers: [], found: new Set(), layers: {}, hideFound: false, query: ""
};
const mapCfg = MAPS[state.mapId];
try { state.hideFound = !!localStorage.getItem("ob_hide_found"); } catch (e) { /* localStorage недоступен */ }
// Первый запуск: скрыты категории с hidden (службы и корень Нирна); дальше — выбор игрока
state.hidden = new Set(LS.read("ob_hidden_cats", null) ? LS.read("ob_hidden_cats", []).filter(k => CAT_BY_KEY[k]) : Object.keys(CAT_BY_KEY).filter(k => CAT_BY_KEY[k].hidden));
LS.write("ob_last_map", state.mapId);
document.title = `Интерактивная карта Oblivion Remastered — ${mapCfg.name} — BroskiPlay`;

// ---------- Описания (markdown MapGenie): **жирный**, [названия], списки, таблицы ----------
function renderDesc(src) {
    // Ссылки вида [Название](loc:123) превращаются в переход к метке (на этой или соседней карте)
    const inline = s => escapeHtml(s)
        .replace(/\[([^\]]+)\]\(loc:(\d+)\)/g, '<a href="#" class="ob-link" data-goto="$2">$1</a>')
        .replace(/\[([^\]]+)\]\s*\(https?:[^)]*\)/g, "$1")
        .replace(/\s*\(https?:\/\/[^)]*\)/g, "")
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[([^\]]+)\]/g, "<i>$1</i>").replace(/\*\*/g, "");
    const lines = String(src || "").replace(/\r/g, "").split("\n");
    let out = "", para = [], list = [], rows = [];
    const flushPara = () => { if (para.length) { out += `<p>${para.join("<br>")}</p>`; para = []; } };
    const flushList = () => { while (list.length) { out += "</li></ul>"; list.pop(); } };
    const flushTable = () => {
        if (!rows.length) return;
        const [head, ...body] = rows;
        out += `<table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>` +
            body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join("")}</tr>`).join("") + "</tbody></table>";
        rows = [];
    };
    for (const raw of lines) {
        const line = raw.replace(/\s+$/, "");
        if (!line.trim()) { flushPara(); flushList(); flushTable(); continue; }
        if (/^\s*\|/.test(line)) {
            flushPara(); flushList();
            if (/^\s*\|[\s:|-]+\|?\s*$/.test(line)) continue; // строка-разделитель |---|:--:|
            rows.push(line.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
            continue;
        }
        flushTable();
        const li = /^(\s*)[-*]\s+(.*)$/.exec(line);
        if (li) {
            flushPara();
            const n = li[1].length;
            if (!list.length || n > list[list.length - 1]) { out += "<ul>"; list.push(n); }
            else {
                while (list.length > 1 && n < list[list.length - 1]) { out += "</li></ul>"; list.pop(); }
                out += "</li>";
            }
            out += `<li>${inline(li[2])}`;
            continue;
        }
        flushList();
        para.push(inline(line.trim()));
    }
    flushPara(); flushList(); flushTable();
    return out;
}

// ---------- Прогресс (найдено) ----------
const foundKey = () => "ob_found_" + state.mapId;

// ---------- Облако: users/{uid}/mapProgress|customMarkers/ob_<карта> ----------
// Если документ в облаке есть — он главный (так удаления не «воскресают» со старых устройств).
const cloud = { db: null, user: null };
const cloudRef = (col, uid = cloud.user.uid) => cloud.db.collection("users").doc(uid).collection(col).doc("ob_" + state.mapId);

async function cloudPull() {
    if (!cloud.db || !cloud.user || !state.loaded) return;
    const uid = cloud.user.uid;
    try {
        const [prog, cm] = await Promise.all([cloudRef("mapProgress", uid).get(), cloudRef("customMarkers", uid).get()]);
        if (!cloud.user || cloud.user.uid !== uid) return;
        if (prog.exists && Array.isArray(prog.data().foundIds)) {
            state.found = mergeLocalEdits(new Set(prog.data().foundIds.map(String)));
            LS.write(foundKey(), [...state.found]);
        } else if (state.found.size) cloudPush("mapProgress", { foundIds: [...state.found] });
        if (marks.fromCloud(prog.exists ? prog.data() : null)) setTimeout(() => cloudPush("mapProgress", { foundIds: [...state.found] }), 0);
        if (cm.exists && Array.isArray(cm.data().markers)) {
            const mine = cm.data().markers.filter(m => m && m.pos && CAT_BY_KEY[m.cat]).map(m => ({ ...m, user: true }));
            state.markers = state.markers.filter(m => !m.user).concat(mine);
            saveUserMarkers(false);
        } else if (state.markers.some(m => m.user)) saveUserMarkers();
        buildMarkers();
        renderFilters();
        renderProgress();
        cloud.base = null;
        extrasAfterPull();
    } catch (err) { console.warn("Не удалось загрузить из Firestore:", err); }
}

// ---------- Прогресс и фильтры ----------
function counts() {
    const total = {}, done = {};
    state.markers.forEach(m => {
        total[m.cat] = (total[m.cat] || 0) + 1;
        if (state.found.has(String(m.id))) done[m.cat] = (done[m.cat] || 0) + 1;
    });
    return { total, done };
}

// В общий прогресс не входят ресурсные узлы, NPC, враги и задания (категории с track: false)
const tracked = m => CAT_BY_KEY[m.cat] && CAT_BY_KEY[m.cat].track !== false;

function renderProgress() {
    const list = state.markers.filter(tracked);
    const total = list.length;
    const found = list.reduce((n, m) => n + (state.found.has(String(m.id)) ? 1 : 0), 0);
    const pct = total ? Math.round(found / total * 100) : 0;
    document.getElementById("progress-value").textContent = pct + "%";
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-bar").setAttribute("aria-valuenow", String(pct));
    document.getElementById("progress-count").textContent = total ? `${found} из ${total} меток (без служб и заданий)` : "";
    renderRegionProgress(found, total);
}

function renderFilters() {
    const q = state.query;
    const { total, done } = counts();
    pruneLocate(total);
    document.getElementById("filters-container").innerHTML = locateClearBtn() + CATEGORIES.map(group => {
        // Категории, которых нет на текущей карте, в меню не показываем
        const items = group.items.filter(c => total[c.key] && (!q || c.name.toLowerCase().includes(q)));
        if (!items.length) return "";
        const gTotal = items.reduce((n, c) => n + (total[c.key] || 0), 0);
        const gDone = items.reduce((n, c) => n + (done[c.key] || 0), 0);
        const anyShown = items.some(c => !state.hidden.has(c.key));
        return `<div class="filter-group"><div class="filter-group-head"><div class="filter-group-title">${group.title} <span class="filter-hint">${gDone}/${gTotal}</span></div>` +
            `<button type="button" class="group-toggle" data-group="${escapeHtml(group.title)}">${anyShown ? "скрыть" : "показать"}</button></div>` +
            items.map(c => `<div class="filter-row"><button type="button" class="filter-item${state.hidden.has(c.key) ? " disabled" : ""}${total[c.key] ? "" : " is-empty"}" data-cat="${c.key}"><span class="filter-name"><i class="ob-filter-icon" style="background:${c.color}">${iconSvg(c.icon)}</i>${c.name}</span><span class="filter-count">${done[c.key] || 0}/${total[c.key] || 0}</span></button>${locateBtn(c, total)}</div>`).join("") +
            `</div>`;
    }).join("") + `<p class="filters-note">Двойной клик по категории — показать только её.</p>`;
}

// ---------- Метки на canvas ----------
// Тысяча DOM-элементов с тенями и поворотом перерисовывается при каждом сдвиге и зуме, поэтому карта
// дёргалась. Метки рисуются одним canvas из готовых спрайтов: панорамирование — это сдвиг одного слоя.
// Спрайт: размер w×h, остриё капельки в точке (ax, ay) — она совпадает с координатой метки.
const PIN = { w: 48, h: 64, cx: 24, cy: 26, r: 14, ax: 24, ay: 46, hover: 1.15 };
// Меток тысячи, и стоят они густо: рисуем их мельче, а при приближении (с z14) — крупнее
const pinScale = z => z >= 14 ? 1.05 : z <= 10 ? 0.62 : 0.62 + 0.43 * (z - 10) / 4;

// Иконки — собственные SVG-контуры из categories.js, рисуются Path2D (шрифт иконок не нужен)
const iconPaths = new Map();
function drawIcon(ctx, name, cx, cy, size) {
    const ic = ICONS[name];
    if (!ic) return;
    let path = iconPaths.get(name);
    if (!path) { path = new Path2D(ic.d); iconPaths.set(name, path); }
    ctx.save();
    ctx.translate(cx - size / 2, cy - size / 2);
    ctx.scale(size / 24, size / 24);
    ctx.fillStyle = "#fff";
    ctx.fill(path, ic.eo === false ? "nonzero" : "evenodd");
    ctx.restore();
}

// Как у найденных меток: цвет на 70% к серому
function desaturate(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const gray = r * 0.3 + g * 0.59 + b * 0.11;
    const mix = v => Math.round(v + (gray - v) * k);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function buildPinSprite(cat, found) {
    const k = L.Browser.retina ? 2 : 1;
    const def = CAT_BY_KEY[cat];
    const g = geom(cat);
    const canvas = document.createElement("canvas");
    canvas.width = g.w * k; canvas.height = g.h * k;
    const ctx = getCtx(canvas);
    ctx.scale(k, k);

    if (g === DOT) {
        NMPin.dot(ctx, g.cx, g.cy, g.r, found ? desaturate(def.color, 0.7) : def.color, k, "rgba(255,255,255,.85)");
        drawIcon(ctx, def.icon, g.cx, g.cy, 12);
        if (!found) return canvas;
        ctx.font = "700 10px sans-serif";
        ctx.fillStyle = "#9be29b";
        ctx.fillText("✓", g.cx, g.cy - 14);
        const faded = document.createElement("canvas");
        faded.width = canvas.width; faded.height = canvas.height;
        const fctx = getCtx(faded);
        fctx.globalAlpha = 0.45;
        fctx.drawImage(canvas, 0, 0);
        return faded;
    }

    ctx.save();
    ctx.translate(PIN.cx, PIN.cy);
    ctx.rotate(-Math.PI / 4);
    NMPin.drop(ctx, r => teardropPath(ctx, r), PIN.r, found ? desaturate(def.color, 0.7) : def.color, k, "rgba(255,255,255,.85)"); // объёмный пин: ../js/nm-pin.js
    ctx.restore();

    drawIcon(ctx, def.icon, PIN.cx, PIN.cy, 17);

    if (!found) return canvas;
    ctx.font = "700 11px sans-serif";
    ctx.shadowColor = "#000"; ctx.shadowBlur = 3 * k;
    ctx.fillStyle = "#9be29b";
    ctx.fillText("✓", PIN.cx, PIN.cy - 20);

    // Найденные — полупрозрачные целиком
    const faded = document.createElement("canvas");
    faded.width = canvas.width; faded.height = canvas.height;
    const fctx = getCtx(faded);
    fctx.globalAlpha = 0.45;
    fctx.drawImage(canvas, 0, 0);
    return faded;
}

// Слой рисует метки в порядке «север → юг»: южные поверх северных
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
        const tick = () => {
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
    // это сотни МБ видеопамяти, а на краях при сдвиге было пусто.
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
        const p = this._point, m = 10, g = geom(this.options.cat), sc = pinScale(mapZoom(this._map)); // запас под увеличение при наведении
        this._pxBounds = L.bounds(
            [p.x - g.ax * sc - m, p.y - g.ay * sc - m],
            [p.x + (g.w - g.ax) * sc + m, p.y + (g.h - g.ay) * sc + m]
        );
    },
    _empty() { return !this._renderer._bounds.intersects(this._pxBounds); },
    _containsPoint(pt) {
        // Круг по «головке» капельки (или по самой точке); на тач-экранах с запасом под палец
        const tol = L.Browser.touch ? 8 : 0, g = geom(this.options.cat), sc = pinScale(mapZoom(this._map));
        return pt.distanceTo(L.point(this._point.x, this._point.y - (g === PIN ? PIN.r * sc : 0))) <= (g.r + 1) * sc + tol;
    },
    _updatePath() {
        if (!this._renderer._drawing || this._empty()) return;
        this._drawAt(this._renderer._ctx, this._point.x, this._point.y);
    },
    _drawAt(ctx, x, y) {
        const s = pinSprite(this.options.cat, this.options.found), g = geom(this.options.cat);
        const k = pinScale(mapZoom(this._map)) * (this.options.hover ? g.hover : 1);
        ctx.globalAlpha = 1;
        if (litRank(this)) drawGlow(ctx, x, y, g, k);
        ctx.drawImage(s, x - g.ax * k, y - g.ay * k, g.w * k, g.h * k);
        MapExtras.badges(ctx, x + (g.cx - g.ax) * k, y + (g.cy - g.ay) * k, g.r * k, this.options.mid);
    },
    // Попап всегда над остриём метки, а не там, куда попал клик (поведение L.Marker)
    _getPopupAnchor() { return [0, (geom(this.options.cat) === PIN ? -36 : -14) * pinScale(mapZoom(this._map))]; },
    openPopup() { return L.Layer.prototype.openPopup.call(this, this._latlng); }
});

let pinRenderer = null;

// Подсказка с названием метки; на тач-экранах не нужна
const hoverTip = L.tooltip({ direction: "top", offset: [0, -36], opacity: 1, className: "ob-tip" });

const TAG_NAMES = { ft: "Быстрое перемещение", rm: "Ремастер" };
function popupHtml(m) {
    const c = CAT_BY_KEY[m.cat];
    const done = state.found.has(String(m.id));
    const tags = (m.tags || []).map(t => `<span class="ob-tag">${escapeHtml(TAG_NAMES[t] || t)}</span>`).join("");
    const en = m.titleEn && m.titleEn !== m.title ? `<span class="ob-popup-en" title="Название в оригинале">${escapeHtml(m.titleEn)}</span>` : "<span></span>";
    return `<div class="ob-popup">
        <div class="ob-popup-cat" style="color:${c.color}"><span class="ob-popup-icon" style="background:${c.color}">${iconSvg(c.icon)}</span>${c.name}</div>
        <h3>${escapeHtml(m.title || "Без названия")}</h3>
        <div class="ob-popup-meta">${en}<button type="button" class="ob-link-btn" data-copy="${m.id}" title="Скопировать ссылку на эту метку">Ссылка</button></div>
        ${tags ? `<div class="ob-tags">${tags}</div>` : ""}
        ${m.img ? `<img class="ob-popup-img" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(popupImgUrl(m.img))}" data-full="${escapeHtml(popupImgUrl(m.img))}" alt="" title="Открыть изображение" onerror="this.remove()">` : ""}
        ${m.desc ? `<div class="ob-desc">${renderDesc(m.desc)}</div>` : ""}
        ${m.user ? `<button type="button" class="ob-del-btn" data-id="${m.id}">Удалить свою метку</button>` : ""}
        ${marks.html(m.id)}
        <button type="button" class="ob-done-btn${done ? " is-done" : ""}" data-id="${m.id}">${done ? "✓ Найдено — отменить" : "Отметить найденным"}</button>
    </div>`;
}

function toast(text) {
    const el = document.getElementById("ob-toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2200);
}

// Метки, стоящие «друг в друге» (при сильном сближении на карте): в попапе появляются стрелки для переключения между ними (../js/marker-stack.js)
const markerStack = MarkerStack.init({ map: () => state.map, markers: () => state.markers, render: popupHtml, radius: m => 1.6 * geom(m.cat).r * pinScale(mapZoom(state.map)) });

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
    renderProgress();
    renderSearchResults();
}

// Метки категории создаются при первом показе: узлов ресурсов больше четырёх тысяч, а по умолчанию они скрыты
function ensureLayer(key) {
    if (state.layers[key]) return state.layers[key];
    const layer = state.layers[key] = L.layerGroup();
    state.markers.forEach(m => {
        if (m.cat !== key) return;
        m._leaflet = new PinMarker(m.pos, { renderer: pinRenderer, cat: m.cat, found: state.found.has(String(m.id)), mid: String(m.id) })
            .bindPopup(() => markerStack.html(m), { maxWidth: 320, maxHeight: 420, className: "ob-popup-wrap", autoPanPadding: [30, 30], keepInView: false });
        if (!markerHidden(m)) m._leaflet.addTo(layer);
        m._leaflet.on("mouseover", () => {
            m._leaflet.options.hover = true;
            m._leaflet.redraw();
            if (m.title && !L.Browser.mobile) {
                hoverTip.options.offset = L.point(0, (geom(m.cat) === PIN ? -36 : -14) * pinScale(mapZoom(state.map)));
                state.map.openTooltip(hoverTip.setContent(escapeHtml(m.title)), m._leaflet.getLatLng());
            }
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
    return layer;
}

function applyVisibility() {
    Object.keys(CAT_BY_KEY).forEach(key => {
        const hide = catHidden(key);
        const layer = hide ? state.layers[key] : ensureLayer(key);
        if (!layer) return;
        const shown = state.map.hasLayer(layer);
        if (hide && shown) state.map.removeLayer(layer);
        else if (!hide && !shown) state.map.addLayer(layer);
    });
    LS.write("ob_hidden_cats", [...state.hidden]);
    settings.touch();
}

function buildMarkers() {
    Object.values(state.layers).forEach(l => state.map.removeLayer(l));
    state.layers = {};
    state.markers.forEach(m => { m._leaflet = null; });
    applyVisibility();
    searchIndex = null;
}

// ---------- Поиск по меткам ----------
let searchIndex = null;
function buildSearchIndex() {
    return searchIndex = state.markers.map(m => ({ m, title: String(m.title || "").toLowerCase(), hay: (String(m.title || "") + " " + String(m.titleEn || "") + " " + (CAT_BY_KEY[m.cat] ? CAT_BY_KEY[m.cat].name : "")).toLowerCase(), desc: String(m.desc || "").toLowerCase() }));
}
function renderSearchResults() {
    const box = document.getElementById("search-results");
    const q = state.query;
    if (q.length < 2) { box.classList.remove("open"); box.innerHTML = ""; return; }
    const words = q.split(/\s+/).filter(Boolean);
    const scored = [];
    for (const it of searchIndex || buildSearchIndex()) {
        if (!words.every(w => it.hay.includes(w) || it.desc.includes(w))) continue;
        const inTitle = words.every(w => it.title.includes(w));
        scored.push({ it, score: (it.title === q ? 0 : it.title.startsWith(q) ? 1 : inTitle ? 2 : words.every(w => it.hay.includes(w)) ? 3 : 4) });
    }
    scored.sort((a, b) => a.score - b.score || a.it.title.localeCompare(b.it.title));
    const shown = scored.slice(0, 40);
    box.classList.add("open");
    box.innerHTML = shown.length
        ? shown.map(({ it }) => {
            const m = it.m, c = CAT_BY_KEY[m.cat];
            return `<button type="button" class="search-item${state.found.has(String(m.id)) ? " is-done" : ""}" data-marker="${escapeHtml(m.id)}" role="option"><i class="ob-filter-icon" style="background:${c.color}">${iconSvg(c.icon)}</i><span class="si-title">${escapeHtml(m.title || "Без названия")}</span><span class="si-zone">${escapeHtml(c.name)}</span></button>`;
        }).join("") + (scored.length > shown.length ? `<div class="search-empty">Показано ${shown.length} из ${scored.length}. Уточните запрос.</div>` : "")
        : `<div class="search-empty">Ничего не найдено</div>`;
}

function focusMarker(id, { fly = true } = {}) {
    const m = state.markers.find(x => String(x.id) === String(id));
    if (!m) return false;
    if (state.hidden.has(m.cat)) { state.hidden.delete(m.cat); renderFilters(); applyVisibility(); }
    const open = () => {
        if (m._leaflet && state.layers[m.cat] && state.layers[m.cat].hasLayer(m._leaflet)) m._leaflet.openPopup();
        else L.popup({ className: "ob-popup-wrap", maxWidth: 320, offset: [0, -4] }).setLatLng(m.pos).setContent(popupHtml(m)).openOn(state.map);
    };
    const zoom = Math.max(state.map.getZoom(), 13);
    if (!fly) { state.map.setView(m.pos, zoom, { animate: false }); open(); return true; }
    state.map.once("moveend", open);
    state.map.flyTo(m.pos, zoom, { duration: 0.7 });
    return true;
}

// Метка может быть на другой карте (например, «Дверь в Сиродил» на Дрожащих островах): тогда переключаем карту
function goToMarker(id) {
    if (focusMarker(id)) return;
    const other = state.xlinks[String(id)];
    if (other && MAPS[other]) { location.href = mapHref(other, id); return; }
    toast("Эта метка не найдена на карте");
}

function closeLightbox() { const lb = document.getElementById("ob-lightbox"); if (lb) lb.remove(); }
function openLightbox(src) {
    closeLightbox();
    const lb = document.createElement("div");
    lb.id = "ob-lightbox";
    lb.innerHTML = `<img src="${escapeHtml(src)}" alt=""><button type="button" aria-label="Закрыть">×</button>`;
    lb.addEventListener("click", closeLightbox);
    document.body.appendChild(lb);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

document.addEventListener("click", async e => {
    const img = e.target.closest(".ob-popup-img");
    if (img) { openLightbox(img.dataset.full || img.src); return; }
    const del = e.target.closest(".ob-del-btn");
    if (del) { deleteUserMarker(del.dataset.id); return; }
    if (e.target.closest("#ob-add-save")) { saveNewMarker(); return; }
    const btn = e.target.closest(".ob-done-btn");
    if (btn) { toggleFound(btn.dataset.id); return; }
    const go = e.target.closest(".ob-link");
    if (go) { e.preventDefault(); goToMarker(go.dataset.goto); return; }
    const copy = e.target.closest("[data-copy]");
    if (copy) { copyMarkerLink(copy.dataset.copy); return; }
    const hit = e.target.closest(".search-item");
    if (hit) { focusMarker(hit.dataset.marker); if (L.Browser.mobile && window.innerWidth <= 480) toggleSidebar(); return; }
    const gt = e.target.closest(".group-toggle");
    if (gt) {
        const group = CATEGORIES.find(g => g.title === gt.dataset.group);
        const anyShown = group.items.some(c => !state.hidden.has(c.key));
        group.items.forEach(c => anyShown ? state.hidden.add(c.key) : state.hidden.delete(c.key));
        renderFilters();
        applyVisibility();
        return;
    }
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
document.addEventListener("dblclick", e => {
    const item = e.target.closest(".filter-item");
    if (!item) return;
    state.hidden = new Set(Object.keys(CAT_BY_KEY).filter(k => k !== item.dataset.cat));
    renderFilters();
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
    LS.write("ob_hide_found", state.hideFound ? "1" : "");
    settings.touch();
    applyFoundVisibility();
});
document.getElementById("search-input").addEventListener("input", e => {
    state.query = e.target.value.trim().toLowerCase();
    renderFilters();
    renderSearchResults();
});

document.getElementById("sidebar-toggle-btn").addEventListener("click", toggleSidebar);
document.getElementById("sidebar-collapse-mobile").addEventListener("click", toggleSidebar);

// ---------- Карта ----------
// Запас вокруг игровой области: иначе maxBounds ограничивает автопрокрутку попапа и карта «отпрыгивает» назад
const pad = 0.12;
state.map = L.map("map", {
    minZoom: mapCfg.minZoom, maxZoom: 15, zoomSnap: 0.25, bounceAtZoomLimits: false, attributionControl: false,
    scrollWheelZoom: false, // вместо него — плавный зум из ../js/smooth-zoom.js
    // Без плавного появления тайлов: при смене уровня новые тайлы проявлялись из прозрачности (~200 мс), и карта мигала
    fadeAnimation: false,
    maxBounds: [[mapCfg.play[0][0] - pad, mapCfg.play[0][1] - pad], [mapCfg.play[1][0] + pad, mapCfg.play[1][1] + pad]]
});
pinRenderer = new PinCanvas({ padding: 0.05 });
enableSmoothWheelZoom(state.map);

// Положение карты запоминаем отдельно для каждой карты: при следующем открытии продолжаем с того же места
const VIEW_KEY = "ob_view_" + state.mapId;
function restoreView() {
    const v = LS.read(VIEW_KEY, null);
    if (v && isFinite(v.lat) && isFinite(v.lng) && isFinite(v.zoom) && v.zoom >= mapCfg.minZoom) state.map.setView([v.lat, v.lng], v.zoom, { animate: false });
    else state.map.setView(mapCfg.start, mapCfg.startZoom, { animate: false });
}
state.map.on("moveend", () => {
    const c = state.map.getCenter();
    LS.write(VIEW_KEY, { lat: +c.lat.toFixed(5), lng: +c.lng.toFixed(5), zoom: state.map.getZoom() });
});
restoreView();

// Тайлы подложки (выгрузка tools/export-tiles.js, лежат в oblivion-remake-assets). Список существующих лежит в manifest.json
function addTiles(tileSet) {
    const MapTiles = L.TileLayer.extend({
        getTileUrl(c) { return tileSet.has(`${c.z}/${c.x}/${c.y}`) ? `${mapCfg.tiles}/${c.z}/${c.x}/${c.y}.webp` : BLANK_TILE; }
    });
    // Глубже tileMaxZ тайлов нет — картинка просто увеличивается (maxNativeZoom)
    new MapTiles("", { tileSize: 256, minZoom: TILE_MIN_Z, maxZoom: 15, minNativeZoom: TILE_MIN_Z, maxNativeZoom: mapCfg.tileMaxZ, bounds: MAP_BOUNDS, errorTileUrl: BLANK_TILE }).addTo(state.map);
}

function copyMarkerLink(id) {
    const url = location.origin + mapHref(state.mapId, id);
    const done = () => toast("Ссылка на метку скопирована");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => prompt("Ссылка на метку:", url));
    else prompt("Ссылка на метку:", url);
}

// ---------- Свои метки (хранятся в браузере пользователя) ----------
const userKey = () => "ob_user_" + state.mapId;
function loadUserMarkers() {
    return LS.read(userKey(), []).filter(m => m && m.pos && CAT_BY_KEY[m.cat]).map(m => ({ ...m, user: true }));
}
function saveUserMarkers(push = true) {
    const list = state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }));
    LS.write(userKey(), list);
    if (push) cloudPush("customMarkers", { markers: list });
}

state.map.on("click", e => {
    if (!state.adding) return;
    pendingPos = [e.latlng.lat, e.latlng.lng];
    const opts = CATEGORIES.map(g => `<optgroup label="${g.title}">${g.items.map(c => `<option value="${c.key}">${c.name}</option>`).join("")}</optgroup>`).join("");
    L.popup({ className: "ob-popup-wrap", closeOnClick: false })
        .setLatLng(e.latlng)
        .setContent(`<div class="ob-popup ob-add-form">
            <h3>Новая метка</h3>
            <select id="ob-add-cat">${opts}</select>
            <input type="text" id="ob-add-title" placeholder="Название" maxlength="80">
            <textarea id="ob-add-desc" placeholder="Описание (необязательно)" maxlength="500" rows="3"></textarea>
            <button type="button" class="ob-done-btn" id="ob-add-save">Сохранить</button>
        </div>`)
        .openOn(state.map);
});

function saveNewMarker() {
    if (!pendingPos) return;
    const m = {
        id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        title: document.getElementById("ob-add-title").value.trim() || "Моя метка",
        desc: document.getElementById("ob-add-desc").value.trim(),
        cat: document.getElementById("ob-add-cat").value,
        pos: pendingPos, user: true
    };
    pendingPos = null;
    state.markers.push(m);
    saveUserMarkers();
    state.map.closePopup();
    setAddMode(false);
    buildMarkers();
    renderFilters();
    renderProgress();
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
    renderProgress();
}
document.getElementById("add-marker-btn").addEventListener("click", () => setAddMode(!state.adding));
document.addEventListener("keydown", e => { if (e.key === "Escape" && state.adding) setAddMode(false); });

function exportProgress() {
    const payload = {
        app: "oblivion_map_progress",
        map: state.mapId,
        updatedAt: new Date().toISOString(),
        foundCount: state.found.size,
        found: [...state.found],
        ...marks.exportFields(),
        customMarkers: state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }))
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    a.download = `oblivion_progress_${state.mapId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setIoStatus(`Сохранено: ${payload.found.length} отметок, ${payload.customMarkers.length} своих меток.`);
}
async function importProgress(file) {
    try {
        const data = JSON.parse(await file.text());
        if (!data || data.app !== "oblivion_map_progress" || !Array.isArray(data.found)) throw new Error("это не файл прогресса Oblivion");
        const known = new Set(state.markers.map(m => String(m.id)));
        const before = state.found.size;
        data.found.map(String).forEach(id => state.found.add(id));
        const notesAdded = marks.merge(data);
        let added = 0;
        (Array.isArray(data.customMarkers) ? data.customMarkers : []).forEach(m => {
            if (!m || !m.pos || !CAT_BY_KEY[m.cat] || !isFinite(m.pos[0]) || !isFinite(m.pos[1]) || known.has(String(m.id))) return;
            state.markers.push({ id: String(m.id), title: String(m.title || "Моя метка").slice(0, 80), desc: String(m.desc || "").slice(0, 500), cat: m.cat, pos: [+m.pos[0], +m.pos[1]], user: true });
            added++;
        });
        saveFound();
        if (added) saveUserMarkers();
        buildMarkers();
        renderFilters();
        renderProgress();
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

// ---------- Загрузочный экран ----------
const loaderShownAt = performance.now();

// Основные метки карты: тексты уже на русском, английское название лежит в titleEn (для поиска)
function buildBase() {
    return ((state.raw && state.raw.markers) || [])
        .filter(m => isFinite(m.lat) && isFinite(m.lng) && CAT_BY_KEY[m.cat])
        .map(m => ({ ...m, id: String(m.id), pos: [m.lat, m.lng] }));
}

// ---------- Заметки к меткам, настройки показа в облаке, прогресс по регионам (../js/map-extras.js) ----------
const marks = MapExtras.marks({
    key: kind => "ob_" + kind + "_" + state.mapId, map: () => state.map, markers: () => state.markers,
    onSave: () => cloudPush("mapProgress", { foundIds: [...state.found] }),
    onChange: () => redrawPins(),
    onFilter: () => { applyVisibility(); applyFoundVisibility(); redrawPins(); }
});
const settings = MapExtras.settingsSync({
    pfx: "ob", cloud: () => cloud,
    read: () => ({ hidden: [...state.hidden], hideFound: state.hideFound }),
    apply: applySettings
});
// Выбор категорий и «Скрыть отмеченные», пришедшие с другого устройства
function applySettings(s) {
    state.hidden = new Set(s.hidden.filter(k => CAT_BY_KEY[k]));
    state.hideFound = s.hideFound;
    try { localStorage.setItem("ob_hide_found", state.hideFound ? "1" : ""); } catch (e) { /* localStorage недоступен */ }
    const b = document.getElementById("hide-found-btn");
    b.setAttribute("aria-pressed", String(state.hideFound));
    b.textContent = state.hideFound ? "Показать отмеченные" : "Скрыть отмеченные";
    renderFilters();
    applyVisibility();
    applyFoundVisibility();
}
const regionProgress = MapExtras.mapsProgress({
    anchor: document.querySelector(".progress-card"), storeKey: "ob_regions_open",
    maps: MAP_ORDER.map(id => ({ id, name: MAPS[id].name, file: MAPS[id].markersFile.split("/").pop(), href: mapHref(id) })),
    currentId: state.mapId, foundKey: id => "ob_found_" + id, cloud: () => cloud, cloudDocId: id => "ob_" + id
});
const renderRegionProgress = (found, total) => regionProgress.render({ found, total });
// Фильтр «Мои отметки», режим «только карта», горячие клавиши, правка места метки, последняя карта для главной
marks.filterUI(document.getElementById("hide-found-btn").closest(".btn-group"));
MapExtras.hotkeys({ map: () => state.map, focus: focusView });
MapExtras.recordVisit("oblivion", state.mapId);
MapExtras.setContext({
    map: () => state.map, toast,
    marker: id => state.markers.find(x => String(x.id) === String(id) && !x.user),
});

loadFound();
renderFilters();
renderProgress();

// ---------- Загрузка данных ----------
// Подложка не ждёт меток: тайлы добавляем, как только пришёл manifest.json (метки и прочие данные догружаются параллельно)
const tilesReady = fetch(`${mapCfg.tiles}/manifest.json`).then(r => r.ok ? r.json() : null).catch(() => null).then(manifest => {
    if (manifest) addTiles(new Set(manifest));
    else {
        const el = document.getElementById("map-empty");
        el.textContent = "Тайлы карты ещё не загружены: метки показаны без подложки";
        el.classList.add("is-note");
    }
});
Promise.all([
    tilesReady,
    fetch(mapCfg.markersFile).then(r => r.json())
]).then(([, data]) => {
    state.raw = data;
    state.xlinks = data.xlinks || {};
    state.markers = buildBase().concat(loadUserMarkers());
    state.loaded = true;
    cloud.base = new Set(state.found);
    marks.snapshot();
    buildMarkers();
    renderFilters();
    renderProgress();
    cloudPull();
    hideMapLoader();
    applyUrlCategory(); // ?cat=<категория>
    // Ссылка на метку: /<игра>/<карта>/?marker=<id>
    const wanted = new URLSearchParams(location.search).get("marker");
    if (wanted && !focusMarker(wanted, { fly: false })) toast("Метка по ссылке не найдена");
}).catch(() => {
    hideMapLoader();
    const el = document.getElementById("map-empty");
    el.textContent = "Не удалось загрузить карту (откройте страницу через веб-сервер, а не file://)";
    el.style.display = "grid";
});

// Переключатель карт
// Выпадающий список: переход на страницу /<игра>/<id>/
{
    const box = document.getElementById("map-switch");
    box.innerHTML = `<select class="map-select" aria-label="Выбор карты">${MAP_ORDER.map(id =>
        `<option value="${id}"${id === state.mapId ? " selected" : ""}>${escapeHtml(MAPS[id].name)}</option>`).join("")}</select>`;
    box.querySelector("select").addEventListener("change", e => { location.href = mapHref(e.target.value); });
}

// ---------- Вход через Google (тот же Firebase-проект, что и у остальных карт) ----------
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
