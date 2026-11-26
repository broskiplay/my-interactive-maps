"use client";

import { useEffect } from "react";

/** Скрипт страницы: адрес файла или встроенный код (<script>…</script> из тела исходной страницы). */
export type LegacyScript = string | { code: string };

/**
 * Скрипты страницы на чистом JS (вход, прогресс, движок карты…). Они меняют DOM, поэтому подключаются только после
 * гидратации React — иначе React увидел бы «чужую» разметку в шапке и перерисовал страницу (вместе с картой).
 * Порядок выполнения сохраняется (async = false), как у defer-скриптов в старом HTML; встроенный код ждёт,
 * пока выполнятся файлы перед ним.
 */
export function LegacyScripts({ srcs }: { srcs: LegacyScript[] }) {
  useEffect(() => {
    const w = window as typeof window & { __bpLegacy?: boolean };
    if (w.__bpLegacy) return; // защита от двойного запуска (StrictMode в dev)
    w.__bpLegacy = true;
    let last: Promise<unknown> = Promise.resolve();
    let chain: Promise<unknown> = Promise.resolve();
    for (const item of srcs) {
      if (typeof item === "string") {
        const s = document.createElement("script");
        s.src = item;
        s.async = false;
        const done = new Promise((ok) => {
          s.onload = s.onerror = ok;
        });
        // файл после встроенного кода тоже ждёт его — иначе выполнился бы раньше
        chain = chain.then(() => {
          document.body.appendChild(s);
        });
        last = chain.then(() => done);
      } else {
        const code = item.code;
        chain = last.then(() => {
          const s = document.createElement("script");
          s.textContent = code;
          document.body.appendChild(s);
        });
        last = chain;
      }
    }
  }, [srcs]);
  return null;
}
