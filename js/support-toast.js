/* Окошко «Поддержать проект» на страницах карт.
 *
 * Движок карты сообщает об отмеченной метке событием:
 *     window.dispatchEvent(new CustomEvent("bp:found", { detail: { map: <id карты>, count: <сколько отмечено на карте> } }));
 * Окошко показывается на порогах 50, 100, 200, 300, 400… отмеченных меток на карте, но не чаще раза в 5 часов.
 * Кнопка «Больше не показывать» появляется, когда в игре (сумма по её картам) отмечено 200 меток.
 * «Позже» / крестик / Esc: окошко уходит и сообщает, что не появится 5 часов.
 * Для автора: открыть любую карту с ?nosupport=1 — в этом браузере окошка больше не будет (?nosupport=0 возвращает).
 * «Я уже поддержал(а)» открывает форму (Google Forms): имя в DonationAlerts, сумма, когда. Автор сверяет её с донатами.
 * Отправил форму — окошко не появляется 7 дней.
 * Состояние хранится в localStorage (ключ bp_support): без аккаунта и без запросов на сервер сайта.
 */
(function () {
    "use strict";

    var DONATE_URL = "https://www.donationalerts.com/r/broskiplay";

    // Форма «Я уже поддержал(а)» — Google Form «Информация о донате». Все три вопроса в ней обязательные.
    //   action — адрес отправки; поля — идентификаторы вопросов entry.N (из «предзаполненной ссылки» формы)
    var CLAIM = {
        action: "https://docs.google.com/forms/d/e/1FAIpQLSeagjyGe8irRhTR9z5GhXj6Y3jH8rwHQ9B1oqbmlZ4CDBhyeg/formResponse",
        name: "entry.777213525",   // «Имя в DonationAlerts»
        amount: "entry.1293368605", // «Сумма»
        when: "entry.1428241708"    // «Когда»
    };

    var KEY = "bp_support";
    var COOLDOWN_HOURS = 5;
    var COOLDOWN = COOLDOWN_HOURS * 60 * 60 * 1000; // пауза между показами
    var PAUSE_DAYS = 7 * 24 * 60 * 60 * 1000; // пауза после «Поддержать» и после отправленной формы
    var AUTO_HIDE = 30 * 1000;                // окошко само уходит, если на него не обратили внимания
    var SHOW_DELAY = 700;                     // даём доиграть анимации отметки
    var OFF_BUTTON_FROM_MARKS = 200;          // сколько меток должно быть отмечено в игре, чтобы появилась «Больше не показывать»

    // Тексты. {n} — сколько меток отмечено. Меняются по кругу, чтобы просьба не повторялась слово в слово.
    var TEXTS = [
        { title: "{n} находок — отличный счёт", body: "Карты делает один человек: переводит метки, собирает тайлы и чинит баги. Если сайт сэкономил вам час блужданий, поддержите проект донатом — так новая карта выйдет быстрее." },
        { title: "Монетки за находки", body: "Если бы за каждую метку давали монету, у вас было бы уже {n}. Автору карт монеты тоже пригодятся: на них появляются новые игры и переводы." },
        { title: "Карта пока ничего не просила", body: "Вы отметили {n} меток, и она ни разу не попросила ничего взамен. Теперь просим мы: любой донат помогает проекту жить и расти." },
        { title: "Уже {n} меток", body: "Вы проводите на этих картах много времени, и автору это приятно. Донат любого размера — лучший способ сказать «продолжай»." }
    ];
    // Строка под каждым текстом: сайт остаётся бесплатным, донат — по желанию
    var NOTE = "Сайт бесплатный: без подписки и без ограничения числа отмеченных меток. Донат — только по желанию.";

    function read() {
        try {
            var s = JSON.parse(localStorage.getItem(KEY) || "{}");
            return s && typeof s === "object" ? s : {};
        } catch (e) { return {}; }
    }
    function write(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* localStorage недоступен */ } }
    function patch(fields) { var s = read(); for (var k in fields) s[k] = fields[k]; write(s); }

    // Режим автора: флаг хранится в localStorage этого браузера
    try {
        var flag = new URLSearchParams(location.search).get("nosupport");
        if (flag === "1") patch({ owner: true });
        else if (flag === "0") patch({ owner: false });
    } catch (e) { /* без параметров адреса просто работаем как обычно */ }

    // Ближайший пройденный порог: 50, 100, 200, 300…
    function reached(n) {
        if (n < 50) return 0;
        if (n < 100) return 50;
        return Math.floor(n / 100) * 100;
    }

    var toast = null, hideTimer = 0, sessionShown = false;

    function close() {
        clearTimeout(hideTimer);
        if (!toast) return;
        var t = toast;
        toast = null;
        t.classList.remove("is-visible");
        setTimeout(function () { t.remove(); }, 250);
    }

    // Человек сам закрыл окошко («Позже», крестик, Esc): запоминаем момент и сообщаем про паузу
    function notice(text, ms) {
        if (!toast) return;
        var el = toast;
        clearTimeout(hideTimer);
        el.textContent = "";
        el.appendChild(node("p", "support-toast-body support-toast-bye", text));
        hideTimer = setTimeout(close, ms);
    }
    function dismiss() {
        patch({ last: Date.now() });
        notice("Хорошо! Окошко не появится ближайшие " + COOLDOWN_HOURS + " часов.", 3500);
    }

    function node(tag, cls, text) {
        var el = document.createElement(tag);
        if (cls) el.className = cls;
        if (text != null) el.textContent = text;
        return el;
    }
    function button(cls, text, onClick) {
        var b = node("button", cls, text);
        b.type = "button";
        b.addEventListener("click", onClick);
        return b;
    }

    // Отправка ответа в Google Form: поля уходят как entry.N
    function sendClaim(values) {
        var body = new URLSearchParams();
        body.append(CLAIM.name, values.name);
        body.append(CLAIM.amount, values.amount);
        body.append(CLAIM.when, values.when);
        // no-cors: ответ Google прочитать нельзя, но запись в форму создаётся
        return fetch(CLAIM.action, { method: "POST", mode: "no-cors", body: body });
    }

    function renderMain(el, n, shownBefore, gameCount, onOff) {
        el.textContent = "";
        var text = TEXTS[shownBefore % TEXTS.length];
        el.appendChild(button("support-toast-close", "×", dismiss)).setAttribute("aria-label", "Закрыть");
        el.appendChild(node("strong", "support-toast-title", text.title.replace("{n}", n)));
        el.appendChild(node("p", "support-toast-body", text.body.replace("{n}", n)));
        el.appendChild(node("p", "support-toast-note", NOTE));

        var actions = node("div", "support-toast-actions");
        var donate = node("a", "support-toast-donate", "Поддержать проект");
        donate.href = DONATE_URL;
        donate.target = "_blank";
        donate.rel = "noopener noreferrer";
        donate.addEventListener("click", function () { patch({ until: Date.now() + PAUSE_DAYS }); close(); });
        actions.appendChild(donate);
        actions.appendChild(button("support-toast-later", "Позже", dismiss));
        el.appendChild(actions);

        var links = node("div", "support-toast-links");
        if (CLAIM.action) {
            links.appendChild(button("support-toast-link", "Я уже поддержал(а)", function () { renderForm(el, n, shownBefore, gameCount, onOff); }));
        }
        if (gameCount >= OFF_BUTTON_FROM_MARKS) {
            links.appendChild(button("support-toast-link", "Больше не показывать", function () {
                onOff();
                notice("Хорошо, окошко больше не появится.", 3000);
            }));
        }
        if (links.childNodes.length) el.appendChild(links);
    }

    function renderForm(el, n, shownBefore, gameCount, onOff) {
        clearTimeout(hideTimer); // пока человек заполняет, окошко не уходит
        el.textContent = "";
        el.appendChild(button("support-toast-close", "×", dismiss)).setAttribute("aria-label", "Закрыть");
        el.appendChild(node("strong", "support-toast-title", "Спасибо за поддержку!"));
        el.appendChild(node("p", "support-toast-body", "Заполните три поля: автор сверит донат, а напоминания на неделю исчезнут."));

        var form = node("form", "support-toast-form");
        form.noValidate = true;
        function field(label, name, placeholder, required) {
            var wrap = node("label", "support-toast-field");
            wrap.appendChild(node("span", "", label));
            var input = node("input");
            input.type = "text";
            input.name = name;
            input.maxLength = 120;
            input.placeholder = placeholder;
            input.autocomplete = "off";
            if (required) input.required = true;
            wrap.appendChild(input);
            form.appendChild(wrap);
            return input;
        }
        var name = field("Имя в DonationAlerts", "name", "как подписан донат", true);
        var amount = field("Сумма", "amount", "например, 100 ₽", true);
        var when = field("Когда", "when", "например, вчера или 3 ноября", true);

        // ловушка для ботов: человек это поле не видит
        var trap = node("input", "support-toast-trap");
        trap.type = "text"; trap.name = "website"; trap.tabIndex = -1; trap.autocomplete = "off"; trap.setAttribute("aria-hidden", "true");
        form.appendChild(trap);

        var error = node("p", "support-toast-error");
        error.hidden = true;
        form.appendChild(error);

        var actions = node("div", "support-toast-actions");
        var submit = node("button", "support-toast-donate", "Отправить");
        submit.type = "submit";
        actions.appendChild(submit);
        actions.appendChild(button("support-toast-later", "Назад", function () { renderMain(el, n, shownBefore, gameCount, onOff); }));
        form.appendChild(actions);

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var values = { name: name.value.trim(), amount: amount.value.trim(), when: when.value.trim() };
            var empty = !values.name ? name : !values.amount ? amount : !values.when ? when : null;
            if (empty) {
                error.textContent = "Заполните все три поля, чтобы автор мог найти донат.";
                error.hidden = false;
                empty.focus();
                return;
            }
            submit.disabled = true;
            var done = function () {
                patch({ until: Date.now() + PAUSE_DAYS, claimed: Date.now() });
                el.textContent = "";
                el.appendChild(button("support-toast-close", "×", close)).setAttribute("aria-label", "Закрыть");
                el.appendChild(node("strong", "support-toast-title", "Спасибо!"));
                el.appendChild(node("p", "support-toast-body", "Автор сверит донат. Напоминаний не будет неделю."));
                hideTimer = setTimeout(close, 4000);
            };
            if (trap.value) { done(); return; } // бот: делаем вид, что всё хорошо
            sendClaim(values).then(done, function () {
                submit.disabled = false;
                error.textContent = "Не получилось отправить. Проверьте интернет и попробуйте ещё раз.";
                error.hidden = false;
            });
        });
        el.appendChild(form);
        name.focus();
    }

    function show(n, shownBefore, gameCount, onOff) {
        var el = node("aside", "support-toast");
        el.setAttribute("role", "status");
        el.setAttribute("aria-live", "polite");
        renderMain(el, n, shownBefore, gameCount, onOff);

        el.addEventListener("keydown", function (e) { if (e.key === "Escape") dismiss(); });
        // пока человек читает, окошко не уходит
        el.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
        el.addEventListener("mouseleave", function () { if (!el.querySelector("form") && !el.querySelector(".support-toast-bye")) hideTimer = setTimeout(close, AUTO_HIDE); });

        document.body.appendChild(el);
        toast = el;
        void el.offsetWidth; // фиксируем начальное состояние, чтобы сработала анимация появления (без requestAnimationFrame: на тяжёлой странице он может задержаться)
        el.classList.add("is-visible");
        hideTimer = setTimeout(close, AUTO_HIDE);
    }

    window.addEventListener("bp:found", function (e) {
        var d = e.detail || {};
        var count = Number(d.count) || 0;
        var game = location.pathname + "|";
        var key = game + (d.map || "");

        // запоминаем, сколько отмечено на каждой карте игры (нужно для «Больше не показывать»)
        var s = read();
        s.cnt = s.cnt || {};
        if (s.cnt[key] !== count) { s.cnt[key] = count; write(s); }

        var threshold = reached(count);
        if (!threshold || toast || sessionShown) return;
        var now = Date.now();
        if (s.off || s.owner) return;
        if (s.until && now < s.until) return;
        if (s.last && now - s.last < COOLDOWN) return;
        if ((s.th && s.th[key] || 0) >= threshold) return;

        // порог «потрачен» в момент показа, чтобы окошко не вернулось на той же метке
        s.th = s.th || {};
        s.th[key] = threshold;
        var shownBefore = s.shown || 0;
        s.shown = shownBefore + 1;
        s.last = now;
        write(s);
        sessionShown = true; // за один заход на страницу — не больше одного раза

        var gameCount = 0;
        for (var k in s.cnt) if (k.indexOf(game) === 0) gameCount += s.cnt[k];

        setTimeout(function () {
            show(count, shownBefore, gameCount, function () { patch({ off: true }); });
        }, SHOW_DELAY);
    });
})();
