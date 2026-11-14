// Общие дополнения для всех карт (подключается до js/app.js каждой игры):
//   MapExtras.progressCard — блок «По регионам» / «По локациям» под общим прогрессом;
//   MapExtras.mapsProgress — прогресс по всем картам игры (progress-index.json + localStorage + облако);
//   MapExtras.settingsSync — выбор категорий и «Скрыть отмеченные» в облаке (users/{uid}/mapProgress/<префикс>_settings);
//   MapExtras.marks        — мои отметки: флажки «Важно»/«Позже» и заметки (localStorage + поля flags/notes документа прогресса
//                            карты), значки на пинах (MapExtras.badges) и фильтр «только мои отметки»;
//   MapExtras.focusMode    — режим «только карта»; MapExtras.hotkeys — горячие клавиши;
//   MapExtras.recordVisit  — последние открытые карты для главной; MapExtras.suggestMove / reportError — правка места и
//                            сообщение об ошибке в очередь правок (Firestore reports, разбор на /reports/);
//   на смартфоне окно метки открывается под меткой (belowMode).
(function () {
    "use strict";

    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const LS = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, v) { try { localStorage.setItem(key, v); } catch (e) { /* localStorage недоступен */ } },
        del(key) { try { localStorage.removeItem(key); } catch (e) { /* localStorage недоступен */ } },
        json(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; } }
    };

    // ---------- Блок прогресса по регионам / локациям ----------
    // rows: [{ id, name, found, total, current?, href? }]; клик по строке — onPick(row) или переход по href
    function progressCard({ anchor, title, storeKey, onPick }) {
        const box = document.createElement("details");
        box.className = "region-progress";
        box.open = LS.get(storeKey) === "1";
        box.innerHTML = `<summary><span>${esc(title)}</span><span class="rp-sum"></span></summary><div class="rp-list"></div>`;
        if (anchor) anchor.insertAdjacentElement("afterend", box);
        box.addEventListener("toggle", () => LS.set(storeKey, box.open ? "1" : ""));
        let rows = [];
        box.addEventListener("click", e => {
            const b = e.target.closest(".rp-row");
            if (!b || !box.contains(b)) return;
            const row = rows[+b.dataset.i];
            if (!row) return;
            if (onPick) onPick(row);
            else if (row.href && !row.current) location.href = row.href;
        });
        return {
            el: box,
            render(list) {
                rows = list.filter(r => r.total > 0);
                box.hidden = rows.length < 2;
                const done = rows.filter(r => r.found >= r.total).length;
                box.querySelector(".rp-sum").textContent = rows.length ? `${done} из ${rows.length} завершено` : "";
                box.querySelector(".rp-list").innerHTML = rows.map((r, i) => {
                    const pct = Math.floor(r.found / r.total * 100);
                    const full = r.found >= r.total;
                    const clickable = onPick || (r.href && !r.current);
                    return `<${clickable ? 'button type="button"' : "div"} class="rp-row${r.current ? " is-current" : ""}${full ? " is-full" : ""}" data-i="${i}"${r.current ? ' aria-current="true"' : ""}>` +
                        `<span class="rp-name">${esc(r.name)}</span><span class="rp-num">${full ? "✓ " : ""}${r.found}/${r.total}</span>` +
                        `<span class="rp-bar"><i style="width:${pct}%"></i></span></${clickable ? "button" : "div"}>`;
                }).join("");
            }
        };
    }

    // ---------- Прогресс по всем картам игры ----------
    // maps: [{ id, name, file (имя файла меток, ключ в progress-index.json), href }]
    // Текущая карта считается движком (те же цифры, что в общем прогрессе), остальные — по индексу и найденному
    // из localStorage; у вошедшего — из облака (документ прогресса каждой карты), облако главнее.
    function mapsProgress({ anchor, title = "По локациям", storeKey, maps, currentId, foundKey, cloud, cloudDocId, indexUrl = "data/progress-index.json" }) {
        const card = progressCard({ anchor, title, storeKey });
        let index = null, current = { found: 0, total: 0 }, cloudFound = {};
        fetch(indexUrl).then(r => r.ok ? r.json() : null).catch(() => null).then(d => { index = d || {}; render(); });
        function foundOf(id) {
            const list = cloudFound[id] || LS.json(foundKey(id), []);
            return new Set((Array.isArray(list) ? list : []).map(String));
        }
        function render() {
            card.render(maps.map(m => {
                if (m.id === currentId) return { ...m, current: true, found: current.found, total: current.total };
                const ids = index && index[m.file];
                if (!Array.isArray(ids)) return { ...m, found: 0, total: 0 };
                const f = foundOf(m.id);
                return { ...m, found: ids.reduce((n, id) => n + (f.has(String(id)) ? 1 : 0), 0), total: ids.length };
            }));
        }
        return {
            render(counts) { current = counts; render(); },
            // после входа: найденное на других картах берём из облака
            async pullCloud() {
                const c = cloud();
                if (!c.db || !c.user) { cloudFound = {}; render(); return; }
                const uid = c.user.uid, col = c.db.collection("users").doc(uid).collection("mapProgress");
                const others = maps.filter(m => m.id !== currentId);
                const docs = await Promise.all(others.map(m => col.doc(cloudDocId(m.id)).get().catch(() => null)));
                if (!c.user || c.user.uid !== uid) return;
                cloudFound = {};
                docs.forEach((d, i) => { if (d && d.exists && Array.isArray(d.data().foundIds)) cloudFound[others[i].id] = d.data().foundIds; });
                render();
            }
        };
    }

    // ---------- Настройки показа в облаке ----------
    // read() → { hidden: [...], hideFound }, apply(s) — применить пришедшие с другого устройства.
    // Время изменения хранится рядом (<префикс>_settings_at): при входе побеждает более свежая сторона.
    function settingsSync({ pfx, cloud, read, apply }) {
        const atKey = pfx + "_settings_at", docId = pfx + "_settings", locKey = pfx + "_locate";
        // подсветка категорий («лупа», js/map-core.js: getLocate/setLocate) — часть тех же настроек
        const hasLocate = typeof getLocate === "function" && typeof setLocate === "function";
        if (hasLocate) { const saved = LS.json(locKey, null); if (Array.isArray(saved)) setLocate(saved); }
        const locate = () => hasLocate ? getLocate().map(String).sort() : [];
        const snap = () => { const s = read(); return JSON.stringify({ hidden: [...s.hidden].map(String).sort(), hideFound: !!s.hideFound, locate: locate() }); };
        let last = snap(), timer = null, applying = false;
        const ref = () => { const c = cloud(); return c.db && c.user ? c.db.collection("users").doc(c.user.uid).collection("mapProgress").doc(docId) : null; };
        function push() {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const r = ref();
                if (!r) return;
                const s = JSON.parse(last);
                r.set({ hidden: s.hidden, hideFound: s.hideFound, locate: s.locate, at: +LS.get(atKey) || Date.now() })
                    .catch(err => console.warn("Не удалось сохранить настройки карты в Firestore:", err));
            }, 800);
        }
        return {
            // вызывать после любого изменения фильтров или «Скрыть отмеченные»
            touch() {
                if (applying) return;
                const s = snap();
                if (s === last) return;
                last = s;
                LS.set(atKey, String(Date.now()));
                if (hasLocate) LS.set(locKey, JSON.stringify(locate()));
                push();
            },
            async pull() {
                const r = ref();
                if (!r) return;
                try {
                    const d = await r.get();
                    const localAt = +LS.get(atKey) || 0;
                    const data = d.exists ? d.data() : null;
                    if (data && Array.isArray(data.hidden) && (+data.at || 0) > localAt) {
                        applying = true;
                        try {
                            apply({ hidden: data.hidden, hideFound: !!data.hideFound });
                            if (hasLocate && Array.isArray(data.locate)) {
                                setLocate(data.locate);
                                LS.set(locKey, JSON.stringify(locate()));
                                if (typeof renderFilters === "function") renderFilters();
                                if (typeof redrawPins === "function") redrawPins();
                            }
                        } finally { applying = false; }
                        last = snap();
                        LS.set(atKey, String(+data.at));
                    } else if (localAt > (data ? +data.at || 0 : 0)) push();
                } catch (err) { console.warn("Не удалось загрузить настройки карты из Firestore:", err); }
            }
        };
    }

    // ---------- Словарь «id метки → значение» для одной карты (заметки, флажки) ----------
    // localStorage + облако; правки, сделанные до первой синхронизации, накладываются на облачную версию.
    function dictStore(keyFn, cleanVal) {
        let cache = null, cacheKey = null, base = null;
        const clean = obj => {
            const out = {};
            if (obj && typeof obj === "object" && !Array.isArray(obj)) Object.keys(obj).forEach(id => { const v = cleanVal(obj[id]); if (v) out[String(id)] = v; });
            return out;
        };
        const load = () => {
            const k = keyFn();
            if (cacheKey !== k) { cache = clean(LS.json(k, {})); cacheKey = k; }
            return cache;
        };
        const save = () => { const all = load(); Object.keys(all).length ? LS.set(cacheKey, JSON.stringify(all)) : LS.del(cacheKey); };
        return {
            get: id => load()[String(id)] || "",
            set(id, v) { const all = load(), c = cleanVal(v); if (c) all[String(id)] = c; else delete all[String(id)]; save(); },
            all: () => ({ ...load() }),
            count: () => Object.keys(load()).length,
            snapshot() { base = JSON.stringify(load()); },
            // obj — значение из облака (undefined: поля в документе ещё нет — оставляем своё); true — облако надо обновить
            fromCloud(obj) {
                const local = load();
                if (obj == null) { base = null; return Object.keys(local).length > 0; }
                const next = clean(obj), was = base ? JSON.parse(base) : null;
                base = null;
                let changed = false;
                if (was) new Set([...Object.keys(was), ...Object.keys(local)]).forEach(id => {
                    if ((was[id] || "") === (local[id] || "")) return; // на этом устройстве не трогали
                    if (local[id]) next[id] = local[id]; else delete next[id];
                    changed = true;
                });
                cache = next;
                save();
                return changed;
            },
            // импорт из файла: добавляем недостающее, своё не затираем
            merge(obj) {
                const all = load(), add = clean(obj);
                let n = 0;
                Object.keys(add).forEach(id => { if (!all[id]) { all[id] = add[id]; n++; } });
                if (n) save();
                return n;
            }
        };
    }

    // ---------- Мои отметки: флажки «Важно» / «Позже», заметки, значки на пинах, фильтр ----------
    const NOTE_MAX = 500;
    const FLAGS = {
        star: { name: "Важно", glyph: "★", color: "#f0b429" },
        later: { name: "Позже", glyph: "◷", color: "#4f9fe0" }
    };
    let activeMarks = null; // одна карта на странице: значки рисует MapExtras.badges

    // key(kind) — ключ localStorage ("notes" | "flags"); onSave() — записать в облако; onChange(id) — перерисовать метки;
    // onFilter() — пересчитать видимость меток; markers() — все метки карты (для фильтра по категориям)
    function marks({ key, map, markers, onSave, onChange, onFilter }) {
        const notes = dictStore(() => key("notes"), v => String(v == null ? "" : v).trim().slice(0, NOTE_MAX));
        const flags = dictStore(() => key("flags"), v => FLAGS[v] ? v : "");
        const filter = new Set(); // "star" | "later" | "note"
        let catCache = null, filterBox = null;

        const relayout = () => {
            const m = map && map(), p = m && m._popup;
            if (p && p.isOpen && p.isOpen()) { p._updateLayout(); p._updatePosition(); fitPopup(m); }
        };
        const flagsHtml = id => {
            const cur = flags.get(id);
            return `<div class="bp-flags" data-mark-id="${esc(id)}">` + Object.keys(FLAGS).map(f =>
                `<button type="button" class="bp-flag${cur === f ? " is-on" : ""}" data-flag="${f}" aria-pressed="${cur === f}" style="--flag:${FLAGS[f].color}"><span aria-hidden="true">${FLAGS[f].glyph}</span>${FLAGS[f].name}</button>`).join("") + `</div>`;
        };
        const noteHtml = id => {
            const t = notes.get(id);
            return t
                ? `<div class="bp-note" data-mark-id="${esc(id)}"><div class="bp-note-head"><span>Моя заметка</span><button type="button" class="bp-note-edit">Изменить</button></div><div class="bp-note-text">${esc(t)}</div></div>`
                : `<div class="bp-note is-empty" data-mark-id="${esc(id)}"><button type="button" class="bp-note-add" title="Добавить свою заметку к метке"><span aria-hidden="true">✎</span>Заметка</button></div>`;
        };
        function changed(id) {
            catCache = null;
            renderFilter();
            if (onSave) onSave(id);
            if (onChange) onChange(id);
            if (filter.size && onFilter) onFilter();
        }
        function openEditor(box) {
            const id = box.dataset.markId, t = notes.get(id);
            box.classList.remove("is-empty");
            box.innerHTML = `<label class="bp-note-head" for="bp-note-ta"><span>Моя заметка</span><span class="bp-note-left">${t.length}/${NOTE_MAX}</span></label>` +
                `<textarea id="bp-note-ta" class="bp-note-ta" maxlength="${NOTE_MAX}" rows="3" placeholder="Например: вернуться с ключом">${esc(t)}</textarea>` +
                `<div class="bp-note-actions"><button type="button" class="bp-note-save">Сохранить</button><button type="button" class="bp-note-cancel">Отмена</button>${t ? '<button type="button" class="bp-note-del">Удалить</button>' : ""}</div>`;
            const ta = box.querySelector("textarea");
            // клавиши в поле не должны двигать карту и запускать горячие клавиши
            ["keydown", "keypress", "keyup"].forEach(ev => ta.addEventListener(ev, e => e.stopPropagation()));
            ta.addEventListener("keydown", e => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commit(box, ta.value); }
                else if (e.key === "Escape") { e.preventDefault(); closeEditor(box); }
            });
            ta.addEventListener("input", () => { box.querySelector(".bp-note-left").textContent = `${ta.value.length}/${NOTE_MAX}`; });
            relayout();
            ta.focus({ preventScroll: true });
            ta.setSelectionRange(ta.value.length, ta.value.length);
        }
        function closeEditor(box) { box.outerHTML = noteHtml(box.dataset.markId); relayout(); }
        function commit(box, text) {
            const id = box.dataset.markId, t = String(text || "").trim().slice(0, NOTE_MAX);
            if (t === notes.get(id)) { closeEditor(box); return; }
            notes.set(id, t);
            closeEditor(box);
            changed(id);
        }
        function toggleFlag(id, f) {
            flags.set(id, flags.get(id) === f ? "" : f);
            document.querySelectorAll(".bp-flags").forEach(b => { if (b.dataset.markId === String(id)) b.outerHTML = flagsHtml(id); });
            changed(id);
        }
        document.addEventListener("click", e => {
            const fb = e.target.closest(".bp-flag");
            if (fb) { toggleFlag(fb.closest(".bp-flags").dataset.markId, fb.dataset.flag); return; }
            const box = e.target.closest(".bp-note");
            if (box) {
                if (e.target.closest(".bp-note-add, .bp-note-edit")) openEditor(box);
                else if (e.target.closest(".bp-note-save")) commit(box, box.querySelector("textarea").value);
                else if (e.target.closest(".bp-note-cancel")) closeEditor(box);
                else if (e.target.closest(".bp-note-del")) commit(box, "");
                return;
            }
            const chip = e.target.closest(".mf-chip");
            if (chip && filterBox && filterBox.contains(chip)) {
                const k = chip.dataset.mf;
                filter.has(k) ? filter.delete(k) : filter.add(k);
                catCache = null;
                renderFilter();
                if (onFilter) onFilter();
            }
        });

        // ---- фильтр в сайдбаре ----
        function renderFilter() {
            if (!filterBox) return;
            const fl = flags.all(), n = { star: 0, later: 0, note: notes.count() };
            Object.values(fl).forEach(f => { n[f]++; });
            filterBox.hidden = !filter.size && !n.star && !n.later && !n.note;
            const chip = (k, glyph, name, color) => `<button type="button" class="mf-chip${filter.has(k) ? " is-on" : ""}" data-mf="${k}" aria-pressed="${filter.has(k)}"${color ? ` style="--flag:${color}"` : ""}${n[k] || filter.has(k) ? "" : " disabled"}><span aria-hidden="true">${glyph}</span>${name}<b>${n[k]}</b></button>`;
            filterBox.innerHTML = `<p class="mf-label">${filter.size ? "Показаны только мои отметки" : "Мои отметки"}</p><div class="mf-chips">` +
                chip("star", FLAGS.star.glyph, FLAGS.star.name, FLAGS.star.color) + chip("later", FLAGS.later.glyph, FLAGS.later.name, FLAGS.later.color) + chip("note", "✎", "Заметки") + `</div>`;
        }
        const pass = id => {
            if (!filter.size) return true;
            id = String(id);
            const f = flags.get(id);
            return (f && filter.has(f)) || (filter.has("note") && !!notes.get(id));
        };

        const api = {
            html: id => `<div class="bp-marks">${flagsHtml(id)}${noteHtml(id)}</div>`,
            note: id => notes.get(id),
            flag: id => flags.get(id),
            pass,
            filterActive: () => filter.size > 0,
            // при включённом фильтре категория видна, если в ней есть подходящие метки (выбор категорий не меняется)
            catShown(cat) {
                if (!catCache) { catCache = new Set(); (markers ? markers() : []).forEach(m => { if (pass(m.id)) catCache.add(m.cat); }); }
                return catCache.has(cat);
            },
            filterUI(anchor) {
                filterBox = document.createElement("div");
                filterBox.className = "marks-filter";
                if (anchor) anchor.insertAdjacentElement("afterend", filterBox);
                renderFilter();
            },
            cloudFields: () => ({ notes: notes.all(), flags: flags.all() }),
            exportFields: () => ({ notes: notes.all(), flags: flags.all() }),
            snapshot() { notes.snapshot(); flags.snapshot(); },
            fromCloud(data) {
                const a = notes.fromCloud(data ? data.notes : undefined), b = flags.fromCloud(data ? data.flags : undefined);
                catCache = null;
                renderFilter();
                return a || b;
            },
            merge(data) {
                const n = (data ? notes.merge(data.notes) + flags.merge(data.flags) : 0);
                if (n) { catCache = null; renderFilter(); }
                return n;
            }
        };
        activeMarks = api;
        return api;
    }

    // Значки на пине: флажок справа сверху, заметка слева сверху. (cx, cy) — центр «головки», r — её радиус в пикселях
    const badgeSprites = new Map();
    function badgeSprite(kind) {
        let s = badgeSprites.get(kind);
        if (s) return s;
        const R = 7, k = 3, c = document.createElement("canvas");
        c.width = c.height = R * 2 * k;
        const ctx = c.getContext("2d");
        ctx.scale(k, k);
        ctx.beginPath(); ctx.arc(R, R, R - .8, 0, Math.PI * 2);
        ctx.fillStyle = kind === "note" ? "#f4efe2" : FLAGS[kind].color;
        ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 2; ctx.shadowOffsetY = .6;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.lineWidth = 1.3; ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.stroke();
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        if (kind === "star") {
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 1.75 : 4.1;
                ctx[i ? "lineTo" : "moveTo"](R + Math.cos(a) * rr, R + .3 + Math.sin(a) * rr);
            }
            ctx.closePath(); ctx.fillStyle = "#fff"; ctx.fill();
        } else if (kind === "later") {
            ctx.beginPath(); ctx.arc(R, R, 4.3, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
            ctx.beginPath(); ctx.moveTo(R, R - 2.8); ctx.lineTo(R, R); ctx.lineTo(R + 2.1, R + 1.2);
            ctx.lineWidth = 1.5; ctx.strokeStyle = FLAGS.later.color; ctx.stroke();
        } else {
            ctx.beginPath();
            [-2, 0, 2].forEach((dy, i) => { ctx.moveTo(R - 3, R + dy); ctx.lineTo(R + (i === 2 ? 1 : 3), R + dy); });
            ctx.lineWidth = 1.2; ctx.strokeStyle = "#5a4a2c"; ctx.stroke();
        }
        badgeSprites.set(kind, c);
        return c;
    }
    function badges(ctx, cx, cy, r, id) {
        if (!activeMarks || id == null) return;
        const f = activeMarks.flag(id), n = activeMarks.note(id);
        if (!f && !n) return;
        const R = Math.max(5.5, r * .56), d = r * .76;
        if (f) ctx.drawImage(badgeSprite(f), cx + d - R, cy - d - R, R * 2, R * 2);
        if (n) ctx.drawImage(badgeSprite("note"), cx - d - R, cy - d - R, R * 2, R * 2);
    }

    // ---------- Экран не гаснет, пока открыта карта (Screen Wake Lock) ----------
    // Замок снимает система, когда вкладка уходит в фон или экран блокируют, — берём заново при возврате.
    // Некоторые браузеры разрешают замок только после жеста — повторяем попытку на первом касании или клавише.
    (function keepAwake() {
        if (!("wakeLock" in navigator)) return; // старые браузеры (например, iOS до 16.4): экран гаснет по настройкам устройства
        let lock = null, busy = false;
        async function acquire() {
            if (lock || busy || document.visibilityState !== "visible") return;
            busy = true;
            try {
                lock = await navigator.wakeLock.request("screen");
                lock.addEventListener("release", () => { lock = null; });
            } catch (e) { lock = null; } finally { busy = false; }
        }
        document.addEventListener("visibilitychange", acquire);
        ["pointerdown", "touchstart", "keydown"].forEach(t => window.addEventListener(t, acquire, { passive: true }));
        acquire();
    })();

    // ---------- Режим «только карта» (второй монитор, телефон рядом с геймпадом) ----------
    // Прячет панель, разворачивает на весь экран и не даёт экрану погаснуть (Wake Lock). Включается кнопкой, клавишей M или ?focus=1.
    function focusMode({ map }) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bp-focus-btn";
        document.body.appendChild(btn);
        let on = false, wasCollapsed = false, lock = null;
        const sidebar = () => document.getElementById("sidebar");
        const label = () => {
            btn.innerHTML = on
                ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>'
                : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
            btn.title = on ? "Выйти из режима «только карта» (M или Esc)" : "Только карта: без панели, экран не гаснет (M)";
            btn.setAttribute("aria-label", btn.title);
            btn.setAttribute("aria-pressed", String(on));
        };
        const relayout = () => { const m = map(); if (m) { m.invalidateSize(); setTimeout(() => m.invalidateSize(), 350); } };
        async function wake() {
            if (!on || !("wakeLock" in navigator) || document.visibilityState !== "visible") return;
            try { lock = await navigator.wakeLock.request("screen"); } catch (e) { lock = null; }
        }
        document.addEventListener("visibilitychange", () => { if (on && document.visibilityState === "visible") wake(); });
        document.addEventListener("fullscreenchange", () => { if (on && !document.fullscreenElement && btn.dataset.fs === "1") set(false); });
        function set(v, { fullscreen = true } = {}) {
            if (v === on) return;
            on = v;
            const sb = sidebar();
            if (on) {
                wasCollapsed = !!sb && sb.classList.contains("collapsed");
                if (sb) sb.classList.add("collapsed");
                document.body.classList.add("bp-focus");
                wake();
                btn.dataset.fs = "";
                const el = document.documentElement;
                if (fullscreen && el.requestFullscreen && !document.fullscreenElement) el.requestFullscreen().then(() => { btn.dataset.fs = "1"; }).catch(() => {});
            } else {
                if (sb && !wasCollapsed) sb.classList.remove("collapsed");
                document.body.classList.remove("bp-focus");
                if (lock) { lock.release().catch(() => {}); lock = null; }
                if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
                btn.dataset.fs = "";
            }
            label();
            relayout();
        }
        btn.addEventListener("click", () => set(!on));
        label();
        if (new URLSearchParams(location.search).get("focus") === "1") set(true, { fullscreen: false });
        return { toggle: () => set(!on), get on() { return on; }, off: () => set(false) };
    }

    // ---------- Горячие клавиши на ПК (по физическим клавишам: работают и в русской раскладке) ----------
    const HOTKEYS = [
        ["/", "Поиск по меткам (или Ctrl+K)"],
        ["F", "Отметить найденным открытую метку"],
        ["I", "Флажок «Важно» на открытой метке"],
        ["L", "Флажок «Позже» на открытой метке"],
        ["N", "Заметка к открытой метке"],
        ["H", "Скрыть / показать отмеченные"],
        ["M", "Режим «только карта»"],
        ["Esc", "Закрыть окно метки"],
        ["?", "Эта подсказка"]
    ];
    function hotkeys({ map, focus }) {
        const popup = () => document.querySelector(".leaflet-popup");
        const click = sel => { const el = document.querySelector(sel); if (el) { el.click(); return true; } return false; };
        let help = null;
        function toggleHelp(show = !help) {
            if (help) { help.remove(); help = null; }
            if (!show) return;
            help = document.createElement("div");
            help.className = "bp-keys";
            help.setAttribute("role", "dialog");
            help.setAttribute("aria-label", "Горячие клавиши");
            help.innerHTML = `<div class="bp-keys-card"><h3>Горячие клавиши</h3><dl>${HOTKEYS.map(([k, t]) => `<dt><kbd>${k}</kbd></dt><dd>${t}</dd>`).join("")}</dl><button type="button" class="bp-keys-close">Понятно</button></div>`;
            help.addEventListener("click", e => { if (e.target === help || e.target.closest(".bp-keys-close")) toggleHelp(false); });
            document.body.appendChild(help);
            help.querySelector(".bp-keys-close").focus();
        }
        document.addEventListener("keydown", e => {
            const t = e.target;
            if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) {
                if (e.key === "Escape" && t.id === "search-input") t.blur();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.code === "KeyK") { e.preventDefault(); focusSearch(); return; }
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (help && (e.key === "Escape" || e.code === "Slash")) { e.preventDefault(); toggleHelp(false); return; }
            switch (e.code) {
                case "Slash": e.preventDefault(); if (e.shiftKey) toggleHelp(); else focusSearch(); break;
                case "KeyF": if (click('.leaflet-popup [class*="-done-btn"][data-id]')) e.preventDefault(); break;
                case "KeyI": if (click('.leaflet-popup .bp-flag[data-flag="star"]')) e.preventDefault(); break;
                case "KeyL": if (click('.leaflet-popup .bp-flag[data-flag="later"]')) e.preventDefault(); break;
                case "KeyN": if (click(".leaflet-popup .bp-note-add, .leaflet-popup .bp-note-edit")) e.preventDefault(); break;
                case "KeyH": if (click("#hide-found-btn")) e.preventDefault(); break;
                case "KeyM": if (focus) { e.preventDefault(); focus.toggle(); } break;
                case "Escape": {
                    if (document.querySelector('[id$="-lightbox"]')) break; // сначала закрывается картинка
                    const m = map();
                    if (popup() && m) { m.closePopup(); e.preventDefault(); }
                    else if (focus && focus.on) { focus.off(); e.preventDefault(); }
                    break;
                }
            }
        });
        function focusSearch() {
            const s = document.getElementById("search-input");
            if (!s) return;
            const sb = document.getElementById("sidebar");
            if (focus && focus.on) focus.off();
            if (sb && sb.classList.contains("collapsed")) { const b = document.getElementById("sidebar-toggle-btn"); if (b) b.click(); }
            s.focus();
            s.select();
        }
        // ссылка на подсказку в панели — только там, где есть клавиатура и мышь
        if (window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches) {
            const io = document.getElementById("io-status");
            if (io) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "bp-keys-link";
                b.innerHTML = "<kbd>?</kbd> Горячие клавиши";
                b.addEventListener("click", () => toggleHelp(true));
                io.insertAdjacentElement("afterend", b);
            }
        }
        tidySidebar();
        return { help: toggleHelp };
    }

    // ---------- Компактная панель: кнопки над категориями занимают две строки вместо пяти ----------
    // «Показать все» и «Скрыть все» — одна кнопка-переключатель (видна та, что сейчас имеет смысл);
    // «Экспорт», «Импорт» и «Горячие клавиши» — в меню «⋯» рядом с «Добавить свою метку».
    // Кнопки только переставляются: id и обработчики движков остаются прежними.
    function tidySidebar() {
        const show = document.getElementById("show-all-btn"), hide = document.getElementById("hide-all-btn");
        const add = document.getElementById("add-marker-btn"), io = document.querySelector("#sidebar .io-row");
        if (!add || document.getElementById("bp-more-btn")) return;
        if (show && hide) {
            show.hidden = true;
            const swap = toShow => () => { show.hidden = !toShow; hide.hidden = toShow; };
            show.addEventListener("click", swap(false));
            hide.addEventListener("click", swap(true));
            show.closest(".btn-group")?.classList.add("bp-compact");
        }
        const row = document.createElement("div");
        row.className = "bp-act-row";
        add.insertAdjacentElement("beforebegin", row);
        row.appendChild(add);
        const wrap = document.createElement("div");
        wrap.className = "bp-more";
        wrap.innerHTML = '<button type="button" id="bp-more-btn" class="bp-more-btn" aria-haspopup="true" aria-expanded="false" aria-label="Ещё: экспорт, импорт, горячие клавиши" title="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg></button><div class="bp-more-menu" role="menu" hidden></div>';
        row.appendChild(wrap);
        const btn = wrap.firstChild, menu = wrap.lastChild;
        if (io) [].slice.call(io.querySelectorAll("button")).forEach(b => { b.setAttribute("role", "menuitem"); menu.appendChild(b); });
        if (io) io.remove();
        const keys = document.querySelector("#sidebar .bp-keys-link");
        if (keys) { keys.setAttribute("role", "menuitem"); menu.appendChild(keys); }
        const set = open => { menu.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
        btn.addEventListener("click", e => { e.stopPropagation(); set(menu.hidden); });
        menu.addEventListener("click", e => { if (e.target.closest("button")) set(false); });
        document.addEventListener("click", e => { if (!wrap.contains(e.target)) set(false); });
        document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { set(false); btn.focus(); } });
    }

    // ---------- Последние открытые карты (для блока «Продолжить» на главной) ----------
    function recordVisit(game, map) {
        const list = LS.json("bp_recent", []);
        const next = [{ game, map, at: Date.now() }].concat((Array.isArray(list) ? list : []).filter(r => r && !(r.game === game && r.map === map))).slice(0, 8);
        LS.set("bp_recent", JSON.stringify(next));
    }

    // ---------- Предложить правку места метки (кнопка добавляется js/report-marker.js) ----------
    // ctx: { map(), marker(id) → { title, pos }, toData(latlng) → координаты в формате файла меток }
    let context = null, suggestUi = null;
    function setContext(c) {
        context = c;
        const m = c.map();
        if (m && !m._bpFit) {
            m._bpFit = true;
            belowMode(m);
            m.on("popupopen", e => {
                e.popup._bpFitUntil = Date.now() + 1500; // после автопрокрутки; сдвиги карты самим игроком попап не сжимают
                // У края карты автопрокрутка попапа упирается в maxBounds и карта «отпрыгивает» назад, обрезая попап.
                // Пока попап открыт, границы снимаем; после закрытия карта плавно возвращается в них.
                clearTimeout(m._bpRestoreT);
                if (m.options.maxBounds && !m._bpBounds) { m._bpBounds = m.options.maxBounds; m.setMaxBounds(null); }
                e.popup._bpPanH = 0;
                setTimeout(() => fitPopup(m), 0);
                // картинка в попапе догружается позже и делает его выше
                const el = e.popup._container;
                if (el && !el._bpFit) { el._bpFit = true; el.addEventListener("load", () => fitPopup(m), true); }
            });
            m.on("moveend", () => { const p = m._popup; if (p && p._bpFitUntil > Date.now()) fitPopup(m); });
            m.on("popupclose", e => {
                const p = e.popup;
                if (p._bpMax !== undefined) { p.options.maxHeight = p._bpMax; delete p._bpMax; }
                // границы возвращаем, если следом не открылся другой попап (переход между метками)
                clearTimeout(m._bpRestoreT);
                m._bpRestoreT = setTimeout(() => {
                    if (m._bpBounds && !(m._popup && m._popup.isOpen())) { const b = m._bpBounds; m._bpBounds = null; m.setMaxBounds(b); }
                }, 60);
            });
            showSuggestedFromUrl(m);
        }
    }

    // Попап у края карты: если автопрокрутка упёрлась в границу (maxBounds) и верх не виден —
    // уменьшаем высоту попапа до свободного места, дальше он прокручивается внутри
    function fitPopup(map) {
        const p = map && map._popup;
        if (!p || !p.isOpen() || !p._container || !p._contentNode) return;
        const mr = map.getContainer().getBoundingClientRect(), r = p._container.getBoundingClientRect();
        // над меткой попап обрезается сверху, под меткой (смартфоны) — снизу
        const over = p._container.classList.contains("bp-below") ? r.bottom - (mr.bottom - 8) : mr.top + 8 - r.top;
        if (over <= 1) return;
        if (map._panAnim && map._panAnim._inProgress) return; // карта ещё едет — проверим на moveend
        // сначала пробуем сдвинуть карту (попап мог вырасти после открытия); сжимаем, только если сдвиг не помог
        const h = p._contentNode.offsetHeight;
        if (h > (p._bpPanH || 0) && r.height < mr.height - 16) { p._bpPanH = h; p._bpFitUntil = Date.now() + 1500; p._adjustPan(); return; }
        if (p._bpMax === undefined) p._bpMax = p.options.maxHeight;
        p.options.maxHeight = Math.max(150, Math.floor(p._contentNode.offsetHeight - over));
        p._updateLayout();
        p._updatePosition();
    }

    // ---------- На смартфоне окно метки открывается под меткой, а не над ней ----------
    // Якорь попапа — острие метки, попап ниже него, хвостик смотрит вверх (css/map-nm.css .bp-below).
    // Автопрокрутка Leaflet считает попап «над точкой» через _containerBottom — подставляем значение для «под точкой».
    const BELOW_MQ = window.matchMedia ? matchMedia("(max-width: 640px), (pointer: coarse) and (max-height: 500px)") : null;
    const belowOn = () => !!(BELOW_MQ && BELOW_MQ.matches);
    const BELOW_TOP = 18; // от точки метки до верха окна: под хвостиком остаётся ~6 px
    const POPUP_W = 400;  // ширина текста окна метки на ПК; к ней +16 px рамки
    const popupWidth = mapW => Math.max(240, Math.min(POPUP_W, mapW - 40));
    let belowPatched = false;
    function belowMode(map) {
        if (!belowPatched && window.L && L.Popup) {
            belowPatched = true;
            const P = L.Popup.prototype, anchor = P._getAnchor, place = P._updatePosition, layout = P._updateLayout;
            P._getAnchor = function () { return belowOn() ? L.point(0, 0) : anchor.call(this); };
            // Постоянный размер окна метки (css/map-nm.css «Размер и шрифт попапа»): ширина не зависит от длины текста,
            // на смартфоне — во весь экран с полями; высота — по высоте карты (если fitPopup не сжал окно у края)
            P._updateLayout = function () {
                if (this._map && /-popup-wrap/.test(this.options.className || "")) {
                    const size = this._map.getSize(), w = popupWidth(size.x);
                    this.options.minWidth = this.options.maxWidth = w;
                    if (this._bpMax === undefined) this.options.maxHeight = Math.max(280, Math.min(620, size.y - 130));
                    this.options.autoPanPadding = L.point(w < POPUP_W ? 12 : 30, 30);
                }
                return layout.call(this);
            };
            P._updatePosition = function () {
                place.call(this);
                const el = this._container;
                if (!this._map || !el) return;
                const below = belowOn();
                el.classList.toggle("bp-below", below);
                if (!below) { el.style.top = ""; return; }
                let top = BELOW_TOP;
                if (!this._zoomAnimated) top += this._map.latLngToLayerPoint(this._latlng).y;
                el.style.bottom = "auto";
                el.style.top = top + "px";
                this._containerBottom = -top - el.offsetHeight; // для _adjustPan: верх окна = top
            };
        }
        if (BELOW_MQ) {
            const onChange = () => { if (map._popup && map._popup.isOpen()) map._popup.update(); };
            BELOW_MQ.addEventListener ? BELOW_MQ.addEventListener("change", onChange) : BELOW_MQ.addListener(onChange);
        }
    }

    // ---------- Очередь правок: сообщения об ошибках и переносы меток уходят в Firestore (коллекция reports) ----------
    // Читает и разбирает их автор на странице /reports/. Если запись не удалась (нет сети, правила не настроены) —
    // как раньше: текст копируется и открывается Google-форма (js/report-marker.js → BPReport.send).
    const FB_CONFIG = {
        apiKey: "AIzaSyBZ29h18Z1k0gE4dAEca5JH8yePQgxhaII",
        authDomain: "broskiplaymaps.firebaseapp.com",
        projectId: "broskiplaymaps",
        appId: "1:418362476965:web:59ce4e677b1a0a84d7404c"
    };
    let visit = { game: "", map: "" };
    function getFirebase() {
        const ready = fb => { if (!fb.apps.length) fb.initializeApp(FB_CONFIG); return fb; };
        if (window.firebase && window.firebase.firestore) return Promise.resolve(ready(window.firebase));
        return window.BPFirebase ? window.BPFirebase.load().then(ready) : Promise.reject(new Error("Firebase недоступен"));
    }
    const SENT_KEY = "bp_reports_sent";
    function rateLimited() {
        const now = Date.now(), list = (LS.json(SENT_KEY, []) || []).filter(t => now - t < 3600e3);
        return list.length >= 10;
    }
    function markSent() {
        const now = Date.now(), list = (LS.json(SENT_KEY, []) || []).filter(t => now - t < 3600e3);
        list.push(now);
        LS.set(SENT_KEY, JSON.stringify(list));
    }
    async function sendReport(r) {
        const fb = await getFirebase();
        const user = fb.auth ? fb.auth().currentUser : null;
        const doc = {
            kind: r.kind, game: visit.game || "", map: String(visit.map || ""), markerId: String(r.markerId), title: String(r.title || "").slice(0, 200),
            url: String(r.url).slice(0, 500), text: String(r.text || "").slice(0, 1000),
            from: r.from || null, to: r.to || null, fromData: r.fromData || "", toData: r.toData || "",
            status: "new", uid: user ? user.uid : null, createdAt: fb.firestore.FieldValue.serverTimestamp(), v: 1
        };
        const ref = await Promise.race([
            fb.firestore().collection("reports").add(doc),
            new Promise((_, no) => setTimeout(() => no(new Error("Firestore не ответил")), 12000))
        ]);
        markSent();
        // id своих сообщений помним в браузере: на /fixes/ правка по вашему сообщению подсвечивается
        try {
            const mine = (LS.json("bp_my_reports", []) || []).slice(-199);
            mine.push({ id: ref.id, t: Date.now() });
            LS.set("bp_my_reports", JSON.stringify(mine));
        } catch (e) { /* не критично */ }
    }
    const markerUrl = id => { const u = new URL(location.href); u.searchParams.set("marker", id); u.searchParams.delete("suggest"); u.hash = ""; return u.href; };
    const gameTitle = () => document.title.replace(/^Интерактивная карта\s*/, "").replace(/\s*[—-]\s*BroskiPlay.*$/, "");
    const ll5 = p => ({ lat: +(+p.lat).toFixed(6), lng: +(+p.lng).toFixed(6) });
    // отправить в очередь; при неудаче — Google-форма с тем же текстом
    async function deliver(report, fallbackText, btn) {
        const say = context && context.toast || notify;
        if (btn) { btn.disabled = true; btn.textContent = "Отправка…"; }
        if (rateLimited()) { say("Слишком много сообщений за час — попробуйте позже"); return false; }
        try {
            await sendReport(report);
            say("Спасибо! Сообщение отправлено автору. Принятые правки попадают в журнал исправлений");
            return true;
        } catch (err) {
            console.warn("Очередь правок недоступна, открываю форму:", err);
            const sent = window.BPReport ? window.BPReport.send(fallbackText) : false;
            say(sent === "prefilled" ? "Форма открыта — проверьте и отправьте" : "Текст скопирован — вставьте его в открывшуюся форму");
            return true;
        }
    }

    // «Сообщить об ошибке»: своё окошко с текстом вместо перехода в форму
    function reportError(id) {
        if (!context || !context.map()) return false;
        const m = context.marker(id);
        if (!m) return false;
        cancelSuggest();
        context.map().closePopup();
        const bar = document.createElement("div");
        bar.className = "bp-suggest";
        bar.innerHTML = `<p class="bp-suggest-title">Ошибка в метке: <b>${esc(m.title || "метка")}</b></p>` +
            `<textarea class="bp-suggest-ta" rows="3" maxlength="1000" placeholder="Что не так? Например: неверное описание, ошибка в переводе, метки нет в игре"></textarea>` +
            `<div class="bp-suggest-actions"><button type="button" class="bp-suggest-send" disabled>Отправить</button><button type="button" class="bp-suggest-cancel">Отмена</button></div>`;
        document.body.appendChild(bar);
        suggestUi = { bar, layers: [], onClick: null };
        const ta = bar.querySelector("textarea"), send = bar.querySelector(".bp-suggest-send");
        ["keydown", "keypress", "keyup"].forEach(ev => ta.addEventListener(ev, e => e.stopPropagation()));
        ta.addEventListener("input", () => { send.disabled = ta.value.trim().length < 3; });
        ta.addEventListener("keydown", e => { if (e.key === "Escape") cancelSuggest(); });
        ta.focus();
        bar.querySelector(".bp-suggest-cancel").addEventListener("click", cancelSuggest);
        send.addEventListener("click", async () => {
            const text = ta.value.trim();
            if (text.length < 3) return;
            const url = markerUrl(id), from = L.latLng(m.pos);
            const conv = context.toData || ll5;
            await deliver({ kind: "error", markerId: id, title: m.title, url, text, from: ll5(from), fromData: fmtData(conv(from)) },
                "Игра: " + gameTitle() + "\nМетка: " + (m.title || "") + " (id " + id + ")\nСсылка: " + url + "\nЧто не так: " + text, send);
            cancelSuggest();
        });
        return true;
    }

    const fmtData = d => d == null ? "" : typeof d === "object" ? Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(", ") : String(d);
    function suggestMove(id) {
        if (!context || !context.map()) return false;
        const map = context.map(), m = context.marker(id);
        if (!m) return false;
        cancelSuggest();
        map.closePopup();
        const ui = suggestUi = { id, layers: [], picked: null };
        const bar = ui.bar = document.createElement("div");
        bar.className = "bp-suggest";
        bar.innerHTML = `<p class="bp-suggest-title">Правка места: <b>${esc(m.title || "метка")}</b></p><p class="bp-suggest-hint">Нажмите на карте, где метка находится на самом деле</p>` +
            `<div class="bp-suggest-form" hidden><textarea class="bp-suggest-ta" rows="2" maxlength="600" placeholder="Комментарий (необязательно): что не так, как найти"></textarea></div>` +
            `<div class="bp-suggest-actions"><button type="button" class="bp-suggest-send" hidden>Отправить</button><button type="button" class="bp-suggest-cancel">Отмена</button></div>`;
        document.body.appendChild(bar);
        const ta = bar.querySelector("textarea");
        ["keydown", "keypress", "keyup"].forEach(ev => ta.addEventListener(ev, e => e.stopPropagation()));
        const from = L.latLng(m.pos);
        ui.layers.push(L.circleMarker(from, { radius: 9, color: "#e0525e", weight: 2, dashArray: "3 3", fill: false, interactive: false }).addTo(map));
        L.DomUtil.addClass(map.getContainer(), "bp-picking");
        ui.onClick = e => {
            ui.picked = e.latlng;
            ui.layers.slice(1).forEach(l => map.removeLayer(l));
            ui.layers.length = 1;
            ui.layers.push(L.polyline([from, e.latlng], { color: "#f0b429", weight: 2, dashArray: "6 6", interactive: false }).addTo(map));
            ui.layers.push(L.circleMarker(e.latlng, { radius: 8, color: "#fff", weight: 2, fillColor: "#f0b429", fillOpacity: 1, interactive: false }).addTo(map));
            bar.querySelector(".bp-suggest-hint").textContent = "Новое место отмечено. Можно нажать на карте ещё раз, чтобы поправить.";
            bar.querySelector(".bp-suggest-form").hidden = false;
            bar.querySelector(".bp-suggest-send").hidden = false;
        };
        map.on("click", ui.onClick);
        bar.querySelector(".bp-suggest-cancel").addEventListener("click", cancelSuggest);
        const sendBtn = bar.querySelector(".bp-suggest-send");
        sendBtn.addEventListener("click", async () => {
            if (!ui.picked) return;
            const url = markerUrl(id);
            const fmt = p => `${(+p.lat).toFixed(5)}, ${(+p.lng).toFixed(5)}`;
            const conv = context.toData || ll5;
            const comment = ta.value.trim();
            const fromData = fmtData(conv(from)), toData = fmtData(conv(ui.picked));
            const text = "Предложение: перенести метку\nИгра: " + gameTitle() + "\nМетка: " + (m.title || "") + " (id " + id + ")\nСсылка: " + url +
                "\nСейчас: " + fromData + "\nДолжно быть: " + toData + "\nКоординаты карты: " + fmt(from) + " → " + fmt(ui.picked) +
                (comment ? "\nКомментарий: " + comment : "");
            await deliver({ kind: "move", markerId: id, title: m.title, url, text: comment, from: ll5(from), to: ll5(ui.picked), fromData, toData }, text, sendBtn);
            cancelSuggest();
        });
        return true;
    }

    // Ссылка со страницы /reports/: ?marker=<id>&suggest=<lat>,<lng> — показать предложенное место рядом с меткой
    function showSuggestedFromUrl(map) {
        const q = new URLSearchParams(location.search), s = q.get("suggest"), id = q.get("marker");
        if (!s || !id) return;
        const [lat, lng] = s.split(",").map(Number);
        if (!isFinite(lat) || !isFinite(lng)) return;
        let tries = 0;
        const t = setInterval(() => {
            const m = context && context.marker(id);
            if (!m && ++tries < 40) return;
            clearInterval(t);
            if (!m) return;
            const from = L.latLng(m.pos), to = L.latLng(lat, lng);
            const layers = [
                L.circleMarker(from, { radius: 10, color: "#e0525e", weight: 2, dashArray: "3 3", fill: false, interactive: false }),
                L.polyline([from, to], { color: "#f0b429", weight: 2.5, dashArray: "6 6", interactive: false }),
                L.circleMarker(to, { radius: 9, color: "#fff", weight: 2, fillColor: "#f0b429", fillOpacity: 1, interactive: false })
            ].map(l => l.addTo(map));
            setTimeout(() => map.fitBounds(L.latLngBounds([from, to]), { padding: [90, 90], maxZoom: Math.max(map.getZoom(), map.getMinZoom() + 2) }), 1200);
            const bar = document.createElement("div");
            bar.className = "bp-suggest";
            bar.innerHTML = `<p class="bp-suggest-title">Предложенное место: <b>${esc(m.title || "метка")}</b></p><p class="bp-suggest-hint">Красный круг — сейчас, жёлтая точка — куда предлагают перенести</p><div class="bp-suggest-actions"><button type="button" class="bp-suggest-cancel">Скрыть</button></div>`;
            document.body.appendChild(bar);
            bar.querySelector(".bp-suggest-cancel").addEventListener("click", () => { layers.forEach(l => map.removeLayer(l)); bar.remove(); });
        }, 500);
    }

    // своё всплывающее сообщение (у Tainted Grail нет toast)
    function notify(text) {
        let el = document.getElementById("bp-notify");
        if (!el) { el = document.createElement("div"); el.id = "bp-notify"; el.setAttribute("role", "status"); document.body.appendChild(el); }
        el.textContent = text;
        el.classList.add("show");
        clearTimeout(notify.t);
        notify.t = setTimeout(() => el.classList.remove("show"), 3200);
    }
    function cancelSuggest() {
        const ui = suggestUi;
        if (!ui) return;
        suggestUi = null;
        const map = context && context.map();
        if (map && ui.onClick) { map.off("click", ui.onClick); L.DomUtil.removeClass(map.getContainer(), "bp-picking"); }
        if (map) ui.layers.forEach(l => map.removeLayer(l));
        ui.bar.remove();
    }
    document.addEventListener("keydown", e => { if (e.key === "Escape" && suggestUi && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) cancelSuggest(); });

    window.MapExtras = {
        fitPopup: () => context && fitPopup(context.map()), progressCard, mapsProgress, settingsSync, marks, badges, focusMode, hotkeys,
        recordVisit(game, map) { visit = { game, map }; recordVisit(game, map); }, setContext, suggestMove, reportError, canSuggest: () => !!context
    };
})();
