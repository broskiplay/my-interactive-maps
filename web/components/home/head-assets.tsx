/** Иконки, манифест, шрифты и стили главной — общие для / и /games/ (одна система стилей, не отдельная тема). */
export function HomeHeadAssets() {
  return (
    <>
      <meta name="theme-color" content="#0d111b" />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" type="image/png" sizes="120x120" href="/favicon-120.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.webmanifest" />
      {/* Шрифты и стили главной: токены spatial.css, каркас css/shell.css, блоки главной css/home-neo.css */}
      <link rel="stylesheet" href="/fonts/fonts.css?v=4" />
      <link rel="preload" href="/fonts/manrope-cyrillic-var.woff2" as="font" type="font/woff2" crossOrigin="" />
      <link rel="preload" href="/fonts/unbounded-cyrillic-var.woff2" as="font" type="font/woff2" crossOrigin="" />
      <link rel="stylesheet" href="/css/spatial.css?v=dark2" />
      <link rel="stylesheet" href="/css/shell.css?v=dark12" />
      <link rel="stylesheet" href="/css/home-neo.css?v=bg21" />
      {/* Метрика DOM не трогает — грузится как раньше; остальные скрипты главной подключает <LegacyScripts> */}
      <script src="/js/metrika.js?v=1" defer />
      <link rel="stylesheet" href="/css/ui-system.css?v=dark8" />
      {/* каталог и первый экран 2026-11-21 — последним, поверх ui-system.css: радиусы 8/16 px, фильтры, карточки */}
      <link rel="stylesheet" href="/css/home-v3.css?v=27" />
    </>
  );
}
