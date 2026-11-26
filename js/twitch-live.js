// Статус эфира Twitch в общей шапке (и кнопка Twitch в подвале главной) — на всех страницах сайта.
// Подключается после гидратации (LegacyScripts) или defer-скриптом каркаса базы и категорий (без React).
// Шапка: #topbar.is-twitch-live — логотип и BROSKIPLAY в цвет Twitch, #twitch-live — ссылка «● В ЭФИРЕ».
// Проверка — DecAPI при открытии и раз в минуту (в скрытой вкладке не спрашиваем, при возврате — сразу, если пора).
// Ошибка сервиса или непонятный ответ — «не в эфире», ложного эфира не бывает. Предпросмотр: ?previewTwitch=live.
(function () {
    "use strict";
    if (window.__bpTwitchLive) return;
    window.__bpTwitchLive = true;

    var CHANNEL = "https://www.twitch.tv/broskiplay";
    var API = "https://decapi.me/twitch/uptime/broskiplay";
    var EVERY = 60 * 1000;
    var preview = /(?:^|[?&])previewTwitch=live(?:&|$)/.test(location.search);
    var busy = false, last = 0, live = null;

    function render(on, status) {
        var top = document.getElementById("topbar");
        var badge = document.getElementById("twitch-live");
        var btn = document.getElementById("twitch-button");
        var label = document.getElementById("twitch-button-label");
        var title = on ? "BroskiPlay в эфире" + (status ? ": " + status : "") : "Канал BroskiPlay на Twitch";
        if (top) top.classList.toggle("is-twitch-live", on);
        if (badge) { badge.hidden = !on; badge.title = title + " — смотреть на Twitch"; }
        if (btn) { btn.classList.toggle("is-live", on); btn.href = CHANNEL; btn.title = title; }
        if (label) label.textContent = on ? "В ЭФИРЕ" : "Twitch";
        live = on;
    }

    // Эфир — только если DecAPI вернул длительность («1 hour, 5 minutes, 3 seconds»); всё остальное — нет
    function isLive(text) {
        return /^\d+\s+(second|minute|hour|day)s?\b/i.test(text) && !/offline|error|not found|invalid|limit/i.test(text);
    }

    function check() {
        if (busy || document.hidden) return;
        busy = true; last = Date.now();
        var ctrl = window.AbortController ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 10000) : 0;
        fetch(API, { cache: "no-store", signal: ctrl ? ctrl.signal : undefined })
            .then(function (r) { if (!r.ok) throw new Error("DecAPI " + r.status); return r.text(); })
            .then(function (t) { t = t.trim(); var on = isLive(t); render(on, on ? t : ""); })
            .catch(function () { if (live !== false) render(false, ""); })
            .then(function () { clearTimeout(timer); busy = false; });
    }

    function start() {
        if (preview) { render(true, "предпросмотр"); return; }
        check();
        setInterval(check, EVERY);
        document.addEventListener("visibilitychange", function () {
            if (!document.hidden && Date.now() - last >= EVERY) check();
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
})();
