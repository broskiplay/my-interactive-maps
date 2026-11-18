/* Слои карты: сетка координат, подписи регионов, тепловая карта плотности меток.
   Общий для всех карт на js/bp-map.js: берёт карту из события bp:map, список видимых меток — из M.pinsCfg.list(),
   границы сетки — из M.tileBounds. Включённые слои запоминаются в localStorage (отдельно для каждой игры). */
(() => {
    "use strict";
    const KEY = "bp_layers:" + location.pathname.split("/").filter(Boolean)[0];
    const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* без хранилища работаем как есть */ } };
    const COLS = 10;
    const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function init(M) {
        if (M._layers) return;
        M._layers = true;
        const box = M.getContainer();
        // кнопка слоёв убрана (2026-11-18): регионы всегда видны, сетка и плотность — только по ссылке ?layers=
        const on = { grid: false, regions: true, heat: false };
        // ?layers=grid,heat,-regions — включить/выключить слои по ссылке (для проверки и «поделиться видом»)
        const q = new URLSearchParams(location.search).get("layers");
        if (q) q.split(/[,|]/).forEach(k => { const off = k[0] === "-"; if (off ? (k.slice(1) in on) : (k in on)) on[off ? k.slice(1) : k] = !off; });
        let bounds = null; // тайлы добавляются после создания карты — границы берём при первой отрисовке

        const cv = document.createElement("canvas");
        cv.className = "bp-layers-canvas";
        cv.setAttribute("aria-hidden", "true");
        box.appendChild(cv);
        const ctx = cv.getContext("2d");
        const heat = document.createElement("canvas");
        const hctx = heat.getContext("2d", { willReadFrequently: true });

        // ---- кнопка и панель ----
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bp-focus-btn bp-layers-btn";
        btn.title = "Слои карты: сетка, регионы, плотность меток";
        btn.setAttribute("aria-label", "Слои карты");
        btn.setAttribute("aria-haspopup", "true");
        btn.setAttribute("aria-expanded", "false");
        btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/></svg>';
        const panel = document.createElement("div");
        panel.className = "bp-layers-panel";
        panel.hidden = true;
        const rows = [
            ["grid", "Сетка координат", "Квадраты A1–J…: удобно договариваться «метка в D4»", false],
            ["regions", "Названия регионов", "Подписи областей и районов на карте", true],
            ["heat", "Плотность меток", "Тепловая карта: где больше всего того, что включено в фильтрах", true]
        ];
        panel.innerHTML = rows.map(([k, t, d, ok]) =>
            `<label class="bp-layers-row"${ok ? "" : " hidden"}><input type="checkbox" data-layer="${k}"><span><b>${t}</b><small>${d}</small></span></label>`).join("");
        // кнопку и панель на страницу не добавляем — слои включаются только параметром ?layers=

        const save = () => write(on);
        const sync = () => {
            panel.querySelectorAll("input[data-layer]").forEach(i => { i.checked = !!on[i.dataset.layer]; });
            box.classList.toggle("bp-hide-regions", !on.regions);
            btn.setAttribute("aria-pressed", String(on.grid || on.heat || !on.regions));
            draw();
        };
        function haveBounds() {
            if (!bounds && M.tileBounds && M.tileBounds.length === 2) { bounds = M.tileBounds; panel.querySelector('[data-layer="grid"]').closest("label").hidden = false; }
        }
        const setOpen = v => { haveBounds(); panel.hidden = !v; btn.setAttribute("aria-expanded", String(v)); };
        btn.addEventListener("click", e => { e.stopPropagation(); setOpen(panel.hidden); });
        panel.addEventListener("click", e => e.stopPropagation());
        panel.addEventListener("change", e => {
            const k = e.target.dataset && e.target.dataset.layer;
            if (!k) return;
            on[k] = e.target.checked;
            save(); sync();
        });
        document.addEventListener("click", () => { if (!panel.hidden) setOpen(false); });
        document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { setOpen(false); btn.focus(); } });

        // ---- рисование ----
        const px = p => M.latLngToContainerPoint(p);
        function size() {
            const w = box.clientWidth, h = box.clientHeight, r = Math.min(2, window.devicePixelRatio || 1);
            if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
            ctx.setTransform(r, 0, 0, r, 0, 0);
            return { w, h };
        }
        function drawGrid(w, h) {
            const [s, wst] = bounds[0], [n, e] = bounds[1];
            const lat0 = Math.min(s, n), lat1 = Math.max(s, n), lng0 = Math.min(wst, e), lng1 = Math.max(wst, e);
            const dLng = (lng1 - lng0) / COLS;
            const rowsN = Math.max(1, Math.round((lat1 - lat0) / dLng));
            const dLat = (lat1 - lat0) / rowsN;
            // экранные размеры одной ячейки: от них зависит, дробить ли сетку
            const a = px([lat1, lng0]), b = px([lat1 - dLat, lng0 + dLng]);
            const cw = Math.abs(b.x - a.x), ch = Math.abs(b.y - a.y);
            const lineAt = (la1, ln1, la2, ln2) => { const p = px([la1, ln1]), q = px([la2, ln2]); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); };
            const pass = (div, alpha, width) => {
                const nc = COLS * div, nr = rowsN * div;
                ctx.beginPath();
                for (let i = 0; i <= nc; i++) { if (i % div === 0 && div > 1) continue; lineAt(lat1, lng0 + dLng / div * i, lat0, lng0 + dLng / div * i); }
                for (let j = 0; j <= nr; j++) { if (j % div === 0 && div > 1) continue; lineAt(lat1 - dLat / div * j, lng0, lat1 - dLat / div * j, lng1); }
                ctx.lineWidth = width + 1.6; ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.55})`; ctx.stroke();
                ctx.lineWidth = width; ctx.strokeStyle = `rgba(255,255,255,${alpha})`; ctx.stroke();
            };
            const div = Math.min(cw, ch) > 520 ? 4 : Math.min(cw, ch) > 240 ? 2 : 1;
            if (div > 1) pass(div, 0.18, 1);
            pass(1, 0.5, 1.4);
            // подписи ячеек: в левом верхнем углу, но не за краем экрана — у крупных ячеек видно, где они начинаются
            ctx.font = "700 12px system-ui, sans-serif";
            ctx.textBaseline = "top";
            for (let j = 0; j < rowsN; j++) {
                for (let i = 0; i < COLS; i++) {
                    const tl = px([lat1 - dLat * j, lng0 + dLng * i]), br = px([lat1 - dLat * (j + 1), lng0 + dLng * (i + 1)]);
                    const x0 = Math.min(tl.x, br.x), x1 = Math.max(tl.x, br.x), y0 = Math.min(tl.y, br.y), y1 = Math.max(tl.y, br.y);
                    if (x1 < 0 || y1 < 0 || x0 > w || y0 > h) continue;
                    const lx = Math.max(x0, 0) + 6, ly = Math.max(y0, 0) + 5;
                    if (lx > x1 - 24 || ly > y1 - 18) continue;
                    const t = (i < LETTERS.length ? LETTERS[i] : "?") + (j + 1);
                    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(0,0,0,.65)"; ctx.strokeText(t, lx, ly);
                    ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fillText(t, lx, ly);
                }
            }
        }
        // «Огненная» палитра по накопленной плотности (0…255)
        const RAMP = (() => {
            const stops = [[0, 0, 0, 0, 0], [0.12, 40, 70, 255, 90], [0.35, 30, 200, 255, 170], [0.55, 90, 235, 90, 200], [0.78, 255, 220, 40, 225], [1, 255, 60, 40, 245]];
            const out = new Uint8ClampedArray(256 * 4);
            for (let i = 0; i < 256; i++) {
                const t = i / 255;
                let k = 1; while (k < stops.length - 1 && stops[k][0] < t) k++;
                const a = stops[k - 1], b = stops[k], f = (t - a[0]) / (b[0] - a[0] || 1);
                for (let c = 0; c < 4; c++) out[i * 4 + c] = a[c + 1] + (b[c + 1] - a[c + 1]) * f;
            }
            return out;
        })();
        function drawHeat(w, h) {
            const cfg = M.pinsCfg;
            if (!cfg || !cfg.list) return;
            const K = 0.25, hw = Math.max(1, Math.ceil(w * K)), hh = Math.max(1, Math.ceil(h * K));
            if (heat.width !== hw || heat.height !== hh) { heat.width = hw; heat.height = hh; }
            hctx.setTransform(1, 0, 0, 1, 0, 0);
            hctx.clearRect(0, 0, hw, hh);
            const z = M.getZoom(), rad = Math.max(10, Math.min(34, 16 + (z - (M.getMinZoom ? M.getMinZoom() : 0)) * 3)) * K;
            const list = cfg.list(), pos = cfg.pos || (m => m.pos);
            const margin = 60;
            for (const m of list) {
                const q = pos(m);
                if (!q) continue;
                const p = px(q);
                if (p.x < -margin || p.y < -margin || p.x > w + margin || p.y > h + margin) continue;
                const x = p.x * K, y = p.y * K;
                const g = hctx.createRadialGradient(x, y, 0, x, y, rad);
                g.addColorStop(0, "rgba(0,0,0,.09)"); g.addColorStop(1, "rgba(0,0,0,0)");
                hctx.fillStyle = g;
                hctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
            }
            const img = hctx.getImageData(0, 0, hw, hh), d = img.data;
            for (let i = 0; i < d.length; i += 4) {
                const v = Math.min(255, d[i + 3] * 1.7) | 0;
                if (!v) continue;
                d[i] = RAMP[v * 4]; d[i + 1] = RAMP[v * 4 + 1]; d[i + 2] = RAMP[v * 4 + 2]; d[i + 3] = RAMP[v * 4 + 3];
            }
            hctx.putImageData(img, 0, 0);
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.globalAlpha = 0.7;
            ctx.drawImage(heat, 0, 0, hw, hh, 0, 0, hw / K, hh / K);
            ctx.restore();
        }
        let raf = 0;
        function draw() {
            raf = 0;
            const { w, h } = size();
            ctx.clearRect(0, 0, w, h);
            haveBounds();
            cv.hidden = !(on.grid || on.heat);
            if (cv.hidden) return;
            if (on.heat) drawHeat(w, h);
            if (on.grid && bounds) drawGrid(w, h);
        }
        const later = () => { if (!raf && (on.grid || on.heat)) raf = requestAnimationFrame(draw); };
        M.onMove(later);
        M.on("zoomend moveend", later);
        // список меток меняют фильтры и «отмеченные» — подхватываем после любого клика/ввода в панели
        let t = 0;
        const soon = () => { if (!on.heat) return; clearTimeout(t); t = setTimeout(later, 140); };
        document.addEventListener("click", soon, true);
        document.addEventListener("change", soon, true);
        document.addEventListener("input", soon, true);
        sync();
        M.whenReady(later);
    }

    if (window.BPMap && window.BPMap.last) init(window.BPMap.last);
    window.addEventListener("bp:map", e => init(e.detail));
})();
