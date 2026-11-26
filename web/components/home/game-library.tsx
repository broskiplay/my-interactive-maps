import { homeGames, type GameCard, type MapLink, type Suggest } from "@/lib/data";
import { MAP_GROUPS, directOf, genresOf, mapIdOf, mapsText, marksText } from "@/lib/home";
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
      width={1080}
      height={451}
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

/** «Эйдос-7 (Eidos 7)» → русское название основным, английское — мелкой второй строкой; «(Рейд)», «(ветеран)» не трогаем. */
function MapName({ name }: { name: string }) {
  const m = name.match(/^(.+?)\s*\(([A-Za-z][^()]*)\)$/);
  if (!m) return <span className="map-name-text"><span className="map-name-main">{name}</span></span>;
  return (
    <span className="map-name-text">
      <span className="map-name-main">{m[1]}</span>
      <small className="map-name-en" lang="en">{m[2]}</small>
    </span>
  );
}

function MapRow({ link }: { link: MapLink }) {
  return (
    <a href={link.href} className={link.className} title={link.title ?? undefined}>
      <span className="map-name">
        {link.icon === "db" ? <BookMarker /> : <MapMarker />}
        <MapName name={link.name} />
      </span>
      <span className="status" aria-label="Открыть">
        {link.progress && <span className="map-progress">{link.progress}</span>}
        <ArrowRight />
      </span>
    </a>
  );
}

/** Список карт; у игр из MAP_GROUPS — главные карты сверху, остальные в сворачиваемых группах. */
function MapList({ g }: { g: GameCard }) {
  const cfg = MAP_GROUPS[g.key];
  if (!cfg) return <>{g.links.map((l) => <MapRow key={l.href} link={l} />)}</>;
  const placed = new Set([...cfg.lead, ...cfg.groups.flatMap((x) => x.ids)]);
  const lead = g.links.filter((l) => cfg.lead.includes(mapIdOf(l.href)) || l.icon === "db");
  const groups = cfg.groups.map((x) => ({
    title: x.title,
    links: g.links.filter((l) => l.icon !== "db" && (x.title === cfg.rest ? !placed.has(mapIdOf(l.href)) : x.ids.includes(mapIdOf(l.href)))),
  }));
  return (
    <>
      {lead.map((l) => <MapRow key={l.href} link={l} />)}
      {groups.filter((x) => x.links.length).map((x) => (
        <details key={x.title} className="maps-group">
          <summary>
            <span>{x.title}</span>
            <span className="maps-group-count">{x.links.length}</span>
            <ChevronDown />
          </summary>
          <div className="maps-group-list">
            {x.links.map((l) => <MapRow key={l.href} link={l} />)}
          </div>
        </details>
      ))}
    </>
  );
}

/**
 * Карточка игры. Структура (details.game-dropdown > summary, .game-title, .game-cta, .maps-list, id <key>-progress-*)
 * нужна js/script.js (прогресс, поиск, переходы) и js/home-lib.js (избранное, сортировка) — не менять.
 */
function GameDropdown({ g, first }: { g: GameCard; first?: boolean }) {
  const genres = genresOf(g.key).join(" ");
  const direct = directOf(g);
  return (
    <details className={`game-dropdown theme-${g.key}`} id={`game-${g.key}`} data-alias={SEARCH_ALIAS[g.key]} data-maps={g.maps} data-genres={genres}>
      <summary>
        <div className={g.bannerClass}>
          {g.badge && <Badge className={g.badge.className} text={g.badge.text} />}
          <BannerImage img={g.img} first={first} />
        </div>
        <div className="game-info">
          <div className="game-title-block">
            {g.titleShort ? (
              <span className="game-title has-short" aria-label={g.title}>
                <span className="t-full">{g.title}</span>
                <span className="t-short" aria-hidden="true">{g.titleShort}</span>
              </span>
            ) : (
              <span className="game-title">{g.title}</span>
            )}
            <span className="game-meta">
              {mapsText(g.maps)}
              <i aria-hidden="true">,</i>
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
              <strong id={`${g.key}-progress-value`}></strong>
            </div>
          </div>
          <span className="game-indicators">
            {direct ? (
              <a className="game-cta is-direct" href={direct.href} aria-label={direct["aria-label"]}>
                <span>{direct["aria-label"]?.startsWith("Выбрать") ? "Выбрать карту" : "Открыть карту"}</span>
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
      <div className={MAP_GROUPS[g.key] ? "maps-list has-groups" : "maps-list"}>
        <MapList g={g} />
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

/** «./<папка>/…» → «/<папка>/…»: на /games/ относительные адреса карточек вели бы в /games/<папка>/. */
const absUrl = (u: string) => u.replace(/(^|,\s*)\.\//g, "$1/");
function absCard(g: GameCard): GameCard {
  return {
    ...g,
    img: { ...g.img, src: absUrl(g.img.src ?? ""), srcset: absUrl(g.img.srcset ?? "") },
    direct: g.direct ? { ...g.direct, href: absUrl(g.direct.href ?? "") } : null,
    links: g.links.map((l) => ({ ...l, href: absUrl(l.href) })),
  };
}

/**
 * Библиотека игр. Карточки уже в HTML (для поисковиков) — js/script.js их не перерисовывает, только оживляет.
 * full — отдельная страница /games/: заголовок h1 с описанием, абсолютные адреса, в панели js/home-lib.js добавляет «Жанр» и «Статус».
 */
export function GameLibrary({ full = false }: { full?: boolean }) {
  const data = homeGames();
  const games = full ? data.games.map(absCard) : data.games;
  const suggest = data.suggest;
  return (
    <section className={full ? "bx-section game-library is-full" : "bx-section game-library"} id="games" aria-labelledby="games-heading">
      {full ? (
        <div className="bx-head games-page-head">
          <h1 id="games-heading">Игры</h1>
          <p className="games-page-lead">Найдите интерактивную карту для своей любимой игры</p>
        </div>
      ) : (
        <div className="bx-head">
          <h2 id="games-heading">Игры</h2>
        </div>
      )}
      {/* панель каталога: js/home-lib.js ставит фильтры, «Ещё» и «Сортировку», js/script.js — переключатель «Сетка / Список» */}
      <div className="game-search lib-bar"></div>
      <p className="bx-empty" id="bx-empty" hidden></p>
      <div className="games-container" id="games-container" data-lib={full ? "full" : undefined}>
        {games.map((g, k) => (
          <GameDropdown key={g.key} g={g} first={k === 0} />
        ))}
      </div>
      {suggest && <SuggestBanner s={suggest} />}
    </section>
  );
}
