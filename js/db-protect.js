/* Ссылка на источник при копировании (подключает scripts/db_pages.py на всех страницах /db/).
   Копировать можно что угодно; к фрагменту от MIN символов дописывается адрес страницы. */
(function () {
    "use strict";
    var MIN = 80;
    document.addEventListener("copy", function (e) {
        var t = e.target;
        if (t && t.closest && t.closest("input, textarea, [contenteditable=''], [contenteditable='true']")) return;
        var sel = String(window.getSelection ? window.getSelection() : "");
        if (sel.trim().length < MIN || !e.clipboardData) return;
        e.preventDefault();
        e.clipboardData.setData("text/plain", sel + "\n\nИсточник: " + location.href.split("#")[0]);
    });
})();
