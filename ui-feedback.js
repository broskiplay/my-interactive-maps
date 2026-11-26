// Тема у сайта одна — тёмная (светлую и переключатель убрали 2026-11-19).
// Файл оставлен, потому что его ещё подключают старые закэшированные страницы и privacy.html:
// он только ставит тёмную тему и стирает прежний выбор из localStorage.
(function () {
    document.documentElement.setAttribute("data-theme", "dark");
    try {
        localStorage.removeItem("bp_theme");
        localStorage.removeItem("bp_theme_sys");
    } catch (error) {}
    var slot = document.querySelector(".ui-controls.tb-theme");
    if (slot) slot.remove();
})();
