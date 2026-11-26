import type { ReactNode } from "react";
import { LegacyScripts } from "@/components/shell/legacy-scripts";
import { props, RawHead } from "@/components/shell/raw-head";
import { Rail } from "@/components/shell/rail";
import { TWITCH_LIVE_SCRIPT, Topbar } from "@/components/shell/topbar";
import { dbHref, findGames, mapPage } from "@/lib/maps";
import { parseSidebar } from "@/lib/sidebar";
import { sidebarHtml } from "./map-sidebar";
import "../../app/globals.css";

/** Офлайн-кэш карт: раньше грузился вместе с js/map-topbar.js, теперь — первым из скриптов движка. */
const PWA = "/js/pwa.js?v=6";
/** РСЯ: на картах — Top Ad (js/bp-slot.js, BLOCKS.map_top). */
const ADS = "/js/bp-slot.js?v=12";

export const MAP_VIEWPORT = { width: "device-width", initialScale: 1, maximumScale: 1 };

/** Документ страницы карты: <html data-game> и <head> исходной страницы игры. */
export function MapDocument({ folder, mapId, children }: { folder: string; mapId: string | null; children: ReactNode }) {
  const p = mapPage(folder, mapId);
  // bp-sb (компактная панель, css/map-ux.css) — с первой отрисовки, а не после js/map-ux.js: иначе панель перестраивается на глазах (CLS)
  const cls = [p.htmlAttrs.class, "bp-sb"].filter((c) => typeof c === "string" && c).join(" ");
  return (
    <html {...props({ ...p.htmlAttrs, class: cls })}>
      <head>
        <RawHead tags={p.head.filter((tag) => !(typeof tag.attrs.href === "string" && tag.attrs.href.includes("/css/ui-system.css")))} />
        <link rel="stylesheet" href="/css/shell.css?v=dark12" />
        <link rel="stylesheet" href="/css/ui-system.css?v=dark6" />
        {/* скрипты движка подключаются только после гидратации (LegacyScripts) — качаем их заранее, параллельно с Next */}
        {[PWA, ...p.scripts].map((src) => (
          <link key={src} rel="preload" as="script" href={src} fetchPriority="low" />
        ))}
      </head>
      <body {...props(p.bodyAttrs)}>{children}</body>
    </html>
  );
}

/**
 * Страница карты в каркасе сайта: шапка и навигация как на главной, ниже — разметка карты (сайдбар, #map) без изменений.
 * Движок карты (js/app.js игры и общие js/*.js) подключается после гидратации, в прежнем порядке.
 */
export function MapBody({ folder, mapId }: { folder: string; mapId: string | null }) {
  const p = mapPage(folder, mapId);
  // боковая панель — общий шаблон (map-sidebar.ts); игра даёт логотип, свои элементы и данные
  const sb = parseSidebar(p.body, folder.replace(/-map$/, ""));
  const db = dbHref(folder);
  const body = sb ? sb.before + sidebarHtml(sb, folder, db === "/db/" ? null : db) + sb.after : p.body;
  return (
    <div className="bx-app bx-app-map">
      <Topbar games={findGames()} />
      <Rail active="games" dbHref={dbHref(folder)} />
      <div className="bx-map">
        {/* сюда js/map-ux.js кладёт кнопки «Слои» и «Только карта»; по #mtb окно метки знает, сколько места занято сверху */}
        <div className="bx-map-tr" id="mtb" />
        <div className="bx-map-raw" dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      {/* js/map-topbar.js выкинут (DROP_SCRIPTS в lib/maps.ts) — вместе с ним грузился js/pwa.js: офлайн-кэш (кнопка «Установить» — только в кабинете) */}
      <LegacyScripts srcs={[PWA, ...p.scripts, ADS, TWITCH_LIVE_SCRIPT]} />
    </div>
  );
}
