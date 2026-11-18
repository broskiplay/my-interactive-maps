import { GAMES, mapHref } from "../lib/games";
import { markers, num, percent } from "../lib/format";
import type { GameProgress } from "../lib/types";
import { card, container, cx, focusRing, sectionTitle } from "../lib/ui";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";

export interface RecentVisit {
  game: string;
  map: string;
}

interface RecentMapsProps {
  visits: readonly RecentVisit[];
  progress: Record<string, GameProgress>;
  onDismiss: (visit: RecentVisit) => void;
}

/** «Продолжить»: три последние открытые карты (bp_recent пишет js/map-extras.js на страницах карт). */
export function RecentMaps({ visits, progress, onDismiss }: RecentMapsProps) {
  const items = visits
    .map((v) => {
      const game = GAMES.find((g) => g.key === v.game);
      const map = game?.maps.find((m) => m.id === String(v.map));
      return game && map ? { visit: v, game, map } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .slice(0, 3);
  if (!items.length) return null;

  return (
    <section aria-labelledby="recent-heading" className={cx(container, "pb-10")}>
      <h2 id="recent-heading" className={cx(sectionTitle, "mb-4")}>
        Продолжить
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ visit, game, map }) => {
          const p = progress[game.key]?.maps[map.id];
          const pct = p ? percent(p.found, p.total) : 0;
          const sameName = game.maps.length === 1 || map.name === game.title;
          const label = sameName ? game.title : `${game.title}: ${map.name}`;
          return (
            <li key={`${visit.game}/${visit.map}`} className={cx(card, "relative transition-colors hover:border-subtle")}>
              <a href={mapHref(game, map)} className={cx("block rounded-2xl p-4 pr-12", focusRing)}>
                <span className="block truncate text-xs font-medium text-muted">{game.title}</span>
                <span className="mt-0.5 block truncate font-semibold">{sameName ? "Карта" : map.name}</span>
                <ProgressBar value={pct} label={`Прогресс: ${label}`} size="sm" className="mt-3" />
                <span className="mt-2 block text-xs tabular-nums text-muted">
                  {p && p.total ? (p.found ? `${pct}% · ${num(p.found)} из ${num(p.total)}` : markers(p.total)) : "Открыть карту"}
                </span>
              </a>
              <button
                type="button"
                onClick={() => onDismiss(visit)}
                aria-label={`Убрать «${label}» из «Продолжить»`}
                title="Убрать из «Продолжить»"
                className={cx("absolute right-2 top-2", "inline-flex h-9 w-9 items-center justify-center rounded-lg text-subtle hover:bg-raised hover:text-ink", focusRing)}
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
