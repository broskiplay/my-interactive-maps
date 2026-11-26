// «Установить как приложение» и работа без сети. Подключается из js/topbar.js (страницы сайта) и js/map-topbar.js (карты).
//   • регистрирует /sw.js на всех страницах (на картах это же делает js/map-core.js — повторная регистрация безвредна);
//   • первая страница, открытая до установки SW, передаёт ему список своих файлов — так она сразу попадает в офлайн-копию;
//   • кнопка «Установить» — только в личном кабинете (#cab-install в cabinet/index.html), в шапках её нет: Chrome/Edge/Яндекс Браузер — системное окно установки (beforeinstallprompt),
//     iPhone/iPad и Safari на Mac — подсказка «Поделиться → На экран „Домой“» / «Файл → Добавить в Dock»;
//     если окно установки уже показывали и от него отказались — подсказка, где установка в меню браузера. В уже установленном приложении кнопки нет.
(function () {
    "use strict";
    if (window.bpPwa) return;
    window.bpPwa = true;

    // На локальном сервере (Live Server и т. п.) SW не ставим и снимаем старый: иначе после остановки сервера
    // страницы продолжают открываться из офлайн-копии, а правки в файлах не видны.
    var local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    if ("serviceWorker" in navigator && local) {
        navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () {});
        if (window.caches) caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); }).catch(function () {});
    }
    var secure = location.protocol === "https:";
    if ("serviceWorker" in navigator && secure) {
        var hadController = !!navigator.serviceWorker.controller;
        var start = function () {
            navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function () {});
            if (hadController) return;
            navigator.serviceWorker.ready.then(function (reg) {
                var urls = [location.href];
                try {
                    performance.getEntriesByType("resource").forEach(function (e) {
                        if (/^https?:/.test(e.name) && !/\/(tiles|popups)\//.test(e.name)) urls.push(e.name);
                    });
                } catch (e) { /* без списка сохранится только сама страница */ }
                if (reg.active) reg.active.postMessage({ type: "bp-warm", urls: urls });
            }).catch(function () {});
        };
        if (document.readyState === "complete") setTimeout(start, 1500);
        else window.addEventListener("load", function () { setTimeout(start, 1500); });
    }

    var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
    if (standalone) {
        var done0 = document.getElementById("cab-install-done");
        if (done0) done0.hidden = false;
        return;
    }

    var ua = navigator.userAgent;
    var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    // на iOS установка есть только в Safari; встроенные браузеры приложений и Chrome/Firefox для iOS её не дают
    var iosSafari = ios && /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|YaBrowser|OPiOS|Instagram|FBAN|FBAV|VKAndroidApp|vkclient/i.test(ua);
    // Safari 17+ на Mac: «Файл → Добавить в Dock» (событие установки Safari не присылает)
    var macSafari = !ios && /Macintosh/.test(ua) && /Version\/(1[7-9]|[2-9]\d)[.\d]* Safari\//.test(ua) && !/Chrome|Chromium|Edg\/|YaBrowser|OPR\//.test(ua);

    var firefox = !ios && /Firefox\//.test(ua) && !/Android/.test(ua);
    var btn = null, hint = null;

    function css() {
        if (document.getElementById("bp-install-css")) return;
        var s = document.createElement("style");
        s.id = "bp-install-css";
        s.textContent =
            ".bp-install-hint { position: fixed; z-index: 100000; inset: 0; display: grid; place-items: end center; padding: 16px; background: var(--sp-scrim); }" +
            "@media (min-width: 641px) { .bp-install-hint { place-items: center; } }" +
            // окно — стекло движка (.sp-glass), кнопка — .sp-btn.sp-primary: палитра страницы или игры из css/spatial.css
            ".bp-install-card { width: min(380px, 100%); box-sizing: border-box; padding: 20px; font: 15px/1.5 var(--font-body, system-ui, sans-serif); }" +
            ".bp-install-card h3 { margin: 0 0 10px; font-size: 17px; color: var(--sp-text); }" +
            ".bp-install-card ol { margin: 0 0 16px; padding-left: 20px; }" +
            ".bp-install-card li { margin: 4px 0; }" +
            ".bp-install-card svg { width: 18px; height: 18px; vertical-align: -4px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }" +
            ".bp-install-card .sp-btn { width: 100%; min-height: 42px; border-radius: var(--sp-r-pill); font-size: 14px; }";
        document.head.appendChild(s);
    }

    function show() {
        btn = btn || document.getElementById("cab-install");
        if (!btn) return;
        btn.hidden = false;
        if (btn.dataset.bound) return;
        btn.dataset.bound = "1";
        css();
        btn.addEventListener("click", install);
    }
    function hide() { if (btn) btn.hidden = true; closeHint(); }

    function install() {
        var evt = window.bpInstallEvt;
        if (evt && evt.prompt) {
            window.bpInstallEvt = null;
            evt.prompt();
            // окно установки показывается один раз на событие; при отказе браузер пришлёт новое — тогда кнопка вернётся
            // приняли — кнопка уходит; отказались — остаётся: следующий клик покажет, где установка в меню браузера
            var done = function (r) { if (r && r.outcome === "accepted") hide(); };
            if (evt.userChoice && evt.userChoice.then) evt.userChoice.then(done, function () {}); else hide();
            return;
        }
        // окна установки сейчас нет (Safari или браузер уже показывал его) — подсказка вместо «мёртвой» кнопки
        openHint();
    }

    function openHint() {
        if (hint) return;
        css();
        hint = document.createElement("div");
        hint.className = "bp-install-hint";
        hint.setAttribute("role", "dialog");
        hint.setAttribute("aria-modal", "true");
        hint.setAttribute("aria-label", "Как установить приложение");
        var share = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3.5M8 7l4-4 4 4M6 11H5v9.5h14V11h-1"/></svg>';
        var body = iosSafari
            ? '<h3>Установить на iPhone или iPad</h3><ol><li>Нажмите «Поделиться» ' + share + ' в панели Safari.</li>' +
              '<li>Выберите «На экран „Домой“».</li><li>Нажмите «Добавить».</li></ol>'
            : ios
            ? '<h3>Установить на iPhone или iPad</h3><p>Этот браузер не умеет ставить сайты на экран «Домой». Откройте broskiplay.ru в Safari и выберите «Поделиться» ' + share + ' → «На экран „Домой“».</p>'
            : firefox
            ? '<h3>Установить как приложение</h3><p>Firefox на компьютере не устанавливает сайты как приложения. Откройте broskiplay.ru в Chrome, Edge или Яндекс Браузере и нажмите значок установки в адресной строке.</p>'
            : macSafari
            ? '<h3>Установить на Mac</h3><ol><li>Откройте меню «Файл» в Safari (или «Поделиться» ' + share + ').</li>' +
              '<li>Выберите «Добавить в Dock».</li><li>Нажмите «Добавить».</li></ol>'
            : '<h3>Установить как приложение</h3><ol><li>Нажмите значок установки в адресной строке или откройте меню браузера (⋮ или ≡).</li>' +
              '<li>Выберите «Установить приложение» — в Chrome это пункт «Сохранить и поделиться → Установить страницу как приложение».</li>' +
              '<li>Подтвердите установку.</li></ol>';
        hint.innerHTML = '<div class="bp-install-card sp-glass">' + body + '<button type="button" class="sp-btn sp-primary">Понятно</button></div>';
        hint.addEventListener("click", function (e) { if (e.target === hint || e.target.tagName === "BUTTON") closeHint(); });
        document.addEventListener("keydown", onKey);
        document.body.appendChild(hint);
        hint.querySelector("button").focus();
    }
    // окно модальное: Escape закрывает, Tab не выпускает фокус на фон страницы
    function onKey(e) {
        if (e.key === "Escape") { closeHint(); return; }
        if (e.key !== "Tab" || !hint) return;
        var f = [].slice.call(hint.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"));
        if (!f.length) { e.preventDefault(); return; }
        var i = f.indexOf(document.activeElement), n = e.shiftKey ? i - 1 : i + 1;
        if (i < 0 || n < 0 || n >= f.length) { e.preventDefault(); f[n < 0 || (i < 0 && e.shiftKey) ? f.length - 1 : 0].focus(); }
    }
    function closeHint() {
        if (!hint) return;
        hint.remove(); hint = null;
        document.removeEventListener("keydown", onKey);
        if (btn && !btn.hidden) btn.focus();
    }

    // событие могли поймать раньше (topbar.js / map-topbar.js) — тогда оно уже лежит в window.bpInstallEvt
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); window.bpInstallEvt = e; show(); });
    window.addEventListener("bp-installable", show);
    window.addEventListener("appinstalled", function () {
        window.bpInstallEvt = null; hide();
        var d = document.getElementById("cab-install-done");
        if (d) { d.textContent = "Приложение установлено."; d.hidden = false; }
    });
    // в кабинете кнопка есть всегда (кроме установленного приложения): без события установки она откроет подсказку
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show); else show();
})();
