import { useId, useState } from "react";
import { humanDate, mapsWord, markers, num, percent } from "../lib/format";
import { mapHref } from "../lib/games";
import type { FreshKind, Game, GameProgress, LibraryView } from "../lib/types";
import { btn, card, cx, focusRing } from "../lib/ui";
import { Icon, Spinner } from "./Icon";
import { ProgressBar } from "./ProgressBar";

interface GameCardProps {
  game: Game;
  progress: GameProgress;
  fresh: FreshKind | null;
  favorite: boolean;
  onToggleFavorite: (key: string) => void;
  view: LibraryView;
}

const BADGE: Record<FreshKind, string> = { new: "Новое", upd: "Обновлено", soon: "Скоро" };

export function GameCard({ game, progress, fresh, favorite, onToggleFavorite, view }: GameCardProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const single = game.maps.length === 1;
  const list = view === "list";
  const badge = fresh === "soon" && game.fresh?.release ? `Скоро · ${humanDate(game.fresh.release)}` : fresh ? BADGE[fresh] : null;

  return (
    <article
      aria-labelledby={`${listId}-title`}
      className={cx(card, "group/card flex overflow-hidden transition-colors hover:border-subtle", list ? "flex-col sm:flex-row" : "flex-col")}
    >
      <div className={cx("relative shrink-0 overflow-hidden bg-raised", list ? "aspect-[1080/451] sm:aspect-auto sm:w-64" : "aspect-[1080/451]")}>
        <GameBanner game={game} />
        {badge && (
          <span
            className={cx(
              "absolute left-3 top-3 rounded-md px-2 py-0.5 text-xs font-semibold",
              fresh === "soon" ? "bg-black/70 text-white" : "bg-accent text-accent-ink",
            )}
          >
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => onToggleFavorite(game.key)}
          aria-pressed={favorite}
          aria-label={favorite ? `Убрать из избранного: ${game.title}` : `В избранное: ${game.title}`}
          title={favorite ? "Убрать из избранного" : "В избранное"}
          className={cx(
            "absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-black/55 text-white transition-colors hover:bg-black/75",
            focusRing,
          )}
        >
          <Icon name="star" className={cx("h-[18px] w-[18px]", favorite && "fill-current text-[#ffd34d]")} />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="min-w-0">
          <h3 id={`${listId}-title`} className="truncate text-base font-semibold text-ink">
            {game.title}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {mapsWord(game.maps.length)}
            {progress.status === "ready" && progress.total > 0 && ` · ${markers(progress.total)}`}
          </p>
        </div>

        <ProgressLine progress={progress} title={game.title} />

        <div className="mt-auto flex flex-wrap gap-2">
          {single ? (
            <a href={mapHref(game, game.maps[0])} className={cx(btn.primaryCompact, "flex-1")}>
              Открыть карту
              <Icon name="arrowRight" className="h-4 w-4" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={`${listId}-maps`}
              className={cx(btn.primaryCompact, "flex-1")}
            >
              Выбрать карту · {game.maps.length}
              <Icon name="chevronDown" className={cx("h-4 w-4 transition-transform", open && "rotate-180")} />
            </button>
          )}
          {game.db && (
            <a href={game.db} className={list ? btn.secondaryCompact : btn.iconOutline} title={`База данных ${game.title}`} aria-label={list ? undefined : `База данных ${game.title}`}>
              <Icon name="database" className="h-4 w-4" />
              {list && <span>База данных</span>}
            </a>
          )}
        </div>

        {!single && open && (
          <ul id={`${listId}-maps`} className="-mx-2 grid gap-0.5" aria-label={`Карты ${game.title}`}>
            {game.maps.map((map) => {
              const p = progress.maps[map.id];
              return (
                <li key={map.id}>
                  <a
                    href={mapHref(game, map)}
                    className={cx("flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-raised", focusRing)}
                  >
                    <Icon name="pin" className="h-4 w-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate">{map.name}</span>
                    {p && p.total > 0 && (
                      <span className="shrink-0 tabular-nums text-xs text-muted">
                        {p.found > 0 ? `${percent(p.found, p.total)}%` : num(p.total)}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}

function GameBanner({ game }: { game: Game }) {
  const { banner } = game;
  if (banner.kind === "logo") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-raised p-6">
        <img src={banner.src} srcSet={banner.srcset} sizes="240px" alt={banner.alt} loading="lazy" decoding="async" className="max-h-16 w-auto max-w-[70%] object-contain" />
      </div>
    );
  }
  return (
    <img
      src={banner.src}
      srcSet={banner.srcset}
      sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
      alt={banner.alt}
      width={1080}
      height={451}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function ProgressLine({ progress, title }: { progress: GameProgress; title: string }) {
  if (progress.status === "loading") {
    return (
      <p className="flex h-8 items-center gap-2 text-xs text-subtle" aria-live="polite">
        <Spinner className="h-3.5 w-3.5" /> Считаем прогресс…
      </p>
    );
  }
  if (progress.status === "error") {
    return (
      <p className="flex h-8 items-center gap-2 text-xs text-danger">
        <Icon name="alert" className="h-4 w-4" /> Не удалось загрузить метки
      </p>
    );
  }
  const pct = percent(progress.found, progress.total);
  return (
    <div className="h-8 space-y-2">
      <p className="flex justify-between text-xs text-muted">
        <span>{progress.found > 0 ? `Найдено ${num(progress.found)}` : "Ещё ничего не отмечено"}</span>
        {progress.found > 0 && <span className="font-semibold tabular-nums text-ink">{pct}%</span>}
      </p>
      <ProgressBar value={pct} label={`Прогресс: ${title}`} size="sm" />
    </div>
  );
}
