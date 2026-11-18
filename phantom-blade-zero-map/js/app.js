// Интерактивная карта Phantom Blade Zero: восемь карт — от Долины Плачущего ручья до Горы Разбитых Душ.
// Метки, названия и описания — etalongame.com (Гора Разбитых Душ — с mapgenie.io, перевод наш), тайлы подложки и картинки окон меток — mapgenie.io;
// категории — в categories.js. Здесь: карта, метки, прогресс, облако. Движок — копия карты Hogwarts Legacy
// (страницы /phantom-blade-zero-map/<карта>/ делает scripts/map_pages.py).

// ---------- Карты и координаты ----------
// Координаты меток — широта/долгота в системе MapGenie (Web Mercator, карта — клочок мира у 0°/0°).
// tools/build_data.py переводит в неё координаты etalon (у etalon они те же, умноженные на 2^8 или 2^7).
// Тайлы лежат в репозитории phantom-blade-assets (GitHub Pages): tiles/<карта>/<z>/<x>/<y>.webp — 256×256, z8–13
// (Долина — до z14, Багровый лес — до z15), обычная схема XYZ. play — рамка самой картинки карты.
// Картинки окон меток — там же, popups/<id>.webp (с MapGenie; у нескольких меток их две — img массивом).
// Список существующих тайлов — manifest.json в той же папке. labels — зумы, на которых видны подписи районов.
const ASSETS_ROOT = "https://broskiplay.github.io/phantom-blade-assets";
const MAPS = {
    "weeping-creek-valley": {
        id: "weeping-creek-valley", name: "Долина Плачущего ручья", markersFile: "data/phantomblade_weeping-creek-valley_markers.json", tiles: `${ASSETS_ROOT}/tiles/weeping-creek-valley`,
        tileExt: "webp", tileSize: 256, zoomOffset: 0, fit: true, labels: [0, 0],
        tileMinZ: 8, tileMaxZ: 14, minZoom: 10.75, maxZoom: 15.5, pinFull: 13.25, focusZoom: 13,
        play: [[0.43396, -0.97229], [0.97224, -0.43396]], tileBounds: [[0.43396, -0.97229], [0.97224, -0.43396]], background: "#000000"
    },
    "crimson-forest": {
        id: "crimson-forest", name: "Багровый лес", markersFile: "data/phantomblade_crimson-forest_markers.json", tiles: `${ASSETS_ROOT}/tiles/crimson-forest`,
        tileExt: "webp", tileSize: 256, zoomOffset: 0, fit: true, labels: [0, 0],
        tileMinZ: 8, tileMaxZ: 15, minZoom: 10.25, maxZoom: 16, pinFull: 13.25, focusZoom: 13,
        play: [[0.55205, -1.07666], [0.91457, -0.34504]], tileBounds: [[0.55205, -1.07666], [0.91457, -0.34504]], background: "#000000"
    },
    "village-of-lu": {
        id: "village-of-lu", name: "Деревня Лу", markersFile: "data/phantomblade_village-of-lu_markers.json", tiles: `${ASSETS_ROOT}/tiles/village-of-lu`,
        tileExt: "webp", tileSize: 256, zoomOffset: 0, fit: true, labels: [0, 0],
        tileMinZ: 8, tileMaxZ: 13, minZoom: 9.25, maxZoom: 14.5, pinFull: 12.25, focusZoom: 12,
        play: [[0.0, -1.40625], [1.40611, 0.0]], tileBounds: [[0.0, -1.40625], [1.40611, 0.0]], background: "#847463"
    },
    "pangzhen": {
        id: "pangzhen", name: "Панчжэнь", markersFile: "data/phantomblade_pangzhen_markers.json", tiles: `${ASSETS_ROOT}/tiles/pangzhen`,
        tileExt: "webp", tileSize: 256, zoomOffset: 0, fit: true, labels: [0, 0],
        tileMinZ: 8, tileMaxZ: 13, minZoom: 9.25, maxZoom: 14.5, pinFull: 12.25, focusZoom: 12,
        play: [[0.30762, -1.40625], [1.09857, 0.0]], tileBounds: [[0.30762, -1.40625], [1.09857, 0.0]], background: "#8b8370"
    },
    "the-mandates-encampment": {
        id: "the-mandates-encampment", name: "Лагерь Союза", markersFile: "data/phantomblade_the-mandates-encampment_markers.json", tiles: `${ASSETS_ROOT}/tiles/the-mandates-encampment`,
        tileExt: "webp", tileSize: 256, zoomOffset: 0, fit: true, labels: [0, 0],
        tileMinZ: 8, tileMaxZ: 13, minZoom: 9.25, maxZoom: 14.5, pinFull: 12.25, focusZoom: 12,
        play: [[0.0, -1.40625], [1.40611, 0.0]], tileBounds: [[0.0, -1.40625], [1.40611, 0.0]], background: "#a4835c"
    },
    "meigu-lake": {
        id: "meigu-lake", name: "Озеро Мэйгу", markersFile: "data/phantomblade_meigu-lake_markers.json", tiles: `${ASSETS_ROOT}/tiles/meigu-lake`,
        tileExt: "webp", tileSize: 256, zoomOffset: 0, fit: true, labels: [0, 0],
        tileMinZ: 8, tileMaxZ: 13, minZoom: 9.25, maxZoom: 14.5, pinFull: 12.25, focusZoom: 12,
        play: [[0.0, -1.40625], [1.40611, 0.0]], tileBounds: [[0.0, -1.40625], [1.40611, 0.0]], background: "#8c8b7c"
    },
    "mountain-of-imprisonment": {
        id: "mountain-of-imprisonment", name: "Гора Заточения", markersFile: "data/phantomblade_mountain-of-imprisonment_markers.json", tiles: `${ASSETS_ROOT}/tiles/mountain-of-imprisonment`,
        tileExt: "webp", tileSize: 256, zoomOffset: 0, fit: true, labels: [0, 0],
        tileMinZ: 8, tileMaxZ: 13, minZoom: 9.25, maxZoom: 14.5, pinFull: 12.25, focusZoom: 12,
        play: [[0.0, -1.40625], [1.40611, 0.0]], tileBounds: [[0.0, -1.40625], [1.40611, 0.0]], background: "#837b63"
    },
    "mount-soulrend": {
        id: "mount-soulrend", name: "Гора Разбитых Душ", markersFile: "data/phantomblade_mount-soulrend_markers.json", tiles: `${ASSETS_ROOT}/tiles/mount-soulrend`,
        tileExt: "webp", tileSize: 256, zoomOffset: 0, fit: true, labels: [0, 0],
        tileMinZ: 8, tileMaxZ: 13, minZoom: 9.25, maxZoom: 14.5, pinFull: 12.25, focusZoom: 12,
        play: [[0.0, -1.40625], [1.40611, 0.0]], tileBounds: [[0.0, -1.40625], [1.40611, 0.0]], background: "#7a7770"
    }
};
const MAP_ORDER = ["weeping-creek-valley", "crimson-forest", "village-of-lu", "pangzhen", "the-mandates-encampment", "meigu-lake", "mountain-of-imprisonment", "mount-soulrend"];

const mapHref = (id, marker) => `${MAP_HOME}${id}/` + (marker == null ? "" : `?marker=${encodeURIComponent(marker)}`);
function pickMapId() {
    const q = urlMapId();
    if (q && MAPS[q]) return q;
    try { const last = localStorage.getItem("pb_last_map"); if (last && MAPS[last]) return last; } catch (e) { /* localStorage недоступен */ }
    return MAP_ORDER[0];
}
const state = {
    loaded: false, raw: null, adding: false, map: null, mapId: pickMapId(), xlinks: {},
    hidden: new Set(), markers: [], found: new Set(), layers: null, pins: null, hideFound: false, query: ""
};
const mapCfg = MAPS[state.mapId];
try { state.hideFound = !!localStorage.getItem("pb_hide_found"); } catch (e) { /* localStorage недоступен */ }
// Первый запуск: скрыты категории с hidden (сейчас таких нет); дальше — выбор игрока
state.hidden = new Set(LS.read("pb_hidden_cats", null) ? LS.read("pb_hidden_cats", []).filter(k => CAT_BY_KEY[k]) : Object.keys(CAT_BY_KEY).filter(k => CAT_BY_KEY[k].hidden));
LS.write("pb_last_map", state.mapId);
document.title = `Интерактивная карта Phantom Blade Zero — ${mapCfg.name} — BroskiPlay`;
document.documentElement.style.setProperty("--map-bg", mapCfg.background);

// ---------- Описания (markdown MapGenie): **жирный**, [названия], списки, таблицы ----------
function renderDesc(src) {
    // Ссылки вида [Название](loc:123) превращаются в переход к метке (на этой или соседней карте)
    const inline = s => escapeHtml(s)
        .replace(/\[([^\]]+)\]\(loc:([\w-]+)\)/g, '<a href="#" class="pb-link" data-goto="$2">$1</a>')
        .replace(/\[([^\]]+)\]\s*\(https?:[^)]*\)/g, "$1")
        .replace(/\s*\(https?:\/\/[^)]*\)/g, "")
        .replace(/\((основное задание|побочное задание|задание спутника)\)/g, (_, k) => `<span class="pb-qtag pb-qtag-${k.startsWith("основное") ? "main" : "side"}">${k}</span>`)
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
const foundKey = () => "pb_found_" + state.mapId;

// ---------- Облако: users/{uid}/mapProgress|customMarkers/pb_<карта> ----------
// Если документ в облаке есть — он главный (так удаления не «воскресают» со старых устройств).
const cloud = { db: null, user: null };
const cloudRef = (col, uid = cloud.user.uid) => cloud.db.collection("users").doc(uid).collection(col).doc("pb_" + state.mapId);

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

// В общий прогресс не входят торговцы, персонажи, «интересные места» и «прочее» (категории с track: false)
const tracked = m => CAT_BY_KEY[m.cat] && CAT_BY_KEY[m.cat].track !== false;

function renderProgress() {
    const list = state.markers.filter(tracked);
    const total = list.length;
    const found = list.reduce((n, m) => n + (state.found.has(String(m.id)) ? 1 : 0), 0);
    const pct = total ? Math.round(found / total * 100) : 0;
    document.getElementById("progress-value").textContent = pct + "%";
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-bar").setAttribute("aria-valuenow", String(pct));
    document.getElementById("progress-count").textContent = total ? `${found} из ${total} меток (без торговцев и персонажей)` : "";
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
        return `<div class="filter-group" style="--g:${items[0].color}"><div class="filter-group-head"><div class="filter-group-title">${group.title} <span class="filter-hint">${gDone}/${gTotal}</span></div>` +
            `<button type="button" class="group-toggle" data-group="${escapeHtml(group.title)}">${anyShown ? "скрыть" : "показать"}</button></div>` +
            items.map(c => `<div class="filter-row"><button type="button" class="filter-item${state.hidden.has(c.key) ? " disabled" : ""}${total[c.key] ? "" : " is-empty"}" data-cat="${c.key}"><span class="filter-name"><i class="pb-filter-icon" style="background:${c.color}">${iconSvg(c.icon, c.ink)}</i>${c.name}</span><span class="filter-count">${done[c.key] || 0}/${total[c.key] || 0}</span></button>${locateBtn(c, total)}</div>`).join("") +
            `</div>`;
    }).join("") + `<p class="filters-note">Двойной клик по категории — показать только её.</p>`;
}

// ---------- Метки на canvas ----------
// Тысяча DOM-элементов с тенями и поворотом перерисовывается при каждом сдвиге и зуме, поэтому карта
// дёргалась. Метки рисуются одним canvas из готовых спрайтов: панорамирование — это сдвиг одного слоя.
// Спрайт: размер w×h, остриё капельки в точке (ax, ay) — она совпадает с координатой метки.
const PIN = { w: 48, h: 64, cx: 24, cy: 26, r: 14, ax: 24, ay: 46, hover: 1.15 };
// Меток тысячи, и стоят они густо: рисуем их мельче, а при приближении (с z14) — крупнее
const pinScale = z => z >= mapCfg.pinFull ? 1.05 : z <= mapCfg.minZoom ? 0.62 : 0.62 + 0.43 * (z - mapCfg.minZoom) / (mapCfg.pinFull - mapCfg.minZoom);

// Иконки — белые глифы из спрайта icons.png (categories.js: ICON_IMG). Цветной значок (ink) — глиф,
// перекрашенный через source-in на отдельном холсте. Пока спрайт не загрузился, пины рисуются без значка,
// после загрузки кэш спрайтов пинов сбрасывается и слой перерисовывается.
const tintedGlyphs = new Map();
function glyphCanvas(icon, color) {
    const key = icon.join(",") + "|" + (color || "");
    let c = tintedGlyphs.get(key);
    if (c) return c;
    const n = ICON_SHEET.cell;
    c = document.createElement("canvas");
    c.width = c.height = n;
    const g = getCtx(c);
    g.drawImage(ICON_IMG, icon[0], icon[1], n, n, 0, 0, n, n);
    if (color) { g.globalCompositeOperation = "source-in"; g.fillStyle = color; g.fillRect(0, 0, n, n); }
    tintedGlyphs.set(key, c);
    return c;
}
function drawIcon(ctx, icon, cx, cy, size, color) {
    if (!Array.isArray(icon) || !ICON_IMG.complete || !ICON_IMG.naturalWidth) return;
    ctx.drawImage(glyphCanvas(icon, color), cx - size / 2, cy - size / 2, size, size);
}
// спрайты уже лежат в WebGL — после загрузки иконок перерисовываем их там
if (!ICON_IMG.complete) ICON_IMG.addEventListener("load", () => { pinSprites.clear(); if (state.pins) state.pins.redrawSprites(); });

// Как у найденных меток: цвет на 70% к серому
function desaturate(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const gray = r * 0.3 + g * 0.59 + b * 0.11;
    const mix = v => Math.round(v + (gray - v) * k);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function buildPinSprite(cat, found) {
    const k = SPRITE_K;
    const def = CAT_BY_KEY[cat];
    const g = geom(cat);
    const canvas = document.createElement("canvas");
    canvas.width = g.w * k; canvas.height = g.h * k;
    const ctx = getCtx(canvas);
    ctx.scale(k, k);

    if (g === DOT) {
        NMPin.dot(ctx, g.cx, g.cy, g.r, found ? desaturate(def.color, 0.7) : def.color, k, def.ink ? "rgba(20,14,0,.7)" : "rgba(255,255,255,.85)");
        drawIcon(ctx, def.icon, g.cx, g.cy, 12, def.ink);
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
    NMPin.drop(ctx, r => teardropPath(ctx, r), PIN.r, found ? desaturate(def.color, 0.7) : def.color, k, def.ink ? "rgba(20,14,0,.7)" : "rgba(255,255,255,.85)"); // объёмный пин: ../js/nm-pin.js
    ctx.restore();

    drawIcon(ctx, def.icon, PIN.cx, PIN.cy, 17, def.ink);

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



function popupHtml(m) {
    const c = CAT_BY_KEY[m.cat];
    const done = state.found.has(String(m.id));
    const tags = "";
    const en = `<span class="pb-popup-en">${escapeHtml(mapCfg.name)}</span>`;
    return `<div class="pb-popup" style="--c:${c.color}">
        <div class="pb-popup-cat" style="color:${c.color}"><span class="pb-popup-icon" style="background:${c.color}">${iconSvg(c.icon, c.ink)}</span>${c.name}</div>
        <h3>${escapeHtml(m.title || "Без названия")}</h3>
        <div class="pb-popup-meta">${en}<button type="button" class="pb-link-btn" data-copy="${m.id}" title="Скопировать ссылку на эту метку">Ссылка</button></div>
        ${tags ? `<div class="pb-tags">${tags}</div>` : ""}
        ${[].concat(m.img || []).map(p => `<img class="pb-popup-img" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(popupImgUrl(p))}" data-full="${escapeHtml(popupImgUrl(p))}" alt="" title="Открыть изображение" onerror="this.remove()">`).join("")}
        ${m.desc ? `<div class="pb-desc">${renderDesc(m.desc)}</div>` : ""}
        ${c.about && !m.user ? `<div class="pb-about">${escapeHtml(c.about)}</div>` : ""}
        ${m.user ? `<button type="button" class="pb-del-btn" data-id="${m.id}">Удалить свою метку</button>` : ""}
        ${marks.html(m.id)}
        <button type="button" class="pb-done-btn${done ? " is-done" : ""}" data-id="${m.id}">${done ? "✓ Найдено — отменить" : "Отметить найденным"}</button>
    </div>`;
}

function toast(text) {
    const el = document.getElementById("pb-toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2200);
}

// Метки, стоящие «друг в друге» (при сильном сближении на карте): в попапе появляются стрелки для переключения между ними (../js/marker-stack.js)
const markerStack = MarkerStack.init({
    map: () => state.map, markers: () => state.markers, render: popupHtml, radius: m => 1.6 * geom(m.cat).r * pinScale(state.map.getZoom()),
    // как _point у Leaflet: мировые пиксели текущего зума, округлённые — та же граница «рядом», что на старой карте
    point: m => {
        if (!state.pins || !state.pins.has(m)) return null;
        const p = state.map.project(m.pos);
        return { x: Math.round(p.x), y: Math.round(p.y) };
    }
});

function toggleFound(id) {
    id = String(id);
    state.found.has(id) ? state.found.delete(id) : state.found.add(id);
    saveFound();
    if (state.found.has(id)) window.dispatchEvent(new CustomEvent("bp:found", { detail: { map: state.mapId, count: state.found.size } })); // окошко «Поддержать» (js/support-toast.js)
    const m = state.markers.find(x => String(x.id) === id);
    applyFoundVisibility(); // перестраивает метки на карте (state.pins.refresh)
    if (m) markerStack.refresh(m);
    renderFilters();
    renderProgress();
    renderSearchResults();
}

// ---------- Метки на карте (../js/bp-map.js: символы WebGL) ----------
// Показываются метки видимых категорий, кроме скрытых фильтрами «Скрыть отмеченные» / «Мои отметки»
const shownMarkers = () => state.markers.filter(m => !catHidden(m.cat) && !markerHidden(m));
const pinAnchor = m => () => [0, (geom(m.cat) === PIN ? -36 : -14) * pinScale(state.map.getZoom())];
// Окно метки — над остриём; markerStack добавляет полоску «‹ 1 из 3 ›», если метки стоят друг в друге
const openMarkerPopup = m => state.map.openPopup({ latlng: m.pos, content: () => markerStack.html(m), className: "pb-popup-wrap", source: m, anchor: pinAnchor(m) });

function initPins() {
    state.pins = state.map.addPins({
        geoms: [PIN, DOT], geom: m => geom(m.cat), scale: pinScale, ratio: SPRITE_K,
        list: shownMarkers, pos: m => m.pos,
        sprite: m => {
            const found = state.found.has(String(m.id));
            return { key: "pb-" + m.cat + (found ? "|1" : "|0"), draw: () => pinSprite(m.cat, found) };
        },
        // подсвеченные категории (кнопка с лупой): над остальными и со свечением; найденные не подсвечиваются
        lit: m => locateCats.size > 0 && locateCats.has(m.cat) && !state.found.has(String(m.id)),
        glow: glowSprite, glowScale: g => g.r / 14 < 0.8 ? 0.72 : 1,
        badges: m => MapExtras.markOf(String(m.id)), badgeSprite: MapExtras.badgeSprite, badgeR: 7, badgeRatio: 3,
        // круг по «головке» капельки (или по самой точке) с запасом под палец — как было на Leaflet
        hit: g => ({ dy: g === PIN ? PIN.r : 0, r: g.r + 1 }), tol: BPMap.Browser.touch ? 8 : 0
    });
    state.pins.on("click", m => openMarkerPopup(m));
    // Подсказка с названием метки; на тач-экранах не нужна
    state.pins.on("mouseover", m => { if (m.title && !BPMap.Browser.mobile) state.map.showTip(escapeHtml(m.title), m.pos, pinAnchor(m), "pb-tip"); });
    state.pins.on("mouseout", () => state.map.hideTip());
    // Правая кнопка мыши — быстро отметить найденным
    state.pins.on("contextmenu", m => {
        const wasFound = state.found.has(String(m.id));
        toggleFound(m.id);
        toast(wasFound ? "Отметка снята" : "Отмечено найденным: " + (m.title || "метка"));
    });
}

function refreshVisibility() { if (state.pins) state.pins.refresh(); }

function applyVisibility() {
    refreshVisibility();
    LS.write("pb_hidden_cats", [...state.hidden]);
    settings.touch();
}

function buildMarkers() {
    if (!state.pins) initPins();
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
            return `<button type="button" class="search-item${state.found.has(String(m.id)) ? " is-done" : ""}" data-marker="${escapeHtml(m.id)}" role="option"><i class="pb-filter-icon" style="background:${c.color}">${iconSvg(c.icon, c.ink)}</i><span class="si-title">${escapeHtml(m.title || "Без названия")}</span><span class="si-zone">${escapeHtml(c.name)}</span></button>`;
        }).join("") + (scored.length > shown.length ? `<div class="search-empty">Показано ${shown.length} из ${scored.length}. Уточните запрос.</div>` : "")
        : `<div class="search-empty">Ничего не найдено</div>`;
}

function focusMarker(id, { fly = true } = {}) {
    const m = state.markers.find(x => String(x.id) === String(id));
    if (!m) return false;
    if (state.hidden.has(m.cat)) { state.hidden.delete(m.cat); renderFilters(); applyVisibility(); }
    const open = () => {
        if (state.pins && state.pins.has(m)) openMarkerPopup(m);
        else state.map.openPopup({ latlng: m.pos, content: popupHtml(m), className: "pb-popup-wrap", offset: [0, -4] });
    };
    const zoom = Math.max(state.map.getZoom(), mapCfg.focusZoom);
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

function closeLightbox() { const lb = document.getElementById("pb-lightbox"); if (lb) lb.remove(); }
function openLightbox(src) {
    closeLightbox();
    const lb = document.createElement("div");
    lb.id = "pb-lightbox";
    lb.innerHTML = `<img src="${escapeHtml(src)}" alt=""><button type="button" aria-label="Закрыть">×</button>`;
    lb.addEventListener("click", closeLightbox);
    document.body.appendChild(lb);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

document.addEventListener("click", async e => {
    const img = e.target.closest(".pb-popup-img");
    if (img) { openLightbox(img.dataset.full || img.src); return; }
    const del = e.target.closest(".pb-del-btn");
    if (del) { deleteUserMarker(del.dataset.id); return; }
    if (e.target.closest("#pb-add-save")) { saveNewMarker(); return; }
    const btn = e.target.closest(".pb-done-btn");
    if (btn) { toggleFound(btn.dataset.id); return; }
    const go = e.target.closest(".pb-link");
    if (go) { e.preventDefault(); goToMarker(go.dataset.goto); return; }
    const copy = e.target.closest("[data-copy]");
    if (copy) { copyMarkerLink(copy.dataset.copy); return; }
    const hit = e.target.closest(".search-item");
    if (hit) { focusMarker(hit.dataset.marker); if (BPMap.Browser.mobile && window.innerWidth <= 480) toggleSidebar(); return; }
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
    LS.write("pb_hide_found", state.hideFound ? "1" : "");
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
// Карты MapGenie — клочок мира в 1–1,4°, поэтому запас — доля размера карты, а не градусы
const padLat = (mapCfg.play[1][0] - mapCfg.play[0][0]) * 0.25, padLng = (mapCfg.play[1][1] - mapCfg.play[0][1]) * 0.25;
state.map = BPMap.create("map", {
    minZoom: mapCfg.minZoom, maxZoom: mapCfg.maxZoom, zoomSnap: 0.25,
    maxBounds: [[mapCfg.play[0][0] - padLat, mapCfg.play[0][1] - padLng], [mapCfg.play[1][0] + padLat, mapCfg.play[1][1] + padLng]]
});

// Положение карты запоминаем отдельно для каждой карты: при следующем открытии продолжаем с того же места
const VIEW_KEY = "pb_view_" + state.mapId;
function restoreView() {
    const v = LS.read(VIEW_KEY, null);
    if (v && isFinite(v.lat) && isFinite(v.lng) && isFinite(v.zoom) && v.zoom >= mapCfg.minZoom) { state.map.setView([v.lat, v.lng], v.zoom, { animate: false }); return true; }
    // Первое открытие: пока нет меток — вся карта, после загрузки — область меток (fitToMarkers)
    state.map.fitBounds(mapCfg.play, { padding: [30, 30], animate: false });
    return false;
}
// Первое открытие: вписываем в окно область меток, а не всю подложку
function fitToMarkers() {
    const pts = state.markers.filter(m => !m.user).map(m => m.pos);
    if (pts.length) state.map.fitBounds(pts, { padding: [40, 40], animate: false });
}
state.map.on("moveend", () => {
    const c = state.map.getCenter();
    LS.write(VIEW_KEY, { lat: +c.lat.toFixed(5), lng: +c.lng.toFixed(5), zoom: state.map.getZoom() });
});
const viewRestored = restoreView();

// Локальные тайлы (экспорт tools/export-tiles.js). Список существующих лежит в manifest.json
function addTiles(tileSet) {
    // Глубже tileMaxZ тайлов нет — картинка просто увеличивается; тайлы 512 px: тайл z6 рисуется на зуме карты 7, как в Leaflet с zoomOffset -1
    state.map.addTiles({
        url: (z, x, y) => tileSet.has(`${z}/${x}/${y}`) ? `${mapCfg.tiles}/${z}/${x}/${y}.${mapCfg.tileExt}` : null,
        tileSize: mapCfg.tileSize, minNative: mapCfg.tileMinZ + mapCfg.zoomOffset, maxNative: mapCfg.tileMaxZ + mapCfg.zoomOffset, bounds: mapCfg.tileBounds
    });
}

function copyMarkerLink(id) {
    const url = location.origin + mapHref(state.mapId, id);
    const done = () => toast("Ссылка на метку скопирована");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => prompt("Ссылка на метку:", url));
    else prompt("Ссылка на метку:", url);
}

// ---------- Свои метки (хранятся в браузере пользователя) ----------
const userKey = () => "pb_user_" + state.mapId;
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
    state.map.openPopup({ latlng: e.latlng, className: "pb-popup-wrap", closeOnClick: false, content: `<div class="pb-popup pb-add-form">
            <h3>Новая метка</h3>
            <select id="pb-add-cat">${opts}</select>
            <input type="text" id="pb-add-title" placeholder="Название" maxlength="80">
            <textarea id="pb-add-desc" placeholder="Описание (необязательно)" maxlength="500" rows="3"></textarea>
            <button type="button" class="pb-done-btn" id="pb-add-save">Сохранить</button>
        </div>` });
});

function saveNewMarker() {
    if (!pendingPos) return;
    const m = {
        id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        title: document.getElementById("pb-add-title").value.trim() || "Моя метка",
        desc: document.getElementById("pb-add-desc").value.trim(),
        cat: document.getElementById("pb-add-cat").value,
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
        app: "phantomblade_map_progress",
        map: state.mapId,
        updatedAt: new Date().toISOString(),
        foundCount: state.found.size,
        found: [...state.found],
        ...marks.exportFields(),
        customMarkers: state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }))
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    a.download = `phantomblade_progress_${state.mapId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setIoStatus(`Сохранено: ${payload.found.length} отметок, ${payload.customMarkers.length} своих меток.`);
}
async function importProgress(file) {
    try {
        const data = JSON.parse(await file.text());
        if (!data || data.app !== "phantomblade_map_progress" || !Array.isArray(data.found)) throw new Error("это не файл прогресса карты Phantom Blade Zero");
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
    key: kind => "pb_" + kind + "_" + state.mapId, map: () => state.map, markers: () => state.markers,
    onSave: () => cloudPush("mapProgress", { foundIds: [...state.found] }),
    onChange: () => redrawPins(),
    onFilter: () => { applyVisibility(); applyFoundVisibility(); redrawPins(); }
});
const settings = MapExtras.settingsSync({
    pfx: "pb", cloud: () => cloud,
    read: () => ({ hidden: [...state.hidden], hideFound: state.hideFound }),
    apply: applySettings
});
// Выбор категорий и «Скрыть отмеченные», пришедшие с другого устройства
function applySettings(s) {
    state.hidden = new Set(s.hidden.filter(k => CAT_BY_KEY[k]));
    state.hideFound = s.hideFound;
    try { localStorage.setItem("pb_hide_found", state.hideFound ? "1" : ""); } catch (e) { /* localStorage недоступен */ }
    const b = document.getElementById("hide-found-btn");
    b.setAttribute("aria-pressed", String(state.hideFound));
    b.textContent = state.hideFound ? "Показать отмеченные" : "Скрыть отмеченные";
    renderFilters();
    applyVisibility();
    applyFoundVisibility();
}
// «По картам»: прогресс всех семи карт (у меток источника нет районов)
const regionProgress = MapExtras.mapsProgress({
    anchor: document.querySelector(".progress-card"), title: "По картам", storeKey: "pb_regions_open",
    maps: MAP_ORDER.map(id => ({ id, name: MAPS[id].name, file: MAPS[id].markersFile.split("/").pop(), href: mapHref(id) })),
    currentId: state.mapId, foundKey: id => "pb_found_" + id, cloud: () => cloud, cloudDocId: id => "pb_" + id
});
const renderRegionProgress = (found, total) => regionProgress.render({ found, total });

// Подписи районов на карте (у источника для этих карт их нет; оставлено для будущих данных): зумы mapCfg.labels
let regionLabels = [];
function buildRegionLabels(list) {
    regionLabels.forEach(t => t.remove());
    regionLabels = (list || []).map(l => {
        const el = document.createElement("div");
        el.className = "pb-region-label";
        el.innerHTML = `<span>${escapeHtml(l.name)}</span>`;
        return state.map.addLabel([l.lat, l.lng], el);
    });
    updateRegionLabels();
}
function updateRegionLabels() {
    const z = state.map.getZoom(), [a, b] = mapCfg.labels || [0, 0];
    state.map.getContainer().classList.toggle("pb-labels-on", z >= a && z < b);
}
state.map.on("zoomend", updateRegionLabels);
// Фильтр «Мои отметки», режим «только карта», горячие клавиши, правка места метки, последняя карта для главной
marks.filterUI(document.getElementById("hide-found-btn").closest(".btn-group"));
MapExtras.hotkeys({ map: () => state.map, focus: focusView });
MapExtras.recordVisit("phantomblade", state.mapId);
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
    buildRegionLabels(data.labels);
    state.markers = buildBase().concat(loadUserMarkers());
    state.loaded = true;
    if (!viewRestored && !new URLSearchParams(location.search).get("marker")) fitToMarkers();
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

// Переключатель карт: выпадающий список, переход на страницу /<игра>/<id>/
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
