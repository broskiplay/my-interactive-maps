import { useState } from "react";
import { percent } from "../lib/format";
import { cx } from "../lib/ui";
import { ProgressBar } from "./ProgressBar";

// Окно-превью карты: 4 тайла Скайрима и 5 меток, которые можно отметить найденными — как на настоящей карте.

interface Category {
  name: string;
  plural: string;
  dot: string;
}

const CATEGORIES: readonly Category[] = [
  { name: "Слово силы", plural: "Слова силы", dot: "bg-[#e2b660]" },
  { name: "Сундук", plural: "Сундуки", dot: "bg-[#54dcff]" },
  { name: "Пещера", plural: "Пещеры", dot: "bg-[#c7ff3f]" },
];

interface Pin {
  cat: number;
  pos: string;
}

const PINS: readonly Pin[] = [
  { cat: 0, pos: "left-[30%] top-[30%]" },
  { cat: 0, pos: "left-[66%] top-[20%]" },
  { cat: 1, pos: "left-[48%] top-[56%]" },
  { cat: 1, pos: "left-[80%] top-[62%]" },
  { cat: 2, pos: "left-[20%] top-[72%]" },
];

export function MapPreview() {
  const [found, setFound] = useState<readonly boolean[]>(() => PINS.map((_, i) => i === 0));
  const count = found.filter(Boolean).length;
  const toggle = (i: number) => setFound((prev) => prev.map((v, j) => (j === i ? !v : v)));

  return (
    <figure
      role="group"
      aria-label="Как выглядит карта: нажмите на метку, чтобы отметить её найденной"
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface lg:max-w-none"
    >
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden="true" />
        <span className="ml-2 text-xs font-medium text-muted">Скайрим · карта</span>
      </div>

      <div className="relative aspect-square bg-[#1b1f24] sm:aspect-[4/3]">
        <div className="absolute inset-0 grid grid-cols-2 overflow-hidden" aria-hidden="true">
          {[0, 1, 2, 3].map((n) => (
            <img
              key={n}
              src={`/icons/hero/sk-${n}.webp`}
              width={256}
              height={256}
              alt=""
              decoding="async"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ))}
        </div>
        {PINS.map((pin, i) => {
          const cat = CATEGORIES[pin.cat];
          return (
            <button
              key={pin.pos}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={found[i]}
              aria-label={found[i] ? `${cat.name} — найдено` : cat.name}
              className={cx(
                "absolute -ml-4 -mt-4 flex h-8 w-8 items-center justify-center rounded-full outline-none",
                "focus-visible:ring-2 focus-visible:ring-white",
                pin.pos,
              )}
            >
              <span
                className={cx(
                  "block h-4 w-4 rounded-full border-2 border-white transition-transform hover:scale-125",
                  cat.dot,
                  found[i] && "opacity-40",
                )}
              />
            </button>
          );
        })}
        <p className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white">Нажмите на метку</p>
      </div>

      <figcaption className="space-y-3 px-4 py-4">
        <p className="text-sm" aria-live="polite">
          Найдено <b className="font-semibold">{count}</b> из <b className="font-semibold">{PINS.length}</b>
        </p>
        <ProgressBar value={percent(count, PINS.length)} label="Прогресс на карте-примере" />
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Категории">
          {CATEGORIES.map((cat, c) => {
            const total = PINS.filter((p) => p.cat === c).length;
            const done = PINS.filter((p, i) => p.cat === c && found[i]).length;
            return (
              <li key={cat.name} className="flex items-center gap-1.5">
                <span className={cx("h-2 w-2 rounded-full", cat.dot)} aria-hidden="true" />
                {cat.plural} {done}/{total}
              </li>
            );
          })}
        </ul>
      </figcaption>
    </figure>
  );
}
