// Пины меток в стиле spatial UI для всех карт; вызывается из buildPinSprite каждого движка.
// Слои глубины, как у панели и кнопок: пин «парит» над картой (мягкая тень вниз + пятно контакта под кончиком),
// корпус светлее сверху и глубже снизу, глянец по верхней кромке, иконка лежит на вдавленной подложке,
// тонкий тёмный контур отделяет пин от светлых тайлов, светлая кромка гаснет книзу. Цвет категории сохраняется.
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
    const noShadow = ctx => { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; };

    // Корпус. path — форма в текущих координатах; (tx,ty) → (bx,by) — направление «верх экрана → низ экрана»;
    // lift — насколько пин приподнят (тень длиннее и мягче)
    function body(ctx, path, tx, ty, bx, by, fill, k, lift) {
        const c = rgb(fill);
        // тень «парения»: свет сверху, тень строго вниз
        path();
        ctx.shadowColor = "rgba(0,0,0,.34)"; ctx.shadowBlur = 9 * lift * k; ctx.shadowOffsetY = 4 * lift * k;
        ctx.fillStyle = css(c);
        ctx.fill();
        noShadow(ctx);
        // объём: светлее сверху, глубже снизу
        const g = ctx.createLinearGradient(tx, ty, bx, by);
        g.addColorStop(0, css(mix(c, 255, .3)));
        g.addColorStop(.48, css(c));
        g.addColorStop(1, css(mix(c, 0, .34)));
        path();
        ctx.fillStyle = g;
        ctx.fill();
        // глянец по верхней половине
        ctx.save();
        path(); ctx.clip();
        const s = ctx.createLinearGradient(tx, ty, tx + (bx - tx) * .55, ty + (by - ty) * .55);
        s.addColorStop(0, "rgba(255,255,255,.34)");
        s.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = s;
        ctx.fillRect(-200, -200, 400, 400);
        ctx.restore();
    }

    // Подложка под иконку: круг чуть темнее корпуса, «вдавлен» — тень сверху внутри, светлая кромка снизу
    function platter(ctx, x, y, r, fill, tx, ty, bx, by) {
        const c = rgb(fill);
        const g = ctx.createLinearGradient(tx, ty, bx, by);
        g.addColorStop(0, css(mix(c, 0, .2)));
        g.addColorStop(1, css(mix(c, 0, .04)));
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        const e = ctx.createLinearGradient(tx, ty, bx, by);
        e.addColorStop(0, "rgba(0,0,0,.2)");
        e.addColorStop(1, "rgba(255,255,255,.32)");
        ctx.beginPath(); ctx.arc(x, y, r - .4, 0, Math.PI * 2);
        ctx.lineWidth = .9; ctx.strokeStyle = e;
        ctx.stroke();
    }

    // Кромки: снаружи тонкий тёмный контур (отделяет от светлых тайлов), внутри — цвет обводки игры, гаснущий книзу
    function edges(ctx, outer, inner, rimColor, tx, ty, bx, by) {
        outer();
        ctx.lineWidth = 1; ctx.strokeStyle = "rgba(0,0,0,.38)";
        ctx.stroke();
        const c = rgb(rimColor);
        const g = ctx.createLinearGradient(tx, ty, bx, by);
        g.addColorStop(0, css(c, Math.min(1, c[3])));
        g.addColorStop(1, css(c, c[3] * .18));
        inner();
        ctx.lineWidth = 1.2; ctx.strokeStyle = g;
        ctx.stroke();
    }

    window.NMPin = {
        // «Капля»: вызывается внутри ctx.translate(cx,cy) + ctx.rotate(-45°), как teardropPath в движках.
        // В повёрнутых координатах «верх экрана» — направление (1, -1), кончик капли — (-r, r).
        drop(ctx, buildPath, r, fill, k, rimColor) {
            const d = r / Math.SQRT2, tx = d, ty = -d, bx = -r, by = r;
            // пятно контакта под кончиком — пин стоит над картой
            ctx.save();
            ctx.rotate(Math.PI / 4);
            const tipY = r * Math.SQRT2;
            ctx.translate(0, tipY + 4);
            ctx.scale(1, .3);
            const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, r * .58);
            sh.addColorStop(0, "rgba(0,0,0,.42)");
            sh.addColorStop(.6, "rgba(0,0,0,.16)");
            sh.addColorStop(1, "rgba(0,0,0,0)");
            ctx.beginPath(); ctx.arc(0, 0, r * .58, 0, Math.PI * 2);
            ctx.fillStyle = sh;
            ctx.fill();
            ctx.restore();

            body(ctx, () => buildPath(r), tx, ty, bx, by, fill, k, 1);
            platter(ctx, 0, 0, r * .7, fill, tx * .7, ty * .7, -d * .7, d * .7);
            edges(ctx, () => buildPath(r + .5), () => buildPath(r - .9), rimColor, tx, ty, bx * .7, by * .7);
        },
        // Круглая точка (мелкие категории): меньше подъём, без пятна контакта — точка сидит на месте
        dot(ctx, cx, cy, r, fill, k, rimColor) {
            const circle = rr => () => { ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); };
            body(ctx, circle(r), cx, cy - r, cx, cy + r, fill, k, .6);
            platter(ctx, cx, cy, r * .68, fill, cx, cy - r * .68, cx, cy + r * .68);
            edges(ctx, circle(r + .5), circle(r - .7), rimColor, cx, cy - r, cx, cy + r);
        }
    };
})();
