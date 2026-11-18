/* Живой фон страниц базы игры (разметка — scripts/db_pages.py → shell, DB["bg"]).
   Tainted Grail: Авалон гниёт под Мглой. Туман рисует CSS (.dbg i), а на canvas летят:
   — пепел: серые хлопья медленно падают, кувыркаются и сносятся ветром;
   — искры: редкие тёплые точки поднимаются, покачиваясь, и гаснут;
   — огамические надписи: холодным светом Мглы проступает вертикальная строка огама и гаснет.
     Черты рисуются линиями, а не шрифтом, поэтому огам виден везде, даже без шрифта с этими символами.
   Без движения (prefers-reduced-motion) — только неподвижный туман. Во вкладке в фоне всё стоит на паузе. */
(function () {
    "use strict";
    var root = document.querySelector(".dbg");
    if (!root) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { root.classList.add("is-still"); return; }
    var cv = root.querySelector("canvas"), ctx = cv && cv.getContext && cv.getContext("2d");
    if (!ctx) return;

    var W = 0, H = 0, dpr = 1, raf = 0, last = 0, wind = 0, windT = 0;
    var ash = [], embers = [], runes = [], runeIn = .8;
    var small = false;

    // заранее нарисованное пятнышко искры: радиальный градиент на каждый кадр дорог
    var spark = document.createElement("canvas");
    spark.width = spark.height = 32;
    (function () {
        var c = spark.getContext("2d"), g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, "rgba(255,214,150,1)");
        g.addColorStop(.25, "rgba(255,150,70,.75)");
        g.addColorStop(1, "rgba(255,90,30,0)");
        c.fillStyle = g; c.fillRect(0, 0, 32, 32);
    })();

    function size() {
        dpr = 1;   // мягким хлопьям и свечению retina не нужна, а canvas во весь экран вчетверо легче
        W = window.innerWidth; H = window.innerHeight;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        small = W < 700;
        var nA = Math.round(Math.min(small ? 34 : 80, W * H / 22000));
        var nE = small ? 6 : 14;
        while (ash.length < nA) ash.push(newAsh(true));
        ash.length = nA;
        while (embers.length < nE) embers.push(newEmber(true));
        embers.length = nE;
    }

    function newAsh(any) {
        var z = Math.random();                       // глубина: дальние мельче, тусклее и медленнее
        return { x: Math.random() * (W + 200) - 100, y: any ? Math.random() * H : -10 - Math.random() * 40,
            z: z, s: 1 + z * 2.6, vy: 9 + z * 22, sw: 6 + Math.random() * 18, ph: Math.random() * 6.28,
            rot: Math.random() * 6.28, vr: (Math.random() - .5) * 2.2, a: .14 + z * .3,
            c: Math.random() < .2 ? "196,182,170" : "150,140,134" };
    }
    function newEmber(any) {
        return { x: Math.random() * W, y: any ? H * (.35 + Math.random() * .65) : H + 10,
            r: 4 + Math.random() * 7, vy: 14 + Math.random() * 26, ph: Math.random() * 6.28, sw: 10 + Math.random() * 26,
            life: 0, max: 6 + Math.random() * 8 };
    }

    // ---------- огам: стебель-линия и группы черт (1–5) справа, слева, наискось через стебель или насечки ----------
    function newRune() {
        var n = 3 + Math.floor(Math.random() * 4), letters = [];
        for (var k = 0; k < n; k++) letters.push({ kind: Math.floor(Math.random() * 4), cnt: 1 + Math.floor(Math.random() * 5) });
        var unit = small ? 7 : 9, len = 0;
        letters.forEach(function (l) { len += (l.cnt + 1.6) * unit; });
        var h = len + unit * 3;
        // по сторонам от колонки контента, на узком экране — где угодно, но совсем бледно
        var col = Math.min(1180, W - 32), side = (W - col) / 2, x;
        if (side > 70) x = Math.random() < .5 ? 20 + Math.random() * (side - 50) : W - side + 30 + Math.random() * (side - 50);
        else x = 16 + Math.random() * (W - 32);
        return { x: x, y: 80 + Math.random() * Math.max(10, H - h - 140), h: h, unit: unit, letters: letters,
            life: 0, max: 7 + Math.random() * 4, faint: side <= 70, hue: Math.random() < .7 ? 186 : 268 };
    }
    function drawRune(r) {
        var t = r.life / r.max, a = t < .3 ? t / .3 : t > .7 ? (1 - t) / .3 : 1;
        a = a * a * (3 - 2 * a) * (r.faint ? .32 : .78);
        // строка пишется снизу вверх, как на камнях: черты проступают по очереди
        var shown = Math.min(1, r.life / (r.max * .35));
        var u = r.unit, x = r.x, y0 = r.y + r.h, y = y0 - u * 1.5, w = u * 1.25;
        ctx.save();
        ctx.lineCap = "round";
        // свечение — два прохода: широкий бледный штрих и тонкий яркий (shadowBlur на каждый кадр слишком дорог)
        var glow = "hsla(" + r.hue + ",90%,60%," + (a * .22) + ")", core = "hsla(" + r.hue + ",80%,72%," + a + ")";
        for (var pass = 0; pass < 2; pass++) { strokeRune(r, x, y0, y, u, w, shown, pass ? core : glow, pass ? 2.2 : 9); }
        ctx.restore();
    }
    function strokeRune(r, x, y0, y, u, w, shown, col, lw) {
        ctx.strokeStyle = ctx.fillStyle = col;
        ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 - (r.h * shown)); ctx.stroke();
        var limit = y0 - r.h * shown;
        for (var k = 0; k < r.letters.length; k++) {
            var L = r.letters[k];
            for (var c = 0; c < L.cnt; c++) {
                if (y < limit) break;
                ctx.beginPath();
                if (L.kind === 0) { ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke(); }                 // вправо
                else if (L.kind === 1) { ctx.moveTo(x - w, y); ctx.lineTo(x, y); ctx.stroke(); }            // влево
                else if (L.kind === 2) { ctx.moveTo(x - w, y + u * .45); ctx.lineTo(x + w, y - u * .45); ctx.stroke(); } // наискось
                else { ctx.arc(x, y, lw > 3 ? 4.5 : 2.2, 0, 6.283); ctx.fill(); }                             // насечка
                y -= u;
            }
            y -= u * .6;
        }
    }

    function frame(t) {
        raf = 0;
        if (document.hidden) return;
        // 30 кадров в секунду: для медленного пепла глазу хватает, а GPU слабых ноутбуков вдвое свободнее
        if (last && t - last < 30) { raf = requestAnimationFrame(frame); return; }
        var dt = Math.min(.05, (t - (last || t)) / 1000);
        last = t;
        // ветер то усиливается, то стихает
        windT += dt;
        wind = Math.sin(windT * .13) * 14 + Math.sin(windT * .37) * 6;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        // огам — под пеплом
        runeIn -= dt;
        if (runeIn <= 0 && runes.length < (small ? 2 : 4)) { runes.push(newRune()); runeIn = 1.8 + Math.random() * 2.2; }
        for (var q = runes.length - 1; q >= 0; q--) {
            runes[q].life += dt;
            if (runes[q].life >= runes[q].max) { runes.splice(q, 1); continue; }
            drawRune(runes[q]);
        }

        // пепел
        for (var k = 0; k < ash.length; k++) {
            var p = ash[k];
            p.ph += dt * .9; p.rot += p.vr * dt;
            p.y += p.vy * dt;
            p.x += (wind * (.4 + p.z) + Math.sin(p.ph) * p.sw * .5) * dt;
            if (p.y > H + 12 || p.x < -120 || p.x > W + 120) { ash[k] = newAsh(false); continue; }
            ctx.save();
            ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            ctx.scale(1, .35 + Math.abs(Math.sin(p.rot)) * .65);   // хлопья кувыркаются — то плашмя, то ребром
            ctx.fillStyle = "rgba(" + p.c + "," + p.a + ")";
            ctx.fillRect(-p.s, -p.s * .6, p.s * 2, p.s * 1.2);
            ctx.restore();
        }

        // искры
        ctx.globalCompositeOperation = "lighter";
        for (var e = 0; e < embers.length; e++) {
            var m = embers[e];
            m.life += dt; m.y -= m.vy * dt; m.ph += dt * 1.4;
            if (m.life > m.max || m.y < -20) { embers[e] = newEmber(false); continue; }
            var f = Math.min(1, m.life / 1.5) * Math.min(1, (m.max - m.life) / 2.5);
            // мерцание
            ctx.globalAlpha = f * (.55 + .25 * Math.sin(m.ph * 3.1));
            var ex = m.x + Math.sin(m.ph) * m.sw * .5 + wind * .3 * m.life;
            ctx.drawImage(spark, ex - m.r, m.y - m.r, m.r * 2, m.r * 2);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        raf = requestAnimationFrame(frame);
    }
    function run() { if (!raf && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }

    size();
    var rt = 0;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 150); });
    document.addEventListener("visibilitychange", function () { root.classList.toggle("is-off", document.hidden); if (!document.hidden) run(); });
    root.classList.add("is-live");
    run();
})();
