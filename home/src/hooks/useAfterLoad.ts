import { useEffect } from "react";

/** Запуск после полной загрузки и в свободную минуту браузера — второстепенные запросы не мешают первому экрану. */
export function afterPageLoad(fn: () => void): () => void {
  let cancelled = false;
  const run = () => {
    const go = () => !cancelled && fn();
    if ("requestIdleCallback" in window) window.requestIdleCallback(go, { timeout: 3000 });
    else setTimeout(go, 200);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
  };
}

export function useAfterLoad(fn: () => void): void {
  useEffect(() => afterPageLoad(fn), []);
}
