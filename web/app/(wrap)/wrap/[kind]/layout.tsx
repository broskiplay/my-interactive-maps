import type { ReactNode } from "react";
import "../../../globals.css";

export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

/**
 * Шаблон каркаса для страниц, которые генерирует Python (база данных /db/ — scripts/db_pages.py,
 * страницы категорий /<игра>-map/c/ — scripts/category_pages.py).
 * Next собирает его один раз на игру (out/wrap/<вид>/), scripts/assemble.mjs вставляет в него <head> и тело
 * каждой сгенерированной страницы. Гидратации нет (скрипты Next убираются): поиск и вход — js/shell-lite.js и js/auth-lite.js.
 */
export default function WrapLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/css/shell.css?v=dark12" />
        <link rel="stylesheet" href="/css/ui-system.css?v=dark6" />
      </head>
      <body>{children}</body>
    </html>
  );
}
