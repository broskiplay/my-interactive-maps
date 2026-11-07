// Главная: абстрактный фон с параллаксом, индикатор прокрутки, появление карточек при прокрутке (стили — css/style.css, «Оформление 2026»)
(function () {
    const bg = document.createElement("div");
    bg.className = "abstract-bg";
    bg.innerHTML = '<span class="b1" data-speed=".25"></span><span class="b2" data-speed=".4"></span><span class="b3" data-speed=".15"></span>' +
        '<svg viewBox="0 0 1100 600" fill="none" stroke="#9fd6ea" stroke-width="1.2" data-speed=".1">' +
        '<path d="M40 420 C 220 300, 340 520, 540 380 S 860 260, 1060 360"/><path d="M40 470 C 240 350, 360 570, 560 430 S 880 310, 1060 410" opacity=".6"/>' +
        '<path d="M40 520 C 260 400, 380 620, 580 480 S 900 360, 1060 460" opacity=".35"/>' +
        '<circle cx="300" cy="200" r="90" opacity=".5"/><circle cx="820" cy="150" r="54" opacity=".4"/><circle cx="820" cy="150" r="100" opacity=".2"/></svg>';
    document.body.prepend(bg);

    const meter = document.createElement("div");
    meter.className = "scroll-meter";
    document.body.append(meter);

    // При «уменьшить движение» фон не двигается
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layers = still ? [] : [...bg.querySelectorAll("[data-speed]")];
    function onScroll() {
        const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
        meter.style.width = (max > 0 ? y / max * 100 : 0) + "%";
        layers.forEach(el => {
            const base = el.tagName === "svg" ? "translateX(-50%) " : "";
            el.style.transform = base + `translateY(${-y * el.dataset.speed}px)`;
        });
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Карточки появляются при прокрутке; без IntersectionObserver — сразу видимы
    const cards = document.querySelectorAll(".game-dropdown, .game-placeholder, .community-block, .donate-block, .updates, .about-item");
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: .12 });
    cards.forEach(c => { c.classList.add("reveal"); io.observe(c); });
})();
