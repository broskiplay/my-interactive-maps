import type { UpdateEntry } from "../lib/types";
import { humanDate } from "../lib/format";
import { btn, container, cx, focusRing } from "../lib/ui";
import { Icon } from "./Icon";
import { MapPreview } from "./MapPreview";

interface HeroProps {
  latest: UpdateEntry | null;
}

export function Hero({ latest }: HeroProps) {
  return (
    <section aria-labelledby="hero-title" className={cx(container, "grid grid-cols-[minmax(0,1fr)] items-center gap-10 pb-12 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:pb-16 lg:pt-20")}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Карты · находки · приключения</p>
        <h1 id="hero-title" className="mt-4 font-display text-[1.75rem] font-semibold xs:text-[2rem] leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
          Интерактивные карты от <span className="text-accent">BroskiPlay</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Все метки на русском, как в игре. Отмечайте найденное — прогресс сохранится и откроется на любом устройстве.
        </p>
        <div className="mt-8 flex flex-col gap-3 xs:flex-row">
          <a href="#library" className={btn.primary}>
            Выбрать игру
            <Icon name="arrowDown" className="h-[18px] w-[18px]" />
          </a>
          <a href="/db/" className={btn.secondary}>
            <Icon name="database" className="h-[18px] w-[18px]" />
            База данных
          </a>
        </div>
        {latest && (
          <a
            href="#updates"
            className={cx(
              "group mt-8 flex max-w-xl items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-sm transition-colors hover:border-subtle hover:bg-surface",
              focusRing,
            )}
          >
            <span className="shrink-0 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">Обновление</span>
            <time dateTime={latest.date} className="shrink-0 text-muted">
              {humanDate(latest.date)}
            </time>
            <span className="min-w-0 truncate">{latest.items[0]}</span>
            <Icon name="arrowRight" className="ml-auto h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
      <MapPreview />
    </section>
  );
}
