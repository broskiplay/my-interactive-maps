import { useEffect, useState } from "react";
import { GAMES } from "../lib/games";

const TIPS = [
  "Отмечайте найденные метки прямо в карточке — прогресс сохранится.",
  "Правый клик по метке на карте быстро отмечает её найденной.",
  "Используйте фильтры категорий, чтобы оставить на карте только нужное.",
  "Войдите через Google, чтобы синхронизировать личный прогресс между устройствами.",
];

const FOLDERS = new Set(GAMES.map((g) => g.folder));

/** Экран загрузки при переходе на карту: карта грузится заметное время, а без него кажется, что клик не сработал. */
export function MapLoadingOverlay() {
  const [state, setState] = useState<{ title: string; tip: string } | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest("a");
      if (!a || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !FOLDERS.has(url.pathname.split("/")[1])) return;
      const game = GAMES.find((g) => g.folder === url.pathname.split("/")[1]);
      setState({ title: game ? game.title : "Подготовка карты", tip: TIPS[Math.floor(Math.random() * TIPS.length)] });
    };
    const onShow = (e: PageTransitionEvent) => e.persisted && setState(null);
    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className={state ? "fixed inset-0 z-50 flex items-center justify-center bg-canvas/95 p-6 backdrop-blur-sm" : "sr-only"}>
      {state && (
        <div className="w-full max-w-sm text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Загрузка карты</p>
          <p className="mt-3 font-display text-2xl font-semibold">{state.title}</p>
          <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-raised" aria-hidden="true">
            <span className="block h-full w-1/3 animate-[bp-load_1.1s_ease-in-out_infinite] rounded-full bg-accent" />
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted">{state.tip}</p>
        </div>
      )}
    </div>
  );
}
