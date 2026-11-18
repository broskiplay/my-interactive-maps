(function () {
    const themeStorageKey = "bp_theme";
    const style = document.createElement("style");
    style.textContent = `
        .ui-controls {
            position: fixed; top: 14px; right: 14px; z-index: 10000;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .ui-theme-toggle {
            --ui-inner: #121820; --ui-fg: #54dcff;
            --ui-ring: linear-gradient(135deg, #54dcff, #c084ff);
            --ui-glow: rgba(84, 220, 255, .28);
            position: relative; isolation: isolate;
            display: grid; place-items: center; width: 44px; height: 44px; padding: 0;
            border: 2px solid transparent; border-radius: 50%;
            background: linear-gradient(var(--ui-inner), var(--ui-inner)) padding-box, var(--ui-ring) border-box;
            color: var(--ui-fg);
            box-shadow: 0 2px 8px rgba(0, 0, 0, .3);
            cursor: pointer;
            transition: transform .25s ease, box-shadow .25s ease, color .25s ease;
        }
        /* Мягкое свечение вокруг кнопки */
        .ui-theme-toggle::before {
            content: ""; position: absolute; inset: -2px; z-index: -1; border-radius: 50%;
            background: var(--ui-ring); filter: blur(9px); opacity: .25; transition: opacity .25s ease;
        }
        .ui-theme-toggle:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 16px var(--ui-glow); }
        .ui-theme-toggle:hover::before { opacity: .55; }
        .ui-theme-toggle:active { transform: scale(.94); }
        .ui-theme-toggle:focus-visible { outline: 2px solid #c7ff3f; outline-offset: 3px; }
        /* Тема: в тёмной — янтарное солнце, в светлой — фиолетовая луна */
        .ui-theme-toggle { --ui-fg: #ffb547; --ui-ring: linear-gradient(135deg, #ffb547, #ff7a45); --ui-glow: rgba(255, 160, 70, .35); }
        .ui-theme-toggle svg { width: 20px; height: 20px; overflow: visible; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
        .ui-theme-toggle .theme-icon { transform-origin: center; animation: ui-theme-pop .5s cubic-bezier(.4, 0, .2, 1); }
        .ui-theme-toggle:hover .theme-icon { transform: rotate(18deg); transition: transform .3s ease; }
        @keyframes ui-theme-pop { from { transform: rotate(-90deg) scale(.5); opacity: 0; } to { transform: none; opacity: 1; } }
        /* Светлая тема */
        :root[data-theme="light"] .ui-theme-toggle {
            --ui-inner: #ffffff; --ui-fg: #0e9bc4; --ui-ring: linear-gradient(135deg, #0e9bc4, #8b4fd4);
            --ui-glow: rgba(14, 155, 196, .28); box-shadow: 0 2px 8px rgba(30, 45, 70, .12);
        }
        :root[data-theme="light"] .ui-theme-toggle { --ui-fg: #7c3aed; --ui-ring: linear-gradient(135deg, #8b4fd4, #4f7cff); --ui-glow: rgba(124, 58, 237, .3); }
        @media (prefers-reduced-motion: reduce) { .ui-theme-toggle .theme-icon { animation: none; } }
        @media (max-width: 480px) {
            .ui-controls { top: 10px; right: 10px; gap: 6px; }
            .ui-theme-toggle { width: 42px; height: 42px; }
        }
    `;
    document.head.append(style);

    function getControlsContainer() {
        let container = document.querySelector(".ui-controls");
        if (!container) {
            container = document.createElement("div");
            container.className = "ui-controls";
            document.body.append(container);
        }
        return container;
    }

    function currentTheme() {
        return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    }

    function renderThemeIcon(theme) {
        // Тёмная тема: солнце (нажатие включит светлую), светлая: луна.
        return theme === "light"
            ? '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/></svg>'
            : '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>';
    }

    function renderThemeToggle(button, animate) {
        const theme = currentTheme();
        button.setAttribute("aria-label", theme === "light" ? "Переключить на тёмную тему" : "Переключить на светлую тему");
        button.title = theme === "light" ? "Тёмная тема" : "Светлая тема";
        if (button.dataset.theme !== theme) {
            button.dataset.theme = theme;
            button.innerHTML = renderThemeIcon(theme);
        }
    }

    function addThemeToggle() {
        if (document.querySelector(".ui-theme-toggle")) return;
        const button = document.createElement("button");
        button.className = "ui-theme-toggle";
        button.type = "button";
        renderThemeToggle(button);
        button.addEventListener("click", () => {
            const next = currentTheme() === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", next);
            try {
                localStorage.setItem(themeStorageKey, next);
                // Запоминаем системную тему на момент выбора: когда телефон сменит тему, ручной выбор сбросится
                localStorage.setItem(themeStorageKey + "_sys", systemTheme());
            } catch (error) {
                console.warn("Не удалось сохранить тему:", error);
            }
            renderThemeToggle(button);
        });
        getControlsContainer().append(button);
        watchSystemTheme(button);
    }

    function systemTheme() {
        try { return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"; } catch (error) { return "dark"; }
    }

    // Телефон сменил тему (например, автоматически вечером) — сайт переключается следом
    function watchSystemTheme(button) {
        let query;
        try { query = window.matchMedia("(prefers-color-scheme: light)"); } catch (error) { return; }
        const onChange = () => {
            try {
                localStorage.removeItem(themeStorageKey);
                localStorage.removeItem(themeStorageKey + "_sys");
            } catch (error) {}
            document.documentElement.setAttribute("data-theme", systemTheme());
            renderThemeToggle(button);
        };
        if (query.addEventListener) query.addEventListener("change", onChange);
        else if (query.addListener) query.addListener(onChange);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            addThemeToggle();
        }, { once: true });
    } else {
        addThemeToggle();
    }
})();