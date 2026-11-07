// Объёмные (неоморфные) пины меток для всех карт; вызывается из buildPinSprite каждого движка.
// Вместо плоской заливки с белой обводкой: выпуклая «капля» — блик сверху-слева, тень снизу-справа,
// мягкая тень под пином и светлая кромка, гаснущая книзу. Цвет категории сохраняется.
(function () {
    "use strict";

    function rgb(color) {
        if (color[0] === "#") {
            let h = color.slice(1);
            if (h.length === 3) h = h.split("").map(c => c + c).join("");
            const n = parseInt(h, 16);
            return [n >> 16, (n >> 8) & 255, n & 255, 1];
        }
        const m = color.match(/[\d.]+/g).map(Number);
        return [m[0], m[1], m[2], m[3] == null ? 1 : m[3]];
    }
    const mix = (c, t, k) => c.map((v, i) => i < 3 ? Math.round(v + (t - v) * k) : v);
    const css = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a == null ? c[3] : a})`;

    // Заливка «выпуклой» формы: path уже построен в ctx, (hx, hy) — точка блика в текущих координатах
    function shadeBody(ctx, path, hx, hy, r, fill, k) {
        const c = rgb(fill);
        // мягкая тень под пином (как у неоморфных плиток)
        path();
        ctx.shadowColor = "rgba(0,0,0,.42)"; ctx.shadowBlur = 8 * k; ctx.shadowOffsetX = 1.5 * k; ctx.shadowOffsetY = 3 * k;
        ctx.fillStyle = css(c);
        ctx.fill();
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        // объём: светлее у блика, темнее к краю
        const g = ctx.createRadialGradient(hx, hy, r * .05, hx * .3, hy * .3, r * 1.55);
        g.addColorStop(0, css(mix(c, 255, .5)));
        g.addColorStop(.42, css(c));
        g.addColorStop(1, css(mix(c, 0, .38)));
        path();
        ctx.fillStyle = g;
        ctx.fill();
        // глянцевый блик
        ctx.save();
        path(); ctx.clip();
        const s = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * .7);
        s.addColorStop(0, "rgba(255,255,255,.42)");
        s.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = s;
        ctx.fillRect(-r * 3, -r * 3, r * 6, r * 6);
        ctx.restore();
    }

    // Кромка: цвет обводки игры сверху, почти прозрачная снизу (tx,ty → bx,by — направление «верх → низ»)
    function rim(ctx, path, rimColor, width, tx, ty, bx, by) {
        const c = rgb(rimColor);
        const g = ctx.createLinearGradient(tx, ty, bx, by);
        g.addColorStop(0, css(c, Math.min(1, c[3] * 1.05)));
        g.addColorStop(1, css(c, c[3] * .25));
        path();
        ctx.lineWidth = width; ctx.strokeStyle = g;
        ctx.stroke();
    }

    window.NMPin = {
        // «Капля»: вызывается внутри ctx.translate(cx,cy) + ctx.rotate(-45°), как teardropPath в движках.
        // В повёрнутых координатах «верх-лево экрана» — это (0, -r), «верх экрана» — (r, -r).
        drop(ctx, buildPath, r, fill, k, rimColor) {
            shadeBody(ctx, () => buildPath(r), 0, -r * .5, r, fill, k);
            rim(ctx, () => buildPath(r - 1), rimColor, 1.6, r * .7, -r * .7, -r * .7, r * .7);
        },
        // Круглая точка (мелкие категории)
        dot(ctx, cx, cy, r, fill, k, rimColor) {
            const path = () => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); };
            ctx.save(); ctx.translate(cx, cy);
            shadeBody(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); }, -r * .35, -r * .4, r, fill, k);
            ctx.restore();
            rim(ctx, () => { ctx.beginPath(); ctx.arc(cx, cy, r - .5, 0, Math.PI * 2); }, rimColor, 1.3, cx, cy - r, cx, cy + r);
        }
    };
})();
