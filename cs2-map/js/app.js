// CS2 — карты раскидок гранат. Тайлы радаров и картинки раскидок — broskiplay.github.io/cs2-assets,
// метки — data/cs2_<карта>.json (tools/build_data.py), видео — VK Видео.
// /cs2-map/ — выбор карты и стороны; /cs2-map/<карта>/?side=t|ct — сама карта.
// Координаты — пиксели радара 2048×2048 (crs simple: lat = −y, lng = x), игровой зум 0 = радар 1:1.
"use strict";

const ASSETS_ROOT = "https://broskiplay.github.io/cs2-assets";
const MAPS = {
    dust2: { name: "Dust II", levels: 1 },
    mirage: { name: "Mirage", levels: 1 },
    inferno: { name: "Inferno", levels: 1 },
    nuke: { name: "Nuke", levels: 2 },
    ancient: { name: "Ancient", levels: 1 },
    anubis: { name: "Anubis", levels: 1 },
    overpass: { name: "Overpass", levels: 1 },
    vertigo: { name: "Vertigo", levels: 2 },
    cache: { name: "Cache", levels: 1 },
};
// Где на радаре спавн T (по точкам бросков сторон): карту поворачиваем так, чтобы своя сторона была снизу
const T_SPAWN = { dust2: "down", mirage: "right", inferno: "left", nuke: "left", ancient: "down", anubis: "down", overpass: "down", vertigo: "down", cache: "right" };
function sideBearing(side) {
    const t = { down: 0, right: -90, left: 90, up: 180 }[T_SPAWN[state.mapId]] || 0;
    return side === "ct" ? t + 180 : t;
}
const MAP_ORDER = ["dust2", "mirage", "inferno", "nuke", "ancient", "anubis", "overpass", "vertigo", "cache"];

const TYPES = [
    { key: "smoke", name: "Смоки", one: "Смок", color: "#cfd6e0" },
    { key: "flash", name: "Флешки", one: "Флешка", color: "#ffe36b" },
    { key: "molotov", name: "Молотовы", one: "Молотов", color: "#ff7a3d" },
    { key: "he", name: "Гранаты", one: "Граната", color: "#8ee06a" },
];
const TYPE = Object.fromEntries(TYPES.map(t => [t.key, t]));
const SIDE_NAME = { t: "Атака (T)", ct: "Защита (CT)" };
const ICON = {
    smoke: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.6 4.2 4.2 0 0 1 17.5 18Z"/></svg>',
    flash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 5 14h6l-1 8 8-12h-6z"/></svg>',
    molotov: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 3 5 5.5 5 10a5 5 0 0 1-10 0c0-2.4 1.2-3.9 2.4-5 .1 1.6.8 2.7 1.9 3.2C11 7.6 11 4.6 12 2Z"/></svg>',
    he: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="14" r="6.5"/><path d="M10 7.5V5h4v2.5M14 5l3-2"/></svg>',
};
const SIZE = 2048, TILE_MAX = 3;
const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* нет доступа */ } },
};
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const $ = id => document.getElementById(id);

// ---------- адрес: /cs2-map/<карта>/ ----------
const HOME = new URL(".", document.baseURI).pathname;
const seg = location.pathname.slice(HOME.length).split("/")[0];
const MAP_ID = MAPS[seg] ? seg : null;
const params = new URLSearchParams(location.search);

const state = {
    mapId: MAP_ID, side: params.get("side") === "ct" ? "ct" : params.get("side") === "t" ? "t" : null,
    level: 0, types: new Set(TYPES.map(t => t.key)), markers: [], groups: [], sel: null, map: null,
    nodes: [], lines: [], q: "",
};
try { const saved = JSON.parse(LS.get("cs2_types", "null")); if (Array.isArray(saved) && saved.length) state.types = new Set(saved.filter(k => TYPE[k])); } catch (e) { /* старый формат */ }

// ---------- экран выбора: карта → сторона ----------
function pickerHtml() {
    const cards = MAP_ORDER.map(id => `
        <a class="cs-card" href="${HOME}${id}/" data-map="${id}">
            <img src="${HOME}img/maps/${id}.webp" alt="" loading="lazy" decoding="async" width="640" height="360">
            <span class="cs-card-name">${esc(MAPS[id].name)}</span>
        </a>`).join("");
    return `<div class="cs-pick-in">
        <div class="cs-pick-head"><p class="cs-eyebrow">Counter-Strike 2 · раскидки гранат</p><h2>Выберите карту</h2></div>
        <div class="cs-grid">${cards}</div>
        <div class="bp-slot cs-ad" data-bp-slot="cs2"></div></div>`;
}
function sideHtml(id, counts) {
    const btn = s => `<button type="button" class="cs-side-pick" data-side="${s}">
            <span class="cs-side-badge">${s.toUpperCase()}</span>
            <span class="cs-side-txt"><b>${s === "t" ? "Атака" : "Защита"}</b><small>${counts ? counts[s] + " раскидок" : "&nbsp;"}</small></span>
        </button>`;
    return `<div class="cs-side-in" style="--bg:url('${HOME}img/maps/${id}.webp')">
        <p class="cs-eyebrow">${esc(MAPS[id].name)}</p><h2>За какую сторону играете?</h2>
        <div class="cs-side-row">${btn("t")}${btn("ct")}</div>
        <p class="cs-side-note">Сторону можно сменить на карте в любой момент.</p>
        ${MAP_ID ? "" : '<button type="button" class="cs-back" data-back>← Другая карта</button>'}</div>`;
}
function overlay(html) {
    let o = $("cs-pick");
    if (!o) { o = document.createElement("div"); o.id = "cs-pick"; o.className = "cs-pick"; ($("map") ? $("map").parentNode : document.body).appendChild(o); }  // в области карты: верхний и нижний бар сайта остаются
    o.innerHTML = html; o.hidden = false;
    document.documentElement.classList.add("cs-picking");
    return o;
}
function closeOverlay() { const o = $("cs-pick"); if (o) o.hidden = true; document.documentElement.classList.remove("cs-picking"); }

function showPicker() {
    const o = overlay(pickerHtml());
    window.bpSlot?.(o.querySelector(".bp-slot"));  // РСЯ под выбором карты (js/bp-slot.js); без bp-slot.js место просто пустое
    o.querySelectorAll(".cs-card").forEach(a => a.addEventListener("click", e => {
        e.preventDefault();
        askSide(a.dataset.map, null);
    }));
}
function askSide(id, counts) {
    const o = overlay(sideHtml(id, counts));
    o.querySelectorAll(".cs-side-pick").forEach(b => b.addEventListener("click", () => {
        LS.set("cs2_side", b.dataset.side);
        if (id === MAP_ID) { closeOverlay(); setSide(b.dataset.side); }
        else location.href = `${HOME}${id}/?side=${b.dataset.side}`;
    }));
    const back = o.querySelector("[data-back]");
    if (back) back.addEventListener("click", showPicker);
    o.querySelector(".cs-side-pick[data-side='" + (LS.get("cs2_side", "t")) + "']")?.focus();
}

// ---------- боковая панель ----------
function buildSidebar() {
    const sw = $("map-switch");
    if (sw) {
        sw.innerHTML = `<select id="map-select" aria-label="Карта">${MAP_ORDER.map(id => `<option value="${id}"${id === state.mapId ? " selected" : ""}>${esc(MAPS[id].name)}</option>`).join("")}</select>`;
        sw.querySelector("select").addEventListener("change", e => { location.href = `${HOME}${e.target.value}/?side=${state.side || "t"}`; });
        if (!state.mapId) sw.querySelector("select").insertAdjacentHTML("afterbegin", '<option value="" selected disabled>Выберите карту</option>');
    }
    const fc = $("filters-container");
    if (fc) {
        fc.innerHTML = `<div class="category-group"><div class="category-header"><span>Гранаты</span></div><div class="cs-types">${TYPES.map(t => `
            <label class="filter-item cs-type" style="--c:${t.color}">
                <input type="checkbox" value="${t.key}"${state.types.has(t.key) ? " checked" : ""}>
                <span class="cs-ico">${ICON[t.key]}</span><span class="filter-name">${t.name}</span><span class="filter-count" data-count="${t.key}">0</span>
            </label>`).join("")}</div></div>`;
        fc.addEventListener("change", e => { if (TYPE[e.target.value]) setType(e.target.value, e.target.checked); });
    }
    const si = $("search-input"), sr = $("search-results");
    if (si && sr) {
        si.addEventListener("input", () => {
            const q = si.value.trim().toLowerCase();
            if (q.length < 2) { sr.innerHTML = ""; sr.classList.remove("open"); return; }
            const hits = state.markers.filter(m => sideOk(m) && (m.title + " " + (m.en || "") + " " + (m.tname || "") + " " + (m.fname || "")).toLowerCase().includes(q)).slice(0, 30);
            sr.innerHTML = hits.length ? hits.map(m => `<button type="button" class="search-item" data-id="${m.id}"><span class="cs-ico" style="--c:${TYPE[m.cat].color}">${ICON[m.cat]}</span>${esc(m.title)}</button>`).join("") : '<div class="search-empty">Ничего не найдено</div>';
            sr.classList.add("open");
        });
        sr.addEventListener("click", e => {
            const b = e.target.closest("[data-id]");
            if (!b) return;
            const m = state.markers.find(x => x.id === b.dataset.id);
            sr.classList.remove("open"); si.value = "";
            if (m) { if (window.innerWidth <= 480 && !$("sidebar").classList.contains("collapsed")) toggleSidebar(); if (m.tlv !== state.level) setLevel(m.tlv); selectGroup(groupOf(m), true); openGuide(m); }
        });
    }
}

function setType(k, on) {
    on ? state.types.add(k) : state.types.delete(k);
    LS.set("cs2_types", JSON.stringify([...state.types]));
    document.querySelectorAll(`.cs-types input[value="${k}"]`).forEach(i => { i.checked = on; });
    render();
}

// ---------- панель на карте: гранаты, сторона и уровень ----------
function buildBar() {
    const bar = document.createElement("div");
    bar.className = "cs-bar";
    bar.innerHTML = `
        <div class="cs-seg cs-gtypes" role="group" aria-label="Гранаты">${TYPES.map(t => `
            <button type="button" data-type="${t.key}" style="--c:${t.color}" title="${t.name}" aria-label="${t.name}">${ICON[t.key]}<span>${t.name}</span></button>`).join("")}
        </div>
        <div class="cs-row"><div class="cs-seg cs-sides" role="group" aria-label="Сторона">
            <button type="button" data-side="t" title="${SIDE_NAME.t}"><b>T</b><span>Атака</span></button>
            <button type="button" data-side="ct" title="${SIDE_NAME.ct}"><b>CT</b><span>Защита</span></button>
        </div>
        ${MAPS[state.mapId].levels > 1 ? `<div class="cs-seg cs-levels" role="group" aria-label="Уровень">
            <button type="button" data-level="0">Верх</button><button type="button" data-level="1">Низ</button></div>` : ""}</div>
        <div class="cs-hint" id="cs-hint"></div>`;
    $("map").parentNode.appendChild(bar);
    bar.addEventListener("click", e => {
        const s = e.target.closest("[data-side]"), l = e.target.closest("[data-level]"), t = e.target.closest("[data-type]");
        if (t) setType(t.dataset.type, !state.types.has(t.dataset.type));
        if (s) { LS.set("cs2_side", s.dataset.side); setSide(s.dataset.side); }
        if (l) setLevel(+l.dataset.level);
    });
}
function syncBar() {
    document.querySelectorAll(".cs-sides [data-side]").forEach(b => b.setAttribute("aria-pressed", b.dataset.side === state.side));
    const has = new Set(state.markers.map(m => m.cat));
    document.querySelectorAll(".cs-gtypes [data-type]").forEach(b => { b.setAttribute("aria-pressed", state.types.has(b.dataset.type)); b.hidden = !has.has(b.dataset.type); });
    // «Верх/Низ» — только если раскидки есть на обоих уровнях (для выбранной стороны)
    const lv = new Set(state.markers.filter(sideOk).map(m => m.tlv));
    document.querySelectorAll(".cs-levels").forEach(e => { e.hidden = lv.size < 2; });
    document.querySelectorAll(".cs-levels [data-level]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.level === state.level));
    document.documentElement.dataset.csSide = state.side || "";
    const h = $("cs-hint");
    if (h) h.textContent = state.sel ? "Нажмите точку броска — откроется гайд" : "Нажмите на значок гранаты — покажем, откуда её кидать";
}
function setSide(s) {
    state.side = s;
    const u = new URL(location.href); u.searchParams.set("side", s);
    try { history.replaceState(history.state, "", u.pathname + u.search + u.hash); } catch (e) { /* нет History API */ }
    clearSel(); render();
    if (state.map && state.map.getBearing() !== sideBearing(s)) state.map.setBearing(sideBearing(s));
}
let tileLayers = [];
function setLevel(l) {
    if (l === state.level) return;
    state.level = l; clearSel(); addTiles(); render();
}

// ---------- карта ----------
const ll = p => [-p[1] / 1, p[0] / 1];
function addTiles() {
    const key = state.mapId + (state.level ? "-lower" : "");
    if (tileLayers[state.level]) { setTileVis(); return; }
    state.map.addTiles({
        url: (z, x, y) => {
            const tz = z + TILE_MAX, n = Math.pow(2, tz);
            if (tz < 0 || x < 0 || y < 0 || x >= n || y >= n) return null;
            return `${ASSETS_ROOT}/tiles/${key}/${tz}/${x}/${y}.webp`;
        },
        minNative: -TILE_MAX, maxNative: 0, bounds: [[-SIZE, 0], [0, SIZE]],
    });
    const ml = state.map.ml, ids = ml.getStyle ? null : null;
    state.map.whenReady(() => {
        const layers = ml.getStyle().layers.filter(l => l.type === "raster").map(l => l.id);
        tileLayers[state.level] = layers.find(id => !tileLayers.includes(id));
        setTileVis();
    });
}
function setTileVis() {
    const ml = state.map.ml;
    tileLayers.forEach((id, lv) => { if (id && ml.getLayer(id)) ml.setLayoutProperty(id, "visibility", lv === state.level ? "visible" : "none"); });
}

function sideOk(m) { return m.side === "any" || m.side === state.side; }

// цели: раскидки одного типа с близкой точкой падения (≤ 26 px) — один значок
function buildGroups() {
    const out = [];
    for (const m of state.markers) {
        const g = out.find(g => g.cat === m.cat && g.lv === m.tlv && Math.hypot(g.t[0] - m.t[0], g.t[1] - m.t[1]) <= 26);
        if (g) { g.list.push(m); g.t = [(g.t[0] * (g.list.length - 1) + m.t[0]) / g.list.length, (g.t[1] * (g.list.length - 1) + m.t[1]) / g.list.length]; }
        else out.push({ id: "g" + out.length, cat: m.cat, lv: m.tlv, t: m.t.slice(), list: [m] });
    }
    out.forEach(g => g.list.forEach(m => (m.g = g)));
    state.groups = out;
}
const groupOf = m => m.g;
function groupName(g) {
    const m = g.list[0], t = /\sна\s(.+?)(?:\sс\s.+)?$/.exec(m.title);
    return t ? t[1] : m.title;
}

function plural(n, one, few, many) { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; }
function clearNodes() { state.nodes.forEach(n => n.remove()); state.nodes = []; state.lines.forEach(l => l.remove()); state.lines = []; }
function node(p, html, cls, onClick, title) {
    const el = document.createElement("div");
    el.innerHTML = `<button type="button" class="${cls}"${title ? ` aria-label="${esc(title)}"` : ""}>${html}</button>`;
    const b = el.firstChild;
    b.addEventListener("click", e => { e.stopPropagation(); onClick(e); });
    if (title) {
        b.addEventListener("mouseenter", () => state.map.showTip(esc(title), ll(p), [0, -16], "cs-tip"));
        b.addEventListener("mouseleave", () => state.map.hideTip());
    }
    state.nodes.push(state.map.addLabel(ll(p), el));
    return b;
}

function counts() {
    const c = { t: 0, ct: 0 };
    state.markers.forEach(m => { if (m.side === "any") { c.t++; c.ct++; } else c[m.side]++; });
    return c;
}

function render() {
    if (!state.map) return;
    if (state.markers.length && !state.markers.some(m => sideOk(m) && m.tlv === state.level)) {  // на этом уровне пусто — на тот, где есть
        const m = state.markers.find(sideOk);
        if (m) { state.level = m.tlv; addTiles(); }
    }
    clearNodes(); syncBar();
    const per = Object.fromEntries(TYPES.map(t => [t.key, 0]));
    state.markers.forEach(m => { if (sideOk(m)) per[m.cat]++; });
    const has = new Set(state.markers.map(m => m.cat));  // типа нет на карте (напр. HE) — фильтр скрываем
    document.querySelectorAll("[data-count]").forEach(e => { e.textContent = per[e.dataset.count]; e.closest(".cs-type").hidden = !has.has(e.dataset.count); });
    const sel = state.sel;
    for (const g of state.groups) {
        if (g.lv !== state.level || !state.types.has(g.cat)) continue;
        const n = g.list.filter(sideOk).length;
        if (!n) continue;
        const b = node(g.t, `${ICON[g.cat]}${n > 1 ? `<i>${n}</i>` : ""}`, `cs-target cs-${g.cat}${sel === g ? " is-sel" : sel ? " is-dim" : ""}`,
            () => selectGroup(sel === g ? null : g), `${TYPE[g.cat].one}: ${groupName(g)}${n > 1 ? ` — ${n} ${plural(n, "вариант", "варианта", "вариантов")}` : ""}`);
        b.style.setProperty("--c", TYPE[g.cat].color);
    }
    if (sel) {
        const list = sel.list.filter(sideOk), fan = fanOut(list);
        list.forEach((m, i) => {
            const other = m.lv !== state.level;
            state.lines.push(state.map.addLine([ll(m.f), ll(sel.t)], { color: TYPE[m.cat].color, weight: 2, opacity: other ? .35 : .85, dashArray: "6 6" }));
            const b = node(m.f, `<span>${i + 1}</span>`, `cs-origin${other ? " is-other" : ""}`, () => openGuide(m),
                `${m.title}${other ? (m.lv ? " (нижний уровень)" : " (верхний уровень)") : ""}`);
            b.style.setProperty("--c", TYPE[m.cat].color);
            const d = fan.get(m);
            if (d) { b.style.setProperty("--dx", d[0] + "px"); b.style.setProperty("--dy", d[1] + "px"); }
        });
    }
    const empty = $("map-empty");
    if (empty) {
        const any = state.groups.some(g => g.lv === state.level && state.types.has(g.cat) && g.list.some(sideOk));
        empty.textContent = any ? "" : state.types.size ? "Для этой стороны и уровня раскидок нет" : "Включите хотя бы один тип гранат";
        empty.classList.toggle("show", !any);
    }
}
// Точки броска, которые при текущем зуме ложатся друг на друга (одно место, разная техника), — веером,
// чтобы на карте было видно столько точек, сколько написано на значке цели
function fanOut(list) {
    const k = Math.pow(2, state.map.getZoom()), b = state.map.getBearing() * Math.PI / 180, cb = Math.cos(b), sb = Math.sin(b), near = 28 / k, spot = [], fan = new Map();
    list.forEach(m => { const q = spot.find(q => q.some(o => Math.hypot(o.f[0] - m.f[0], o.f[1] - m.f[1]) < near)); q ? q.push(m) : spot.push([m]); });
    spot.forEach(ms => {
        if (ms.length < 2) return;
        const cx = ms.reduce((a, m) => a + m.f[0], 0) / ms.length, cy = ms.reduce((a, m) => a + m.f[1], 0) / ms.length, r = ms.length === 2 ? 15 : 13 + ms.length * 2;
        ms.forEach((m, j) => {
            const a = Math.PI * 2 * j / ms.length - Math.PI / 2;
            const dx = (cx - m.f[0]) * k, dy = (cy - m.f[1]) * k;  // сдвиг к центру кучки — в пикселях экрана с учётом поворота карты
            fan.set(m, [Math.round(dx * cb + dy * sb + Math.cos(a) * r), Math.round(-dx * sb + dy * cb + Math.sin(a) * r)]);
        });
    });
    state.fanKey = list.map(m => (fan.get(m) || [0, 0]).join(",")).join(";");
    return fan;
}
function selectGroup(g, fly) {
    state.sel = g;
    render();
    if (g && fly) {
        const pts = [g.t, ...g.list.filter(sideOk).map(m => m.f)];
        const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
        state.map.fitBounds([[-Math.max(...ys), Math.min(...xs)], [-Math.min(...ys), Math.max(...xs)]], { padding: [80, 80], maxZoom: 0 });
    }
}
function clearSel() { state.sel = null; closeGuide(); }

// ---------- гайд: картинка «куда целиться» → видео по ключевым моментам ----------
function moments(m, dur) {
    if (m.tt) { const t = +m.tt; return [0, Math.max(.5, t * .35), Math.max(0, t - .4), t + 2.5].map(v => Math.min(v, Math.max(0, (dur || 99) - .2))); }
    return [0, .15, .42, .65].map(f => f * (dur || 0));
}
const STEPS = ["Позиция", "Прицел", "Бросок", "Результат"];
// «Crosshair» — увеличенный участок lineup с прицелом (tools/make_cross.py)
function crossImg(m) { return `${ASSETS_ROOT}/popups/${m.id}-cross.webp`; }
// Коллаж cs2nades (позиция · прицел · результат), знак закрашен — репозиторий broskiplay/cs2-collages
function collageImg(m) { return `https://broskiplay.github.io/cs2-collages/${m.id}.webp`; }

// Видео раскидок — в VK Видео (сообщество club243638010). JS API нового плеера vkvideo не отвечает,
// поэтому «моменты» перезапускают плеер с нужной секунды (&t=…s&autoplay=1)
const VK_OID = -243638010;
function vkSrc(m, t) { return `https://vkvideo.ru/video_ext.php?oid=${VK_OID}&id=${m.vk}&hd=3&loop=1&mute=1${t ? `&t=${t}s&autoplay=1` : ""}`; }
function vkPlayer(fr, m, chips) {
    const T = moments(m, m.dur || 0);
    chips.forEach(c => c.addEventListener("click", () => {
        const k = +c.dataset.k, t = Math.max(0, Math.floor(T[k]));
        fr.src = vkSrc(m, t || 0) + (t ? "" : "&autoplay=1");
        chips.forEach((x, j) => x.classList.toggle("is-on", j === k));
    }));
}

function openGuide(m) {
    let d = $("cs-guide");
    if (!d) {
        d = document.createElement("div");
        d.id = "cs-guide"; d.className = "cs-guide"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
        document.body.appendChild(d);
        d.addEventListener("click", e => { if (e.target === d || e.target.closest("[data-close]")) closeGuide(); });
        document.addEventListener("keydown", e => {
            if (d.hidden) return;
            if (e.key === "Escape") closeGuide();
            if (e.key === "ArrowRight") d.querySelector("[data-next]")?.click();
            if (e.key === "ArrowLeft") d.querySelector("[data-prev]")?.click();
        });
    }
    const list = m.g ? m.g.list.filter(sideOk) : [m], i = list.indexOf(m);
    const side = m.side === "any" ? "T и CT" : m.side.toUpperCase();
    const tech = (m.tech || "").split(" · ").filter(Boolean).map(t => `<span class="cs-chip">${esc(t)}</span>`).join("");
    d.innerHTML = `<div class="cs-guide-box" style="--c:${TYPE[m.cat].color}">
        <header class="cs-guide-head">
            <span class="cs-ico cs-guide-ico">${ICON[m.cat]}</span>
            <div class="cs-guide-title"><small>${TYPE[m.cat].one} · ${side}${list.length > 1 ? ` · вариант ${i + 1} из ${list.length}` : ""}</small><h3>${esc(m.title)}</h3></div>
            ${list.length > 1 ? `<button type="button" class="cs-nav" data-prev aria-label="Предыдущий вариант">‹</button><button type="button" class="cs-nav" data-next aria-label="Следующий вариант">›</button>` : ""}
            <button type="button" class="cs-x" data-close aria-label="Закрыть">✕</button>
        </header>
        <div class="cs-guide-body">
            <section class="cs-step"><h4><b>1</b>Куда целиться</h4>
                <figure class="cs-shot is-aim"><img src="${crossImg(m)}" alt="Прицел: ${esc(m.title)}" decoding="async"></figure>
                ${tech ? `<div class="cs-tech"><span>Как бросать:</span>${tech}</div>` : ""}
                ${m.desc ? `<p class="cs-desc">${esc(m.desc)}</p>` : ""}
            </section>
            <section class="cs-step"><h4><b>2</b>Как кидать — по шагам
                ${m.vk ? `<span class="cs-view" role="group" aria-label="Что показать"><button type="button" data-view="img" class="is-on">Коллаж</button><button type="button" data-view="vid">Видео</button></span>` : ""}</h4>
                <div class="cs-media"></div>
            </section>
        </div>
        ${m.setpos ? `<footer class="cs-guide-foot"><button type="button" class="cs-copy" data-copy title="Вставьте в консоль на своём сервере (sv_cheats 1) — встанете точно в позицию">Скопировать позицию (setpos)</button></footer>` : ""}</div>`;
    d.hidden = false;
    document.documentElement.classList.add("cs-guide-open");
    const img = d.querySelector(".cs-shot.is-aim img");
    img.addEventListener("error", () => { img.closest(".cs-shot").hidden = true; });
    img.addEventListener("click", () => img.closest(".cs-shot").classList.toggle("is-big"));
    const media = d.querySelector(".cs-media");
    const show = v => {
        if (v === "vid") {
            media.innerHTML = `<div class="cs-video"><iframe src="${vkSrc(m)}" title="Видео: ${esc(m.title)}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock" allowfullscreen></iframe></div>
                <div class="cs-moments">${STEPS.map((s, k) => `<button type="button" data-k="${k}"><b>${k + 1}</b>${s}</button>`).join("")}</div>`;
            vkPlayer(media.querySelector("iframe"), m, [...media.querySelectorAll(".cs-moments button")]);
        } else {
            media.innerHTML = `<figure class="cs-shot is-collage"><img src="${collageImg(m)}" alt="Коллаж: ${esc(m.title)}" decoding="async"></figure>`;
            const fig = media.firstElementChild;
            fig.firstElementChild.addEventListener("error", () => { if (fig.isConnected) media.innerHTML = '<p class="cs-novid">Коллажа для этой раскидки нет.</p>'; });
            fig.addEventListener("click", () => fig.classList.toggle("is-big"));
        }
        d.querySelectorAll("[data-view]").forEach(b => { b.classList.toggle("is-on", b.dataset.view === v); b.setAttribute("aria-pressed", b.dataset.view === v); });
    };
    d.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => show(b.dataset.view)));
    show("img");
    d.querySelector("[data-prev]")?.addEventListener("click", () => openGuide(list[(i - 1 + list.length) % list.length]));
    d.querySelector("[data-next]")?.addEventListener("click", () => openGuide(list[(i + 1) % list.length]));
    d.querySelector("[data-copy]")?.addEventListener("click", e => {
        const b = e.currentTarget;
        (navigator.clipboard ? navigator.clipboard.writeText(m.setpos) : Promise.reject()).then(() => { b.textContent = "Скопировано ✓"; }, () => { prompt("Команда для консоли:", m.setpos); });
    });
    d.querySelector(".cs-x").focus({ preventScroll: true });
}
function closeGuide() {
    const d = $("cs-guide");
    if (!d || d.hidden) return;
    d.hidden = true; d.innerHTML = "";
    document.documentElement.classList.remove("cs-guide-open");
}

// ---------- запуск ----------
function hideLoader() { const l = $("map-loader"); if (l) { l.classList.add("is-done"); setTimeout(() => l.remove(), 700); } }

async function start() {
    buildSidebar();
    if (!state.mapId) { hideLoader(); showPicker(); return; }
    LS.set("cs2_last_map", state.mapId);
    buildBar();
    const pad = 900;
    state.map = BPMap.create("map", {
        crs: "simple", bearing: sideBearing(state.side || LS.get("cs2_side", "t")), minZoom: -2.5, maxZoom: 1, zoomSnap: 0.25,
        maxBounds: [[-SIZE - pad, -pad], [pad, SIZE + pad]],
    });
    const fit = () => {
        const s = state.map.getSize(), z = Math.log2(Math.min(s.x, s.y) / SIZE);
        state.map.setMinZoom(Math.max(-3, Math.floor((z - .25) * 4) / 4));
    };
    fit();
    state.map.fitBounds([[-SIZE, 0], [0, SIZE]], { padding: [8, 8] });
    window.addEventListener("resize", fit);
    addTiles();
    state.map.on("click", () => { if (state.sel) selectGroup(null); });
    state.map.on("zoomend", () => {  // веер точек броска зависит от зума — пересчитать, если раскладка поменялась
        if (!state.sel) return;
        const old = state.fanKey;
        fanOut(state.sel.list.filter(sideOk));
        if (state.fanKey !== old) render();
    });
    try {
        const r = await fetch(`data/cs2_${state.mapId}.json`);
        state.markers = (await r.json()).markers;
    } catch (e) {
        state.markers = [];
        $("map-empty").textContent = "Не удалось загрузить раскидки — обновите страницу";
    }
    buildGroups();
    hideLoader();
    if (!state.side) askSide(state.mapId, counts());
    render();
}

function toggleSidebar() {
    $("sidebar").classList.toggle("collapsed");
    setTimeout(() => state.map && state.map.invalidateSize && state.map.invalidateSize(), 320);
}
$("sidebar-toggle-btn")?.addEventListener("click", toggleSidebar);
$("sidebar-collapse-mobile")?.addEventListener("click", toggleSidebar);
start();
