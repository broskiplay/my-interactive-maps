import { homeGames, type GameCard, type MapLink, type Suggest } from "@/lib/data";
import { genresOf, mapsText, marksText } from "@/lib/home";
import { SEARCH_ALIAS } from "@/lib/maps";
import { ArrowRight, BookMarker, ChevronDown, MapMarker } from "@/components/shell/icons";

/** first — первая карточка: её обложка бывает LCP на телефоне, грузим сразу и с высоким приоритетом. */
function BannerImage({ img, first }: { img: Record<string, string>; first?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="game-banner-art"
      src={img.src}
      srcSet={img.srcset}
      sizes="(max-width: 559px) calc(100vw - 32px), (max-width: 1099px) 50vw, 400px"
      loading={first ? "eager" : "lazy"}
      fetchPriority={first ? "high" : undefined}
      decoding="async"
      alt={img.alt}
    />
  );
}

/** Плашка «Новое / Обновлено / Скоро · дата»: дата — отдельно, как в js/script.js (в «Списке» на телефоне — вторая строка без «·»). */
function Badge({ className, text }: { className: string; text: string }) {
  const [head, date] = text.split(" · ");
  return (
    <span className={className}>
      {head}
      {date && (
        <>
          <i className="game-new-sep"> · </i>
          <span>{date}</span>
        </>
      )}
    </span>
  );
}

function MapRow({ link }: { link: MapLink }) {
  return (
    <a href={link.href} className={link.className} title={link.title ?? undefined}>
      <span className="map-name">
        {link.icon === "db" ? <BookMarker /> : <MapMarker />}
        {link.name}
      </span>
      <span className="status" aria-label="Открыть">
        {link.progress && <span className="map-progress">{link.progress}</span>}
        <ArrowRight />
      </span>
    </a>
  );
}

/**
 * Карточка игры. Структура (details.game-dropdown > summary, .game-title, .game-cta, .maps-list, id <key>-progress-*)
 * нужна js/script.js (прогресс, поиск, переходы) и js/home-lib.js (избранное, сортировка) — не менять.
 */
function GameDropdown({ g, first }: { g: GameCard; first?: boolean }) {
  const genres = genresOf(g.key).join(" ");
  return (
    <details className={`game-dropdown theme-${g.key}`} id={`game-${g.key}`} data-alias={SEARCH_ALIAS[g.key]} data-maps={g.maps} data-genres={genres}>
      <summary>
        <div className={g.bannerClass}>
          {g.badge && <Badge className={g.badge.className} text={g.badge.text} />}
          <BannerImage img={g.img} first={first} />
        </div>
        <div className="game-info">
          <div className="game-title-block">
            <span className="game-title">{g.title}</span>
            <span className="game-meta">
              {mapsText(g.maps)}
              <i aria-hidden="true">·</i>
              <span className="game-progress-count" id={`${g.key}-progress-count`} title={g.count.title ?? undefined}>
                {marksText(g)}
              </span>
            </span>
            <div className="game-progress is-empty">
              <div
                className="game-progress-track"
                id={`${g.key}-progress-bar`}
                role="progressbar"
                aria-label={g.progressLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={0}
              >
                <span id={`${g.key}-progress-fill`} style={{ width: "0%" }}></span>
              </div>
              <strong id={`${g.key}-progress-value`}>0%</strong>
            </div>
          </div>
          <span className="game-indicators">
            {g.direct ? (
              <a className="game-cta is-direct" href={g.direct.href} aria-label={g.direct["aria-label"]}>
                <span>Открыть карту</span>
                <ArrowRight />
              </a>
            ) : (
              <span className="game-cta is-pick" title={mapsText(g.maps)}>
                <span>Выбрать карту</span>
                <ChevronDown />
              </span>
            )}
          </span>
        </div>
      </summary>
      <div className="maps-list">
        {g.links.map((l) => (
          <MapRow key={l.href} link={l} />
        ))}
      </div>
    </details>
  );
}

function SuggestBanner({ s }: { s: Suggest }) {
  return (
    <a className="game-suggest-banner" href={s.href} target="_blank" rel="noopener noreferrer">
      <span className="game-suggest-plus" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
      </span>
      <span className="game-suggest-copy">
        <span className="game-suggest-title">Не нашли свою игру?</span>
        <span className="game-suggest-sub">{s.sub}</span>
      </span>
      <span className="game-suggest-cta">
        Предложить игру
        <ArrowRight />
      </span>
    </a>
  );
}

/** Библиотека игр. Карточки уже в HTML (для поисковиков) — js/script.js их не перерисовывает, только оживляет. */
export function GameLibrary() {
  const { games, suggest } = homeGames();
  return (
    <section className="bx-section game-library" id="games" aria-labelledby="games-heading">
      <div className="bx-head">
        <h2 id="games-heading">Игры</h2>
      </div>
      {/* панель каталога: js/home-lib.js ставит фильтры, «Ещё» и «Сортировку», js/script.js — переключатель «Сетка / Список» */}
      <div className="game-search lib-bar"></div>
      <p className="bx-empty" id="bx-empty" hidden></p>
      <div className="games-container" id="games-container">
        {games.map((g, k) => (
          <GameDropdown key={g.key} g={g} first={k === 0} />
        ))}
      </div>
      {suggest && <SuggestBanner s={suggest} />}
    </section>
  );
}
