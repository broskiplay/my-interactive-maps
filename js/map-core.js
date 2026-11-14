// Общее ядро движка карт: код, который раньше был скопирован в js/app.js каждой игры дословно.
// Подключается перед js/app.js (классический скрипт): объявления попадают в общую глобальную область,
// поэтому функции видят state, mapCfg, ASSETS_ROOT и прочее, что объявляет app.js — оно нужно только при вызове.
// Правите здесь — меняется сразу на всех картах. Особенности игры (ключи localStorage, категории, окна меток) остаются в её app.js.


const popupImgUrl = p => /^https?:/.test(p) ? p : `${ASSETS_ROOT}/${p}`;

const LS = {
    read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } },
    write(key, value) { try { localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); } catch (e) { /* localStorage недоступен */ } }
};

function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function loadFound() {
    state.found = new Set(LS.read(foundKey(), []).map(String));
}

function saveFound() {
    LS.write(foundKey(), [...state.found]);
    cloudPush("mapProgress", { foundIds: [...state.found] });
}

function cloudPush(col, data) {
    if (!cloud.db || !cloud.user) return;
    cloudRef(col).set({ ...data, ...(col === "mapProgress" ? marks.cloudFields() : {}), updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .catch(err => console.warn("Не удалось сохранить в Firestore:", err));
}

// Firebase теперь грузится не сразу: отметки, сделанные до первой синхронизации, накладываем на облачную версию,
// а не теряем. cloud.base — снимок найденного на момент загрузки карты (ставится при state.loaded).
function mergeLocalEdits(cloudSet) {
    const base = cloud.base;
    cloud.base = null;
    let changed = false;
    if (!base) return cloudSet;
    state.found.forEach(id => { if (!base.has(id) && !cloudSet.has(id)) { cloudSet.add(id); changed = true; } });
    base.forEach(id => { if (!state.found.has(id) && cloudSet.delete(id)) changed = true; });
    if (changed) setTimeout(() => cloudPush("mapProgress", { foundIds: [...state.found] }), 0);
    return cloudSet;
}

// ---------- Подсветка категории (кнопка-лупа в сайдбаре) ----------
// Метки выбранных категорий (можно несколько) получают статичное золотое свечение под капелькой (без пульсации) и рисуются поверх остальных.
const locateCats = new Set();

const litRank = l => locateCats.size && locateCats.has(l.options.cat) && !l.options.found ? 1 : 0; // найденные метки не подсвечиваются

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

function fitCategory(key, force) {
    const pts = state.markers.filter(m => m.cat === key && !markerHidden(m)).map(m => m.pos);
    if (!pts.length) return;
    const view = state.map.getBounds();
    if (!force && pts.some(p => view.contains(p))) return; // хоть одна метка уже на экране — карту не двигаем
    state.map.flyToBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: mapCfg.focusZoom || 13, duration: 0.7 });
}

// Подсветка запоминается и переезжает на другие устройства вместе с настройками показа (MapExtras.settingsSync):
// locateSaved — выбор целиком (по всем картам игры), locateCats — то, что подсвечено на этой карте
// (категории, которых здесь нет, pruneLocate убирает только отсюда, из сохранённого выбора они не пропадают).
const locateSaved = new Set();
const getLocate = () => [...locateSaved];
function setLocate(list) {
    locateSaved.clear(); locateCats.clear();
    (Array.isArray(list) ? list : []).forEach(k => { if (CAT_BY_KEY[k]) { locateSaved.add(k); locateCats.add(k); } });
}
const saveLocate = () => { if (typeof settings !== "undefined") settings.touch(); };

function locateCategory(key) {
    const add = !locateCats.has(key);
    add ? (locateCats.add(key), locateSaved.add(key)) : (locateCats.delete(key), locateSaved.delete(key));
    if (add && state.hidden.has(key)) { state.hidden.delete(key); applyVisibility(); }
    renderFilters();
    redrawPins();
    if (add) fitCategory(key);
    saveLocate();
}

function clearLocate() {
    locateCats.clear(); locateSaved.clear();
    renderFilters();
    redrawPins();
    saveLocate();
}

// Категории, которых нет на этой карте, в сайдбаре не показываются — подсветку с них снимаем
function pruneLocate(total) {
    if (state.loaded) for (const k of [...locateCats]) if (!total[k]) locateCats.delete(k);
}

const locateClearBtn = () => locateCats.size ? `<button type="button" class="locate-clear">Сбросить подсветку (${locateCats.size})</button>` : "";

const locateBtn = (c, total) => `<button type="button" class="filter-locate${locateCats.has(c.key) ? " is-on" : ""}" data-locate="${c.key}" aria-pressed="${locateCats.has(c.key)}" title="Подсветить на карте" aria-label="Подсветить на карте: ${escapeHtml(c.name)}"${total[c.key] ? "" : " disabled"}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg></button>`;

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

// Ресурсные узлы (категории с dot) — маленькие круглые точки: их тысячи, капельки закрыли бы карту. Центр точки = координата
const DOT = { w: 28, h: 28, cx: 14, cy: 14, r: 9, ax: 14, ay: 14, hover: 1.25 };

const geom = cat => CAT_BY_KEY[cat] && CAT_BY_KEY[cat].dot ? DOT : PIN;

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

// Повёрнутый на -45° квадрат: три скруглённых угла и один острый (остриё смотрит вниз)
function teardropPath(ctx, h) {
    ctx.beginPath();
    ctx.moveTo(-h, h);
    ctx.lineTo(-h, 0);
    ctx.arc(0, 0, h, Math.PI, Math.PI * 2.5);
    ctx.closePath();
}

function pinSprite(cat, found) {
    const key = cat + (found ? "|1" : "|0");
    let s = pinSprites.get(key);
    if (!s) { s = buildPinSprite(cat, found); pinSprites.set(key, s); }
    return s;
}

function redrawPins() {
    if (pinRenderer && pinRenderer._map) {
        pinRenderer._redrawBounds = null;
        pinRenderer._redraw();
    }
}

function applyFoundVisibility() {
    // Движок без слоёв по категориям (Dimraeth: один общий слой) сам решает, что показывать
    if (!state.layers) { refreshVisibility(); return; }
    state.markers.forEach(m => {
        const layer = state.layers[m.cat];
        if (!m._leaflet || !layer) return;
        const hide = markerHidden(m);
        if (hide) layer.removeLayer(m._leaflet);
        else if (!layer.hasLayer(m._leaflet)) layer.addLayer(m._leaflet);
    });
}

function setAll(visible) {
    state.hidden = visible ? new Set() : new Set(Object.keys(CAT_BY_KEY));
    renderFilters();
    applyVisibility();
}

const toggleSidebar = () => {
    const collapsed = document.getElementById("sidebar").classList.toggle("collapsed");
    document.getElementById("sidebar-toggle-btn").textContent = collapsed ? "▶" : "◀";
    setTimeout(() => state.map && state.map.invalidateSize(), 320);
};

function setAddMode(on) {
    state.adding = on;
    const b = document.getElementById("add-marker-btn");
    b.classList.toggle("active", on);
    b.textContent = on ? "Кликните по карте… (отмена)" : "＋ Добавить свою метку";
    document.getElementById("map").classList.toggle("adding", on);
    if (!on) state.map.closePopup();
}

let pendingPos = null;

// ---------- Экспорт и импорт прогресса ----------
function setIoStatus(text) { document.getElementById("io-status").textContent = text; }

function hideMapLoader() {
    const el = document.getElementById("map-loader");
    if (!el || el.classList.contains("is-done")) return;
    setTimeout(() => {
        el.classList.add("is-done");
        setTimeout(() => el.remove(), 700);
    }, Math.max(0, 800 - (performance.now() - loaderShownAt)));
}

// Метка скрыта как найденная или не проходит фильтр «только мои отметки»; категория видна с учётом этого фильтра
function markerHidden(m) {
    const id = String(m.id), done = state.found.has(id);
    return (state.hideFound && done) || !marks.pass(m.id);
}

function catHidden(key) { return marks.filterActive() ? !marks.catShown(key) : state.hidden.has(key); }

function extrasAfterPull() {
    settings.pull();
    if (regionProgress.pullCloud) regionProgress.pullCloud();
}

const focusView = MapExtras.focusMode({ map: () => state.map });

// Адрес карты — /<игра>/<карта>/ (страницы локаций создаёт scripts/map_pages.py, у них <base href="../">).
// MAP_HOME — папка игры; старые ссылки ?map=<id> ещё в <head> перенаправляются на новый адрес (early-data).
const MAP_HOME = new URL(".", document.baseURI).pathname;

function urlMapId() {
    const seg = decodeURIComponent(location.pathname.slice(MAP_HOME.length).split("/")[0] || "");
    return seg && seg !== "index.html" ? seg : new URLSearchParams(location.search).get("map");
}

// Ссылка на категорию: ?cat=<ключ> — на карте остаётся только она, вид приближается к её меткам.
// Сюда ведут статические страницы категорий /<игра>/c/<ключ>/ (scripts/category_pages.py).
// Выбор попадает в обычные настройки фильтров: «Показать все» возвращает остальные категории.
// Если в ссылке есть ?marker=, приоритет у метки. Вызывать после buildMarkers() и renderFilters().
//
// Гайды сняты с сайта 2026-11-12 (архив: github.com/broskiplay/guides-games). Кто ушёл из режима гайда, не закрыв его,
// получает обратно набор скрытых категорий, сохранённый до входа в гайд (bp_guide_prev_<папка><карта>).
function guideRestorePrev() {
    const k = "bp_guide_prev_" + MAP_HOME + (urlMapId() || "");
    let s = null;
    try { s = JSON.parse(localStorage.getItem(k)); localStorage.removeItem(k); } catch (e) {}
    if (!s || !Array.isArray(s.hidden)) return false;
    state.hidden = new Set(s.hidden.filter(k => CAT_BY_KEY[k]));
    renderFilters();
    applyVisibility();
    return true;
}

function applyUrlCategory() {
    const q = new URLSearchParams(location.search), key = q.get("cat");
    guideRestorePrev();
    if (!key || q.get("marker") || !CAT_BY_KEY[key]) return false;
    state.hidden = new Set(Object.keys(CAT_BY_KEY).filter(k => k !== key));
    renderFilters();
    applyVisibility();
    if (typeof fitCategory === "function") fitCategory(key);
    return true;
}

// Долговременный кэш тайлов и картинок меток (см. /sw.js): после первого показа они берутся с диска,
// а не из хранилища на GitHub Pages. persist() просит браузер не вытеснять кэш при нехватке места;
// в Firefox он показывает запрос разрешения, поэтому там не вызываем.
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => { /* без кэша карта работает как раньше */ });
        try {
            if (navigator.storage && navigator.storage.persist && !/Firefox\//.test(navigator.userAgent)) {
                navigator.storage.persisted().then(p => p || navigator.storage.persist()).catch(() => {});
            }
        } catch (e) { /* не критично */ }
    });
}
