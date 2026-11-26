"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/shell/icons";

export type ArtSlide = { key: string; title: string; dir: string; href: string };

const STEP_MS = 7000;

/**
 * Изображение первого экрана: иллюстрации игр (<папка игры>/hero-art{,-960,-640}.webp, WebP q95), сменяются сами
 * и стрелками ‹ › снизу справа. На компьютере — правая часть баннера до краёв, слева растворяется в фоне;
 * на телефоне — широкое превью (css/home-v3.css). Картинка — ссылка на карту; сверху справа — название и «Открыть карту».
 * Картинки грузятся по мере показа (текущая и соседние). Пауза при наведении/фокусе и в скрытой вкладке;
 * при prefers-reduced-motion меняется без плавного перехода.
 */
export function HeroArt({ slides }: { slides: ArtSlide[] }) {
  const n = slides.length;
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0, 1, n - 1]));
  const hold = useRef(false);

  const go = (d: number) => {
    setI((cur) => {
      const next = (cur + d + n) % n;
      setSeen((s) => new Set(s).add(next).add((next + 1) % n).add((next - 1 + n) % n));
      return next;
    });
  };

  // эффект зависит от i: после ручного переключения отсчёт начинается заново
  useEffect(() => {
    if (n < 2) return;
    const t = window.setInterval(() => {
      if (hold.current || document.hidden) return;
      const next = (i + 1) % n;
      setSeen((s) => new Set(s).add(next).add((next + 1) % n));
      setI(next);
    }, STEP_MS);
    return () => window.clearInterval(t);
  }, [i, n]);

  const s = slides[i];
  const pause = (v: boolean) => () => (hold.current = v);

  return (
    <div
      className="bx-art"
      onMouseEnter={pause(true)}
      onMouseLeave={pause(false)}
      onFocus={pause(true)}
      onBlur={pause(false)}
    >
      <a className="bx-art-link" href={s.href} aria-label={`Открыть карту: ${s.title}`}>
        <span className="bx-art-media" aria-hidden="true">
          {slides.map((x, k) => {
            const src = `./${x.dir}/hero-art`;
            return seen.has(k) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={x.key}
                className={`bx-art-img${k === i ? " is-on" : ""}`}
                src={`${src}.webp`}
                srcSet={`${src}-640.webp 640w, ${src}-960.webp 960w, ${src}.webp 1680w`}
                sizes="(max-width: 860px) calc(100vw - 32px), 900px"
                width={1680}
                height={946}
                fetchPriority={k === 0 ? "high" : undefined}
                decoding="async"
                alt=""
              />
            ) : null;
          })}
        </span>
        <span className="bx-art-top">
          <b key={s.key}>{s.title}</b>
          <span className="bx-art-go">
            Открыть карту
            <ChevronRight />
          </span>
        </span>
      </a>
      {n > 1 && (
        <span className="bx-art-nav">
          <button type="button" className="bx-art-arrow" onClick={() => go(-1)} aria-label="Предыдущая игра">
            <ChevronLeft />
          </button>
          <button type="button" className="bx-art-arrow" onClick={() => go(1)} aria-label="Следующая игра">
            <ChevronRight />
          </button>
        </span>
      )}
    </div>
  );
}
