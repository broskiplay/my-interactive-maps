import type { ReactNode } from "react";
import { LegacyScripts, type LegacyScript } from "@/components/shell/legacy-scripts";
import { props, RawHead } from "@/components/shell/raw-head";
import { Rail } from "@/components/shell/rail";
import { TWITCH_LIVE_SCRIPT, Topbar } from "@/components/shell/topbar";
import { findGames } from "@/lib/maps";
import { rawPage, type PageKey } from "@/lib/pages";
import "../../app/globals.css";

export const PAGE_VIEWPORT = { width: "device-width", initialScale: 1 };

// шапке нужен вход (auth-lite) — раньше его подключал блок старого меню
const SHELL_SCRIPTS = ["/js/firebase-lazy.js?v=1", "/js/auth-lite.js?v=4", TWITCH_LIVE_SCRIPT];
const file = (s: LegacyScript) => (typeof s === "string" ? s.replace(/[?#].*$/, "") : null);

/** Документ отдельной страницы: <html> и <head> исходной страницы, data-shell — раскладка внутри каркаса. */
export function PageDocument({ page, children }: { page: PageKey; children: ReactNode }) {
  const p = rawPage(page);
  return (
    <html {...props(p.htmlAttrs)} data-shell="" suppressHydrationWarning>
      <head>
        <RawHead tags={p.head} />
        <link rel="stylesheet" href="/css/shell.css?v=dark10" />
        <link rel="stylesheet" href="/css/ui-system.css?v=dark6" />
      </head>
      <body {...props(p.bodyAttrs)}>{children}</body>
    </html>
  );
}

/** Отдельная страница в каркасе сайта: общая шапка и навигация, ниже — прежняя разметка страницы. */
export function PageBody({ page }: { page: PageKey }) {
  const p = rawPage(page);
  const own = new Set(p.scripts.map(file));
  const scripts = [...SHELL_SCRIPTS.filter((s) => !own.has(file(s))), ...p.scripts];
  return (
    <div className="bx-app bx-app-page">
      <Topbar games={findGames()} />
      <Rail active={p.active} />
      <div className="bx-body">
        <div className="bx-raw" dangerouslySetInnerHTML={{ __html: p.body }} />
      </div>
      <LegacyScripts srcs={scripts} />
    </div>
  );
}

/** Файлы маршрута одной страницы: app/(page)/<папка>/layout.tsx и page.tsx. */
export const pageLayout = (page: PageKey) =>
  function Layout({ children }: { children: ReactNode }) {
    return <PageDocument page={page}>{children}</PageDocument>;
  };
export const pageBody = (page: PageKey) =>
  function Page() {
    return <PageBody page={page} />;
  };
