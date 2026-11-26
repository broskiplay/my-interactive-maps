// Яндекс Метрика (счётчик 114103338). Вебвизор не используется.
// Считаем только посетителей broskiplay.ru: локальные проверки (localhost) и сторонние копии в статистику не попадают.
(function () {
    var h = location.hostname;
    if (h !== "broskiplay.ru" && h !== "www.broskiplay.ru") return;
    (function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
        m[i].l = 1 * new Date();
        for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) return; }
        k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(114103338, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
})();
