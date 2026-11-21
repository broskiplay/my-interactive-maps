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

/** Ссылка «открыть»: одна карта — сразу на неё, несколько — к карточке игры (раскрывается со списком карт). */
export const openHref = (g: GameCard) => g.direct?.href ?? `#game-${g.key}`;
