import { Database, Gamepad, Home, User } from "@/components/shell/icons";

export type RailItem = "top" | "games" | "db" | "profile";

/**
 * Боковая навигация сайта (на телефоне — нижняя панель). Одна для всех страниц.
 * На главной (home) «Главная» ведёт к началу страницы; «Игры» везде ведут на библиотеку /games/.
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
      <a className={cls("games")} href="/games/" {...cur("games")}>
        <Gamepad />
        <span>Игры</span>
      </a>
      <a className={cls("db")} href={dbHref} {...cur("db")}>
        <Database />
        <span>База</span>
      </a>
      <a className={cls("profile")} href="/cabinet/" {...cur("profile")}>
        <User />
        <span>Профиль</span>
      </a>
    </nav>
  );
}
