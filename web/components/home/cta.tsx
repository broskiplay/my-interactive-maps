import { ArrowRight, Play } from "@/components/shell/icons";

/**
 * Нижний блок: как сохраняется прогресс и полезное действие вместо повторной отправки в каталог.
 * Кнопку «Продолжить» показывает js/script.js (renderRecent), если на этом устройстве открывали карту.
 */
export function FinalCta() {
  return (
    <section className="bx-cta" aria-labelledby="cta-title" data-reveal="">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="bx-cta-img"
        src="./img/cta-start.webp"
        srcSet="./img/cta-start-960.webp 960w, ./img/cta-start.webp 1672w"
        sizes="(max-width: 860px) 100vw, 720px"
        width={1672}
        height={941}
        loading="lazy"
        decoding="async"
        alt=""
      />
      <div className="bx-cta-copy">
        <h2 id="cta-title">
          Прогресс <span>сохраняется сам</span>
        </h2>
        <p>
          Отмеченные метки хранятся в этом браузере. Войдите через Google — и продолжайте с любого устройства. Сводка и
          достижения — в личном кабинете.
        </p>
        <div className="bx-cta-btns">
          <a className="bx-btn bx-btn-primary" id="cta-continue" href="#recent-maps" hidden>
            <Play />
            <span id="cta-continue-text">Продолжить</span>
          </a>
          <a className="bx-btn bx-btn-ghost" id="cta-cabinet" href="./cabinet/">
            Личный кабинет
            <ArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}
