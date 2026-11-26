// Карты Tainted Grail: The Fall of Avalon
// tiles — папка тайлов MapGenie (z8..z13); rect — область самой карты внутри региона
// тайлов в долях [x0, y0, x1, y1] (от левого верхнего угла), T — перевод координат меток (см. markerPos).
// Тайлы и картинки из окон меток лежат в репозитории tainted-grail-assets (GitHub Pages):
// tiles/<карта>/<zoom Leaflet>/<строка>/<столбец>.webp и popups/<id>.webp.
// В данных меток поле img — путь вида popups/<id>.webp; ссылки http(s) остаются как есть.
const ASSETS_ROOT = "https://broskiplay.github.io/tainted-grail-assets";
const MAPS = [
    { id: "horns-of-the-south", name: "Рога Юга", tiles: "horns-of-the-south", rect: [0.2217, 0.2202, 0.7783, 0.7798], T: { ay: 0.6918812, by: 1365.1355, ax: 0.8187288, bx: 1010.6753 } },
    { id: "cuanacht", name: "Кунахт", tiles: "cuanacht", rect: [0.1484, 0.2949, 0.8516, 0.7051], T: { ay: 0.5075756, by: 2093.6812, ax: 1.0331949, bx: 201.1201 } },
    { id: "forlorn-swords", name: "Забытые Мечи", tiles: "forlorn", rect: [0.2222, 0.2217, 0.7773, 0.7783], T: { ay: 0.6860139, by: 1387.4959, ax: 0.8163158, bx: 1017.7084 } },
    { id: "sarras", name: "Саррас", dlc: true, tiles: "sarras", rect: [0.2217, 0.2202, 0.7808, 0.7798], T: { ay: 0.6910644, by: 1371.4399, ax: 0.8214323, bx: 1011.1327 } }
];

// Регион тайлов: тайл 127/127 на z8, на z13 это квадрат 8192×8192 px.
// Координаты Leaflet = пиксели z13 (lat вверх). Метки в JSON лежат в системе MapGenie и переводятся линейно:
// у каждой карты свой T — посчитан по всем меткам против широты/долготы MapGenie (Меркатор, z13), погрешность < 0.1 px.
// Прежняя растяжка «по границам разброса меток» сдвигала метки до 7 px z13.
const REGION = 8192;
const markerPos = (m, T) => [T.by + T.ay * m.lat, T.bx + T.ax * m.lng];

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
        { key: "campfire", name: "Костёр", color: "#d0602a" },
        { key: "workbench", name: "Верстак", color: "#8a6a4a" },
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

// Игровые иконки категорий: атлас images/cat-icons.webp из файлов игры (tools/tg_db/map_icons.py) —
// ячейки по CAT_ICONS.cols в ряд в порядке CATEGORIES. Пока атлас не загрузился, в пине рисуется прежний глиф.
// glyph — категории, которые остаются с прежним глифом шрифта (в атласе их нет)
const CAT_ICONS = { url: MAP_HOME + "images/cat-icons.webp?v=2", cols: 8, glyph: ["easter_egg"] };
const CAT_INDEX = Object.fromEntries(CATEGORIES.flatMap(g => g.items).filter(c => !CAT_ICONS.glyph.includes(c.key)).map((c, i) => [c.key, i]));
CAT_ICONS.rows = Math.ceil(Object.keys(CAT_INDEX).length / CAT_ICONS.cols);
const catAtlas = new Image();
catAtlas.onload = () => {
    pinSprites.clear();
    if (state.pins) state.pins.redrawSprites(); // спрайты уже лежат в WebGL — перерисовываем их там
};
catAtlas.src = CAT_ICONS.url;
// Значок категории для сайдбара и поиска: ячейка атласа фоном, кольцо — цвет категории
function catIconHtml(key) {
    const i = CAT_INDEX[key], c = CAT_BY_KEY[key] || CAT_BY_KEY.miscellaneous;
    if (i == null) return `<i class="tg-filter-icon icon-${key}" style="--c:${c.color}"></i>`;
    const x = (i % CAT_ICONS.cols) / (CAT_ICONS.cols - 1) * 100, y = Math.floor(i / CAT_ICONS.cols) / Math.max(1, CAT_ICONS.rows - 1) * 100;
    return `<i class="tg-filter-icon tg-gi" style="--c:${c.color};background-image:url('${CAT_ICONS.url}');background-size:${CAT_ICONS.cols * 100}% auto;background-position:${x.toFixed(3)}% ${y.toFixed(3)}%"></i>`;
}

// Категории взяты из иконок MapGenie; неизвестные ключи попадают в «Разное»
function refineCategory(m) {
    return CAT_BY_KEY[m.category] ? m.category : "miscellaneous";
}

const state = { loaded: false, raw: null, adding: false, map: null, mapId: null, hidden: new Set(), markers: [], found: new Set(), layers: null, pins: null, hideFound: false };
try { state.hideFound = !!localStorage.getItem("tg_hide_found"); } catch (e) { /* localStorage недоступен */ }
// Выбор категорий в сайдбаре запоминается между заходами (общий для всех карт игры)
try { state.hidden = new Set((JSON.parse(localStorage.getItem("tg_hidden_cats")) || []).filter(k => CAT_BY_KEY[k])); } catch (e) { /* localStorage недоступен */ }

const mapHref = (id, marker) => `${MAP_HOME}${id}/` + (marker == null ? "" : `?marker=${encodeURIComponent(marker)}`);
function currentMapId() {
    const id = urlMapId();
    return MAPS.some(m => m.id === id) ? id : MAPS[0].id;
}

// Описания MapGenie содержат markdown: **жирный**, [названия квестов], переносы \r\n
// [Название](карта:id) — ссылка на другую метку (задание): на этой карте переходит к ней, иначе открывает нужную карту
function formatDesc(desc) {
    return escapeHtml(desc || "")
        .replace(/\[([^\]]+)\]\(([a-z0-9-]+):(\d+)\)/g, (s, text, map, id) => {
            if (!MAPS.some(m => m.id === map)) return `<i>${text}</i>`;
            return map === state.mapId
                ? `<a class="tg-desc-link" href="?marker=${id}" data-goto="${id}">${text}</a>`
                : `<a class="tg-desc-link" href="${mapHref(map, id)}">${text}</a>`;
        })
        // [Название](/db/…) — ссылка на запись в базе данных (метки из файлов игры: вещи на трупах)
        .replace(/\[([^\]]+)\]\((\/db\/[a-z0-9\/-]+)\)/g, (s, text, url) => `<a class="tg-desc-link" href="${url}">${text}</a>`)
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
        cloud.synced = uid; // облако прочитано: с этого момента можно писать (до этого .set() затёр бы облачный прогресс)
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

// общий прогресс — как на остальных картах: свои метки игрока не считаются
function renderProgress() {
    const own = state.markers.filter(x => !x.user);
    const total = own.length, found = own.reduce((n, x) => n + (state.found.has(String(x.id)) ? 1 : 0), 0);
    const pct = total ? Math.round(found / total * 100) : 0;
    const el = id => document.getElementById(id);
    if (el("progress-value")) {
        el("progress-value").textContent = pct + "%";
        el("progress-fill").style.width = pct + "%";
        el("progress-bar").setAttribute("aria-valuenow", String(pct));
        el("progress-count").textContent = total ? `${found} из ${total} меток` : "";
    }
    renderRegionProgress(found, total);
}

function renderFilters() {
    renderProgress();
    const { total, done } = counts();
    pruneLocate(total);
    document.getElementById("filters-container").innerHTML = locateClearBtn() + CATEGORIES.map(group => {
        const items = group.items.filter(c => total[c.key] > 0); // поиск не сокращает список категорий (как во всех играх)
        if (!items.length) return "";
        return `<div class="filter-group"><div class="filter-group-title">${group.title}</div>` +
            items.map(c => `<div class="filter-row"><button type="button" class="filter-item${state.hidden.has(c.key) ? " disabled" : ""}" data-cat="${c.key}"><span class="filter-name">${catIconHtml(c.key)}${c.name}</span><span class="filter-count">${done[c.key] || 0}/${total[c.key] || 0}</span></button>${locateBtn(c, total)}</div>`).join("") +
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
    const k = SPRITE_K;
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

    const ci = CAT_INDEX[cat];
    if (catAtlas.complete && catAtlas.naturalWidth && ci != null) {
        // игровой значок поверх подложки пина
        const cell = catAtlas.naturalWidth / CAT_ICONS.cols, r = PIN.r * .8;
        ctx.drawImage(catAtlas, (ci % CAT_ICONS.cols) * cell, Math.floor(ci / CAT_ICONS.cols) * cell, cell, cell, PIN.cx - r, PIN.cy - r, r * 2, r * 2);
    } else {
        ctx.font = "15px icomoon";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.fillText(iconGlyph(cat), PIN.cx, PIN.cy);
    }

    if (!found) return canvas;
    ctx.font = "700 11px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
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


// Спрайты с иконками можно рисовать только после загрузки шрифта иконок
if (document.fonts) {
    document.fonts.load("15px icomoon").catch(() => {}).then(() => {
        pinSprites.clear();
        if (state.pins) state.pins.redrawSprites(); // спрайты уже лежат в WebGL — перерисовываем их там
    });
}

// «В базе →»: метка → запись базы /db/tainted-grail/<раздел>/<запись>/ (карту id → запись пишет scripts/db_pages.py)
const DB_BASE = "/db/tainted-grail/";
let dbLinks = null;
function dbLinkHtml(id) {
    const k = dbLinks && dbLinks[id];
    if (dbLinks && !k) return "";
    return `<a class="tg-db-link" data-dbm="${escapeHtml(String(id))}"${k ? ` href="${DB_BASE}${k}/"` : " hidden"} title="Открыть запись в базе данных">В базе →</a>`;
}
function loadDbLinks() {
    fetch(DB_BASE + "marker-links.json").then(r => r.ok ? r.json() : {}).catch(() => ({})).then(j => {
        dbLinks = j || {};
        document.querySelectorAll("a.tg-db-link[data-dbm]").forEach(a => {
            const k = dbLinks[a.dataset.dbm];
            if (k) { a.href = DB_BASE + k + "/"; a.hidden = false; } else a.remove();
        });
    });
}
("requestIdleCallback" in window ? requestIdleCallback : f => setTimeout(f, 1500))(loadDbLinks);

function popupHtml(m) {
    const c = CAT_BY_KEY[m.cat];
    const done = state.found.has(String(m.id));
    return `<div class="tg-popup">
        <div class="tg-popup-cat" style="color:${c.color}">${c.name}</div>
        <h3>${escapeHtml(m.title || "Без названия")}</h3>
        ${m.user ? "" : `<div class="tg-popup-meta"><button type="button" class="tg-link-btn" data-copy="${m.id}" title="Скопировать ссылку на эту метку">Ссылка</button>${dbLinkHtml(m.id)}</div>`}
        ${m.img ? `<img class="tg-popup-img" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(popupImgUrl(m.img))}" data-full="${escapeHtml(popupImgUrl(m.img))}" alt="" title="Открыть изображение" onerror="this.remove()">` : ""}
        ${m.desc ? `<p>${formatDesc(m.desc)}</p>` : ""}
        ${m.user ? `<button type="button" class="tg-del-btn" data-id="${m.id}">Удалить свою метку</button>` : ""}
        ${marks.html(m.id)}
        <button type="button" class="tg-done-btn${done ? " is-done" : ""}" data-id="${m.id}">${done ? "✓ Выполнено — отменить" : "Отметить выполненным"}</button>
    </div>`;
}

// Ссылка на метку: открывает карту с этой меткой (?marker=<id>)
function copyMarkerLink(id) {
    const url = `${location.origin}${location.pathname}?marker=${encodeURIComponent(id)}`;
    const done = () => toast("Ссылка на метку скопирована");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => prompt("Ссылка на метку:", url));
    else prompt("Ссылка на метку:", url);
}
function focusMarker(id) {
    const m = state.markers.find(x => String(x.id) === String(id) && !x.user);
    if (!m) return false;
    if (state.hidden.has(m.cat)) { state.hidden.delete(m.cat); renderFilters(); applyVisibility(); }
    state.map.setView(m.pos, Math.max(state.map.getZoom(), -1), { animate: false });
    if (state.pins && state.pins.has(m)) openMarkerPopup(m);
    else state.map.openPopup({ latlng: m.pos, content: popupHtml(m), className: "tg-popup-wrap" });
    return true;
}

// Результат поиска: своя метка тоже открывается (focusMarker ведёт только к меткам карты)
function openSearchHit(id) {
    if (!focusMarker(id)) {
        const m = state.markers.find(x => String(x.id) === String(id));
        if (!m) return;
        if (state.hidden.has(m.cat)) { state.hidden.delete(m.cat); renderFilters(); applyVisibility(); }
        state.map.setView(m.pos, Math.max(state.map.getZoom(), -1), { animate: false });
        if (state.pins && state.pins.has(m)) openMarkerPopup(m);
    } else history.replaceState(null, "", `?marker=${id}`);
    if (BPMap.Browser.mobile && window.innerWidth <= 480) toggleSidebar();
}

function toast(text) {
    const el = document.getElementById("tg-toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2200);
}

// Метки, стоящие «друг в друге» (при сильном сближении на карте): в попапе появляются стрелки для переключения между ними (../js/marker-stack.js)
const markerStack = MarkerStack.init({
    map: () => state.map, markers: () => state.markers, render: popupHtml, radius: () => 1.6 * PIN.r,
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
}

// ---------- Метки на карте (../js/bp-map.js: символы WebGL) ----------
// Показываются метки видимых категорий, кроме скрытых фильтрами «Скрыть отмеченные» / «Мои отметки»
const shownMarkers = () => state.markers.filter(m => !catHidden(m.cat) && !markerHidden(m));
const pinAnchor = m => () => [0, -36];
// Окно метки — над остриём; markerStack добавляет полоску «‹ 1 из 3 ›», если метки стоят друг в друге
const openMarkerPopup = m => state.map.openPopup({ latlng: m.pos, content: () => markerStack.html(m), className: "tg-popup-wrap", source: m, anchor: pinAnchor(m) });

function initPins() {
    state.pins = state.map.addPins({
        geoms: [PIN], geom: () => PIN, scale: () => 1, ratio: SPRITE_K,
        list: shownMarkers, pos: m => m.pos,
        sprite: m => {
            const found = state.found.has(String(m.id));
            return { key: "tg-" + m.cat + (found ? "|1" : "|0"), draw: () => pinSprite(m.cat, found) };
        },
        // подсвеченные категории (кнопка с лупой): над остальными и со свечением; найденные не подсвечиваются
        lit: m => locateCats.size > 0 && locateCats.has(m.cat) && !state.found.has(String(m.id)),
        glow: glowSprite, glowScale: g => g.r / 14 < 0.8 ? 0.72 : 1,
        badges: m => MapExtras.markOf(String(m.id)), badgeSprite: MapExtras.badgeSprite, badgeR: 7, badgeRatio: 3,
        // круг по «головке» капельки (или по самой точке) с запасом под палец — как было на Leaflet
        hit: () => ({ dy: PIN.r, r: PIN.r + 1 }), tol: BPMap.Browser.touch ? 8 : 0
    });
    state.pins.on("click", m => openMarkerPopup(m));
    // Подсказка с названием метки; на тач-экранах не нужна
    state.pins.on("mouseover", m => { if (m.title && !BPMap.Browser.mobile) state.map.showTip(escapeHtml(m.title), m.pos, pinAnchor(m), "tg-tip"); });
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
    try { localStorage.setItem("tg_hidden_cats", JSON.stringify([...state.hidden])); } catch (e) { /* localStorage недоступен */ }
    settings.touch();
}

function buildMarkers() {
    if (!state.pins) initPins();
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
    const go = e.target.closest("a[data-goto]");
    if (go && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        state.map.closePopup && state.map.closePopup();
        if (focusMarker(go.dataset.goto)) history.replaceState(null, "", `?marker=${go.dataset.goto}`);
        return;
    }
    const copy = e.target.closest("[data-copy]");
    if (copy) { copyMarkerLink(copy.dataset.copy); return; }
    const hit = e.target.closest(".search-item");
    if (hit) { openSearchHit(hit.dataset.marker); return; }
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
document.getElementById("search-input").addEventListener("input", () => { renderFilters(); renderSearchResults(); });

// ---------- Поиск по меткам: название, категория и описание ----------
// Индекс строится лениво и сбрасывается, когда меняется набор меток (своя метка добавлена/удалена, другая карта)
let searchIndex = null, searchIndexOf = null;
function plainDesc(desc) {
    return String(desc || "").replace(/\[([^\]]+)\]\([a-z0-9-]+:\d+\)/g, "$1").replace(/\*\*|[\[\]]/g, "");
}
function renderSearchResults() {
    const box = document.getElementById("search-results");
    const q = document.getElementById("search-input").value.trim().toLowerCase().replace(/ё/g, "е");
    if (q.length < 2) { box.classList.remove("open"); box.innerHTML = ""; return; }
    if (searchIndexOf !== state.markers) {
        searchIndexOf = state.markers;
        searchIndex = state.markers.map(m => {
            const title = String(m.title || "").toLowerCase().replace(/ё/g, "е");
            const cat = CAT_BY_KEY[m.cat] ? CAT_BY_KEY[m.cat].name.toLowerCase() : "";
            return { m, title, hay: title + " " + cat, desc: plainDesc(m.desc).toLowerCase().replace(/ё/g, "е") };
        });
    }
    const words = q.split(/\s+/).filter(Boolean);
    const scored = [];
    for (const it of searchIndex) {
        if (!words.every(w => it.hay.includes(w) || it.desc.includes(w))) continue;
        const inTitle = words.every(w => it.title.includes(w));
        scored.push({ it, score: it.title === q ? 0 : it.title.startsWith(q) ? 1 : inTitle ? 2 : words.every(w => it.hay.includes(w)) ? 3 : 4 });
    }
    scored.sort((a, b) => a.score - b.score || a.it.title.localeCompare(b.it.title, "ru"));
    const shown = scored.slice(0, 50);
    box.classList.add("open");
    box.innerHTML = shown.length
        ? shown.map(({ it, score }) => {
            const m = it.m, c = CAT_BY_KEY[m.cat] || {};
            return `<button type="button" class="search-item${state.found.has(String(m.id)) ? " is-done" : ""}" data-marker="${escapeHtml(String(m.id))}" role="option" title="${score === 4 ? "Найдено в описании" : ""}">${catIconHtml(m.cat)}<span class="si-title">${escapeHtml(m.title || "Без названия")}</span><span class="si-zone">${score === 4 ? "в описании" : escapeHtml(c.name || "")}</span></button>`;
        }).join("") + (scored.length > shown.length ? `<div class="search-empty">Показано ${shown.length} из ${scored.length}. Уточните запрос.</div>` : "")
        : `<div class="search-empty">Ничего не найдено на этой карте</div>`;
}

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
state.map = BPMap.create("map", {
    crs: "simple", // как L.CRS.Simple: координаты — пиксели исходной картинки
    minZoom: -3, maxZoom: 1.5, zoomSnap: 0.25,
    maxBounds: [[mapBounds[0][0] - pad, mapBounds[0][1] - pad], [mapBounds[1][0] + pad, mapBounds[1][1] + pad]]
});
state.map.fitBounds(mapBounds, { cover: true });

// Тайлы (репозиторий tainted-grail-assets): tiles/<карта>/<zoom Leaflet>/<строка от верха региона>/<столбец>.webp
// (уровень Leaflet 0 = z13 исходной сетки).
// Пустые чёрные тайлы не хранятся — список существующих лежит в manifest.json карты
fetch(`${ASSETS_ROOT}/tiles/${mapCfg.id}/manifest.json`).then(r => r.ok ? r.json() : null).catch(() => null).then(manifest => {
    const tileSet = manifest && new Set(manifest);
    state.map.addTiles({
        url: (z, x, y) => {
            const key = `${z}/${Math.pow(2, z + 5) + y}/${x}`;
            return !tileSet || tileSet.has(key) ? `${ASSETS_ROOT}/tiles/${mapCfg.id}/${key}.webp` : null;
        },
        minNative: -3, maxNative: 0, bounds: mapBounds,
        // Краевые тайлы содержат чёрные поля за пределами карты: всё вне mapBounds закрываем цветом фона
        clip: true
    });
});

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
    state.map.openPopup({ latlng: e.latlng, className: "tg-popup-wrap", closeOnClick: false, content: `<div class="tg-popup tg-add-form">
            <h3>Новая метка</h3>
            <select id="tg-add-cat">${opts}</select>
            <input type="text" id="tg-add-title" placeholder="Название" maxlength="80">
            <textarea id="tg-add-desc" placeholder="Описание (необязательно)" maxlength="500" rows="3"></textarea>
            <button type="button" class="tg-done-btn" id="tg-add-save">Сохранить</button>
        </div>` });
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
        .map(m => ({ ...m, cat: refineCategory(m), pos: markerPos(m, mapCfg.T) }))
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
    anchor: document.querySelector(".progress-card") || document.getElementById("map-switch"), storeKey: "tg_regions_open",
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
        const T = mapCfg.T;
        return { lat: +((p.lat - T.by) / T.ay).toFixed(2), lng: +((p.lng - T.bx) / T.ax).toFixed(2) };
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
        // Ссылка на метку: ?marker=<id>
        const wanted = new URLSearchParams(location.search).get("marker");
        if (wanted && !focusMarker(wanted)) toast("Метка по ссылке не найдена");
    })
    .catch(() => {
        hideMapLoader();
        const el = document.getElementById("map-empty");
        el.textContent = "Не удалось загрузить метки (откройте страницу через веб-сервер, а не file://)";
        el.style.display = "grid";
    });

// ---------- Вход через Google (тот же Firebase-проект, что и у Stellar Blade) ----------
const GOOGLE_BTN_HTML = '<svg class="google-icon" width="14" height="14" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span>Войти с Google</span>';

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
            statusEl.innerHTML = `<b>${escapeHtml(user.displayName || user.email || "Google")}</b><br><span class="auth-online">● Личный кабинет</span>`;
            btn.innerHTML = '<svg class="logout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg><span>Выйти</span>'; // как на главной: на телефоне видна только иконка
            btn.classList.add("logout");
            if (user.photoURL) {
                avatar.referrerPolicy = "no-referrer";
                avatar.onload = () => { avatar.style.display = "block"; avatar.parentElement.classList.add("has-avatar"); };
                avatar.onerror = () => { avatar.style.display = "none"; avatar.parentElement.classList.remove("has-avatar"); };
                avatar.src = user.photoURL;
            }
        } else {
            statusEl.innerHTML = "<b>Кабинет</b><br><span>Войдите через Google для синхронизации меток</span>";
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
