import { useMemo, useState, type RefObject } from "react";
import { plural } from "../lib/format";
import { freshKind, GAMES, SUGGEST_URL } from "../lib/games";
import type { FreshKind, Game, GameProgress, LibraryMode, LibraryView } from "../lib/types";
import { btn, container, cx, extLink, focusRing, sectionTitle } from "../lib/ui";
import { GameCard } from "./GameCard";
import { Icon } from "./Icon";
import type { RecentVisit } from "./RecentMaps";

interface GameLibraryProps {
  progress: Record<string, GameProgress>;
  favorites: readonly string[];
  onToggleFavorite: (key: string) => void;
  recent: readonly RecentVisit[];
  mode: LibraryMode;
  onModeChange: (mode: LibraryMode) => void;
  view: LibraryView;
  onViewChange: (view: LibraryView) => void;
  /** Время для бейджей «Новое / Скоро»: null при пререндере, чтобы HTML не устаревал */
  now: number | null;
  searchRef: RefObject<HTMLInputElement>;
}

const MODES: readonly { id: LibraryMode; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "new", label: "Новые" },
  { id: "mine", label: "С прогрессом" },
  { id: "recent", label: "Недавние" },
  { id: "az", label: "А–Я" },
];

const normalize = (s: string) => s.toLowerCase().replace(/ё/g, "е").trim();
const pct = (p?: GameProgress) => (p && p.total ? p.found / p.total : 0);
const freshDate = (g: Game) => g.fresh?.updated || g.fresh?.added || "";

export function GameLibrary(props: GameLibraryProps) {
  const { progress, favorites, onToggleFavorite, recent, mode, onModeChange, view, onViewChange, now, searchRef } = props;
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = normalize(query);
    const rank = (g: Game) => recent.findIndex((r) => r.game === g.key);
    const index = (g: Game) => GAMES.indexOf(g);
    let list = GAMES.filter((g) => !q || normalize([g.title, g.banner.alt, ...g.maps.map((m) => m.name)].join(" ")).includes(q));
    if (mode === "mine") list = list.filter((g) => (progress[g.key]?.found ?? 0) > 0);
    if (mode === "recent") list = list.filter((g) => rank(g) >= 0);
    const byMode: Record<LibraryMode, (a: Game, b: Game) => number> = {
      all: (a, b) => index(a) - index(b),
      new: (a, b) => freshDate(b).localeCompare(freshDate(a)) || index(a) - index(b),
      mine: (a, b) => pct(progress[b.key]) - pct(progress[a.key]) || index(a) - index(b),
      recent: (a, b) => rank(a) - rank(b),
      az: (a, b) => a.title.localeCompare(b.title, "ru"),
    };
    const fav = (g: Game) => (favorites.includes(g.key) ? 1 : 0);
    return [...list].sort((a, b) => fav(b) - fav(a) || byMode[mode](a, b));
  }, [query, mode, progress, favorites, recent]);

  const reset = () => {
    setQuery("");
    onModeChange("all");
    searchRef.current?.focus();
  };

  const emptyText = query
    ? `По запросу «${query}» ничего не нашлось.`
    : mode === "mine"
      ? "Пока нет игр с отмеченными метками: найденное на картах появится здесь."
      : "Вы ещё не открывали карты на этом устройстве.";

  return (
    <section id="library" aria-labelledby="games-heading" className={cx(container, "scroll-mt-20 pb-16")}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="games-heading" className={sectionTitle}>
            Библиотека игр
          </h2>
          <p className="mt-1 text-sm text-muted">
            {GAMES.length} {plural(GAMES.length, "игра", "игры", "игр")} · новые карты появляются каждую неделю
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <label htmlFor="game-search" className="sr-only">
            Найти игру или карту
          </label>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-subtle" />
          <input
            ref={searchRef}
            id="game-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Найти игру или карту"
            autoComplete="off"
            className={cx(
              "h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-10 text-sm text-ink placeholder:text-subtle",
              "transition-colors hover:border-subtle [&::-webkit-search-cancel-button]:hidden",
              focusRing,
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="Очистить поиск"
              className={cx("absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-subtle hover:text-ink", focusRing)}
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-2 lg:ml-auto">
          <div role="group" aria-label="Сортировка и фильтры" className="-mx-4 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0 lg:flex-none">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onModeChange(m.id)}
                aria-pressed={mode === m.id}
                className={cx(
                  "h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium transition-colors",
                  mode === m.id ? "border-ink bg-ink text-canvas" : "border-line text-muted hover:border-subtle hover:text-ink",
                  focusRing,
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Вид библиотеки" className="hidden shrink-0 rounded-xl border border-line p-0.5 sm:flex">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onViewChange(v)}
                aria-pressed={view === v}
                aria-label={v === "grid" ? "Сетка" : "Список"}
                title={v === "grid" ? "Сетка" : "Список"}
                className={cx(
                  "inline-flex h-9 w-9 items-center justify-center rounded-[10px] transition-colors",
                  view === v ? "bg-raised text-ink" : "text-subtle hover:text-ink",
                  focusRing,
                )}
              >
                <Icon name={v} className="h-[18px] w-[18px]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {query || mode !== "all" ? `Показано игр: ${shown.length}` : ""}
      </p>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <Icon name="search" className="h-6 w-6 text-subtle" />
          <p className="mt-3 max-w-sm text-sm text-muted">{emptyText}</p>
          <button type="button" onClick={reset} className={cx(btn.small, "mt-5")}>
            Показать все игры
          </button>
        </div>
      ) : (
        <ul className={cx("grid gap-4", view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
          {shown.map((game) => (
            <li key={game.key} className="flex">
              <div className="flex w-full [&>article]:w-full">
                <GameCard
                  game={game}
                  progress={progress[game.key]}
                  fresh={now === null ? null : (freshKind(game, now) as FreshKind | null)}
                  favorite={favorites.includes(game.key)}
                  onToggleFavorite={onToggleFavorite}
                  view={view}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <SuggestBanner />
    </section>
  );
}

function SuggestBanner() {
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-dashed border-line p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">Нет нужной игры?</p>
        <p className="mt-1 text-sm text-muted">Предложите её — самые популярные просьбы берём в работу первыми.</p>
      </div>
      <a href={SUGGEST_URL} {...extLink} className={cx(btn.secondary, "shrink-0")}>
        <Icon name="plus" className="h-[18px] w-[18px]" />
        Предложить игру
      </a>
    </div>
  );
}
