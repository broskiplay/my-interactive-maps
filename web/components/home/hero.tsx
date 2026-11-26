import { homeGames } from "@/lib/data";
import { openHref } from "@/lib/home";
import { ChevronRight } from "@/components/shell/icons";
import { HeroArt, type ArtSlide } from "./hero-art";

/** С какой игры начинается превью (новинка); остальные — в порядке каталога. */
const FIRST = "gta6";

/**
 * Первый экран — широкий компактный баннер: заголовок «Интерактивные / карты на русском», пояснение, «Выбрать игру» / «База данных»
 * и справа превью-иллюстрация игры (hero-art.tsx). На телефоне превью стоит между пояснением и кнопками (css/home-v3.css).
 */
export function Hero() {
  const games = homeGames().games;
  const slides: ArtSlide[] = [...games]
    .sort((a, b) => Number(b.key === FIRST) - Number(a.key === FIRST))
    .map((g) => ({
      key: g.key,
      title: g.title,
      dir: g.img.src.split("/")[1],
      href: openHref(g),
    }));
  return (
    <section className="bx-hero" id="top" aria-labelledby="hero-title">
      <h1 id="hero-title" className="bx-hero-title">
        <span>Интерактивные</span> <span>карты <em>на&nbsp;русском</em></span>
      </h1>
      <p className="bx-hero-lead">Находите секреты. Отмечайте найденное.</p>
      <div className="bx-hero-cta">
        <a className="bx-btn bx-btn-primary" href="#games">
          Выбрать игру
          <ChevronRight />
        </a>
        <a className="bx-btn bx-btn-ghost" href="./db/">
          База данных
        </a>
      </div>
      <HeroArt slides={slides} />
    </section>
  );
}
