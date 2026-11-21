// Замок карты Silver Palace до выхода игры. Пока не наступило 14 декабря 2026 (00:00 по Москве), карту закрывает заставка
// с обратным отсчётом; в назначенную минуту заставка снимается сама, перезагружать страницу не нужно.
// Автор карты входит через Google: адрес сверяется по SHA-256 (сам адрес в коде не хранится).
// Важно: сайт статический, это замок «от посетителей», а не защита данных — файлы меток и тайлов лежат в открытом доступе.
(function () {
    "use strict";
    var RELEASE = Date.parse("2026-12-14T00:00:00+03:00");
    var OWNER_HASH = "86d410ddae79a275fd5e9a7b1ef2803640f0af29747a13803f8e192c2074caa0";
    var FB = { apiKey: "AIzaSyBZ29h18Z1k0gE4dAEca5JH8yePQgxhaII", authDomain: "broskiplaymaps.firebaseapp.com", projectId: "broskiplaymaps", appId: "1:418362476965:web:59ce4e677b1a0a84d7404c" };
    if (Date.now() >= RELEASE) return;

    var root = document.documentElement;
    root.classList.add("slv-locked");
    var style = document.createElement("style");
    style.textContent =
        "html.slv-locked body{visibility:hidden!important}" +
        "#slv-gate{position:fixed;inset:0;z-index:2147483000;display:flex;padding:20px;overflow:auto;overscroll-behavior:contain;color:var(--sp-text);text-align:center;" +
        "font:400 18px/1.45 var(--font-body,Alegreya,Georgia,serif);background:var(--sp-floor,var(--sp-base))}" +
        "#slv-gate:before{content:'';position:absolute;inset:0;background:url(logo-card.webp) center/cover;opacity:.12;filter:blur(4px)}" +
        "#slv-gate .g{position:relative;margin:auto;width:min(640px,100%);padding:36px 32px 30px;display:grid;gap:20px;justify-items:center;border-radius:var(--sp-r-lg,18px);background:var(--sp-card);box-shadow:var(--sp-card-sh)}" +
        "#slv-gate img{width:min(520px,100%);height:auto;filter:drop-shadow(0 0 18px color-mix(in srgb,var(--sp-accent) 45%,transparent))}" +
        "#slv-gate .eb{font:600 13px/1 var(--font-display,Cinzel,Georgia,serif);letter-spacing:.38em;text-transform:uppercase;color:var(--sp-muted);margin-top:-6px}" +
        "#slv-gate h1{font:600 clamp(22px,4.4vw,30px)/1.2 var(--font-display,Forum,Georgia,serif);letter-spacing:.03em;margin:0;color:var(--sp-text)}" +
        "#slv-gate .t{display:flex;gap:12px;justify-content:center;width:100%}" +
        "#slv-gate .t div{flex:1 1 0;max-width:120px;padding:14px 6px 11px;border-radius:var(--sp-r-md,14px);background:var(--sp-base);box-shadow:var(--sp-press)}" +
        "#slv-gate .t b{display:block;font:700 clamp(26px,6vw,38px)/1.05 var(--font-display,Cinzel,Georgia,serif);color:var(--sp-accent);font-variant-numeric:tabular-nums}" +
        "#slv-gate .t span{display:block;margin-top:5px;font-size:12px;color:var(--sp-muted);letter-spacing:.1em;text-transform:uppercase}" +
        "#slv-gate p{margin:0;color:var(--sp-muted);max-width:46ch}" +
        "#slv-gate .b{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}" +
        "#slv-gate .sp-btn{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 20px;font:600 15px/1 var(--font-body,Alegreya,Georgia,serif);text-decoration:none;cursor:pointer;border:0}" +
        "#slv-gate .m{min-height:20px;font-size:15px;color:var(--sp-accent)}" +
        "@media(max-width:480px){#slv-gate .g{padding:28px 16px 24px}#slv-gate .t{gap:8px}}" +
        // низкий экран: карточка не центрируется за пределы окна (margin:auto) и ужимается, чтобы кнопки входа были видны сразу
        "@media(max-height:700px){#slv-gate{padding:12px}#slv-gate .g{gap:12px;padding:20px 16px 18px}#slv-gate img{width:min(360px,100%)}#slv-gate .eb{margin-top:-4px}#slv-gate .t div{padding:9px 4px 7px}#slv-gate .t b{font-size:clamp(22px,5vw,30px)}#slv-gate p{font-size:15px;line-height:1.35}}" +
        "@media(max-height:620px){#slv-gate p{display:none}#slv-gate h1{font-size:20px}#slv-gate .b{flex-wrap:nowrap;gap:8px}#slv-gate .sp-btn{padding:0 14px;font-size:14px}}" +
        // в каркасе сайта шапка и навигация остаются видны и работают, заставка — только на месте карты
        "html.slv-locked .bx-top,html.slv-locked .bx-rail{visibility:visible}" +
        "html:has(.bx-top) #slv-gate{top:var(--bx-top-h,0px);left:var(--bx-rail-w,0px);z-index:45}" +
        "@media(max-width:860px){html:has(.bx-rail) #slv-gate{bottom:calc(64px + env(safe-area-inset-bottom))}}";
    document.head.appendChild(style);

    var gate, timer, cdEl, msg, btn;
    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function unit(label) { return '<div><b>00</b><span>' + label + '</span></div>'; }
    function unlock() {
        clearInterval(timer);
        root.classList.remove("slv-locked");
        if (gate) gate.remove();
        window.dispatchEvent(new Event("resize"));
    }
    function tick() {
        var left = RELEASE - Date.now();
        if (left <= 0) { unlock(); return; }
        var s = Math.floor(left / 1000), v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
        cdEl.querySelectorAll("b").forEach(function (b, i) { b.textContent = pad(v[i]); });
    }
    function sha256(text) {
        return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
            return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
        });
    }
    function checkUser(user, fb) {
        if (!user) return;
        if (!user.email || !user.emailVerified || !window.crypto || !crypto.subtle) { msg.textContent = "Не удалось проверить аккаунт."; return; }
        sha256(user.email.trim().toLowerCase()).then(function (h) {
            if (h === OWNER_HASH) unlock();
            else { msg.textContent = "У этого аккаунта пока нет доступа: карта откроется для всех 14 декабря."; fb.auth().signOut(); }
        });
    }
    function firebase() {
        var lazy = window.BPFirebase;
        if (!lazy) return Promise.reject(new Error("no firebase"));
        return lazy.load().then(function (f) { if (!f.apps.length) f.initializeApp(FB); return f; });
    }
    function build() {
        gate = document.createElement("div");
        gate.id = "slv-gate";
        gate.setAttribute("role", "dialog");
        gate.setAttribute("aria-label", "Карта откроется 14 декабря 2026");
        gate.innerHTML =
            '<div class="g"><img src="logo-title.svg" width="568" height="87" alt="Silver Palace">' +
            '<div class="eb">Серебряный дворец</div>' +
            '<h1>Карта откроется 14 декабря 2026 — в день выхода игры</h1>' +
            '<div class="t">' + unit("дней") + unit("часов") + unit("минут") + unit("секунд") + '</div>' +
            '<p>Мы переносим все метки и переводим названия заранее, чтобы к релизу карта была готова. Откроется сама, перезагружать страницу не нужно.</p>' +
            '<div class="b"><a class="sp-btn" href="../">На главную</a><button type="button" class="sp-btn sp-primary" id="slv-auth">Вход для автора</button></div><div class="m" id="slv-msg" aria-live="polite"></div></div>';
        root.appendChild(gate);
        cdEl = gate.querySelector(".t"); msg = gate.querySelector("#slv-msg"); btn = gate.querySelector("#slv-auth");
        tick(); timer = setInterval(tick, 1000);
        btn.addEventListener("click", function () {
            msg.textContent = "";
            firebase().then(function (f) {
                // результат входа сразу проверяем: наблюдатель ниже ставится, только если сессия была сохранена раньше
                return f.auth().signInWithPopup(new f.auth.GoogleAuthProvider()).then(function (r) { checkUser(r && r.user, f); });
            })
                .catch(function (e) { msg.textContent = e && e.code === "auth/popup-closed-by-user" ? "" : "Вход не удался, попробуйте ещё раз."; });
        });
        // человек уже входил раньше — проверяем сессию без всплывающего окна
        if (window.BPFirebase) window.BPFirebase.hasSavedSession().then(function (saved) {
            if (saved) firebase().then(function (f) { f.auth().onAuthStateChanged(function (u) { checkUser(u, f); }); });
        });
    }
    function init() { build(); }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
