// Кнопка «Сообщить об ошибке» в окне метки на всех картах.
//
// Окна меток у карт устроены по-разному, но везде есть заголовок <h3> и кнопка
// «Отметить найденным» с data-id. Скрипт следит за появлением окон Leaflet и добавляет
// в конец каждого кнопку, которая копирует данные метки и открывает Google-форму.
//
// Чтобы форма заполнялась сама: в Google Forms откройте «⋮ → Получить ссылку для
// предварительного заполнения», впишите любой текст в поле для описания проблемы,
// нажмите «Получить ссылку» и найдите в ней entry.XXXXXXXXX. Число подставьте в ENTRY_ID.
(function () {
    "use strict";

    var FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdCjye5hjkhH_ed9R2IUjYKJ43S5MXFg2aUftj4Vu_rk2cv0w/viewform";
    var ENTRY_ID = ""; // например "1234567890"; пусто — форма откроется без подстановки

    var style = document.createElement("style");
    style.textContent =
        ".bp-report{display:block;margin:8px auto 0;padding:2px 4px;background:none;border:0;color:inherit;" +
        "font:inherit;font-size:12px;opacity:.6;text-decoration:underline;text-underline-offset:3px;cursor:pointer}" +
        ".bp-report:hover,.bp-report:focus-visible{opacity:1}";
    document.head.appendChild(style);

    function decorate(content) {
        var popup = content.firstElementChild;
        if (!popup || popup.querySelector(".bp-report")) return;
        if (popup.querySelector('[class*="-del-btn"]')) return; // своя метка пользователя
        var doneBtn = popup.querySelector("button[data-id]");
        var title = popup.querySelector("h3");
        if (!doneBtn || !title) return;

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bp-report";
        btn.textContent = "Сообщить об ошибке";
        btn.dataset.id = doneBtn.dataset.id;
        btn.dataset.title = title.textContent.trim();
        btn.title = "Открыть форму: неверное место, ошибка в переводе, пропущенная метка";
        popup.appendChild(btn);
    }

    var scheduled = false;
    new MutationObserver(function () {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () {
            scheduled = false;
            document.querySelectorAll(".leaflet-popup-content").forEach(decorate);
        });
    }).observe(document.body, { childList: true, subtree: true });

    // Leaflet гасит всплытие кликов внутри окна метки, поэтому слушаем на фазе перехвата
    document.addEventListener("click", function (event) {
        var btn = event.target.closest && event.target.closest(".bp-report");
        if (!btn) return;
        event.preventDefault();

        var url = new URL(location.href);
        url.searchParams.set("marker", btn.dataset.id);
        url.hash = "";
        var game = document.title.replace(/^Интерактивная карта\s*/, "").replace(/\s*[—-]\s*BroskiPlay.*$/, "");
        var text = "Игра: " + game + "\nМетка: " + btn.dataset.title + " (id " + btn.dataset.id + ")\nСсылка: " + url.href + "\nЧто не так: ";

        var target = FORM_URL;
        if (ENTRY_ID) target += "?usp=pp_url&entry." + ENTRY_ID + "=" + encodeURIComponent(text);
        try { navigator.clipboard.writeText(text); } catch (e) { /* без буфера обмена форма всё равно откроется */ }
        window.open(target, "_blank", "noopener");
        btn.textContent = ENTRY_ID ? "Форма открыта" : "Данные скопированы — вставьте в форму";
    }, true);
})();
