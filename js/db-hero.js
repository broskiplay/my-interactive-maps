/* Шапка каталога базы (/db/<игра>/, разметка — scripts/db_pages.py → Game.hero):
   кадры из игры плавно сменяются с медленным наездом камеры, справа выходит босс, чудовище или персонаж сюжета
   (подпись внизу — ссылка на его запись; порядок, кроме первого, перемешивается при каждом заходе), над всем —
   дрейфующий туман (CSS) и искры (canvas). Картинки грузятся по одной, перед своей сменой.
   Без движения (prefers-reduced-motion) — первый кадр и первое существо, без анимации. Вне экрана и во вкладке
   в фоне всё стоит на паузе. */
(function () {
    "use strict";
    var hero = document.querySelector(".dbx");
    if (!hero) return;
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var shots = [].slice.call(hero.querySelectorAll(".dbx-shot"));
    var beasts = [].slice.call(hero.querySelectorAll(".dbx-beast"));
    var cap = hero.querySelector(".dbx-cap");
    var visible = true, timer = null, i = 0, STEP = 7000;
    // показанного сейчас (его случайно выбрал инлайн-скрипт шапки) — в начало, остальных — в случайном порядке
    var on = beasts.filter(function (b) { return b.classList.contains("is-on"); })[0];
    if (on) { beasts.splice(beasts.indexOf(on), 1); beasts.unshift(on); }
    for (var j = beasts.length - 1; j > 1; j--) {
        var r = 1 + Math.floor(Math.random() * j), t = beasts[j]; beasts[j] = beasts[r]; beasts[r] = t;
    }

    function load(el) {
        var src = el.getAttribute("data-src");
        if (!src || el._loaded) return;
        el._loaded = true;
        if (el.tagName === "IMG") {
            if (!el.getAttribute("src")) {   // на телефоне srcset отдаёт копию 540 px вместо рендера 1024 px
                if (el.getAttribute("data-srcset")) el.srcset = el.getAttribute("data-srcset");
                el.src = src;
            }
        }
        else {
            var im = new Image();
            im.onload = function () { el.style.backgroundImage = "url(" + src + ")"; };
            im.src = src;
        }
    }
    function ready(el) { return el.tagName === "IMG" ? el.complete && el.naturalWidth > 0 : !!el.style.backgroundImage; }
    function caption() {
        var b = beasts[i % beasts.length];
        if (!cap || !b) return;
        cap.innerHTML = "";
        var k = document.createElement("small");
        k.textContent = b.getAttribute("data-kind") || "";
        cap.appendChild(k);
        cap.appendChild(document.createTextNode(b.getAttribute("data-name") || ""));
        if (b.getAttribute("data-href")) cap.href = b.getAttribute("data-href");
    }

    function step() {
        var n = i + 1;
        var s = shots.length ? shots[n % shots.length] : null, b = beasts.length ? beasts[n % beasts.length] : null;
        // следующая пара ещё грузится — подождём, чтобы не мигнуть пустым кадром
        if ((s && !ready(s)) || (b && !ready(b))) { if (s) load(s); if (b) load(b); timer = setTimeout(step, 600); return; }
        if (shots.length) { shots[i % shots.length].classList.remove("is-on"); s.classList.add("is-on"); }
        if (beasts.length) { beasts[i % beasts.length].classList.remove("is-on"); b.classList.add("is-on"); }
        i = n;
        caption();
        if (shots.length) load(shots[(i + 1) % shots.length]);
        if (beasts.length) load(beasts[(i + 1) % beasts.length]);
        timer = setTimeout(step, STEP);
    }
    function play() { if (!timer && !still && visible && !document.hidden) timer = setTimeout(step, STEP); }
    function pause() { clearTimeout(timer); timer = null; }

    caption();
    hero.classList.add("is-live");
    if (still) { hero.classList.add("is-still"); return; }
    // вторую пару — сразу после загрузки страницы, остальные — по ходу показа
    window.addEventListener("load", function () { if (shots[1]) load(shots[1]); if (beasts[1]) load(beasts[1]); });

    // ---------- искры: тёплые точки поднимаются, покачиваясь, и гаснут ----------
    var cv = hero.querySelector(".dbx-embers"), ctx = cv && cv.getContext && cv.getContext("2d");
    var parts = [], W = 0, H = 0, dpr = 1, raf = 0, last = 0;
    // искры — заранее нарисованные пятнышки трёх оттенков: градиент на каждую искру в каждом кадре был дорог
    var sprites = [18, 31, 44].map(function (hue) {
        var c = document.createElement("canvas"); c.width = c.height = 32;
        var x = c.getContext("2d"), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, "hsla(" + hue + ",100%,70%,1)"); g.addColorStop(1, "hsla(" + hue + ",100%,50%,0)");
        x.fillStyle = g; x.fillRect(0, 0, 32, 32); return c;
    });
    function size() {
        if (!cv) return;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        W = hero.clientWidth; H = hero.clientHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        var want = Math.round(Math.min(70, W / 16));
        while (parts.length < want) parts.push(spawn(true));
        parts.length = want;
    }
    function spawn(any) {
        return { x: Math.random() * W, y: any ? Math.random() * H : H + 10, r: .6 + Math.random() * 1.9,
            vy: 12 + Math.random() * 30, ph: Math.random() * 6.28, sw: 8 + Math.random() * 22, life: 0, max: 5 + Math.random() * 7,
            s: Math.floor(Math.random() * sprites.length) };
    }
    function frame(t) {
        raf = 0;
        if (!visible || document.hidden) return;
        if (last && t - last < 30) { raf = requestAnimationFrame(frame); return; }   // 30 кадров/с
        var dt = Math.min(.05, (t - (last || t)) / 1000);
        last = t;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = "lighter";
        for (var k = 0; k < parts.length; k++) {
            var p = parts[k];
            p.life += dt; p.y -= p.vy * dt; p.ph += dt * 1.3;
            if (p.life > p.max || p.y < -10) { parts[k] = spawn(false); continue; }
            var fade = Math.min(1, p.life / 1.2) * Math.min(1, (p.max - p.life) / 2);
            var x = p.x + Math.sin(p.ph) * p.sw * .4;
            ctx.globalAlpha = .85 * fade;
            ctx.drawImage(sprites[p.s], x - p.r * 4, p.y - p.r * 4, p.r * 8, p.r * 8);
        }
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(frame);
    }
    function run() { if (ctx && !raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
    if (ctx) { size(); window.addEventListener("resize", size); }

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
            visible = en[0].isIntersecting;
            hero.classList.toggle("is-off", !visible);   // CSS ставит туман и наезд камеры на паузу
            if (visible) { play(); run(); } else pause();
        }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) pause(); else { play(); run(); } });
    play(); run();
})();
