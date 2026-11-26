// Данные нового оформления главной: жанры карточек, слайды первого экрана, короткие подписи карточек.
// Всё считается из web/data/home-games.json — тех же карточек, что видят поисковики.
import { homeGames, type GameCard } from "./data";

export type CatId = "rpg" | "action" | "adventure" | "survival" | "other" | "fav";

/** Жанры игр сайта. Игра может быть в нескольких; без жанра — «Другие». */
const GENRES: Record<string, CatId[]> = {
  stellar: ["action", "adventure"],
  tainted: ["rpg"],
  gothic: ["rpg"],
  palworld: ["survival", "adventure"],
  oblivion: ["rpg"],
  skyrim: ["rpg"],
  witcher3: ["rpg", "adventure"],
  cyberpunk2077: ["rpg", "action"],
  hogwarts: ["rpg", "adventure"],
  phantomblade: ["action"],
  dragonsword: ["action"],
  ms2: ["action", "rpg"],
  cs2: ["action"],
  rdr2: ["action", "adventure"],
  gta6: ["action", "adventure"],
  // dimraeth, silverpalace — жанр не уточняли, идут в «Другие»
};
export const genresOf = (key: string): CatId[] => GENRES[key] ?? ["other"];

/** «1 139 меток в прогрессе» → «1 139 меток» */
export const marksText = (g: GameCard) => g.count.text.replace(/\s+в прогрессе$/, "");

const MAP_WORD = (n: number) => {
  const a = n % 10,
    b = n % 100;
  return a === 1 && b !== 11 ? "карта" : a >= 2 && a <= 4 && (b < 12 || b > 14) ? "карты" : "карт";
};
export const mapsText = (n: number) => `${n} ${MAP_WORD(n)}`;

/**
 * Прямая ссылка карточки: из данных или, если карта одна (рядом может быть ссылка на базу, как у Gothic), — на эту карту.
 * Тогда кнопка — «Открыть карту», без лишнего шага со списком.
 */
export const directOf = (g: GameCard): Record<string, string> | null => {
  if (g.direct) return g.direct;
  const maps = g.links.filter((l) => l.icon !== "db");
  return g.maps === 1 && maps.length === 1 ? { href: maps[0].href, "aria-label": `Открыть карту: ${g.title}` } : null;
};

/** Ссылка «открыть»: одна карта — сразу на неё, несколько — к карточке игры (раскрывается со списком карт). */
export const openHref = (g: GameCard) => directOf(g)?.href ?? `#game-${g.key}`;

/**
 * Игры с десятками карт: первые ссылки (lead) — отдельно, остальные — сворачиваемыми группами.
 * ID — те же, что в адресах карт (./<папка>/<id>/), прогресс и ссылки не меняются.
 * Карты, не попавшие ни в одну группу, уходят в последнюю (rest).
 */
export type MapGroups = { lead: string[]; groups: { title: string; ids: string[] }[]; rest: string };
export const MAP_GROUPS: Record<string, MapGroups> = {
  dragonsword: {
    lead: ["orbis"],
    groups: [
      { title: "Сюжет и рейды", ids: ["steelheart-fortress-defense-raid", "steelheart-fortress-defense-scenario", "steelheart-fortress-armory", "chase-toward-the-end-raid", "chase-toward-the-end-scenario", "corrupted-cave", "cracked-crevice", "ancient-ruins", "where-the-giant-sleeps", "altar-of-the-dragon"] },
      { title: "Боссы и арены", ids: ["ghagaroach-of-blazeflame", "ghagaroach-of-thunderbolt", "ghagaroach-of-venom", "ghagaroach-of-frostbite", "drosophia-of-breaker", "drosophia-of-bloodburst", "mantius-of-amplitude", "mantius-of-crushing", "mantius-of-gale", "gallore-the-collapse", "furcas-the-starving-ghost-of-corrosion", "ghoul-greed", "earthlander-of-the-ravenous-earth", "vanak-the-bloody-hook", "barduk-the-corrupted", "fang-bandits-arena"] },
      { title: "Башни и испытания", ids: ["tower-of-amplitude", "tower-of-crushing", "tower-of-gale", "mercenary-crew-promotion-exam-novice", "mercenary-crew-promotion-exam-intermediate", "mercenary-crew-promotion-exam-veteran"] },
      { title: "Пещеры и руины", ids: [] },
    ],
    rest: "Пещеры и руины",
  },
};

/** id карты из ссылки ./<папка>/<id>/ (у главной карты игры id нет → ""). */
export const mapIdOf = (href: string) => href.replace(/\/$/, "").split("/").slice(2).join("/");
