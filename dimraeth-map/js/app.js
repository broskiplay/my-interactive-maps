// Интерактивная карта Dimraeth (Эрлвуд, Затерянные пещеры, Святилище, Гоблинские пещеры).
// Категории — в categories.js. Здесь: карта, метки, карточки, поиск, прогресс, облако, правки владельца.
// Метки и описания — с dimraethdb.com: data/dimraeth_<карта>_markers.json (позиции) и data/dimraeth_db.json
// (существа, предметы, лавки, сундуки — общий справочник для карточек).

// ---------- Карты ----------
const HOST = "https://dimraethdb.com";
const MAPS = [
    { id: "wildwood", name: "Эрлвуд" },
    { id: "thelostcaverns", name: "Затерянные пещеры" },
    { id: "playerbase", name: "Святилище" },
    { id: "thegoblincaves", name: "Гоблинские пещеры" }
];
const BLANK_TILE = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const LS = {
    read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } },
    write(key, value) { try { localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); } catch (e) { /* localStorage недоступен */ } }
};
function currentMapId() {
    const id = new URLSearchParams(location.search).get("map");
    return MAPS.some(m => m.id === id) ? id : MAPS[0].id;
}

// Самые глубокие уровни тайлов (полное разрешение) удалены ради размера репозитория: картинка просто увеличивается.
// TOP_LEVELS_CUT — сколько уровней убрано; на диске их нет, но Leaflet-координаты (зум 0 = полное разрешение) не меняются.
const TOP_LEVELS_CUT = 1;

const state = {
    loaded: false, raw: null, adding: false, map: null, mapId: currentMapId(),
    hidden: new Set(), markers: [], found: new Set(), hideFound: false,
    group: L.layerGroup(), zones: [], size: { w: 1, h: 1 }, levels: 0,
    focus: null, focusIds: null, pct: 0, lv: [null, null]
};
const mapCfg = MAPS.find(m => m.id === state.mapId);
try { state.hideFound = !!localStorage.getItem("dr_hide_found"); } catch (e) { /* localStorage недоступен */ }
state.hidden = LS.read("dr_hidden_cats", null) ? new Set(LS.read("dr_hidden_cats", []).filter(k => CAT_BY_KEY[k])) : new Set(DEFAULT_HIDDEN);
state.lv = LS.read("dr_lv", [null, null]);
LS.write("dr_last_map", state.mapId);
let DB = { M: {}, I: {}, S: {}, C: {}, P: [], W: {} };

function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const esc = escapeHtml;
const num = v => v == null || v === "" ? "" : (Math.round(Number(v) * 100) / 100).toLocaleString("ru");
const qty = (lo, hi) => lo === hi ? num(lo) : `${num(lo)}–${num(hi)}`;
// Пути справочника всегда вида «/ru/...»; всё остальное отбрасываем
const wiki = path => typeof path === "string" && /^\/[A-Za-z0-9_\-./#?=:%]*$/.test(path) ? HOST + path : "";
const normQ = s => String(s || "").toLowerCase().replace(/ё/g, "е");

// ---------- Координаты ----------
// Метки лежат в процентах от картинки карты; Leaflet (CRS.Simple): lat = −y, lng = x в пикселях полного разрешения.
const toPos = (x, y) => [-(y / 100) * state.size.h, (x / 100) * state.size.w];
const toPct = p => ({ x: +((p[1] / state.size.w) * 100).toFixed(3), y: +((-p[0] / state.size.h) * 100).toFixed(3) });
const mapBounds = () => [[-state.size.h, 0], [0, state.size.w]];
const inBounds = (b, p) => p[0] >= b[0][0] && p[0] <= b[1][0] && p[1] >= b[0][1] && p[1] <= b[1][1];
const areaOf = b => (b[1][0] - b[0][0]) * (b[1][1] - b[0][1]);

// ---------- Справочник: карточки меток ----------
const itemRef = ik => {
    const I = DB.I[ik];
    if (!I) return "";
    return `<a class="dr-ref" href="${esc(wiki(I[1]))}" target="_blank" rel="noopener noreferrer">${I[2] ? `<img src="${esc(I[2])}" alt="" loading="lazy">` : ""}<span>${esc(I[0])}</span></a>`;
};
const monRef = mk => {
    const M = DB.M[mk];
    if (!M) return "";
    return `<a class="dr-ref" href="${esc(wiki(M[1]))}" target="_blank" rel="noopener noreferrer">${M[2] ? `<img src="${esc(M[2])}" alt="" loading="lazy">` : ""}<span>${esc(M[0])}</span></a>`;
};
const monLine = mk => {
    const M = DB.M[mk] || [];
    return [M[4], M[3] != null ? `Уровень ${num(M[3])}` : ""].filter(Boolean).join(" · ");
};
function dropList(mk) {
    const M = DB.M[mk];
    if (!M) return "";
    const lis = (M[5] || []).map(d => `<li>${itemRef(d[0])} <span class="dr-muted">x${qty(d[1], d[2])}, ${num(d[3])}% вероятность</span></li>`);
    if (M[6]) lis.push(`<li>Золото: ${qty(M[6][0], M[6][1])}, ${num(M[6][2])}% шанс.</li>`);
    return lis.length ? `<ul class="dr-drops">${lis.join("")}</ul>` : `<p class="dr-muted">Ничего не дает.</p>`;
}
const zoneOfMarker = m => {
    const hit = state.zones.filter(z => inBounds(z.bounds, m.pos)).sort((a, b) => areaOf(a.bounds) - areaOf(b.bounds))[0];
    return hit ? hit.name : "";
};
const markerLevel = m => m.r[0] === "m" ? (DB.M[m.r[1]] || [])[3] : null;
const isTracked = m => !UNTRACKED.has(m.cat);
const markerLink = m => `${location.origin}${location.pathname}?map=${state.mapId}&marker=${encodeURIComponent(String(m.id).replace("#", "-"))}`;

function popupHtml(m) {
    const c = CAT_BY_KEY[m.cat];
    const done = state.found.has(String(m.id));
    const ref = m.r || ["b", ""];
    let icon = "", title = esc(m.title || "Без названия"), sub = [], body = "", foot = [];
    const zone = zoneOfMarker(m);
    if (m.sub && ref[0] !== "r") sub.push(m.sub); else if (zone) sub.push(zone);

    if (ref[0] === "m") {
        const M = DB.M[ref[1]] || [];
        icon = M[2];
        if (wiki(M[1])) title = `<a href="${esc(wiki(M[1]))}" target="_blank" rel="noopener noreferrer">${esc(M[0] || m.title)}</a>`;
        sub = [monLine(ref[1])].concat(sub);
        if (m.pk) body += `<p class="dr-note">Появляется в группе: ${esc(m.pk)}.</p>`;
        body += `<p class="dr-h">Выпадает</p>${dropList(ref[1])}`;
        foot.push(`<button type="button" class="dr-link-btn" data-focus="m:${esc(ref[1])}">Показать каждое появление</button>`);
        if (wiki(M[1])) foot.push(`<a class="dr-link-btn" href="${esc(wiki(M[1]))}" target="_blank" rel="noopener noreferrer">Страница существа</a>`);
    } else if (ref[0] === "r") {
        const I = DB.I[ref[1]] || [];
        icon = I[2];
        body = `<p>${num(ref[2])} ${esc(I[0] || "")} за сбор.</p>`;
        (ref[3] || []).forEach(b => { body += `<p>${num(b[2])}% вероятность получить ${num(b[1])} ${esc((DB.I[b[0]] || [])[0] || "")}.</p>`; });
        body += `<ul class="dr-drops"><li>${itemRef(ref[1])}</li>${(ref[3] || []).map(b => `<li>${itemRef(b[0])}</li>`).join("")}</ul>`;
        foot.push(`<button type="button" class="dr-link-btn" data-focus="i:${esc(ref[1])}">Все места, где можно получить ${esc(I[0] || "")}</button>`);
    } else if (ref[0] === "c") {
        if (wiki(ref[2])) title = `<a href="${esc(wiki(ref[2]))}" target="_blank" rel="noopener noreferrer">${title}</a>`;
        body = DB.P[DB.C[ref[1]]] || `<p class="dr-muted">Файлы игры не указывают награду для этого сундука.</p>`;
        foot.push(`<a class="dr-link-btn" href="${esc(HOST + "/ru/tools/drops?source=" + encodeURIComponent("chest:" + ref[1]))}" target="_blank" rel="noopener noreferrer">Каталог выпадений</a>`);
    } else if (ref[0] === "d") {
        body = `<p class="dr-h">Выпадает при разрушении</p><ul class="dr-drops">${(ref[1] || []).map(d => `<li>${itemRef(d[0])} <span class="dr-muted">x${qty(d[1], d[2])}, ${num(d[3])}% шанс</span></li>`).join("")}</ul>`;
    } else if (ref[0] === "s") {
        const S = DB.S[ref[1]] || ["", "", []];
        title = wiki(S[1]) ? `<a href="${esc(wiki(S[1]))}" target="_blank" rel="noopener noreferrer">${esc(S[0])}</a>` : esc(S[0]);
        body = (S[2] || []).length
            ? `<table class="dr-stock"><thead><tr><th>Предмет</th><th>Цена</th></tr></thead><tbody>${S[2].map(r =>
                `<tr><td>${itemRef(r[0])}${r[3] ? `<small class="dr-muted">${esc(r[3])}</small>` : ""}</td><td class="num">${num(r[2])}</td></tr>`).join("")}</tbody></table>`
            : `<p class="dr-muted">Список запаса этой лавки пуст в файлах игры.</p>`;
        if (wiki(S[1])) foot.push(`<a class="dr-link-btn" href="${esc(wiki(S[1]))}" target="_blank" rel="noopener noreferrer">Список лавки</a>`);
    } else if (ref[0] === "b") {
        if (wiki(ref[1])) {
            title = `<a href="${esc(wiki(ref[1]))}" target="_blank" rel="noopener noreferrer">${title}</a>`;
            foot.push(`<a class="dr-link-btn" href="${esc(wiki(ref[1]))}" target="_blank" rel="noopener noreferrer">Открыть страницу</a>`);
        }
    }
    if (ref[0] === "k" && ref[2] && DB.I[ref[2]]) {
        icon = icon || DB.I[ref[2]][2];
        body = `<ul class="dr-drops"><li>${itemRef(ref[2])}</li></ul>` + body;
    }
    if (m.desc) body += `<p class="dr-user-desc">${esc(m.desc)}</p>`;

    const head = `<div class="dr-card-h">${icon
        ? `<img class="dr-card-icon" src="${esc(icon)}" alt="">`
        : `<i class="dr-card-sw gr-filter-icon icon-${c.icon}" style="background:${c.color}"></i>`}` +
        `<div class="dr-card-t"><div class="dr-popup-cat" style="color:${c.color}">${c.name}</div><h3>${title}</h3>` +
        `${sub.filter(Boolean).length ? `<div class="dr-popup-meta">${sub.filter(Boolean).map(esc).join(" · ")}</div>` : ""}</div></div>`;

    const actions = m.user ? `<button type="button" class="dr-del-btn" data-id="${esc(m.id)}">Удалить свою метку</button>` : "";
    return `<div class="dr-popup">${head}${body ? `<div class="dr-body">${body}</div>` : ""}` +
        `<div class="dr-foot">${foot.join("")}<button type="button" class="dr-link-btn" data-copy="${esc(m.id)}">Скопировать ссылку</button></div>${actions}` +
        `<button type="button" class="dr-done-btn${done ? " is-done" : ""}" data-id="${esc(m.id)}">${done ? "✓ Найдено — отменить" : "Отметить найденным"}</button></div>`;
}

function toast(text) {
    const el = document.getElementById("dr-toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2200);
}

// ---------- Прогресс (найдено) ----------
const foundKey = () => "dr_found_" + state.mapId;
function loadFound() { state.found = new Set(LS.read(foundKey(), []).map(String)); }
function saveFound() {
    LS.write(foundKey(), [...state.found]);
    cloudPush("mapProgress", { foundIds: [...state.found] });
}

// ---------- Облако: users/{uid}/mapProgress|customMarkers/dr_<карта> ----------
// Если документ в облаке есть — он главный (так удаления не «воскресают» со старых устройств).
const cloud = { db: null, user: null };
const cloudRef = (col, uid = cloud.user.uid) => cloud.db.collection("users").doc(uid).collection(col).doc("dr_" + state.mapId);
function cloudPush(col, data) {
    if (!cloud.db || !cloud.user) return;
    cloudRef(col).set({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .catch(err => console.warn("Не удалось сохранить в Firestore:", err));
}
const cleanUser = m => ({ id: String(m.id), title: String(m.title || "Моя метка").slice(0, 80), desc: String(m.desc || "").slice(0, 500), cat: m.cat, x: +m.x, y: +m.y });
const validUser = m => m && CAT_BY_KEY[m.cat] && isFinite(m.x) && isFinite(m.y);
function userToMarker(m) {
    return { ...cleanUser(m), sub: "", r: ["b", ""], pos: toPos(+m.x, +m.y), user: true };
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
            const mine = cm.data().markers.filter(validUser).map(userToMarker);
            state.markers = state.markers.filter(m => !m.user).concat(mine);
            saveUserMarkers(false);
        } else if (state.markers.some(m => m.user)) saveUserMarkers();
        buildMarkers();
        renderFilters();
        renderProgress();
    } catch (err) { console.warn("Не удалось загрузить из Firestore:", err); }
}

// ---------- Карты и области ----------
function renderMapSwitch() {
    // Выпадающий список карт: страница перезагружается с ?map=<id>
    const box = document.getElementById("map-switch");
    box.innerHTML = `<select class="map-select" aria-label="Выбор карты">${MAPS.map(m =>
        `<option value="${m.id}"${m.id === state.mapId ? " selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}</select>`;
    box.querySelector("select").addEventListener("change", e => { location.href = `?map=${e.target.value}`; });
}
function renderZones() {
    document.getElementById("zone-block").hidden = state.zones.length < 2;
    document.getElementById("zone-switch").innerHTML = state.zones.map(z =>
        `<button type="button" class="zone-btn" data-zone="${esc(z.id)}">${esc(z.name)}</button>`).join("");
}
function highlightZone() {
    if (!state.map || state.zones.length < 2) return;
    const c = state.map.getCenter(), p = [c.lat, c.lng];
    const hit = state.zones.filter(z => inBounds(z.bounds, p)).sort((a, b) => areaOf(a.bounds) - areaOf(b.bounds))[0];
    document.querySelectorAll(".zone-btn").forEach(b => b.classList.toggle("active", !!hit && b.dataset.zone === hit.id));
}
function flyToZone(id) {
    const z = state.zones.find(q => q.id === id);
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
    const tracked = state.markers.filter(isTracked);
    const found = tracked.reduce((n, m) => n + (state.found.has(String(m.id)) ? 1 : 0), 0);
    const total = tracked.length;
    const pct = total ? Math.round(found / total * 100) : 0;
    document.getElementById("progress-value").textContent = pct + "%";
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-bar").setAttribute("aria-valuenow", String(pct));
    document.getElementById("progress-count").textContent = total ? `${found} из ${total} меток` : "";
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
    const { total, done } = counts();
    pruneLocate(total);
    document.getElementById("filters-container").innerHTML = locateClearBtn() + CATEGORIES.map(group => {
        const items = group.items.filter(c => total[c.key]);
        if (!items.length) return "";
        const gTotal = items.reduce((n, c) => n + total[c.key], 0);
        const gDone = items.reduce((n, c) => n + (done[c.key] || 0), 0);
        const anyShown = items.some(c => !state.hidden.has(c.key));
        return `<div class="filter-group"><div class="filter-group-head"><div class="filter-group-title">${group.title} <span class="filter-hint">${gDone}/${gTotal}</span></div>` +
            `<button type="button" class="group-toggle" data-group="${esc(group.title)}">${anyShown ? "скрыть" : "показать"}</button></div>` +
            items.map(c => `<div class="filter-row"><button type="button" class="filter-item${state.hidden.has(c.key) ? " disabled" : ""}" data-cat="${c.key}"><span class="filter-name"><i class="gr-filter-icon icon-${c.icon}" style="background:${c.color}"></i>${c.name}</span><span class="filter-count">${done[c.key] || 0}/${total[c.key]}</span></button>${locateBtn(c, total)}</div>`).join("") +
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
// Тысячи DOM-элементов с тенями перерисовывались бы при каждом сдвиге и зуме, поэтому метки рисуются одним canvas
// из готовых спрайтов: панорамирование — это сдвиг одного слоя.
// Спрайт: размер w×h, остриё капельки в точке (ax, ay) — она совпадает с координатой метки.
const PIN = { w: 48, h: 64, cx: 24, cy: 26, r: 14, ax: 24, ay: 46, hover: 1.15 };
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
    const canvas = document.createElement("canvas");
    canvas.width = PIN.w * k; canvas.height = PIN.h * k;
    const ctx = getCtx(canvas);
    ctx.scale(k, k);

    ctx.save();
    ctx.translate(PIN.cx, PIN.cy);
    ctx.rotate(-Math.PI / 4);
    NMPin.drop(ctx, r => teardropPath(ctx, r), PIN.r, found ? desaturate(def.color, 0.7) : def.color, k, "rgba(255,246,223,.9)"); // объёмный пин: ../js/nm-pin.js
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
    },
    // Попап всегда над остриём метки, а не там, куда попал клик (поведение L.Marker)
    _getPopupAnchor() { return [0, -36]; },
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
const hoverTip = L.tooltip({ direction: "top", offset: [0, -36], opacity: 1, className: "dr-tip" });

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
        m._leaflet.redraw();
        markerStack.refresh(m);
    }
    refreshVisibility();
    renderFilters();
    renderProgress();
    renderSearchResults();
}

// ---------- Видимость меток ----------
// Метка видна, если её слой включён (либо она входит в результат поиска по источнику), она не скрыта как найденная
// и существо проходит фильтр по уровню.
function lvOk(m) {
    const [lo, hi] = state.lv;
    if ((lo == null && hi == null) || !LEVEL_CATS.has(m.cat)) return true;
    const lv = markerLevel(m);
    return lv == null || ((lo == null || lv >= lo) && (hi == null || lv <= hi));
}
function shouldShow(m) {
    if (state.hideFound && state.found.has(String(m.id))) return false;
    if (state.focusIds) return state.focusIds.has(String(m.id));
    return !state.hidden.has(m.cat) && lvOk(m);
}
function refreshVisibility() {
    state.markers.forEach(m => {
        if (!m._leaflet) return;
        const show = shouldShow(m);
        if (show && !state.group.hasLayer(m._leaflet)) state.group.addLayer(m._leaflet);
        else if (!show && state.group.hasLayer(m._leaflet)) state.group.removeLayer(m._leaflet);
    });
}
function applyVisibility() {
    LS.write("dr_hidden_cats", [...state.hidden]);
    refreshVisibility();
}

function buildMarkers() {
    state.group.clearLayers();
    state.markers.forEach(m => {
        m._leaflet = new PinMarker(m.pos, { renderer: pinRenderer, cat: m.cat, found: state.found.has(String(m.id)) })
            .bindPopup(() => markerStack.html(m), { maxWidth: 340, maxHeight: 460, className: "dr-popup-wrap", autoPanPadding: [30, 30], keepInView: false });
        m._leaflet.on("mouseover", () => {
            m._leaflet.options.hover = true;
            m._leaflet.redraw();
            if (m.title && !L.Browser.mobile) state.map.openTooltip(hoverTip.setContent(esc(m.title)), m._leaflet.getLatLng());
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
    refreshVisibility();
    buildSearchIndex();
}

function setAll(visible) {
    state.hidden = visible ? new Set() : new Set(Object.keys(CAT_BY_KEY));
    renderFilters();
    applyVisibility();
}

// ---------- Фокус: «где взять» предмет, все появления существа, одноимённые метки ----------
function itemTest(key, thr) {
    const w = DB.W[key] || [[], [], [], null, null];
    const mons = new Set(), loot = new Set(), shop = new Set(w[2] || []);
    (w[0] || []).forEach((k, i) => { const p = w[3] && w[3][i]; if (p == null || p >= thr) mons.add(k); });
    (w[1] || []).forEach((k, i) => { const p = w[4] && w[4][i]; if (p == null || p >= thr) loot.add(k); });
    return m => {
        const r = m.r || [];
        switch (r[0]) {
            case "m": return mons.has(r[1]);
            case "c": return loot.has(r[1]);
            case "s": return shop.has(r[1]);
            case "r": return r[1] === key || (r[3] || []).some(b => b[0] === key && b[2] >= thr);
            case "d": return (r[1] || []).some(b => b[0] === key && b[3] >= thr);
            case "k": return r[2] === key;
            default: return false;
        }
    };
}

function applyFocus() {
    const f = state.focus;
    document.getElementById("focus-banner").hidden = !f;
    if (!f) { state.focusIds = null; refreshVisibility(); return; }
    const test = f.kind === "i" ? itemTest(f.key, state.pct) : f.test;
    const list = state.markers.filter(test);
    state.focusIds = new Set(list.map(m => String(m.id)));
    document.getElementById("focus-label").textContent = f.label;
    document.getElementById("focus-count").textContent = `${list.length} на карте`;
    document.getElementById("focus-pct-wrap").hidden = f.kind !== "i";
    refreshVisibility();
    return list;
}
function setFocus(f) {
    state.focus = f;
    state.pct = 0;
    document.getElementById("focus-pct").value = "0";
    const list = applyFocus();
    if (!list || !list.length) { state.focus = null; applyFocus(); toast("На этой карте таких меток нет"); return; }
    if (list.length === 1) { focusMarker(list[0].id); return; }
    state.map.closePopup();
    state.map.flyToBounds(L.latLngBounds(list.map(m => m.pos)), { padding: [70, 70], maxZoom: 0.5, duration: 0.8 });
}
function clearFocus() {
    if (!state.focus) return;
    state.focus = null;
    applyFocus();
}

// ---------- Поиск ----------
let searchIndex = { creatures: new Map(), places: new Map(), items: [] };
function buildSearchIndex() {
    const creatures = new Map(), places = new Map(), items = new Set(Object.keys(DB.W));
    state.markers.forEach(m => {
        const r = m.r || [];
        if (r[0] === "m") { creatures.set(r[1], (creatures.get(r[1]) || 0) + 1); return; }
        if (r[0] === "k" && r[2]) items.add(r[2]);
        const k = m.cat + "|" + m.title;
        if (!places.has(k)) places.set(k, { title: m.title, cat: m.cat, ids: [] });
        places.get(k).ids.push(String(m.id));
    });
    searchIndex = { creatures, places, items: [...items].filter(k => DB.I[k]) };
}
function renderSearchResults() {
    const box = document.getElementById("search-results");
    const q = normQ(document.getElementById("search-input").value.trim());
    if (q.length < 2) { box.classList.remove("open"); box.innerHTML = ""; return; }
    const tier = name => {
        const s = normQ(name);
        if (s === q) return 0;
        if (s.startsWith(q)) return 1;
        if ((" " + s).includes(" " + q)) return 2;
        return s.includes(q) ? 3 : -1;
    };
    const rows = [];
    searchIndex.creatures.forEach((count, key) => {
        const M = DB.M[key], t = M ? tier(M[0]) : -1;
        if (t >= 0) rows.push({ t, kind: 0, name: M[0], icon: M[2], type: "Существо", count, act: { focus: "m:" + key } });
    });
    searchIndex.items.forEach(key => {
        const I = DB.I[key], t = tier(I[0]);
        if (t < 0) return;
        const count = state.markers.filter(itemTest(key, 0)).length;
        if (count) rows.push({ t, kind: 1, name: I[0], icon: I[2], type: "Предмет", count, act: { focus: "i:" + key } });
    });
    searchIndex.places.forEach(p => {
        const t = tier(p.title);
        if (t < 0) return;
        const c = CAT_BY_KEY[p.cat];
        rows.push({ t, kind: 2, name: p.title, cat: c, type: c.name, count: p.ids.length, act: p.ids.length === 1 ? { marker: p.ids[0] } : { place: p.cat + "|" + p.title } });
    });
    // метки по описанию лавок и пр. (название не совпало) не ищем: «где взять» закрывают предметы
    rows.sort((a, b) => a.t - b.t || a.kind - b.kind || a.name.length - b.name.length || a.name.localeCompare(b.name, "ru"));
    const shown = rows.slice(0, 14);
    box.classList.add("open");
    box.innerHTML = shown.length
        ? shown.map((r, i) => `<button type="button" class="search-item" data-row="${i}" role="option">${r.icon
            ? `<img class="si-icon" src="${esc(r.icon)}" alt="">`
            : `<i class="gr-filter-icon icon-${r.cat.icon}" style="background:${r.cat.color}"></i>`}` +
            `<span class="si-title">${esc(r.name)}</span><span class="si-zone">${esc(r.type)}${r.count > 1 || r.kind < 2 ? " · " + r.count : ""}</span></button>`).join("") +
            (rows.length > shown.length ? `<div class="search-empty">Показано ${shown.length} из ${rows.length}. Уточните запрос.</div>` : "")
        : `<div class="search-empty">На этой карте ничего не найдено</div>`;
    box._rows = shown;
}
function runSearchAct(act) {
    if (act.marker) { focusMarker(act.marker); return; }
    if (act.focus) { focusSpec(act.focus); return; }
    if (act.place) {
        const p = searchIndex.places.get(act.place);
        if (!p) return;
        const ids = new Set(p.ids);
        setFocus({ kind: "p", label: p.title, test: m => ids.has(String(m.id)) });
    }
}
function focusSpec(spec) {
    const [kind, key] = [spec.slice(0, 1), spec.slice(2)];
    if (kind === "m") {
        const M = DB.M[key];
        setFocus({ kind: "m", key, label: M ? M[0] : key, test: m => m.r && m.r[0] === "m" && m.r[1] === key });
    } else if (kind === "i") {
        const I = DB.I[key];
        setFocus({ kind: "i", key, label: I ? I[0] : key });
    }
}

function focusMarker(id, { fly = true } = {}) {
    const m = state.markers.find(x => String(x.id) === String(id));
    if (!m) return false;
    // метку, скрытую фильтрами, показываем: включаем её категорию и снимаем «скрыть найденные»
    if (state.hidden.has(m.cat)) { state.hidden.delete(m.cat); renderFilters(); applyVisibility(); }
    if (state.focusIds && !state.focusIds.has(String(m.id))) clearFocus();
    if (state.hideFound && state.found.has(String(m.id))) { state.hideFound = false; syncHideFoundBtn(); LS.write("dr_hide_found", ""); }
    refreshVisibility();
    const open = () => {
        if (m._leaflet && state.group.hasLayer(m._leaflet)) m._leaflet.openPopup();
        else L.popup({ className: "dr-popup-wrap", maxWidth: 340, offset: [0, -4] }).setLatLng(m.pos).setContent(popupHtml(m)).openOn(state.map);
    };
    const zoom = Math.max(state.map.getZoom(), -0.5);
    if (!fly) { state.map.setView(m.pos, zoom, { animate: false }); open(); return true; }
    state.map.once("moveend", open);
    state.map.flyTo(m.pos, zoom, { duration: 0.7 });
    return true;
}

// ---------- События интерфейса ----------
document.addEventListener("click", async e => {
    const del = e.target.closest(".dr-del-btn");
    if (del) { deleteUserMarker(del.dataset.id); return; }
    if (e.target.closest("#dr-add-save")) { saveNewMarker(); return; }
    const btn = e.target.closest(".dr-done-btn");
    if (btn) { toggleFound(btn.dataset.id); return; }
    const fcs = e.target.closest("[data-focus]");
    if (fcs) { focusSpec(fcs.dataset.focus); return; }
    const cp = e.target.closest("[data-copy]");
    if (cp) {
        const m = state.markers.find(x => String(x.id) === cp.dataset.copy);
        if (m) {
            const url = markerLink(m);
            try { await navigator.clipboard.writeText(url); toast("Ссылка скопирована"); } catch (err) { window.prompt("Скопируйте ссылку", url); }
        }
        return;
    }
    const zone = e.target.closest(".zone-btn");
    if (zone) { flyToZone(zone.dataset.zone); return; }
    const hit = e.target.closest(".search-item");
    if (hit) {
        const row = document.getElementById("search-results")._rows[+hit.dataset.row];
        if (row) runSearchAct(row.act);
        document.getElementById("search-results").classList.remove("open");
        if (L.Browser.mobile && window.innerWidth <= 480) toggleSidebar();
        return;
    }
    const gt = e.target.closest(".group-toggle");
    if (gt) {
        const group = CATEGORIES.find(g => g.title === gt.dataset.group);
        const { total } = counts();
        const items = group.items.filter(c => total[c.key]);
        const anyShown = items.some(c => !state.hidden.has(c.key));
        items.forEach(c => anyShown ? state.hidden.add(c.key) : state.hidden.delete(c.key));
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
function syncHideFoundBtn() {
    const b = document.getElementById("hide-found-btn");
    b.setAttribute("aria-pressed", String(state.hideFound));
    b.textContent = state.hideFound ? "Показать отмеченные" : "Скрыть отмеченные";
}
syncHideFoundBtn();
document.getElementById("hide-found-btn").addEventListener("click", () => {
    state.hideFound = !state.hideFound;
    syncHideFoundBtn();
    LS.write("dr_hide_found", state.hideFound ? "1" : "");
    refreshVisibility();
});
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", renderSearchResults);
searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") { const first = document.querySelector("#search-results .search-item"); if (first) first.click(); }
    else if (e.key === "Escape") { searchInput.value = ""; renderSearchResults(); }
});
document.getElementById("focus-clear").addEventListener("click", () => { searchInput.value = ""; renderSearchResults(); clearFocus(); });
document.getElementById("focus-pct").addEventListener("change", e => {
    state.pct = +e.target.value || 0;
    const list = applyFocus();
    if (list && list.length > 1) state.map.flyToBounds(L.latLngBounds(list.map(m => m.pos)), { padding: [70, 70], maxZoom: 0.5, duration: 0.6 });
});

// Фильтр по уровню существ
const lvLo = document.getElementById("lv-lo"), lvHi = document.getElementById("lv-hi"), lvClear = document.getElementById("lv-clear");
function syncLevelInputs() {
    lvLo.value = state.lv[0] == null ? "" : state.lv[0];
    lvHi.value = state.lv[1] == null ? "" : state.lv[1];
    lvClear.hidden = state.lv[0] == null && state.lv[1] == null;
}
function onLevelInput() {
    const read = el => el.value === "" || !isFinite(+el.value) ? null : Math.max(1, Math.round(+el.value));
    state.lv = [read(lvLo), read(lvHi)];
    LS.write("dr_lv", state.lv);
    lvClear.hidden = state.lv[0] == null && state.lv[1] == null;
    refreshVisibility();
}
lvLo.addEventListener("input", onLevelInput);
lvHi.addEventListener("input", onLevelInput);
lvClear.addEventListener("click", () => { state.lv = [null, null]; LS.write("dr_lv", state.lv); syncLevelInputs(); refreshVisibility(); });
syncLevelInputs();

const toggleSidebar = () => {
    const collapsed = document.getElementById("sidebar").classList.toggle("collapsed");
    document.getElementById("sidebar-toggle-btn").textContent = collapsed ? "▶" : "◀";
    setTimeout(() => state.map && state.map.invalidateSize(), 320);
};
document.getElementById("sidebar-toggle-btn").addEventListener("click", toggleSidebar);
document.getElementById("sidebar-collapse-mobile").addEventListener("click", toggleSidebar);

// ---------- Карта ----------
// Большой запас вокруг картинки: иначе maxBounds ограничивает автопрокрутку попапа и карта «отпрыгивает» назад
state.map = L.map("map", {
    crs: L.CRS.Simple, minZoom: -8, maxZoom: 1.5 - TOP_LEVELS_CUT, zoomSnap: 0.25, bounceAtZoomLimits: false, attributionControl: false,
    scrollWheelZoom: false, // вместо него — плавный зум из ../js/smooth-zoom.js
    // Без плавного появления тайлов: при смене уровня новые тайлы проявлялись из прозрачности (~200 мс), и карта мигала
    fadeAnimation: false
});
pinRenderer = new PinCanvas({ padding: 0.05 });
enableSmoothWheelZoom(state.map);
state.group.addTo(state.map);

// Положение карты запоминаем: при следующем открытии продолжаем с того же места
const viewKey = () => "dr_view_" + state.mapId;
function restoreView() {
    const v = LS.read(viewKey(), null);
    if (v && isFinite(v.lat) && isFinite(v.lng) && isFinite(v.zoom)) state.map.setView([v.lat, v.lng], v.zoom, { animate: false });
    else state.map.fitBounds(mapBounds(), { padding: [10, 10], animate: false });
}
state.map.on("moveend", () => {
    if (!state.loaded) return;
    const c = state.map.getCenter();
    LS.write(viewKey(), { lat: +c.lat.toFixed(1), lng: +c.lng.toFixed(1), zoom: state.map.getZoom() });
    highlightZone();
});

// Адрес хранилища с тайлами (ASSETS_ROOT) — при переезде на свой домен меняется только он.
// Тайлы лежат в репозитории dimraeth-assets (GitHub Pages): tiles/<карта>/<z>/<x>/<y>.webp, z = 0 — самый мелкий уровень, state.levels — полное разрешение.
// Пустые (прозрачные) тайлы не хранятся — список существующих лежит в manifest.json.
const ASSETS_ROOT = "https://broskiplay.github.io/dimraeth-assets";
function addTiles(tileSet) {
    const DimraethTiles = L.TileLayer.extend({
        getTileUrl(c) {
            const key = `${c.z + state.levels}/${c.x}/${c.y}`;
            return tileSet.has(key) ? `${ASSETS_ROOT}/tiles/${state.mapId}/${key}.webp` : BLANK_TILE;
        }
    });
    new DimraethTiles("", {
        tileSize: 256, minZoom: -state.levels, maxZoom: 2 - TOP_LEVELS_CUT, minNativeZoom: -state.levels, maxNativeZoom: -TOP_LEVELS_CUT,
        bounds: mapBounds(), noWrap: true, errorTileUrl: BLANK_TILE
    }).addTo(state.map);
}

// ---------- Свои метки (хранятся в браузере пользователя) ----------
const userKey = () => "dr_user_" + state.mapId;
function loadUserMarkers() {
    return LS.read(userKey(), []).filter(validUser).map(userToMarker);
}
function saveUserMarkers(push = true) {
    const list = state.markers.filter(m => m.user).map(cleanUser);
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
    L.popup({ className: "dr-popup-wrap", closeOnClick: false })
        .setLatLng(e.latlng)
        .setContent(`<div class="dr-popup dr-add-form">
            <h3>Новая метка</h3>
            <select id="dr-add-cat">${opts}</select>
            <input type="text" id="dr-add-title" placeholder="Название" maxlength="80">
            <textarea id="dr-add-desc" placeholder="Описание (необязательно)" maxlength="500" rows="3"></textarea>
            <button type="button" class="dr-done-btn" id="dr-add-save">Сохранить</button>
        </div>`)
        .openOn(state.map);
});

function saveNewMarker() {
    if (!pendingPos) return;
    const at = toPct(pendingPos);
    const m = userToMarker({
        id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        title: document.getElementById("dr-add-title").value.trim() || "Моя метка",
        desc: document.getElementById("dr-add-desc").value.trim(),
        cat: document.getElementById("dr-add-cat").value, ...at
    });
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
        app: "dimraeth_map_progress",
        map: state.mapId,
        updatedAt: new Date().toISOString(),
        foundCount: state.found.size,
        found: [...state.found],
        customMarkers: state.markers.filter(m => m.user).map(cleanUser)
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    a.download = `dimraeth_${state.mapId}_progress_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setIoStatus(`Сохранено: ${payload.found.length} отметок, ${payload.customMarkers.length} своих меток.`);
}
async function importProgress(file) {
    try {
        const data = JSON.parse(await file.text());
        if (!data || data.app !== "dimraeth_map_progress" || !Array.isArray(data.found)) throw new Error("это не файл прогресса Dimraeth");
        if (data.map && data.map !== state.mapId) throw new Error("файл от другой карты — откройте её и импортируйте там");
        const known = new Set(state.markers.map(m => String(m.id)));
        const before = state.found.size;
        data.found.map(String).forEach(id => state.found.add(id));
        let added = 0;
        (Array.isArray(data.customMarkers) ? data.customMarkers : []).forEach(m => {
            if (!validUser(m) || known.has(String(m.id))) return;
            state.markers.push(userToMarker(m));
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

// Основные метки карты
function buildBase() {
    return ((state.raw && state.raw.markers) || [])
        .filter(m => isFinite(m.x) && isFinite(m.y))
        .map(m => ({ id: String(m.id), title: m.t, sub: m.s, cat: m.c, x: m.x, y: m.y, r: m.r || ["b", ""], pk: m.pk, desc: m.d || "", pos: toPos(m.x, m.y) }))
        .filter(m => CAT_BY_KEY[m.cat]);
}

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

renderMapSwitch();
loadFound();
renderProgress();

// ---------- Загрузка данных ----------
const json = url => fetch(url).then(r => { if (!r.ok) throw new Error(url + ": " + r.status); return r.json(); });
Promise.all([
    json(`${ASSETS_ROOT}/tiles/${state.mapId}/manifest.json?v=2`),
    json(`data/dimraeth_${state.mapId}_markers.json`),
    json("data/dimraeth_db.json")
]).then(([manifest, data, db]) => {
    DB = db;
    state.raw = data;
    state.size = { w: data.w, h: data.h };
    state.levels = Math.max(0, ...manifest.map(k => +k.split("/")[0])) + TOP_LEVELS_CUT;
    state.zones = (data.zones || []).map(z => ({
        id: z.id, name: z.name,
        bounds: [[-(z.b[3] / 100) * data.h, (z.b[0] / 100) * data.w], [-(z.b[1] / 100) * data.h, (z.b[2] / 100) * data.w]]
    }));
    const pad = 3000;
    const b = mapBounds();
    state.map.setMaxBounds([[b[0][0] - pad, b[0][1] - pad], [b[1][0] + pad, b[1][1] + pad]]);
    state.map.setMinZoom(Math.floor((state.map.getBoundsZoom(b, false) - 0.5) * 4) / 4);
    addTiles(new Set(manifest));
    restoreView();
    state.markers = buildBase().concat(loadUserMarkers());
    state.loaded = true;
    renderZones();
    document.getElementById("level-filter").hidden = !state.markers.some(m => LEVEL_CATS.has(m.cat));
    buildMarkers();
    renderFilters();
    renderProgress();
    highlightZone();
    cloudPull();
    hideMapLoader();
    // Ссылка на метку: ?marker=<id>
    const wanted = new URLSearchParams(location.search).get("marker");
    if (wanted && !focusMarker(state.markers.find(m => String(m.id).replace("#", "-") === wanted)?.id ?? wanted, { fly: false })) toast("Метка по ссылке не найдена");
}).catch(err => {
    console.error(err);
    hideMapLoader();
    const el = document.getElementById("map-empty");
    el.textContent = "Не удалось загрузить карту (откройте страницу через веб-сервер, а не file://)";
    el.style.display = "grid";
});

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
            statusEl.innerHTML = `<b>${esc(user.displayName || user.email || "Google")}</b><br><span class="auth-online">● Облако активно</span>`;
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
