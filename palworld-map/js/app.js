// Интерактивная карта Palworld (Palpagos Islands). Данные, тайлы и иконки — из MapGenie.
// Категории — в categories.js. Здесь: карта, метки, прогресс, облако, области.

// ---------- Карта и координаты ----------
// Координаты меток — обычные широта/долгота (Web Mercator, как у MapGenie): L.CRS.EPSG3857.
// Тайлы и картинки из окон меток лежат в репозитории palworld-assets (GitHub Pages):
// tiles/<z>/<x>/<y>.webp, z = 8..14 (нумерация XYZ, как у MapGenie), tiles/manifest.json и popups/<id>.webp.
// В данных меток поле img — путь вида popups/<id>.webp; ссылки http(s) остаются как есть.
const ASSETS_ROOT = "https://broskiplay.github.io/palworld-assets";
const popupImgUrl = p => /^https?:/.test(p) ? p : `${ASSETS_ROOT}/${p}`;
const MAPS = [
    { id: "palpagos-islands", name: "Острова Палпагос", markersFile: "data/palworld_palpagos-islands_markers.json", regionsFile: "data/palworld_regions.json" }
];
const MAP_BOUNDS = [[0, -1.4], [1.4, 0]];
// Суша занимает только часть тайлов: «вся карта» — по границам островов
const START_BOUNDS = [[0.26, -1.32], [1.29, -0.48]];
// Первый запуск: стартовая область игры (как на MapGenie), а не весь архипелаг целиком — иначе метки и подписи мелкие
const START_CENTER = [0.6078, -0.6969];
const START_ZOOM = () => window.innerWidth <= 600 ? 11.5 : 12;
const TILE_MIN_Z = 8, TILE_MAX_Z = 13;
const BLANK_TILE = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const state = {
    loaded: false, raw: null, adding: false, map: null, mapId: MAPS[0].id, regions: {}, regionLayer: null,
    hidden: new Set(), markers: [], found: new Set(), layers: {}, hideFound: false, query: ""
};
const mapCfg = MAPS[0];
const LS = {
    read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } },
    write(key, value) { try { localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); } catch (e) { /* localStorage недоступен */ } }
};
try { state.hideFound = !!localStorage.getItem("pw_hide_found"); } catch (e) { /* localStorage недоступен */ }
// Первый запуск: скрыты категории с hidden (ресурсные узлы, яйца, рыбалка, сбросы припасов — их тысячи, карта не читалась); дальше — выбор игрока
state.hidden = new Set(LS.read("pw_hidden_cats", null) ? LS.read("pw_hidden_cats", []).filter(k => CAT_BY_KEY[k]) : Object.keys(CAT_BY_KEY).filter(k => CAT_BY_KEY[k].hidden));
LS.write("pw_last_map", state.mapId);

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Описания (markdown MapGenie): **жирный**, [названия], списки, таблицы ----------
function renderDesc(src) {
    // Ссылки MapGenie вида [Название](…?locationIds=123) превращаются в переход к метке на этой карте
    const inline = s => escapeHtml(s)
        .replace(/\[([^\]]+)\]\s*\(https?:\/\/[^)\s]*?locationIds=(\d+)[^)\s]*\)/g, '<a href="#" class="pw-link" data-goto="$2">$1</a>')
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
const foundKey = () => "pw_found_" + state.mapId;
function loadFound() { state.found = new Set(LS.read(foundKey(), []).map(String)); }
function saveFound() {
    LS.write(foundKey(), [...state.found]);
    cloudPush("mapProgress", { foundIds: [...state.found] });
}

// ---------- Облако: users/{uid}/mapProgress|customMarkers/pw_<карта> ----------
// Если документ в облаке есть — он главный (так удаления не «воскресают» со старых устройств).
const cloud = { db: null, user: null };
const cloudRef = (col, uid = cloud.user.uid) => cloud.db.collection("users").doc(uid).collection(col).doc("pw_" + state.mapId);
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

// ---------- Области, прогресс, фильтры ----------
// Области карты (острова, горы, пустыни) приходят из data/palworld_regions.json: границы и контуры полигонов.
const regionOf = m => state.regions[m.region];

function renderRegions() {
    const list = Object.entries(state.regions).sort((a, b) => a[1].ru.localeCompare(b[1].ru, "ru"));
    document.getElementById("region-select").innerHTML = '<option value="">Вся карта</option>' +
        list.map(([id, r]) => `<option value="${id}">${escapeHtml(r.ru)}</option>`).join("");
}
function flyToRegion(id) {
    if (state.regionLayer) { state.map.removeLayer(state.regionLayer); state.regionLayer = null; }
    const r = state.regions[id];
    if (!r) { state.map.flyToBounds(START_BOUNDS, { padding: [10, 10], duration: 0.8 }); return; }
    state.regionLayer = L.polygon(r.rings, { color: "#e0a63a", weight: 2, dashArray: "6 6", fillColor: "#e0a63a", fillOpacity: 0.06, interactive: false }).addTo(state.map);
    state.map.flyToBounds(r.bounds, { padding: [20, 20], duration: 0.8 });
}

// ---------- Названия областей на карте ----------
// Подпись ставим в самую «глубокую» точку контура (дальше всего от границы): у вытянутых и изогнутых областей
// центр масс часто лежит вне суши. Что показывать, зависит от зума: область должна быть достаточно крупной на экране,
// а подписи не должны наезжать друг на друга — при конфликте остаётся более крупная область.
const LABEL_MIN_PX = 56, LABEL_GAP = 6;
const regionLabels = [];

function labelPoint(rings, bounds) {
    const [[s, w], [n, e]] = bounds;
    const inside = (la, ln) => {
        let c = false;
        for (const ring of rings) {
            for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
                const [ai, bi] = ring[i], [aj, bj] = ring[j];
                if ((bi > ln) !== (bj > ln) && la < (aj - ai) * (ln - bi) / (bj - bi) + ai) c = !c;
            }
        }
        return c;
    };
    const edgeDist = (la, ln) => {
        let best = Infinity;
        for (const ring of rings) {
            for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
                const [ya, xa] = ring[j], [yb, xb] = ring[i];
                const dy = yb - ya, dx = xb - xa, len = dy * dy + dx * dx;
                const t = len ? Math.max(0, Math.min(1, ((la - ya) * dy + (ln - xa) * dx) / len)) : 0;
                best = Math.min(best, Math.hypot(la - (ya + t * dy), ln - (xa + t * dx)));
            }
        }
        return best;
    };
    // Две проходки по сетке: грубая по всей области, затем уточнение вокруг лучшей точки
    let best = [(s + n) / 2, (w + e) / 2], bestD = -1, spanLa = n - s, spanLn = e - w;
    for (let pass = 0; pass < 2; pass++) {
        const c = best, N = 16;
        for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
            const la = pass ? c[0] + (i / N - 0.5) * spanLa / 8 : s + spanLa * i / N;
            const ln = pass ? c[1] + (j / N - 0.5) * spanLn / 8 : w + spanLn * j / N;
            if (!inside(la, ln)) continue;
            const d = edgeDist(la, ln);
            if (d > bestD) { bestD = d; best = [la, ln]; }
        }
    }
    return best;
}

function buildRegionLabels() {
    regionLabels.forEach(l => l.marker.remove());
    regionLabels.length = 0;
    if (!state.map.getPane("regionLabels")) {
        const pane = state.map.createPane("regionLabels");
        pane.style.zIndex = 450; // над canvas с метками (overlayPane, 400), под попапами
        pane.style.pointerEvents = "none";
    }
    for (const r of Object.values(state.regions)) {
        const extent = Math.max(r.bounds[1][0] - r.bounds[0][0], r.bounds[1][1] - r.bounds[0][1]);
        const tier = extent > 0.25 ? "lg" : extent > 0.08 ? "md" : "sm";
        const pos = labelPoint(r.rings, r.bounds);
        const marker = L.marker(pos, {
            pane: "regionLabels", interactive: false, keyboard: false,
            icon: L.divIcon({ className: "pw-region-label pw-region-" + tier, html: `<span>${escapeHtml(r.ru)}</span>`, iconSize: [0, 0] })
        }).addTo(state.map);
        regionLabels.push({ marker, el: marker.getElement(), pos, extent, w: 0, h: 0, on: false });
    }
    regionLabels.sort((a, b) => b.extent - a.extent);
    updateRegionLabels();
}

function updateRegionLabels(z = state.map.getZoom()) {
    if (!regionLabels.length) return;
    const map = state.map, perDeg = 256 * Math.pow(2, z) / 360, taken = [];
    for (const l of regionLabels) {
        let show = l.extent * perDeg >= LABEL_MIN_PX;
        if (show) {
            if (!l.w) { const span = l.el.firstChild; l.w = span.offsetWidth; l.h = span.offsetHeight; }
            const p = map.project(l.pos, z);
            const rect = [p.x - l.w / 2 - LABEL_GAP, p.y - l.h / 2 - LABEL_GAP, p.x + l.w / 2 + LABEL_GAP, p.y + l.h / 2 + LABEL_GAP];
            show = !taken.some(t => rect[0] < t[2] && rect[2] > t[0] && rect[1] < t[3] && rect[3] > t[1]);
            if (show) taken.push(rect);
        }
        if (show !== l.on) { l.on = show; l.el.classList.toggle("is-on", show); }
    }
}

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
    document.getElementById("progress-count").textContent = total ? `${found} из ${total} меток (без ресурсов, врагов и заданий)` : "";
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
    state.map.flyToBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 13, duration: 0.7 });
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
        const items = group.items.filter(c => total[c.key] > 0 && (!q || c.name.toLowerCase().includes(q)));
        if (!items.length) return "";
        const gTotal = items.reduce((n, c) => n + (total[c.key] || 0), 0);
        const gDone = items.reduce((n, c) => n + (done[c.key] || 0), 0);
        const anyShown = items.some(c => !state.hidden.has(c.key));
        return `<div class="filter-group"><div class="filter-group-head"><div class="filter-group-title">${group.title} <span class="filter-hint">${gDone}/${gTotal}</span></div>` +
            `<button type="button" class="group-toggle" data-group="${escapeHtml(group.title)}">${anyShown ? "скрыть" : "показать"}</button></div>` +
            items.map(c => `<div class="filter-row"><button type="button" class="filter-item${state.hidden.has(c.key) ? " disabled" : ""}${total[c.key] ? "" : " is-empty"}" data-cat="${c.key}"><span class="filter-name"><i class="pw-filter-icon icon-${c.icon}" style="background:${c.color}"></i>${c.name}</span><span class="filter-count">${done[c.key] || 0}/${total[c.key] || 0}</span></button>${locateBtn(c, total)}</div>`).join("") +
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
const pinScale = z => z >= 14 ? 0.8 : z <= 10 ? 0.4 : 0.4 + 0.4 * (z - 10) / 4;
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

// Символ иконки берём из CSS (icons.css: .icon-<name>:before { content }), чтобы не дублировать таблицу кодов
function iconGlyph(name) {
    if (!glyphs.has(name)) {
        const el = document.createElement("i");
        el.className = "icon-" + name;
        el.style.cssText = "position:absolute;visibility:hidden";
        document.body.appendChild(el);
        const content = getComputedStyle(el, "::before").content;
        el.remove();
        glyphs.set(name, !content || content === "none" ? "" : content.replace(/^["']|["']$/g, ""));
    }
    return glyphs.get(name);
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
        NMPin.dot(ctx, g.cx, g.cy, g.r, found ? desaturate(def.color, 0.7) : def.color, k, "rgba(255,255,255,.85)");
        ctx.font = "11px icomoon";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.fillText(iconGlyph(def.icon), g.cx, g.cy);
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

    ctx.font = "15px icomoon";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(iconGlyph(def.icon), PIN.cx, PIN.cy);

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

// Спрайты с иконками можно рисовать только после загрузки шрифта иконок
if (document.fonts) {
    document.fonts.load("15px icomoon").catch(() => {}).then(() => {
        pinSprites.clear();
        redrawPins();
    });
}

// Подсказка с названием метки; на тач-экранах не нужна
const hoverTip = L.tooltip({ direction: "top", offset: [0, -36], opacity: 1, className: "pw-tip" });

function popupHtml(m) {
    const c = CAT_BY_KEY[m.cat];
    const done = state.found.has(String(m.id));
    const region = regionOf(m);
    return `<div class="pw-popup">
        <div class="pw-popup-cat" style="color:${c.color}">${c.name}</div>
        <h3>${escapeHtml(m.title || "Без названия")}</h3>
        <div class="pw-popup-meta"><span>${region ? escapeHtml(region.ru) : ""}</span><button type="button" class="pw-link-btn" data-copy="${m.id}" title="Скопировать ссылку на эту метку">Ссылка</button></div>
        ${m.img ? `<img class="pw-popup-img" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(popupImgUrl(m.img))}" data-full="${escapeHtml(popupImgUrl(m.img))}" alt="" title="Открыть изображение" onerror="this.remove()">` : ""}
        ${m.desc ? `<div class="pw-desc">${renderDesc(m.desc)}</div>` : ""}
        ${m.user ? `<button type="button" class="pw-del-btn" data-id="${m.id}">Удалить свою метку</button>` : ""}
        <button type="button" class="pw-done-btn${done ? " is-done" : ""}" data-id="${m.id}">${done ? "✓ Найдено — отменить" : "Отметить найденным"}</button>
    </div>`;
}

function toast(text) {
    const el = document.getElementById("pw-toast");
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
            .bindPopup(() => markerStack.html(m), { maxWidth: 320, maxHeight: 420, className: "pw-popup-wrap", autoPanPadding: [30, 30], keepInView: false });
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
    LS.write("pw_hidden_cats", [...state.hidden]);
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
            const m = it.m, c = CAT_BY_KEY[m.cat], z = regionOf(m);
            return `<button type="button" class="search-item${state.found.has(String(m.id)) ? " is-done" : ""}" data-marker="${escapeHtml(m.id)}" role="option"><i class="pw-filter-icon icon-${c.icon}" style="background:${c.color}"></i><span class="si-title">${escapeHtml(m.title || "Без названия")}</span><span class="si-zone">${z ? escapeHtml(z.ru) : ""}</span></button>`;
        }).join("") + (scored.length > shown.length ? `<div class="search-empty">Показано ${shown.length} из ${scored.length}. Уточните запрос.</div>` : "")
        : `<div class="search-empty">Ничего не найдено</div>`;
}

function focusMarker(id, { fly = true } = {}) {
    const m = state.markers.find(x => String(x.id) === String(id));
    if (!m) return false;
    if (state.hidden.has(m.cat)) { state.hidden.delete(m.cat); renderFilters(); applyVisibility(); }
    const open = () => {
        if (m._leaflet && state.layers[m.cat] && state.layers[m.cat].hasLayer(m._leaflet)) m._leaflet.openPopup();
        else L.popup({ className: "pw-popup-wrap", maxWidth: 320, offset: [0, -4] }).setLatLng(m.pos).setContent(popupHtml(m)).openOn(state.map);
    };
    const zoom = Math.max(state.map.getZoom(), 13);
    if (!fly) { state.map.setView(m.pos, zoom, { animate: false }); open(); return true; }
    state.map.once("moveend", open);
    state.map.flyTo(m.pos, zoom, { duration: 0.7 });
    return true;
}

function closeLightbox() { const lb = document.getElementById("pw-lightbox"); if (lb) lb.remove(); }
function openLightbox(src) {
    closeLightbox();
    const lb = document.createElement("div");
    lb.id = "pw-lightbox";
    lb.innerHTML = `<img src="${escapeHtml(src)}" alt=""><button type="button" aria-label="Закрыть">×</button>`;
    lb.addEventListener("click", closeLightbox);
    document.body.appendChild(lb);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

document.addEventListener("click", async e => {
    const img = e.target.closest(".pw-popup-img");
    if (img) { openLightbox(img.dataset.full || img.src); return; }
    const del = e.target.closest(".pw-del-btn");
    if (del) { deleteUserMarker(del.dataset.id); return; }
    if (e.target.closest("#pw-add-save")) { saveNewMarker(); return; }
    const btn = e.target.closest(".pw-done-btn");
    if (btn) { toggleFound(btn.dataset.id); return; }
    const go = e.target.closest(".pw-link");
    if (go) { e.preventDefault(); if (!focusMarker(go.dataset.goto)) toast("Эта метка есть только на сайте-источнике"); return; }
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
    LS.write("pw_hide_found", state.hideFound ? "1" : "");
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
// Запас вокруг карты: иначе maxBounds ограничивает автопрокрутку попапа и карта «отпрыгивает» назад
const pad = 0.4;
state.map = L.map("map", {
    minZoom: 9, maxZoom: 15, zoomSnap: 0.25, bounceAtZoomLimits: false, attributionControl: false,
    scrollWheelZoom: false, // вместо него — плавный зум из ../js/smooth-zoom.js
    // Без плавного появления тайлов: при смене уровня новые тайлы проявлялись из прозрачности (~200 мс), и карта мигала
    fadeAnimation: false,
    maxBounds: [[MAP_BOUNDS[0][0] - pad, MAP_BOUNDS[0][1] - pad], [MAP_BOUNDS[1][0] + pad, MAP_BOUNDS[1][1] + pad]]
});
pinRenderer = new PinCanvas({ padding: 0.05 });
enableSmoothWheelZoom(state.map);

// Положение карты запоминаем: при следующем открытии продолжаем с того же места
const VIEW_KEY = "pw_view2"; // pw_view хранил старый стартовый вид на весь архипелаг — его не подхватываем
function restoreView() {
    const v = LS.read(VIEW_KEY, null);
    if (v && isFinite(v.lat) && isFinite(v.lng) && isFinite(v.zoom)) state.map.setView([v.lat, v.lng], v.zoom, { animate: false });
    else state.map.setView(START_CENTER, START_ZOOM(), { animate: false });
}
state.map.on("moveend", () => {
    const c = state.map.getCenter();
    LS.write(VIEW_KEY, { lat: +c.lat.toFixed(5), lng: +c.lng.toFixed(5), zoom: state.map.getZoom() });
});
restoreView();

// Локальные тайлы MapGenie (спутниковая картинка). Список существующих лежит в manifest.json
function addTiles(tileSet) {
    const PalTiles = L.TileLayer.extend({
        getTileUrl(c) { return tileSet.has(`${c.z}/${c.x}/${c.y}`) ? `${ASSETS_ROOT}/tiles/${c.z}/${c.x}/${c.y}.webp` : BLANK_TILE; }
    });
    // Глубже z13 тайлов нет — картинка просто увеличивается (maxNativeZoom)
    new PalTiles("", { tileSize: 256, minZoom: TILE_MIN_Z, maxZoom: 15, minNativeZoom: TILE_MIN_Z, maxNativeZoom: TILE_MAX_Z, bounds: MAP_BOUNDS, errorTileUrl: BLANK_TILE }).addTo(state.map);
}

function copyMarkerLink(id) {
    const url = `${location.origin}${location.pathname}?marker=${id}`;
    const done = () => toast("Ссылка на метку скопирована");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => prompt("Ссылка на метку:", url));
    else prompt("Ссылка на метку:", url);
}

// ---------- Свои метки (хранятся в браузере пользователя) ----------
const userKey = () => "pw_user_" + state.mapId;
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
    L.popup({ className: "pw-popup-wrap", closeOnClick: false })
        .setLatLng(e.latlng)
        .setContent(`<div class="pw-popup pw-add-form">
            <h3>Новая метка</h3>
            <select id="pw-add-cat">${opts}</select>
            <input type="text" id="pw-add-title" placeholder="Название" maxlength="80">
            <textarea id="pw-add-desc" placeholder="Описание (необязательно)" maxlength="500" rows="3"></textarea>
            <button type="button" class="pw-done-btn" id="pw-add-save">Сохранить</button>
        </div>`)
        .openOn(state.map);
});

function saveNewMarker() {
    if (!pendingPos) return;
    const m = {
        id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        title: document.getElementById("pw-add-title").value.trim() || "Моя метка",
        desc: document.getElementById("pw-add-desc").value.trim(),
        cat: document.getElementById("pw-add-cat").value,
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
        app: "palworld_map_progress",
        map: state.mapId,
        updatedAt: new Date().toISOString(),
        foundCount: state.found.size,
        found: [...state.found],
        customMarkers: state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }))
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    a.download = `palworld_progress_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setIoStatus(`Сохранено: ${payload.found.length} отметок, ${payload.customMarkers.length} своих меток.`);
}
async function importProgress(file) {
    try {
        const data = JSON.parse(await file.text());
        if (!data || data.app !== "palworld_map_progress" || !Array.isArray(data.found)) throw new Error("это не файл прогресса Palworld");
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
    fetch(`${ASSETS_ROOT}/tiles/manifest.json`).then(r => r.json()),
    fetch(mapCfg.markersFile).then(r => r.json()),
    fetch(mapCfg.regionsFile).then(r => r.json()).catch(() => ({}))
]).then(([manifest, data, regions]) => {
    addTiles(new Set(manifest));
    state.raw = data;
    state.regions = regions;
    renderRegions();
    buildRegionLabels();
    state.map.on("zoom zoomend", () => updateRegionLabels());
    state.map.on("zoomanim", e => updateRegionLabels(e.zoom)); // анимированный зум: getZoom() до конца анимации старый
    state.markers = buildBase().concat(loadUserMarkers());
    state.loaded = true;
    buildMarkers();
    renderFilters();
    renderProgress();
    cloudPull();
    hideMapLoader();
    // Ссылка на метку: ?marker=<id>
    const wanted = new URLSearchParams(location.search).get("marker");
    if (wanted && !focusMarker(wanted, { fly: false })) toast("Метка по ссылке не найдена");
}).catch(() => {
    hideMapLoader();
    const el = document.getElementById("map-empty");
    el.textContent = "Не удалось загрузить карту (откройте страницу через веб-сервер, а не file://)";
    el.style.display = "grid";
});

document.getElementById("region-select").addEventListener("change", e => flyToRegion(e.target.value));

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
