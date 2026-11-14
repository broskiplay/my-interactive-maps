// Главная: абстрактный фон с параллаксом, индикатор прокрутки, появление карточек при прокрутке (стили — css/style.css, «Оформление 2026»)
(function () {
    const bg = document.createElement("div");
    bg.className = "abstract-bg";
    // Фон «карта мира BroskiPlay»: сетка (css), горизонтали рельефа, роза ветров, точки-вейпоинты и три «локации»:
    // геймпад (игры) → маршрут к «кладу», видеоплеер (YouTube) → маршрут к метке карты, чат с плашкой LIVE (Twitch).
    // По маршрутам бегут пунктир и огонёк; под курсором сетка подсвечивается («туман войны»).
    // Рисуется под реальный размер окна (в пикселях) и перерисовывается при смене ширины: рельеф и роза ветров
    // привязаны к краям экрана, на широких экранах маршрут с меткой уходит в поле сбоку от контента.
    // Цвета и прозрачность — css/style.css (.abstract-bg svg …)
    const f = n => n.toFixed(1);
    // При «уменьшить движение» фон не двигается
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    // Холм: вложенные неровные кольца, вершина чуть смещается от уровня к уровню; каждая 3-я линия — «утолщённая» (.ci)
    function hill(cx, cy, levels, r0, step, seed, s) {
        let out = "";
        for (let k = 0; k < levels; k++) {
            const r = r0 + k * step, x0 = cx - k * 6 * s, y0 = cy + k * 4 * s;
            let d = "";
            for (let i = 0; i <= 96; i++) {
                const t = i / 96 * Math.PI * 2;
                const w = 1 + .1 * Math.sin(2 * t + seed) + .06 * Math.sin(3 * t + seed * 1.7 + k * .35) + .035 * Math.sin(5 * t + seed * 2.3 - k * .2);
                d += (i ? "L" : "M") + f(x0 + Math.cos(t) * r * w) + " " + f(y0 + Math.sin(t) * r * w * .82);
            }
            out += `<path class="${k % 3 === 2 ? "ci" : "c"}" d="${d}Z"/>`;
        }
        return out;
    }
    // Роза ветров: 8 лучей фирменных цветов + стрелка севера
    function compass(x, y, s) {
        let out = `<circle class="c" cx="${f(x)}" cy="${f(y)}" r="${f(44 * s)}"/><circle class="cd" cx="${f(x)}" cy="${f(y)}" r="${f(58 * s)}"/>`;
        for (let i = 0; i < 8; i++) {
            const a = (i * 45 + 22.5) * Math.PI / 180, c = Math.cos(a), n = Math.sin(a);
            out += `<line class="${i % 2 ? "sc" : "sl"}" x1="${f(x + c * 16 * s)}" y1="${f(y + n * 16 * s)}" x2="${f(x + c * 32 * s)}" y2="${f(y + n * 32 * s)}"/>`;
        }
        return out + `<path class="north" d="M${f(x)} ${f(y - 40 * s)}l${f(5 * s)} ${f(14 * s)}h${f(-10 * s)}z"/>`;
    }
    // Пунктирный маршрут-«змейка» от (sx, sy) к (px, py); по нему летит огонёк
    function route(sx, sy, px, py, amp, cls) {
        const dx = px - sx, dy = py - sy, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
        let d = "";
        for (let i = 0; i <= 48; i++) {
            const t = i / 48, o = amp * Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI);
            d += (i ? "L" : "M") + f(sx + dx * t + nx * o) + " " + f(sy + dy * t + ny * o);
        }
        const run = still ? "" : `<circle class="trav t${cls}" r="3.2"><animateMotion dur="${f(clamp(len / 42, 5, 11))}s" repeatCount="indefinite" path="${d}"/></circle>`;
        return `<path class="route ${cls}" d="${d}"/>` + run;
    }
    // «Локации» — контурные значки вокруг (0, 0); ic() ставит значок в точку с поворотом и масштабом
    const ic = (x, y, k, a, body, cls) => `<g class="ic${cls ? " " + cls : ""}" transform="translate(${f(x)} ${f(y)}) rotate(${a}) scale(${k.toFixed(2)})">${body}</g>`;
    // геймпад 136×66: крестовина салатовая, кнопки мерцают
    const PAD = '<path class="o" d="M-34-26h68c16 0 24 12 28 30l6 26c3 14-12 22-21 10l-13-18h-68l-13 18c-9 12-24 4-21-10l6-26c4-18 12-30 28-30z"/>' +
        '<path class="al" d="M-36-14v20M-46-4h20"/><circle class="fc tw1" cx="36" cy="-14" r="3.8"/><circle class="oc" cx="46" cy="-4" r="3.8"/>' +
        '<circle class="fl tw2" cx="36" cy="6" r="3.8"/><circle class="oc" cx="26" cy="-4" r="3.8"/><path class="o" d="M-7-9h4M3-9h4"/>';
    // видеоплеер 120×76: кнопка «play» и полоса просмотра
    const PLAYER = '<rect class="o" x="-60" y="-38" width="120" height="76" rx="12"/><path class="fc play" d="M-10-22l24 14-24 14z"/>' +
        '<path class="o" d="M-46 24h92"/><path class="al" d="M-46 24h38"/><circle class="fl" cx="-8" cy="24" r="4"/>';
    // чат стрима 84×60 с плашкой LIVE над правым углом
    const STREAM = '<path class="o" d="M-34-30h68a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8h-36l-14 13v-13h-18a8 8 0 0 1-8-8v-30a8 8 0 0 1 8-8z"/>' +
        '<circle class="fl" cx="-28" cy="-16" r="3"/><path class="o m1" d="M-20-16h30"/><circle class="fc" cx="-28" cy="-3" r="3"/><path class="o m2" d="M-20-3h46"/>' +
        '<circle class="fl" cx="-28" cy="10" r="3"/><path class="o m3" d="M-20 10h22"/>' +
        '<rect class="live" x="12" y="-54" width="54" height="20" rx="10"/><circle class="fl blink" cx="23" cy="-44" r="3.6"/><text class="live-t" x="31" y="-40">LIVE</text>';
    // Метка-булавка с пульсом под остриём; «клад» — крестик
    const pin = (x, y) => `<ellipse class="pulse" cx="${f(x)}" cy="${f(y)}" rx="12" ry="4"/>` +
        `<path class="pin" d="M${f(x)} ${f(y)}c-2-6-11-12-11-21a11 11 0 1 1 22 0c0 9-9 15-11 21z"/><circle class="pin-eye" cx="${f(x)}" cy="${f(y - 21)}" r="4"/>`;
    const cross = (x, y) => `<path class="xmark" d="M${f(x - 8)} ${f(y - 8)}l16 16M${f(x + 8)} ${f(y - 8)}l-16 16"/>`;
    // Точки-вейпоинты: доли ширины и высоты окна
    const DOTS = [[.33, .1, "dc"], [.62, .08, "dl"], [.86, .1, "dc"], [.07, .8, "dc"], [.44, .74, "dl"], [.8, .7, "dc"], [.96, .46, "dl"],
        [.55, 1.08, "dc"], [.16, 1.22, "dl"], [.9, 1.3, "dc"], [.35, 1.45, "dl"], [.7, 1.55, "dc"]];

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("fill", "none"); svg.setAttribute("stroke-width", "1.3"); svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round"); svg.setAttribute("aria-hidden", "true"); svg.dataset.speed = ".1";
    let lastW = 0, lastH = 0, lastSig = "";
    // «Отпечаток» опор разметки: если герой сдвинулся (шрифты, перенос плашек, поздняя вёрстка) — фон перерисовывается
    const sig = () => [".home-title", ".hero-perks > :first-child", "#games-heading"].map(q => {
        const e = document.querySelector(q), b = e && e.getBoundingClientRect();
        return b ? Math.round(b.left) + ":" + Math.round(b.top + scrollY) + ":" + Math.round(b.width) : "";
    }).join("|");
    function draw() {
        lastSig = sig();
        const w = document.documentElement.clientWidth, h = innerHeight, H = Math.round(h * 1.7);
        lastW = w; lastH = h;
        const shell = document.querySelector(".site-shell"), r = shell && shell.getBoundingClientRect();
        const g = r ? Math.max(0, Math.min(r.left, w - r.right)) : 0;   // ширина поля сбоку от контента
        const s = clamp(w / 1440, .65, 1.35), narrow = w < 760, wide = g >= 170;
        // опоры по разметке: заголовок «Библиотека игр» и строка поиска — над ними не рисуем маршруты
        const top = sel => { const e = document.querySelector(sel); return e ? e.getBoundingClientRect().top + scrollY : 0; };
        const headY = top("#games-heading") || h * .36, searchY = top(".game-search") || h * .45;
        let out = "";
        // рельеф: холм у левого края, второй холм выглядывает справа внизу, третий — ниже, виден при прокрутке
        // на широком экране вершина в поле слева, на узком — в полосе героя над заголовком
        const ax = narrow ? 14 : wide ? g * .5 : Math.max(g * .5, 44 * s), ay = narrow ? h * .3 : wide ? h * .4 : headY - 40 * s;
        out += hill(ax, ay, 7, 46 * s, 44 * s, .8, s) + hill(w + 30 * s, h * .98, 5, 60 * s, 50 * s, 2.4, s);
        if (w >= 1000) out += hill(g * .3, h * 1.38, 4, 50 * s, 46 * s, 4.1, s);
        // свободные зоны героя: меряем сам текст заголовка и ряд плашек
        const box = sel => { const e = document.querySelector(sel); if (!e) return null; const rg = document.createRange(); rg.selectNodeContents(e); return rg.getBoundingClientRect(); };
        const tb = box(".home-title"), pb = box(".hero-perks");
        const titleR = tb ? tb.right : 0, titleB = tb ? tb.bottom + scrollY : h * .2;
        if (narrow) {
            // телефон: геймпад справа от заголовка «Библиотека игр»; чат и плеер — по бокам от первой плашки, если есть место
            out += ic(w - 52, headY + 26, .6, -12, PAD, "dim");
            const chip = document.querySelector(".hero-perks > :first-child"), cr = chip && chip.getBoundingClientRect();
            if (cr) {
                const cy = cr.top + scrollY + cr.height / 2;
                if (cr.left > 95) out += ic(cr.left / 2 - 8, cy + 6, .55, -6, STREAM, "dim");
                if (w - cr.right > 90) out += ic((w + cr.right) / 2 + 2, cy - 2, .55, 8, PLAYER, "dim");
            }
        } else {
            const xx = Math.max(28, ax - 130 * s), xy = Math.max(70, ay - 160 * s);
            const cs = clamp(s, .8, 1.2), cx = w - Math.max(g * .5, 72 * s);
            const hasCompass = cx - 58 * cs > titleR + 12;
            if (hasCompass) out += compass(cx, h * .27, cs);
            if (wide) {
                // широкий экран: слева геймпад → маршрут через холм к «кладу», ниже чат стрима;
                // справа роза ветров, метка карты и видеоплеер, от которого к метке идёт маршрут
                const k = clamp(Math.min(s, g / 200), .75, 1.3), px = w - g * .5, py = h * .52;
                out += route(ax + 6 * k, h * .68 - 34 * k, xx, xy + 14, 20 * s, "rl") + cross(xx, xy) + ic(ax, h * .68, k, -10, PAD);
                out += ic(ax - 4 * k, h * .9, k, 6, STREAM);
                out += route(px - 8 * k, h * .8 - 46 * k, px, py, 22 * s, "rc") + pin(px, py) + ic(px, h * .8, k, 6, PLAYER);
            } else {
                // поля нет: значки встают в свободные углы героя — слева и справа от ряда плашек
                const k = .8, midY = (titleB + headY) / 2, pl = pb ? pb.left : w * .3, pr = pb ? pb.right : w * .7;
                const px = w - 120 * s, py = searchY - 16;
                let fromX = px - 320 * s, fromY = py - 6 * s, start = ax, startY = ay;
                if (pl - 30 > 190) {   // геймпад слева, от него маршрут к «кладу»
                    const gx = clamp(pl * .36, 100, 170);
                    out += ic(gx, midY - 6, k, -12, PAD);
                    start = gx - 30 * k; startY = midY - 6 - 30 * k;
                    if (pl - 30 > gx + 54 * k + 130) out += ic(Math.min(pl - 108, gx + 190), midY + 14, k, 6, STREAM);
                }
                out += route(start, startY, xx, xy + 14, 10 * s, "rl") + cross(xx, xy);
                const zr = (hasCompass ? cx - 58 * cs : w) - 16;   // правый край свободной зоны
                if (zr - pr - 30 > 110) {   // видеоплеер справа, маршрут от него к метке
                    const vx = (pr + 30 + zr) / 2, vy = midY - 2;
                    out += ic(vx, vy, k, 6, PLAYER);
                    fromX = vx + 8; fromY = vy + 42 * k;
                }
                out += route(fromX, fromY, px, py, 18 * s, "rc") + pin(px, py);
            }
        }
        out += DOTS.map(([x, y, k]) => `<circle class="${k}" cx="${f(x * w)}" cy="${f(y * h)}" r="3.5"/>`).join("");
        svg.setAttribute("viewBox", `0 0 ${w} ${H}`); svg.setAttribute("width", w); svg.setAttribute("height", H);
        svg.innerHTML = out;
    }
    bg.innerHTML = '<span class="b1" data-speed=".25"></span><span class="b2" data-speed=".4"></span><span class="b3" data-speed=".15"></span><i class="reveal-grid"></i>';
    bg.append(svg);
    draw();
    // шрифты меняют ширину заголовка и положение блоков — после загрузки перерисовать
    if (document.fonts) document.fonts.ready.then(draw);
    const redrawIfMoved = () => { if (sig() !== lastSig) draw(); };
    addEventListener("load", redrawIfMoved);
    const hero = document.querySelector(".hero");
    if (hero && "ResizeObserver" in window) new ResizeObserver(redrawIfMoved).observe(hero);
    // Перерисовка при смене ширины (поворот, окно браузера); мелкие скачки высоты на телефоне (панель адреса) не трогают фон
    let pending = 0;
    addEventListener("resize", () => {
        if (pending || (Math.abs(document.documentElement.clientWidth - lastW) < 2 && Math.abs(innerHeight - lastH) < 160)) return;
        pending = requestAnimationFrame(() => { pending = 0; draw(); });
    });
    document.body.prepend(bg);

    // «Туман войны»: под курсором проявляется яркая сетка (только мышь; клетка совпадает с сеткой .abstract-bg::before)
    if (!still && matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const rv = bg.querySelector(".reveal-grid"), R = 230;
        let mx = 0, my = 0, queued = 0;
        addEventListener("pointermove", e => {
            mx = e.clientX; my = e.clientY;
            if (queued) return;
            queued = requestAnimationFrame(() => {
                queued = 0;
                const cell = lastW <= 700 ? 48 : 64, L = mx - R, T = my - R;
                rv.style.transform = `translate3d(${L}px,${T}px,0)`;
                rv.style.backgroundPosition = `${lastW / 2 - cell / 2 - L}px ${-T}px`;
                rv.classList.add("on");
            });
        }, { passive: true });
        document.documentElement.addEventListener("pointerleave", () => rv.classList.remove("on"));
    }

    const meter = document.createElement("div");
    meter.className = "scroll-meter";
    document.body.append(meter);

    const layers = still ? [] : [...bg.querySelectorAll("[data-speed]")];
    function onScroll() {
        const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
        meter.style.width = (max > 0 ? y / max * 100 : 0) + "%";
        layers.forEach(el => { el.style.transform = `translateY(${-y * el.dataset.speed}px)`; });
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Карточки появляются при прокрутке; без IntersectionObserver — сразу видимы
    const cards = document.querySelectorAll(".game-dropdown, .game-placeholder, .game-suggest-banner, .community-block, .donate-block, .updates, .about-item");
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: .12 });
    // Анимацию получают только карточки ниже первого экрана: уже видимые не прячем,
    // иначе они мигают (появились → исчезли → проявились) и сдвигают момент LCP
    const fold = innerHeight;
    cards.forEach(c => {
        if (c.getBoundingClientRect().top < fold) return;
        c.classList.add("reveal");
        io.observe(c);
    });
})();
