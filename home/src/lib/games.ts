import data from "../../../data/games.json";
import type { FreshKind, Game, MapEntry } from "./types";

export const GAMES: readonly Game[] = (data as { games: Game[] }).games;

export const SUGGEST_URL = "https://forms.gle/S1dA8ivejnYkdB1HA";

/** Ссылка на карту: у игры с одной картой — /<игра>/, иначе /<игра>/<карта>/ */
export function mapHref(game: Game, map: MapEntry): string {
  return game.maps.length === 1 ? `/${game.folder}/` : `/${game.folder}/${map.id}/`;
}

const WEEK = 7 * 864e5;
const dayStart = (iso: string, tz = "") => new Date(`${iso}T00:00:00${tz}`).getTime();

/** Бейдж на карточке: «Новое» — неделю после добавления, «Обновлено» — неделю после крупного обновления,
 *  «Скоро» — пока игра не вышла (до 00:00 по Москве в день релиза). */
export function freshKind(game: Game, now: number): FreshKind | null {
  const f = game.fresh;
  if (!f) return null;
  if (f.release && now < dayStart(f.release, "+03:00")) return "soon";
  const recent = (d?: string) => Boolean(d) && now - dayStart(d as string) < WEEK;
  if (recent(f.added)) return "new";
  if (recent(f.updated)) return "upd";
  return null;
}
