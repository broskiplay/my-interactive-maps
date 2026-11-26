"use client";

import { useEffect } from "react";

type W = typeof window & { bpPwa?: unknown; bpPwaLoader?: boolean; bpInstallEvt?: Event };

/**
 * Поведение нового оформления главной (не трогает логику js/script.js и js/home-lib.js):
 * появление блоков, «/» для поиска, поиск на телефоне,
 * одна раскрытая карточка, переход по #game-<игра>, окно «О проекте», установка приложения (PWA).
 */
export function HomeClient() {
  useEffect(() => {
    const root = document.documentElement;
    const off: (() => void)[] = [];
    const on = <K extends keyof DocumentEventMap>(
      t: EventTarget,
      type: K | string,
      fn: (e: Event) => void,
      opts?: AddEventListenerOptions,
    ) => {
      t.addEventListener(type, fn, opts);
      off.push(() => t.removeEventListener(type, fn, opts));
    };
    const container = document.getElementById("games-container");
    const cards = () => [...document.querySelectorAll<HTMLDetailsElement>("#games-container > details.game-dropdown")];

    // ---------- появление блоков при прокрутке ----------
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blocks = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    if (!still && "IntersectionObserver" in window) {
      // Блоки, уже видимые на экране, не прячем: повторное проявление после гидрации Chrome засчитывает как новый LCP
      blocks.forEach((b) => {
        if (b.getBoundingClientRect().top < window.innerHeight) b.classList.add("is-in");
      });
      root.classList.add("bx-js");
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io.unobserve(e.target);
            }
          }),
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
      );
      blocks.forEach((b) => io.observe(b));
      off.push(() => io.disconnect());
    } else blocks.forEach((b) => b.classList.add("is-in"));

    // ---------- поиск: «/», кнопка на телефоне, прокрутка к играм ----------
    const input = document.getElementById("game-search-input") as HTMLInputElement | null;
    const top = document.getElementById("topbar");
    const sBtn = document.getElementById("tb-search");
    on(document, "keydown", (e) => {
      const k = e as KeyboardEvent;
      const t = k.target as HTMLElement;
      if (k.key === "/" && !k.metaKey && !k.ctrlKey && !t.closest("input, textarea, select, [contenteditable]")) {
        k.preventDefault();
        // на узком экране поле спрятано за лупой — сначала раскрываем его
        if (input && !input.getClientRects().length) {
          top?.classList.add("is-search");
          sBtn?.setAttribute("aria-expanded", "true");
        }
        input?.focus();
      }
      if (k.key === "Escape") {
        if (document.activeElement === input) input?.blur();
        closeSearch();
        cards().forEach((c) => (c.open = false));
      }
    });
    // мобильный поиск: закрыть по клику/тапу вне поля и кнопки
    const closeSearch = () => {
      if (!top?.classList.contains("is-search")) return;
      top.classList.remove("is-search");
      sBtn?.setAttribute("aria-expanded", "false");
    };
    on(document, "pointerdown", (e) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".bx-search, #tb-search")) closeSearch();
    });
    if (sBtn)
      on(sBtn, "click", () => {
        const open = !top?.classList.contains("is-search");
        top?.classList.toggle("is-search", open);
        sBtn.setAttribute("aria-expanded", String(open));
        if (open) input?.focus();
      });
    if (input) {
      let jumped = false;
      on(input, "input", () => {
        const lib = document.getElementById("games");
        if (!jumped && input.value && lib && lib.getBoundingClientRect().top > window.innerHeight * 0.6) {
          jumped = true;
          lib.scrollIntoView({ behavior: still ? "auto" : "smooth" });
        }
        if (!input.value) jumped = false;
      });
      on(input, "keydown", (e) => {
        if ((e as KeyboardEvent).key !== "Enter") return;
        const first = cards().find((c) => !c.hidden && !c.classList.contains("is-cat-out") && !c.classList.contains("is-filtered"));
        const direct = first?.querySelector<HTMLAnchorElement>(".game-cta.is-direct");
        if (direct) direct.click();
        else if (first) {
          first.open = true;
          // фокус — на первую карту раскрытой карточки, чтобы Tab шёл по списку, а не по шапке
          const link = first.querySelector<HTMLElement>(".maps-list a") ?? first.querySelector<HTMLElement>("summary");
          link?.focus({ preventScroll: true });
          closeSearch();
          first.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
        }
      });
    }

    // ---------- карточки: одна раскрытая, закрытие кликом мимо ----------
    if (container) {
      cards().forEach((c) =>
        on(c, "toggle", () => {
          if (c.open) cards().forEach((o) => o !== c && o.open && (o.open = false));
        }),
      );
      on(document, "pointerdown", (e) => {
        const t = e.target as Element;
        cards().forEach((c) => c.open && !c.contains(t) && (c.open = false));
      });
    }
    const openHash = () => {
      const m = location.hash.match(/^#game-([a-z0-9]+)$/);
      const card = m && document.getElementById("game-" + m[1]);
      if (card instanceof HTMLDetailsElement) {
        card.classList.remove("is-cat-out");
        // игра скрыта фильтром библиотеки («Скоро», «С базой данных»…) — переключаем на «Все», иначе карточку не видно
        if (card.classList.contains("is-filtered"))
          document.querySelector<HTMLButtonElement>(".lib-sort button[data-filter='all']")?.click();
        // карточку скрыл поиск — сбрасываем запрос, чтобы список и счётчик не расходились с видимым
        if (card.hidden && input?.value) {
          input.value = "";
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        card.hidden = false;
        card.open = true;
        card.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
      }
    };
    openHash();
    on(window, "hashchange", openHash);
    // тот же якорь повторно (слайдер → Escape → снова слайдер): hashchange не срабатывает — раскрываем сами
    on(document, "click", (e) => {
      const a = (e.target as Element).closest?.<HTMLAnchorElement>('a[href*="#game-"]');
      if (a && a.hash === location.hash && a.pathname === location.pathname) openHash();
    });

    // ---------- «О проекте» ----------
    const dlg = document.getElementById("about") as HTMLDialogElement | null;
    if (dlg) {
      on(document, "click", (e) => {
        const t = e.target as Element;
        if (t.closest("[data-about-open]")) dlg.showModal?.();
        else if (t.closest("[data-about-close]")) dlg.close();
        else if (t === dlg) {
          // target === dialog и на внутренних полях окна — закрываем только по клику за его рамкой (по фону)
          const m = e as MouseEvent, r = dlg.getBoundingClientRect();
          if (m.clientX < r.left || m.clientX > r.right || m.clientY < r.top || m.clientY > r.bottom) dlg.close();
        }
      });
    }

    // ---------- установка приложения (как в js/topbar.js) ----------
    const w = window as W;
    if (!w.bpPwa) {
      on(window, "beforeinstallprompt", (e) => {
        e.preventDefault();
        w.bpInstallEvt = e;
      });
    }
    if (!w.bpPwaLoader) {
      w.bpPwaLoader = true;
      const load = () => {
        const s = document.createElement("script");
        s.src = "/js/pwa.js?v=6";
        s.defer = true;
        document.body.appendChild(s);
      };
      if (document.readyState === "complete") setTimeout(load, 300);
      else window.addEventListener("load", () => setTimeout(load, 300), { once: true });
    }

    return () => off.forEach((f) => f());
  }, []);
  return null;
}
