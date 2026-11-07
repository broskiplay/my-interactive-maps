// Интерактивная карта «Ведьмак 3: Дикая Охота» (10 карт: Велен и Новиград, Скеллиге, Туссент и др.).
// Метки, названия и описания — lastboss.net, тайлы подложки — оттуда же; категории и иконки — в categories.js.
// Здесь: карта, метки, прогресс, облако.

// ---------- Карты и координаты ----------
// Координаты меток — обычная широта/долгота (Web Mercator, как у lastboss): L.CRS.EPSG3857.
// Тайлы лежат в репозитории witcher3-assets (GitHub Pages): tiles/<карта>/<z>/<x>/<y>.webp
// (список существующих — manifest.json в той же папке).
const ASSETS_ROOT = "https://broskiplay.github.io/witcher3-assets";
const popupImgUrl = p => /^https?:/.test(p) ? p : `${ASSETS_ROOT}/${p}`;
const MAPS = {
    "velen-novigrad": {
        id: "velen-novigrad", name: "Велен и Новиград", markersFile: "data/witcher3_velen-novigrad_markers.json", tiles: `${ASSETS_ROOT}/tiles/velen-novigrad`,
        tileMinZ: 12, tileMaxZ: 14, minZoom: 10.5, maxZoom: 16, start: [83.90825, -168.03747], startZoom: 13, pinFull: 13, focusZoom: 13,
        play: [[83.8538, -168.6211], [83.9627, -167.4539]], tileBounds: [[83.8338, -168.7711], [83.9827, -167.3039]]
    },
    "skellige": {
        id: "skellige", name: "Скеллиге", markersFile: "data/witcher3_skellige_markers.json", tiles: `${ASSETS_ROOT}/tiles/skellige`,
        tileMinZ: 12, tileMaxZ: 15, minZoom: 10.5, maxZoom: 17, start: [83.90487, -168.04688], startZoom: 14, pinFull: 14, focusZoom: 14,
        play: [[83.8678, -168.3971], [83.942, -167.6967]], tileBounds: [[83.8478, -168.5471], [83.962, -167.5467]]
    },
    "toussaint": {
        id: "toussaint", name: "Туссент", markersFile: "data/witcher3_toussaint_markers.json", tiles: `${ASSETS_ROOT}/tiles/toussaint`,
        tileMinZ: 12, tileMaxZ: 14, minZoom: 10.5, maxZoom: 16, start: [83.90167, -168.04413], startZoom: 13, pinFull: 13, focusZoom: 13,
        play: [[83.8463, -168.5344], [83.957, -167.5539]], tileBounds: [[83.8263, -168.6844], [83.977, -167.4039]]
    },
    "white-orchard": {
        id: "white-orchard", name: "Белый Сад", markersFile: "data/witcher3_white-orchard_markers.json", tiles: `${ASSETS_ROOT}/tiles/white-orchard`,
        tileMinZ: 12, tileMaxZ: 14, minZoom: 10.5, maxZoom: 16, start: [83.89912, -168.0455], startZoom: 13, pinFull: 13, focusZoom: 13,
        play: [[83.8644, -168.3627], [83.9339, -167.7283]], tileBounds: [[83.8444, -168.5127], [83.9539, -167.5783]]
    },
    "kaer-morhen": {
        id: "kaer-morhen", name: "Каэр Морхен", markersFile: "data/witcher3_kaer-morhen_markers.json", tiles: `${ASSETS_ROOT}/tiles/kaer-morhen`, fit: true,
        tileMinZ: 12, tileMaxZ: 14, minZoom: 10.5, maxZoom: 16, start: [83.90411, -168.09219], startZoom: 13, pinFull: 13, focusZoom: 13,
        play: [[83.8522, -168.5728], [83.956, -167.6115]], tileBounds: [[83.8322, -168.7228], [83.976, -167.4615]]
    },
    "isle-of-mists": {
        id: "isle-of-mists", name: "Остров Туманов", markersFile: "data/witcher3_isle-of-mists_markers.json", tiles: `${ASSETS_ROOT}/tiles/isle-of-mists`, fit: true,
        tileMinZ: 12, tileMaxZ: 13, minZoom: 10.5, maxZoom: 15, start: [83.92696, -168.02096], startZoom: 12, pinFull: 12, focusZoom: 12,
        play: [[83.9018, -168.2705], [83.9521, -167.7714]], tileBounds: [[83.8818, -168.4205], [83.9721, -167.6214]]
    },
    "vizima-castle": {
        id: "vizima-castle", name: "Королевский замок в Вызиме", markersFile: "data/witcher3_vizima-castle_markers.json", tiles: `${ASSETS_ROOT}/tiles/vizima-castle`, fit: true,
        tileMinZ: 11, tileMaxZ: 11, minZoom: 9.5, maxZoom: 13, start: [83.90982, -168.05031], startZoom: 11, pinFull: 10, focusZoom: 10,
        play: [[83.8846, -168.3133], [83.935, -167.7873]], tileBounds: [[83.8646, -168.4633], [83.955, -167.6373]]
    },
    "time-and-space": {
        id: "time-and-space", name: "Время и пространство", markersFile: "data/witcher3_time-and-space_markers.json", tiles: `${ASSETS_ROOT}/tiles/time-and-space`, fit: true,
        tileMinZ: 12, tileMaxZ: 13, minZoom: 10.5, maxZoom: 15, start: [83.91184, -167.93736], startZoom: 12, pinFull: 12, focusZoom: 12,
        play: [[83.8925, -168.3154], [83.9312, -167.5594]], tileBounds: [[83.8725, -168.4654], [83.9512, -167.4094]]
    },
    "olgierd-world": {
        id: "olgierd-world", name: "Мир Гюнтера о'Дима", markersFile: "data/witcher3_olgierd-world_markers.json", tiles: `${ASSETS_ROOT}/tiles/olgierd-world`, fit: true,
        tileMinZ: 12, tileMaxZ: 12, minZoom: 10.5, maxZoom: 14, start: [83.9036, -167.90131], startZoom: 12, pinFull: 11, focusZoom: 11,
        play: [[83.8736, -168.2391], [83.9336, -167.5635]], tileBounds: [[83.8536, -168.3891], [83.9536, -167.4135]]
    },
    "land-of-fables": {
        id: "land-of-fables", name: "Страна Сказок", markersFile: "data/witcher3_land-of-fables_markers.json", tiles: `${ASSETS_ROOT}/tiles/land-of-fables`, fit: true,
        tileMinZ: 13, tileMaxZ: 13, minZoom: 11.5, maxZoom: 15, start: [83.89861, -168.08327], startZoom: 13, pinFull: 12, focusZoom: 12,
        play: [[83.89, -168.1873], [83.9072, -167.9792]], tileBounds: [[83.87, -168.3373], [83.9272, -167.8292]]
    }
};
const MAP_ORDER = ["velen-novigrad", "skellige", "toussaint", "white-orchard", "kaer-morhen", "isle-of-mists", "vizima-castle", "time-and-space", "olgierd-world", "land-of-fables"];
const BLANK_TILE = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const LS = {
    read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } },
    write(key, value) { try { localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); } catch (e) { /* localStorage недоступен */ } }
};
function pickMapId() {
    const q = new URLSearchParams(location.search).get("map");
    if (q && MAPS[q]) return q;
    try { const last = localStorage.getItem("w3_last_map"); if (last && MAPS[last]) return last; } catch (e) { /* localStorage недоступен */ }
    return MAP_ORDER[0];
}
const state = {
    loaded: false, raw: null, adding: false, map: null, mapId: pickMapId(), xlinks: {},
    hidden: new Set(), markers: [], found: new Set(), layers: {}, hideFound: false, query: ""
};
const mapCfg = MAPS[state.mapId];
try { state.hideFound = !!localStorage.getItem("w3_hide_found"); } catch (e) { /* localStorage недоступен */ }
// Первый запуск: скрыты категории с hidden (службы, ресурсы, двери и обычные дома); дальше — выбор игрока
state.hidden = new Set(LS.read("w3_hidden_cats", null) ? LS.read("w3_hidden_cats", []).filter(k => CAT_BY_KEY[k]) : Object.keys(CAT_BY_KEY).filter(k => CAT_BY_KEY[k].hidden));
LS.write("w3_last_map", state.mapId);
document.title = `Интерактивная карта Ведьмак 3 — ${mapCfg.name} — BroskiPlay`;

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Описания (markdown MapGenie): **жирный**, [названия], списки, таблицы ----------
function renderDesc(src) {
    // Ссылки вида [Название](loc:123) превращаются в переход к метке (на этой или соседней карте)
    const inline = s => escapeHtml(s)
        .replace(/\[([^\]]+)\]\(loc:(\d+)\)/g, '<a href="#" class="w3-link" data-goto="$2">$1</a>')
        .replace(/\[([^\]]+)\]\s*\(https?:[^)]*\)/g, "$1")
        .replace(/\s*\(https?:\/\/[^)]*\)/g, "")
        .replace(/\((основное|дополнительное) задание\)/g, (_, k) => `<span class="w3-qtag w3-qtag-${k === "основное" ? "main" : "side"}">${k} задание</span>`)
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
const foundKey = () => "w3_found_" + state.mapId;
function loadFound() { state.found = new Set(LS.read(foundKey(), []).map(String)); }
function saveFound() {
    LS.write(foundKey(), [...state.found]);
    cloudPush("mapProgress", { foundIds: [...state.found] });
}

// ---------- Облако: users/{uid}/mapProgress|customMarkers/w3_<карта> ----------
// Если документ в облаке есть — он главный (так удаления не «воскресают» со старых устройств).
const cloud = { db: null, user: null };
const cloudRef = (col, uid = cloud.user.uid) => cloud.db.collection("users").doc(uid).collection(col).doc("w3_" + state.mapId);
function cloudPush(col, data) {
    if (!cloud.db || !cloud.user) return;
    cloudRef(col).set({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .catch(err => console.warn("Не удалось сохранить в Firestore:", err));
}
async function cloudPull() {
    if (!cloud.db || !cloud.user || !state.loaded) return;
    const uid = cloud.user.uid;
    try {
        const [prog, cm] = await Promise.all([cloudRef("mapProgress", uid).get(), cloudRef("customMarkers", uid).get()]);
        if (!cloud.user || cloud.user.uid !== uid) return;
        if (prog.exists && Array.isArray(prog.data().foundIds)) {
            state.found = new Set(prog.data().foundIds.map(String));
            LS.write(foundKey(), [...state.found]);
        } else if (state.found.size) cloudPush("mapProgress", { foundIds: [...state.found] });
        if (cm.exists && Array.isArray(cm.data().markers)) {
            const mine = cm.data().markers.filter(m => m && m.pos && CAT_BY_KEY[m.cat]).map(m => ({ ...m, user: true }));
            state.markers = state.markers.filter(m => !m.user).concat(mine);
            saveUserMarkers(false);
        } else if (state.markers.some(m => m.user)) saveUserMarkers();
        buildMarkers();
        renderFilters();
        renderProgress();
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

// В общий прогресс не входят ресурсные узлы, службы, спутники, двери и задания (категории с track: false)
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
}

// ---------- Подсветка категории (кнопка-лупа в сайдбаре) ----------
// Метки выбранных категорий (можно несколько) получают статичное золотое свечение под капелькой (без пульсации) и рисуются поверх остальных.
const locateCats = new Set();
const litRank = l => locateCats.size && locateCats.has(l.options.cat) ? 1 : 0;
const glowSprites = new Map();
const GLOW_R = 28;
function glowSprite() {
    let s = glowSprites.get("g");
    if (!s) {
        const k = L.Browser.retina ? 2 : 1, R = GLOW_R;
        s = document.createElement("canvas");
        s.width = s.height = R * 2 * k;
        const c = getCtx(s);
        c.scale(k, k);
        const grad = c.createRadialGradient(R, R, 0, R, R, R);
        grad.addColorStop(0, "rgba(255,213,74,.60)");
        grad.addColorStop(0.55, "rgba(255,213,74,.42)");
        grad.addColorStop(1, "rgba(255,213,74,0)");
        c.fillStyle = grad;
        c.fillRect(0, 0, R * 2, R * 2);
        c.beginPath();
        c.arc(R, R, R * 0.6, 0, Math.PI * 2);
        c.lineWidth = 2.5; c.strokeStyle = "rgba(255,236,150,.95)";
        c.stroke();
        glowSprites.set("g", s);
    }
    return s;
}
// Свечение центрируется на «головке» капельки (у точек-ресурсов она совпадает с координатой)
function drawGlow(ctx, x, y, g, k) {
    const R = GLOW_R * (g.r / 14 < 0.8 ? 0.72 : 1) * k, cy = y - (g.ay - g.cy) * k;
    ctx.drawImage(glowSprite(), x - R, cy - R, R * 2, R * 2);
}
function fitCategory(key) {
    const pts = state.markers.filter(m => m.cat === key && !(state.hideFound && state.found.has(String(m.id)))).map(m => m.pos);
    if (!pts.length) return;
    const view = state.map.getBounds();
    if (pts.some(p => view.contains(p))) return; // хоть одна метка уже на экране — карту не двигаем
    state.map.flyToBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: mapCfg.focusZoom, duration: 0.7 });
}
function locateCategory(key) {
    const add = !locateCats.has(key);
    add ? locateCats.add(key) : locateCats.delete(key);
    if (add && state.hidden.has(key)) { state.hidden.delete(key); applyVisibility(); }
    renderFilters();
    redrawPins();
    if (add) fitCategory(key);
}
function clearLocate() {
    locateCats.clear();
    renderFilters();
    redrawPins();
}
// Категории, которых нет на этой карте, в сайдбаре не показываются — подсветку с них снимаем
function pruneLocate(total) {
    if (state.loaded) for (const k of [...locateCats]) if (!total[k]) locateCats.delete(k);
}
const locateClearBtn = () => locateCats.size ? `<button type="button" class="locate-clear">Сбросить подсветку (${locateCats.size})</button>` : "";
const locateBtn = (c, total) => `<button type="button" class="filter-locate${locateCats.has(c.key) ? " is-on" : ""}" data-locate="${c.key}" aria-pressed="${locateCats.has(c.key)}" title="Подсветить на карте" aria-label="Подсветить на карте: ${escapeHtml(c.name)}"${total[c.key] ? "" : " disabled"}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg></button>`;

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
            items.map(c => `<div class="filter-row"><button type="button" class="filter-item${state.hidden.has(c.key) ? " disabled" : ""}${total[c.key] ? "" : " is-empty"}" data-cat="${c.key}"><span class="filter-name"><i class="w3-filter-icon" style="background:${c.color}">${iconSvg(c.icon, c.ink)}</i>${c.name}</span><span class="filter-count">${done[c.key] || 0}/${total[c.key] || 0}</span></button>${locateBtn(c, total)}</div>`).join("") +
            `</div>`;
    }).join("") + `<p class="filters-note">Двойной клик по категории — показать только её.</p>`;
}

// В Firefox ускоренный canvas может молча не рисовать часть содержимого (на Android — тайлы и метки остаются
// пустыми). willReadFrequently включает программный canvas (CPU) — он рисует надёжно.
// ?canvas=cpu / ?canvas=gpu принудительно выбирают режим для проверки.
const SOFTWARE_CANVAS = (() => {
    const query = location.search;
    if (/[?&]canvas=cpu\b/.test(query)) return true;
    if (/[?&]canvas=gpu\b/.test(query)) return false;
    return /\bFirefox\//.test(navigator.userAgent || "");
})();
const getCtx = canvas => canvas.getContext("2d", { willReadFrequently: SOFTWARE_CANVAS });

// ---------- Метки на canvas ----------
// Тысяча DOM-элементов с тенями и поворотом перерисовывается при каждом сдвиге и зуме, поэтому карта
// дёргалась. Метки рисуются одним canvas из готовых спрайтов: панорамирование — это сдвиг одного слоя.
// Спрайт: размер w×h, остриё капельки в точке (ax, ay) — она совпадает с координатой метки.
const PIN = { w: 48, h: 64, cx: 24, cy: 26, r: 14, ax: 24, ay: 46, hover: 1.15 };
// Ресурсные узлы (категории с dot) — маленькие круглые точки: их тысячи, капельки закрыли бы карту. Центр точки = координата
const DOT = { w: 28, h: 28, cx: 14, cy: 14, r: 9, ax: 14, ay: 14, hover: 1.25 };
const geom = cat => CAT_BY_KEY[cat] && CAT_BY_KEY[cat].dot ? DOT : PIN;
// Меток тысячи, и стоят они густо: рисуем их мельче, а при приближении (с z14) — крупнее
const pinScale = z => z >= mapCfg.pinFull ? 1.05 : z <= mapCfg.minZoom ? 0.62 : 0.62 + 0.43 * (z - mapCfg.minZoom) / (mapCfg.pinFull - mapCfg.minZoom);
const mapZoom = map => map._animatingZoom && map._animateToZoom != null ? map._animateToZoom : map.getZoom();
const ZOOM_ANIM_MS = 250; // длительность зума в Leaflet (transition у тайлов)
// cubic-bezier(0, 0, .25, 1) — кривая зума Leaflet: по x ищем параметр t делением пополам, возвращаем y
function easeZoom(x) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 20; i++) {
        const t = (lo + hi) / 2;
        (0.75 * t * t * (1 - t) + t * t * t < x ? lo = t : hi = t);
    }
    const t = (lo + hi) / 2;
    return 3 * (1 - t) * t * t + t * t * t;
}
const pinSprites = new Map();
const glyphs = new Map();

// Иконки — собственные SVG-контуры из categories.js, рисуются Path2D (шрифт иконок не нужен)
const iconPaths = new Map();
function drawIcon(ctx, name, cx, cy, size, color) {
    const ic = ICONS[name];
    if (!ic) return;
    let path = iconPaths.get(name);
    if (!path) { path = new Path2D(ic.d); iconPaths.set(name, path); }
    ctx.save();
    ctx.translate(cx - size / 2, cy - size / 2);
    ctx.scale(size / 24, size / 24);
    ctx.fillStyle = color || "#fff";
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

// Повёрнутый на -45° квадрат: три скруглённых угла и один острый (остриё смотрит вниз)
function teardropPath(ctx, h) {
    ctx.beginPath();
    ctx.moveTo(-h, h);
    ctx.lineTo(-h, 0);
    ctx.arc(0, 0, h, Math.PI, Math.PI * 2.5);
    ctx.closePath();
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

function pinSprite(cat, found) {
    const key = cat + (found ? "|1" : "|0");
    let s = pinSprites.get(key);
    if (!s) { s = buildPinSprite(cat, found); pinSprites.set(key, s); }
    return s;
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
    },
    // Попап всегда над остриём метки, а не там, куда попал клик (поведение L.Marker)
    _getPopupAnchor() { return [0, (geom(this.options.cat) === PIN ? -36 : -14) * pinScale(mapZoom(this._map))]; },
    openPopup() { return L.Layer.prototype.openPopup.call(this, this._latlng); }
});

let pinRenderer = null;
function redrawPins() {
    if (pinRenderer && pinRenderer._map) {
        pinRenderer._redrawBounds = null;
        pinRenderer._redraw();
    }
}

// Подсказка с названием метки; на тач-экранах не нужна
const hoverTip = L.tooltip({ direction: "top", offset: [0, -36], opacity: 1, className: "w3-tip" });

const TAG_NAMES = { hos: "DLC «Каменные сердца»", bw: "DLC «Кровь и вино»" };
function popupHtml(m) {
    const c = CAT_BY_KEY[m.cat];
    const done = state.found.has(String(m.id));
    const tags = (m.tags || []).map(t => `<span class="w3-tag">${escapeHtml(TAG_NAMES[t] || t)}</span>`).join("");
    const en = m.titleEn && m.titleEn !== m.title ? `<span class="w3-popup-en" title="Название в оригинале">${escapeHtml(m.titleEn)}</span>` : "<span></span>";
    return `<div class="w3-popup">
        <div class="w3-popup-cat" style="color:${c.color}"><span class="w3-popup-icon" style="background:${c.color}">${iconSvg(c.icon, c.ink)}</span>${c.name}</div>
        <h3>${escapeHtml(m.title || "Без названия")}</h3>
        <div class="w3-popup-meta">${en}<button type="button" class="w3-link-btn" data-copy="${m.id}" title="Скопировать ссылку на эту метку">Ссылка</button></div>
        ${tags ? `<div class="w3-tags">${tags}</div>` : ""}
        ${m.img ? `<img class="w3-popup-img" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(popupImgUrl(m.img))}" data-full="${escapeHtml(popupImgUrl(m.img))}" alt="" title="Открыть изображение" onerror="this.remove()">` : ""}
        ${m.desc ? `<div class="w3-desc">${renderDesc(m.desc)}</div>` : ""}
        ${m.user ? `<button type="button" class="w3-del-btn" data-id="${m.id}">Удалить свою метку</button>` : ""}
        <button type="button" class="w3-done-btn${done ? " is-done" : ""}" data-id="${m.id}">${done ? "✓ Найдено — отменить" : "Отметить найденным"}</button>
    </div>`;
}

function toast(text) {
    const el = document.getElementById("w3-toast");
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
        m._leaflet.redraw();
        markerStack.refresh(m);
    }
    applyFoundVisibility();
    renderFilters();
    renderProgress();
    renderSearchResults();
}

function applyFoundVisibility() {
    state.markers.forEach(m => {
        const layer = state.layers[m.cat];
        if (!m._leaflet || !layer) return;
        const hide = state.hideFound && state.found.has(String(m.id));
        if (hide) layer.removeLayer(m._leaflet);
        else if (!layer.hasLayer(m._leaflet)) layer.addLayer(m._leaflet);
    });
}

// Метки категории создаются при первом показе: узлов ресурсов больше четырёх тысяч, а по умолчанию они скрыты
function ensureLayer(key) {
    if (state.layers[key]) return state.layers[key];
    const layer = state.layers[key] = L.layerGroup();
    state.markers.forEach(m => {
        if (m.cat !== key) return;
        m._leaflet = new PinMarker(m.pos, { renderer: pinRenderer, cat: m.cat, found: state.found.has(String(m.id)) })
            .bindPopup(() => markerStack.html(m), { maxWidth: 320, maxHeight: 420, className: "w3-popup-wrap", autoPanPadding: [30, 30], keepInView: false });
        if (!(state.hideFound && state.found.has(String(m.id)))) m._leaflet.addTo(layer);
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
        const hide = state.hidden.has(key);
        const layer = hide ? state.layers[key] : ensureLayer(key);
        if (!layer) return;
        const shown = state.map.hasLayer(layer);
        if (hide && shown) state.map.removeLayer(layer);
        else if (!hide && !shown) state.map.addLayer(layer);
    });
    LS.write("w3_hidden_cats", [...state.hidden]);
}

function buildMarkers() {
    Object.values(state.layers).forEach(l => state.map.removeLayer(l));
    state.layers = {};
    state.markers.forEach(m => { m._leaflet = null; });
    applyVisibility();
    searchIndex = null;
}

function setAll(visible) {
    state.hidden = visible ? new Set() : new Set(Object.keys(CAT_BY_KEY));
    renderFilters();
    applyVisibility();
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
            return `<button type="button" class="search-item${state.found.has(String(m.id)) ? " is-done" : ""}" data-marker="${escapeHtml(m.id)}" role="option"><i class="w3-filter-icon" style="background:${c.color}">${iconSvg(c.icon, c.ink)}</i><span class="si-title">${escapeHtml(m.title || "Без названия")}</span><span class="si-zone">${escapeHtml(c.name)}</span></button>`;
        }).join("") + (scored.length > shown.length ? `<div class="search-empty">Показано ${shown.length} из ${scored.length}. Уточните запрос.</div>` : "")
        : `<div class="search-empty">Ничего не найдено</div>`;
}

function focusMarker(id, { fly = true } = {}) {
    const m = state.markers.find(x => String(x.id) === String(id));
    if (!m) return false;
    if (state.hidden.has(m.cat)) { state.hidden.delete(m.cat); renderFilters(); applyVisibility(); }
    const open = () => {
        if (m._leaflet && state.layers[m.cat] && state.layers[m.cat].hasLayer(m._leaflet)) m._leaflet.openPopup();
        else L.popup({ className: "w3-popup-wrap", maxWidth: 320, offset: [0, -4] }).setLatLng(m.pos).setContent(popupHtml(m)).openOn(state.map);
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
    if (other && MAPS[other]) { location.href = `?map=${other}&marker=${id}`; return; }
    toast("Эта метка не найдена на карте");
}

function closeLightbox() { const lb = document.getElementById("w3-lightbox"); if (lb) lb.remove(); }
function openLightbox(src) {
    closeLightbox();
    const lb = document.createElement("div");
    lb.id = "w3-lightbox";
    lb.innerHTML = `<img src="${escapeHtml(src)}" alt=""><button type="button" aria-label="Закрыть">×</button>`;
    lb.addEventListener("click", closeLightbox);
    document.body.appendChild(lb);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

document.addEventListener("click", async e => {
    const img = e.target.closest(".w3-popup-img");
    if (img) { openLightbox(img.dataset.full || img.src); return; }
    const del = e.target.closest(".w3-del-btn");
    if (del) { deleteUserMarker(del.dataset.id); return; }
    if (e.target.closest("#w3-add-save")) { saveNewMarker(); return; }
    const btn = e.target.closest(".w3-done-btn");
    if (btn) { toggleFound(btn.dataset.id); return; }
    const go = e.target.closest(".w3-link");
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
    if (loc) { locateCategory(loc.dataset.locate); if (L.Browser.mobile && window.innerWidth <= 480) toggleSidebar(); return; }
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
    LS.write("w3_hide_found", state.hideFound ? "1" : "");
    applyFoundVisibility();
});
document.getElementById("search-input").addEventListener("input", e => {
    state.query = e.target.value.trim().toLowerCase();
    renderFilters();
    renderSearchResults();
});

const toggleSidebar = () => {
    const collapsed = document.getElementById("sidebar").classList.toggle("collapsed");
    document.getElementById("sidebar-toggle-btn").textContent = collapsed ? "▶" : "◀";
    setTimeout(() => state.map && state.map.invalidateSize(), 320);
};
document.getElementById("sidebar-toggle-btn").addEventListener("click", toggleSidebar);
document.getElementById("sidebar-collapse-mobile").addEventListener("click", toggleSidebar);

// ---------- Карта ----------
// Запас вокруг игровой области: иначе maxBounds ограничивает автопрокрутку попапа и карта «отпрыгивает» назад
const padLat = 0.012, padLng = 0.1;
state.map = L.map("map", {
    minZoom: mapCfg.minZoom, maxZoom: mapCfg.maxZoom, zoomSnap: 0.25, bounceAtZoomLimits: false, attributionControl: false,
    scrollWheelZoom: false, // вместо него — плавный зум из ../js/smooth-zoom.js
    // Без плавного появления тайлов: при смене уровня новые тайлы проявлялись из прозрачности (~200 мс), и карта мигала
    fadeAnimation: false,
    maxBounds: [[mapCfg.play[0][0] - padLat, mapCfg.play[0][1] - padLng], [mapCfg.play[1][0] + padLat, mapCfg.play[1][1] + padLng]]
});
pinRenderer = new PinCanvas({ padding: 0.05 });
enableSmoothWheelZoom(state.map);

// Положение карты запоминаем отдельно для каждой карты: при следующем открытии продолжаем с того же места
const VIEW_KEY = "w3_view_" + state.mapId;
function restoreView() {
    const v = LS.read(VIEW_KEY, null);
    if (v && isFinite(v.lat) && isFinite(v.lng) && isFinite(v.zoom) && v.zoom >= mapCfg.minZoom) state.map.setView([v.lat, v.lng], v.zoom, { animate: false });
    // Маленькие карты (до сотни меток) целиком вписываем в окно, большие открываем в центре
    else if (mapCfg.fit) state.map.fitBounds(mapCfg.play, { padding: [30, 30], animate: false });
    else state.map.setView(mapCfg.start, mapCfg.startZoom, { animate: false });
}
state.map.on("moveend", () => {
    const c = state.map.getCenter();
    LS.write(VIEW_KEY, { lat: +c.lat.toFixed(5), lng: +c.lng.toFixed(5), zoom: state.map.getZoom() });
});
restoreView();

// Локальные тайлы (экспорт tools/export-tiles.js). Список существующих лежит в manifest.json
function addTiles(tileSet) {
    const MapTiles = L.TileLayer.extend({
        getTileUrl(c) { return tileSet.has(`${c.z}/${c.x}/${c.y}`) ? `${mapCfg.tiles}/${c.z}/${c.x}/${c.y}.webp` : BLANK_TILE; }
    });
    // Глубже tileMaxZ тайлов нет — картинка просто увеличивается (maxNativeZoom)
    new MapTiles("", { tileSize: 256, minZoom: mapCfg.minZoom, maxZoom: mapCfg.maxZoom, minNativeZoom: mapCfg.tileMinZ, maxNativeZoom: mapCfg.tileMaxZ, bounds: mapCfg.tileBounds, errorTileUrl: BLANK_TILE }).addTo(state.map);
}

function copyMarkerLink(id) {
    const url = `${location.origin}${location.pathname}?map=${state.mapId}&marker=${id}`;
    const done = () => toast("Ссылка на метку скопирована");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => prompt("Ссылка на метку:", url));
    else prompt("Ссылка на метку:", url);
}

// ---------- Свои метки (хранятся в браузере пользователя) ----------
const userKey = () => "w3_user_" + state.mapId;
function loadUserMarkers() {
    return LS.read(userKey(), []).filter(m => m && m.pos && CAT_BY_KEY[m.cat]).map(m => ({ ...m, user: true }));
}
function saveUserMarkers(push = true) {
    const list = state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }));
    LS.write(userKey(), list);
    if (push) cloudPush("customMarkers", { markers: list });
}

function setAddMode(on) {
    state.adding = on;
    const b = document.getElementById("add-marker-btn");
    b.classList.toggle("active", on);
    b.textContent = on ? "Кликните по карте… (отмена)" : "＋ Добавить свою метку";
    document.getElementById("map").classList.toggle("adding", on);
    if (!on) state.map.closePopup();
}

let pendingPos = null;
state.map.on("click", e => {
    if (!state.adding) return;
    pendingPos = [e.latlng.lat, e.latlng.lng];
    const opts = CATEGORIES.map(g => `<optgroup label="${g.title}">${g.items.map(c => `<option value="${c.key}">${c.name}</option>`).join("")}</optgroup>`).join("");
    L.popup({ className: "w3-popup-wrap", closeOnClick: false })
        .setLatLng(e.latlng)
        .setContent(`<div class="w3-popup w3-add-form">
            <h3>Новая метка</h3>
            <select id="w3-add-cat">${opts}</select>
            <input type="text" id="w3-add-title" placeholder="Название" maxlength="80">
            <textarea id="w3-add-desc" placeholder="Описание (необязательно)" maxlength="500" rows="3"></textarea>
            <button type="button" class="w3-done-btn" id="w3-add-save">Сохранить</button>
        </div>`)
        .openOn(state.map);
});

function saveNewMarker() {
    if (!pendingPos) return;
    const m = {
        id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        title: document.getElementById("w3-add-title").value.trim() || "Моя метка",
        desc: document.getElementById("w3-add-desc").value.trim(),
        cat: document.getElementById("w3-add-cat").value,
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

// ---------- Экспорт и импорт прогресса ----------
function setIoStatus(text) { document.getElementById("io-status").textContent = text; }
function exportProgress() {
    const payload = {
        app: "witcher3_map_progress",
        map: state.mapId,
        updatedAt: new Date().toISOString(),
        foundCount: state.found.size,
        found: [...state.found],
        customMarkers: state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }))
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    a.download = `witcher3_progress_${state.mapId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setIoStatus(`Сохранено: ${payload.found.length} отметок, ${payload.customMarkers.length} своих меток.`);
}
async function importProgress(file) {
    try {
        const data = JSON.parse(await file.text());
        if (!data || data.app !== "witcher3_map_progress" || !Array.isArray(data.found)) throw new Error("это не файл прогресса карты Ведьмака 3");
        const known = new Set(state.markers.map(m => String(m.id)));
        const before = state.found.size;
        data.found.map(String).forEach(id => state.found.add(id));
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
        setIoStatus(`Импортировано: +${state.found.size - before} отметок, +${added} своих меток.`);
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
function hideMapLoader() {
    const el = document.getElementById("map-loader");
    if (!el || el.classList.contains("is-done")) return;
    setTimeout(() => {
        el.classList.add("is-done");
        setTimeout(() => el.remove(), 700);
    }, Math.max(0, 800 - (performance.now() - loaderShownAt)));
}

// Основные метки карты: тексты уже на русском, английское название лежит в titleEn (для поиска)
function buildBase() {
    return ((state.raw && state.raw.markers) || [])
        .filter(m => isFinite(m.lat) && isFinite(m.lng) && CAT_BY_KEY[m.cat])
        .map(m => ({ ...m, id: String(m.id), pos: [m.lat, m.lng] }));
}

loadFound();
renderFilters();
renderProgress();

// ---------- Загрузка данных ----------
Promise.all([
    fetch(`${mapCfg.tiles}/manifest.json`).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(mapCfg.markersFile).then(r => r.json())
]).then(([manifest, data]) => {
    if (manifest) addTiles(new Set(manifest));
    else {
        const el = document.getElementById("map-empty");
        el.textContent = "Тайлы карты ещё не загружены: метки показаны без подложки";
        el.classList.add("is-note");
    }
    state.raw = data;
    state.xlinks = data.xlinks || {};
    state.markers = buildBase().concat(loadUserMarkers());
    state.loaded = true;
    buildMarkers();
    renderFilters();
    renderProgress();
    cloudPull();
    hideMapLoader();
    // Ссылка на метку: ?map=<карта>&marker=<id>
    const wanted = new URLSearchParams(location.search).get("marker");
    if (wanted && !focusMarker(wanted, { fly: false })) toast("Метка по ссылке не найдена");
}).catch(() => {
    hideMapLoader();
    const el = document.getElementById("map-empty");
    el.textContent = "Не удалось загрузить карту (откройте страницу через веб-сервер, а не file://)";
    el.style.display = "grid";
});

// Переключатель карт
// Выпадающий список: страница перезагружается с ?map=<id>
{
    const box = document.getElementById("map-switch");
    box.innerHTML = `<select class="map-select" aria-label="Выбор карты">${MAP_ORDER.map(id =>
        `<option value="${id}"${id === state.mapId ? " selected" : ""}>${escapeHtml(MAPS[id].name)}</option>`).join("")}</select>`;
    box.querySelector("select").addEventListener("change", e => { location.href = `?map=${e.target.value}`; });
}

// ---------- Вход через Google (тот же Firebase-проект, что и у остальных карт) ----------
const GOOGLE_BTN_HTML = '<svg class="google-icon" width="14" height="14" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span>Google</span>';

function initAuth() {
    const btn = document.getElementById("auth-btn");
    const statusEl = document.getElementById("auth-status");
    const avatar = document.getElementById("auth-avatar");
    btn.innerHTML = GOOGLE_BTN_HTML;
    if (typeof firebase === "undefined") return;

    if (!firebase.apps.length) firebase.initializeApp({
        apiKey: "AIzaSyBZ29h18Z1k0gE4dAEca5JH8yePQgxhaII",
        authDomain: "broskiplaymaps.firebaseapp.com",
        projectId: "broskiplaymaps",
        appId: "1:418362476965:web:59ce4e677b1a0a84d7404c"
    });
    const auth = firebase.auth();
    if (typeof firebase.firestore === "function") cloud.db = firebase.firestore();

    auth.onAuthStateChanged(user => {
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
    });

    btn.addEventListener("click", () => {
        if (auth.currentUser) { auth.signOut(); return; }
        auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .catch(err => alert("Ошибка входа через Google: " + err.message));
    });
}
initAuth();
