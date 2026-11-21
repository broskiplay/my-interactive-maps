import { Bell, Database, Gamepad, Home } from "@/components/shell/icons";

export type RailItem = "top" | "games" | "db" | "updates";

/**
 * Боковая навигация сайта (на телефоне — нижняя панель). Одна для всех страниц.
 * На главной (home) пункты ведут к блокам страницы, активный подсвечивает home-client.tsx по прокрутке,
 * Избранное — звёздочка на карточке игры (js/home-lib.js), такие игры идут первыми. На остальных страницах — обычные ссылки, активный пункт задаёт страница.
 */
export function Rail({ active, home = false, dbHref = "/db/" }: { active: RailItem | null; home?: boolean; dbHref?: string }) {
  const cls = (id: RailItem) => "bx-rail-item" + (active === id ? " is-active" : "");
  const cur = (id: RailItem) => (active === id ? ({ "aria-current": "page" } as const) : {});
  return (
    <nav className="bx-rail" aria-label="Разделы сайта">
      <a className={cls("top")} href={home ? "#top" : "/"} data-nav={home ? "top" : undefined} {...(home ? {} : cur("top"))}>
        <Home />
        <span>Главная</span>
      </a>
      <a className={cls("games")} href={home ? "#games" : "/#games"} data-nav={home ? "games" : undefined} {...(home ? {} : cur("games"))}>
        <Gamepad />
        <span>Игры</span>
      </a>
      <a className={cls("db")} href={dbHref} {...cur("db")}>
        <Database />
        <span>База</span>
      </a>
      <a className={cls("updates")} href="/updates/" {...cur("updates")}>
        <Bell />
        <span>Новое</span>
      </a>
    </nav>
  );
}
