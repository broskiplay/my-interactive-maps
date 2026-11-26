// Интерактивная карта Gothic 1 Remake (Долина рудников).
// Категории и классификатор — в categories.js. Здесь: карта, метки, прогресс, облако, правки владельца.

// ---------- Карта и координаты ----------
// Тайлы MapGenie и картинки из окон меток лежат в репозитории gothic-remake-assets (GitHub Pages):
// tiles/<z>/<строка>/<столбец>.webp (z = 10..15, нумерация MapGenie), tiles/manifest.json, popups/<id>.webp.
// В данных меток поле img — путь вида popups/<id>.webp; ссылки http(s) остаются как есть.
const ASSETS_ROOT = "https://broskiplay.github.io/gothic-remake-assets";
// Вся картинка — это Долина рудников в центре и врезки вокруг (лагеря, Орочий анклав, Храм Спящего).
// Координаты Leaflet = пиксели z15 внутри региона (его покрывает один тайл z8: 32768 × 32768 px), lat — вверх.
const MAPS = [
    {
        // Файл собирает scripts/build_gothic.py: русские тексты и готовая категория (cat) в каждой метке
        id: "valley-of-mines", name: "Долина рудников", markersFile: "data/gothic_remake_valley-of-mines_markers.json"
    }
];
const TILE_Z = 15;
const REGION = 32768;
// Метки в JSON — в «координатах данных» источника; в Leaflet они переводятся линейно. Коэффициенты посчитаны
// по всем 1714 меткам против широты/долготы MapGenie (карта 945, Меркатор, пиксели z15): погрешность < 0.05 px.
// Прежние, подобранные на глаз по опорным точкам, сдвигали метки до 60 px вверх и вбок.
const T = { ax: 1.540313, bx: 10468.0654, ay: 0.7322834, by: 13470.2474 };
const markerPos = m => [T.by + T.ay * m.lat, T.bx + T.ax * m.lng];
const posToLatLng = p => ({ lat: +((p[0] - T.by) / T.ay).toFixed(2), lng: +((p[1] - T.bx) / T.ax).toFixed(2) });

// Граница тайлов (с запасом по краям картинки)
const MAP_BOUNDS = [[13824, 11776], [19200, 20736]];
// Зоны: прямоугольники во «врезках» картинки; mp(px, py) — из пикселей мозаики z13 (начало — тайл 4075/4077)
const zoneRect = (x0, y0, x1, y1) => [[19456 - 4 * y1, 11264 + 4 * x0], [19456 - 4 * y0, 11264 + 4 * x1]];
const ZONES = [
    { id: "valley", name: "Долина рудников", bounds: zoneRect(653, 420, 1901, 1111) },
    { id: "old_camp", name: "Старый лагерь", bounds: zoneRect(1082, 134, 1485, 397) },
    { id: "new_camp", name: "Новый лагерь", bounds: zoneRect(179, 636, 627, 883) },
    { id: "swamp_camp", name: "Болотный лагерь", bounds: zoneRect(1894, 636, 2355, 902) },
    { id: "orc_enclave", name: "Орочий анклав", bounds: zoneRect(1485, 1146, 1907, 1395) },
    { id: "sleeper_temple", name: "Храм Спящего", bounds: zoneRect(653, 1139, 1100, 1382) }
];
const ZONE_BY_ID = Object.fromEntries(ZONES.map(z => [z.id, z]));
const inBounds = (b, p) => p[0] >= b[0][0] && p[0] <= b[1][0] && p[1] >= b[0][1] && p[1] <= b[1][1];

const state = {
    loaded: false, raw: null, adding: false, map: null, mapId: MAPS[0].id,
    hidden: new Set(), markers: [], found: new Set(), layers: null, pins: null, hideFound: false, query: ""
};
const mapCfg = MAPS[0];
try { state.hideFound = !!localStorage.getItem("gr_hide_found"); } catch (e) { /* localStorage недоступен */ }
state.hidden = new Set(LS.read("gr_hidden_cats", []).filter(k => CAT_BY_KEY[k]));
LS.write("gr_last_map", state.mapId);

// ---------- Описания (markdown MapGenie): **жирный**, [названия], списки, таблицы ----------
function renderDesc(src) {
    const inline = s => escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[([^\]]+)\]/g, "<i>$1</i>").replace(/\*\*/g, "");
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
const foundKey = () => "gr_found_" + state.mapId;

// ---------- Облако: users/{uid}/mapProgress|customMarkers/gr_<карта> ----------
// Если документ в облаке есть — он главный (так удаления не «воскресают» со старых устройств).
const cloud = { db: null, user: null };
const cloudRef = (col, uid = cloud.user.uid) => cloud.db.collection("users").doc(uid).collection(col).doc("gr_" + state.mapId);

async function cloudPull() {
    if (!cloud.db || !cloud.user || !state.loaded) return;
    const uid = cloud.user.uid;
    try {
        const [prog, cm] = await Promise.all([cloudRef("mapProgress", uid).get(), cloudRef("customMarkers", uid).get()]);
        if (!cloud.user || cloud.user.uid !== uid) return;
        cloud.synced = uid; // облако прочитано: с этого момента можно писать (до этого .set() затёр бы облачный прогресс)
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

// ---------- Зоны, прогресс, фильтры ----------
function zoneOfMarker(m) { return zoneOf(m.lat != null ? m : posToLatLng(m.pos)); }

function renderZones() {
    document.getElementById("zone-switch").innerHTML = ZONES.map(z =>
        `<button type="button" class="zone-btn" data-zone="${z.id}">${z.name}</button>`).join("");
}
function highlightZone() {
    if (!state.map) return;
    const c = state.map.getCenter(), p = [c.lat, c.lng];
    // Самая маленькая из зон, внутри которой центр карты
    const hit = ZONES.filter(z => inBounds(z.bounds, p)).sort((a, b) => (a.bounds[1][1] - a.bounds[0][1]) - (b.bounds[1][1] - b.bounds[0][1]))[0];
    document.querySelectorAll(".zone-btn").forEach(b => b.classList.toggle("active", !!hit && b.dataset.zone === hit.id));
}
function flyToZone(id) {
    const z = ZONE_BY_ID[id];
    if (z) state.map.flyToBounds(z.bounds, { padding: [20, 20], duration: 0.8 });
}

function counts() {
    const total = {}, done = {};
    state.markers.forEach(m => {
        total[m.cat] = (total[m.cat] || 0) + 1;
        if (state.found.has(String(m.id))) done[m.cat] = (done[m.cat] || 0) + 1;
    });
    return { total, done };
}

function renderProgress() {
    const total = state.markers.length;
    const found = state.markers.reduce((n, m) => n + (state.found.has(String(m.id)) ? 1 : 0), 0);
    const pct = total ? Math.round(found / total * 100) : 0;
    document.getElementById("progress-value").textContent = pct + "%";
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-bar").setAttribute("aria-valuenow", String(pct));
    document.getElementById("progress-count").textContent = total ? `${found} из ${total} меток` : "";
    renderRegionProgress(found, total);
}

function renderFilters() {
    const { total, done } = counts();
    pruneLocate(total);
    document.getElementById("filters-container").innerHTML = locateClearBtn() + CATEGORIES.map(group => {
        const items = group.items.filter(c => total[c.key] > 0); // поиск не сокращает список категорий (как во всех играх)
        if (!items.length) return "";
        const gTotal = items.reduce((n, c) => n + (total[c.key] || 0), 0);
        const gDone = items.reduce((n, c) => n + (done[c.key] || 0), 0);
        const anyShown = items.some(c => !state.hidden.has(c.key));
        return `<div class="filter-group"><div class="filter-group-head"><div class="filter-group-title">${group.title} <span class="filter-hint">${gDone}/${gTotal}</span></div>` +
            `<button type="button" class="group-toggle" data-group="${escapeHtml(group.title)}">${anyShown ? "скрыть" : "показать"}</button></div>` +
            items.map(c => `<div class="filter-row"><button type="button" class="filter-item${state.hidden.has(c.key) ? " disabled" : ""}${total[c.key] ? "" : " is-empty"}" data-cat="${c.key}"><span class="filter-name">${catIconHtml(c.key)}${c.name}</span><span class="filter-count">${done[c.key] || 0}/${total[c.key] || 0}</span></button>${locateBtn(c, total)}</div>`).join("") +
            `</div>`;
    }).join("") + `<p class="filters-note">Двойной клик по категории — показать только её.</p>`;
}

// Игровые иконки категорий: атлас images/cat-icons.webp из UI-текстур игры (tools/g1r_db/map_icons.py) —
// ячейки по CAT_ICONS.cols в ряд в порядке CATEGORIES (есть у всех категорий). Пока атлас не загрузился, в пине — глиф шрифта.
const CAT_ICONS = { url: MAP_HOME + "images/cat-icons.webp?v=1", cols: 8 };
const CAT_INDEX = Object.fromEntries(CATEGORIES.flatMap(g => g.items).map((c, i) => [c.key, i]));
CAT_ICONS.rows = Math.ceil(Object.keys(CAT_INDEX).length / CAT_ICONS.cols);
const catAtlas = new Image();
catAtlas.onload = () => {
    pinSprites.clear();
    if (state.pins) state.pins.redrawSprites(); // спрайты уже лежат в WebGL — перерисовываем их там
};
catAtlas.src = CAT_ICONS.url;
// Значок категории для сайдбара и поиска: ячейка атласа поверх цвета категории
function catIconHtml(key) {
    const i = CAT_INDEX[key], c = CAT_BY_KEY[key] || CAT_BY_KEY.misc;
    if (i == null) return `<i class="gr-filter-icon icon-${c.icon}" style="--c:${c.color}"></i>`;
    const x = (i % CAT_ICONS.cols) / (CAT_ICONS.cols - 1) * 100, y = Math.floor(i / CAT_ICONS.cols) / Math.max(1, CAT_ICONS.rows - 1) * 100;
    return `<i class="gr-filter-icon gr-gi" style="--c:${c.color};background-image:url('${CAT_ICONS.url}');background-size:${CAT_ICONS.cols * 100}% auto;background-position:${x.toFixed(3)}% ${y.toFixed(3)}%"></i>`;
}

// ---------- Метки на canvas ----------
// Тысяча DOM-элементов с тенями и поворотом перерисовывается при каждом сдвиге и зуме, поэтому карта
// дёргалась. Метки рисуются одним canvas из готовых спрайтов: панорамирование — это сдвиг одного слоя.
// Спрайт: размер w×h, остриё капельки в точке (ax, ay) — она совпадает с координатой метки.
const PIN = { w: 48, h: 64, cx: 24, cy: 26, r: 14, ax: 24, ay: 46, hover: 1.15 };

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
    const canvas = document.createElement("canvas");
    canvas.width = PIN.w * k; canvas.height = PIN.h * k;
    const ctx = getCtx(canvas);
    ctx.scale(k, k);

    ctx.save();
    ctx.translate(PIN.cx, PIN.cy);
    ctx.rotate(-Math.PI / 4);
    NMPin.drop(ctx, r => teardropPath(ctx, r), PIN.r, found ? desaturate(def.color, 0.7) : def.color, k, "rgba(255,255,255,.85)"); // объёмный пин: ../js/nm-pin.js
    ctx.restore();

    const ci = CAT_INDEX[cat];
    if (catAtlas.complete && catAtlas.naturalWidth && ci != null) {
        // игровой «потёртый» значок с тёмной обводкой, как у иконок интерфейса игры
        const cell = catAtlas.naturalWidth / CAT_ICONS.cols, r = PIN.r * .78;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,.65)"; ctx.shadowBlur = 2 * k;
        ctx.drawImage(catAtlas, (ci % CAT_ICONS.cols) * cell, Math.floor(ci / CAT_ICONS.cols) * cell, cell, cell, PIN.cx - r, PIN.cy - r, r * 2, r * 2);
        ctx.restore();
    } else {
        ctx.font = "15px icomoon";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.fillText(iconGlyph(def.icon), PIN.cx, PIN.cy);
    }

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



// Спрайты с иконками можно рисовать только после загрузки шрифта иконок
if (document.fonts) {
    document.fonts.load("15px icomoon").catch(() => {}).then(() => {
        pinSprites.clear();
        if (state.pins) state.pins.redrawSprites(); // спрайты уже лежат в WebGL — перерисовываем их там
    });
}

// «В базе →»: метка → запись базы /db/gothic-remake/<раздел>/<запись>/ (карту id → запись пишет scripts/db_pages.py).
// Кнопка только у меток, у которых есть запись; файл грузится в простое, уже открытое окно дополняется по приходу
const DB_BASE = "/db/gothic-remake/";
let dbLinks = null;
function dbLinkHtml(id) {
    const k = dbLinks && dbLinks[id];
    if (dbLinks && !k) return "";
    return `<a class="gr-db-link" data-dbm="${escapeHtml(String(id))}"${k ? ` href="${DB_BASE}${k}/"` : " hidden"} title="Открыть запись в базе данных">В базе →</a>`;
}
function loadDbLinks() {
    fetch(DB_BASE + "marker-links.json").then(r => r.ok ? r.json() : {}).catch(() => ({})).then(j => {
        dbLinks = j || {};
        document.querySelectorAll("a.gr-db-link[data-dbm]").forEach(a => {
            const k = dbLinks[a.dataset.dbm];
            if (k) { a.href = DB_BASE + k + "/"; a.hidden = false; } else a.remove();
        });
    });
}
("requestIdleCallback" in window ? requestIdleCallback : f => setTimeout(f, 1500))(loadDbLinks);

function popupHtml(m) {
    const c = CAT_BY_KEY[m.cat];
    const done = state.found.has(String(m.id));
    const zone = ZONE_BY_ID[zoneOfMarker(m)];
    return `<div class="gr-popup">
        <div class="gr-popup-cat" style="color:${c.color}">${c.name}</div>
        <h3>${escapeHtml(m.title || "Без названия")}</h3>
        <div class="gr-popup-meta"><span>${zone ? zone.name : ""}</span>${m.user ? "" : `<button type="button" class="gr-link-btn" data-copy="${m.id}" title="Скопировать ссылку на эту метку">Ссылка</button>${dbLinkHtml(m.id)}`}</div>
        ${m.img ? `<img class="gr-popup-img" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(popupImgUrl(m.img))}" data-full="${escapeHtml(popupImgUrl(m.img))}" alt="" title="Открыть изображение" onerror="this.remove()">` : ""}
        ${m.desc ? `<div class="gr-desc">${renderDesc(m.desc)}</div>` : ""}
        ${m.user ? `<button type="button" class="gr-del-btn" data-id="${m.id}">Удалить свою метку</button>` : ""}
        ${marks.html(m.id)}
        <button type="button" class="gr-done-btn${done ? " is-done" : ""}" data-id="${m.id}">${done ? "✓ Найдено — отменить" : "Отметить найденным"}</button>
    </div>`;
}

function toast(text) {
    const el = document.getElementById("gr-toast");
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
    renderProgress();
    renderSearchResults();
}

// ---------- Метки на карте (../js/bp-map.js: символы WebGL) ----------
// Показываются метки видимых категорий, кроме скрытых фильтрами «Скрыть отмеченные» / «Мои отметки»
const shownMarkers = () => state.markers.filter(m => !catHidden(m.cat) && !markerHidden(m));
const pinAnchor = m => () => [0, -36];
// Окно метки — над остриём; markerStack добавляет полоску «‹ 1 из 3 ›», если метки стоят друг в друге
const openMarkerPopup = m => state.map.openPopup({ latlng: m.pos, content: () => markerStack.html(m), className: "gr-popup-wrap", source: m, anchor: pinAnchor(m) });

function initPins() {
    state.pins = state.map.addPins({
        geoms: [PIN], geom: () => PIN, scale: () => 1, ratio: SPRITE_K,
        list: shownMarkers, pos: m => m.pos,
        sprite: m => {
            const found = state.found.has(String(m.id));
            return { key: "gr-" + m.cat + (found ? "|1" : "|0"), draw: () => pinSprite(m.cat, found) };
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
    state.pins.on("mouseover", m => { if (m.title && !BPMap.Browser.mobile) state.map.showTip(escapeHtml(m.title), m.pos, pinAnchor(m), "gr-tip"); });
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
    LS.write("gr_hidden_cats", [...state.hidden]);
    settings.touch();
}

function buildMarkers() {
    if (!state.pins) initPins();
    applyVisibility();
    buildSearchIndex();
}

// ---------- Поиск по меткам ----------
let searchIndex = [];
function buildSearchIndex() {
    searchIndex = state.markers.map(m => ({ m, title: String(m.title || "").toLowerCase(), hay: (String(m.title || "") + " " + String(m.titleEn || "") + " " + (CAT_BY_KEY[m.cat] ? CAT_BY_KEY[m.cat].name : "")).toLowerCase(), desc: String(m.desc || "").toLowerCase() }));
}
function renderSearchResults() {
    const box = document.getElementById("search-results");
    const q = state.query;
    if (q.length < 2) { box.classList.remove("open"); box.innerHTML = ""; return; }
    const words = q.split(/\s+/).filter(Boolean);
    const scored = [];
    for (const it of searchIndex) {
        if (!words.every(w => it.hay.includes(w) || it.desc.includes(w))) continue;
        const inTitle = words.every(w => it.title.includes(w));
        scored.push({ it, score: (it.title === q ? 0 : it.title.startsWith(q) ? 1 : inTitle ? 2 : words.every(w => it.hay.includes(w)) ? 3 : 4) });
    }
    scored.sort((a, b) => a.score - b.score || a.it.title.localeCompare(b.it.title));
    const shown = scored.slice(0, 40);
    box.classList.add("open");
    box.innerHTML = shown.length
        ? shown.map(({ it }) => {
            const m = it.m, c = CAT_BY_KEY[m.cat], z = ZONE_BY_ID[zoneOfMarker(m)];
            return `<button type="button" class="search-item${state.found.has(String(m.id)) ? " is-done" : ""}" data-marker="${escapeHtml(m.id)}" role="option">${catIconHtml(c.key)}<span class="si-title">${escapeHtml(m.title || "Без названия")}</span><span class="si-zone">${z ? z.name : ""}</span></button>`;
        }).join("") + (scored.length > shown.length ? `<div class="search-empty">Показано ${shown.length} из ${scored.length}. Уточните запрос.</div>` : "")
        : `<div class="search-empty">Ничего не найдено</div>`;
}

// Ссылка на метку: открывает карту с этой меткой (?marker=<id>)
function copyMarkerLink(id) {
    const url = `${location.origin}${location.pathname}?marker=${encodeURIComponent(id)}`;
    const done = () => toast("Ссылка на метку скопирована");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => prompt("Ссылка на метку:", url));
    else prompt("Ссылка на метку:", url);
}

function focusMarker(id, { fly = true } = {}) {
    const m = state.markers.find(x => String(x.id) === String(id));
    if (!m) return false;
    if (state.hidden.has(m.cat)) { state.hidden.delete(m.cat); renderFilters(); applyVisibility(); }
    const open = () => {
        if (state.pins && state.pins.has(m)) openMarkerPopup(m);
        else state.map.openPopup({ latlng: m.pos, content: popupHtml(m), className: "gr-popup-wrap", offset: [0, -4] });
    };
    const zoom = Math.max(state.map.getZoom(), -1);
    if (!fly) { state.map.setView(m.pos, zoom, { animate: false }); open(); return true; }
    state.map.once("moveend", open);
    state.map.flyTo(m.pos, zoom, { duration: 0.7 });
    return true;
}

function closeLightbox() { const lb = document.getElementById("gr-lightbox"); if (lb) lb.remove(); }
function openLightbox(src) {
    closeLightbox();
    const lb = document.createElement("div");
    lb.id = "gr-lightbox";
    lb.innerHTML = `<img src="${escapeHtml(src)}" alt=""><button type="button" aria-label="Закрыть">×</button>`;
    lb.addEventListener("click", closeLightbox);
    document.body.appendChild(lb);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

document.addEventListener("click", async e => {
    const img = e.target.closest(".gr-popup-img");
    if (img) { openLightbox(img.dataset.full || img.src); return; }
    const copy = e.target.closest("[data-copy]");
    if (copy) { copyMarkerLink(copy.dataset.copy); return; }
    const del = e.target.closest(".gr-del-btn");
    if (del) { deleteUserMarker(del.dataset.id); return; }
    if (e.target.closest("#gr-add-save")) { saveNewMarker(); return; }
    const btn = e.target.closest(".gr-done-btn");
    if (btn) { toggleFound(btn.dataset.id); return; }
    const zone = e.target.closest(".zone-btn");
    if (zone) { flyToZone(zone.dataset.zone); return; }
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
    LS.write("gr_hide_found", state.hideFound ? "1" : "");
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
// Большой запас вокруг картинки: иначе maxBounds ограничивает автопрокрутку попапа и карта «отпрыгивает» назад
const pad = 3000;
state.map = BPMap.create("map", {
    crs: "simple", // как L.CRS.Simple: координаты — пиксели исходной картинки
    minZoom: -4, maxZoom: 0, zoomSnap: 0.25,
    maxBounds: [[MAP_BOUNDS[0][0] - pad, MAP_BOUNDS[0][1] - pad], [MAP_BOUNDS[1][0] + pad, MAP_BOUNDS[1][1] + pad]]
});

// Положение карты запоминаем: при следующем открытии продолжаем с того же места
const VIEW_KEY = "gr_view";
function restoreView() {
    const v = LS.read(VIEW_KEY, null);
    if (v && isFinite(v.lat) && isFinite(v.lng) && isFinite(v.zoom)) state.map.setView([v.lat, v.lng], v.zoom, { animate: false });
    else state.map.fitBounds(ZONE_BY_ID.valley.bounds, { padding: [10, 10], cover: true });
}
state.map.on("moveend", () => {
    const c = state.map.getCenter();
    LS.write(VIEW_KEY, { lat: +c.lat.toFixed(1), lng: +c.lng.toFixed(1), zoom: state.map.getZoom() });
    highlightZone();
});
restoreView();

// Локальные тайлы MapGenie. Чёрные (пустые) тайлы не хранятся — список существующих лежит в manifest.json
function addTiles(tileSet) {
    state.map.addTiles({
        url: (cz, cx, cy) => {
            const z = cz + TILE_Z;
            const x = 127 * Math.pow(2, cz + 7) + cx;
            const y = Math.pow(2, cz + 14) + cy;
            return tileSet.has(`${z}/${x}/${y}`) ? `${ASSETS_ROOT}/tiles/${z}/${y}/${x}.webp` : null;
        },
        minNative: -5, maxNative: -1, bounds: MAP_BOUNDS
    });
}

// ---------- Свои метки (хранятся в браузере пользователя) ----------
const userKey = () => "gr_user_" + state.mapId;
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
    state.map.openPopup({ latlng: e.latlng, className: "gr-popup-wrap", closeOnClick: false, content: `<div class="gr-popup gr-add-form">
            <h3>Новая метка</h3>
            <select id="gr-add-cat">${opts}</select>
            <input type="text" id="gr-add-title" placeholder="Название" maxlength="80">
            <textarea id="gr-add-desc" placeholder="Описание (необязательно)" maxlength="500" rows="3"></textarea>
            <button type="button" class="gr-done-btn" id="gr-add-save">Сохранить</button>
        </div>` });
});

function saveNewMarker() {
    if (!pendingPos) return;
    const m = {
        id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        title: document.getElementById("gr-add-title").value.trim() || "Моя метка",
        desc: document.getElementById("gr-add-desc").value.trim(),
        cat: document.getElementById("gr-add-cat").value,
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
        app: "gothic_remake_map_progress",
        map: state.mapId,
        updatedAt: new Date().toISOString(),
        foundCount: state.found.size,
        found: [...state.found],
        ...marks.exportFields(),
        customMarkers: state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }))
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    a.download = `gothic_remake_progress_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setIoStatus(`Сохранено: ${payload.found.length} отметок, ${payload.customMarkers.length} своих меток.`);
}
async function importProgress(file) {
    try {
        const data = JSON.parse(await file.text());
        if (!data || data.app !== "gothic_remake_map_progress" || !Array.isArray(data.found)) throw new Error("это не файл прогресса Gothic Remake");
        if (data.map && data.map !== state.mapId) throw new Error("файл от другой карты — откройте её и импортируйте там");
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

// Основные метки карты
function buildBase() {
    return ((state.raw && state.raw.markers) || [])
        .filter(m => isFinite(m.lat) && isFinite(m.lng))
        .map(m => {
            return { ...m, id: String(m.id), pos: markerPos(m) };
        })
        .filter(m => CAT_BY_KEY[m.cat]);
}

renderZones();
// ---------- Заметки к меткам, настройки показа в облаке, прогресс по регионам (../js/map-extras.js) ----------
const marks = MapExtras.marks({
    key: kind => "gr_" + kind + "_" + state.mapId, map: () => state.map, markers: () => state.markers,
    onSave: () => cloudPush("mapProgress", { foundIds: [...state.found] }),
    onChange: () => redrawPins(),
    onFilter: () => { applyVisibility(); applyFoundVisibility(); redrawPins(); }
});
const settings = MapExtras.settingsSync({
    pfx: "gr", cloud: () => cloud,
    read: () => ({ hidden: [...state.hidden], hideFound: state.hideFound }),
    apply: applySettings
});
// Выбор категорий и «Скрыть отмеченные», пришедшие с другого устройства
function applySettings(s) {
    state.hidden = new Set(s.hidden.filter(k => CAT_BY_KEY[k]));
    state.hideFound = s.hideFound;
    try { localStorage.setItem("gr_hide_found", state.hideFound ? "1" : ""); } catch (e) { /* localStorage недоступен */ }
    const b = document.getElementById("hide-found-btn");
    b.setAttribute("aria-pressed", String(state.hideFound));
    b.textContent = state.hideFound ? "Показать отмеченные" : "Скрыть отмеченные";
    renderFilters();
    applyVisibility();
    applyFoundVisibility();
}
const regionProgress = MapExtras.progressCard({
    anchor: document.querySelector(".progress-card"), title: "По регионам", storeKey: "gr_regions_open",
    onPick: r => { if (r.id !== "_") flyToZone(r.id); if (BPMap.Browser.mobile && window.innerWidth <= 480) toggleSidebar(); }
});
function renderRegionProgress() {
    const by = new Map();
    state.markers.forEach(m => { const z = ZONE_BY_ID[zoneOfMarker(m)]; addRegionRow(by, z ? z.id : "_", z ? z.name : "Вне зон", state.found.has(String(m.id))); });
    regionProgress.render([...by.values()].sort((a, b) => (a.id === "_") - (b.id === "_") || a.name.localeCompare(b.name, "ru")));
}
const addRegionRow = (by, id, name, found, extra) => {
    let r = by.get(id);
    if (!r) by.set(id, r = { id, name, found: 0, total: 0, ...extra });
    r.total++;
    if (found) r.found++;
};
// Фильтр «Мои отметки», режим «только карта», горячие клавиши, правка места метки, последняя карта для главной
marks.filterUI(document.getElementById("hide-found-btn").closest(".btn-group"));
MapExtras.hotkeys({ map: () => state.map, focus: focusView });
MapExtras.recordVisit("gothic", state.mapId);
MapExtras.setContext({
    map: () => state.map, toast,
    marker: id => state.markers.find(x => String(x.id) === String(id) && !x.user),
    toData: p => posToLatLng([p.lat, p.lng]),
});

loadFound();
renderFilters();
renderProgress();

// ---------- Загрузка данных ----------
// Подложка не ждёт меток: тайлы добавляем, как только пришёл manifest.json (метки и прочие данные догружаются параллельно)
const tilesReady = fetch(`${ASSETS_ROOT}/tiles/manifest.json`).then(r => r.json()).then(manifest => addTiles(new Set(manifest)));
Promise.all([
    tilesReady,
    fetch(mapCfg.markersFile).then(r => r.json())
]).then(([, data]) => {
    state.raw = data;
    state.markers = buildBase().concat(loadUserMarkers());
    state.loaded = true;
    cloud.base = new Set(state.found);
    marks.snapshot();
    buildMarkers();
    renderFilters();
    renderProgress();
    highlightZone();
    cloudPull();
    hideMapLoader();
    applyUrlCategory(); // ?cat=<категория>
    // Ссылка на метку: ?marker=<id>
    const wanted = new URLSearchParams(location.search).get("marker");
    if (wanted && !focusMarker(wanted, { fly: false })) toast("Метка по ссылке не найдена");
}).catch(() => {
    hideMapLoader();
    const el = document.getElementById("map-empty");
    el.textContent = "Не удалось загрузить карту (откройте страницу через веб-сервер, а не file://)";
    el.style.display = "grid";
});

// ---------- Вход через Google (тот же Firebase-проект, что и у остальных карт) ----------
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
