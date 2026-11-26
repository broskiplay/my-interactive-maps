import type { ReactNode } from "react";
import { HomeHeadAssets } from "@/components/home/head-assets";
import { homeGames, SITE } from "@/lib/data";
import "../../globals.css";

// Библиотека всех игр — /games/. Стили и данные те же, что у каталога главной (web/data/home-games.json).
const URL = SITE + "games/";
const TITLE = "Все игры — интерактивные карты на русском — BroskiPlay";
const DESCRIPTION =
  "Библиотека интерактивных карт BroskiPlay: найдите карту своей игры, отфильтруйте по жанру и статусу, отмечайте найденное и синхронизируйте прогресс через Google.";

/** JSON-LD: страница-коллекция, хлебные крошки и список игр — из тех же карточек, что на странице. */
function jsonLd() {
  const items = homeGames().games.map((g, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: g.title,
    url: SITE + (g.links[0]?.href.match(/^\.\/([a-z0-9-]+)\//)?.[1] ?? "") + "/",
  }));
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": URL,
        url: URL,
        name: "Игры",
        description: DESCRIPTION,
        inLanguage: "ru",
        isPartOf: { "@id": SITE + "#website" },
        mainEntity: { "@type": "ItemList", name: "Библиотека игр", itemListElement: items },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE },
          { "@type": "ListItem", position: 2, name: "Игры", item: URL },
        ],
      },
    ],
  };
  return JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
}

export default function GamesLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" data-theme="dark" data-root="/">
      <head>
        <meta name="tdm-reservation" content="1" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="BroskiPlay" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={SITE + "og-preview.jpg"} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={SITE + "og-preview.jpg"} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
        <HomeHeadAssets />
      </head>
      <body>{children}</body>
    </html>
  );
}
