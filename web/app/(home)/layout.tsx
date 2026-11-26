import type { ReactNode } from "react";
import { homeGames, SITE } from "@/lib/data";
import { HomeHeadAssets } from "@/components/home/head-assets";
import "../globals.css";

const TITLE = "Интерактивные карты игр на русском — BroskiPlay";
const DESCRIPTION =
  "Интерактивные карты игровых миров на русском: Stellar Blade, Skyrim, Ведьмак 3, Cyberpunk 2077, Oblivion Remastered, Palworld, Tainted Grail, Gothic 1 Remake и Dimraeth. Метки на русском и синхронизация прогресса между устройствами через Google.";
const OG_ALT =
  "Интерактивные карты BroskiPlay на русском: Stellar Blade, Tainted Grail, Gothic 1 Remake, Dimraeth, Palworld, Oblivion Remastered, Skyrim, Ведьмак 3, Cyberpunk 2077, Hogwarts Legacy, Phantom Blade Zero, Red Dead Redemption 2, Silver Palace";
const SOCIALS = [
  "https://www.twitch.tv/broskiplay",
  "https://www.youtube.com/@broskiplayt",
  "https://vk.ru/broski_club",
  "https://t.me/broskiplaytw",
  "https://discord.gg/RmdBrh2NqC",
  "https://lolka.gg/G53N4TVyp",
];

/** JSON-LD: сайт и список игр — из тех же карточек, что на странице. */
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
        "@type": "WebSite",
        "@id": SITE + "#website",
        url: SITE,
        name: "Интерактивные карты BroskiPlay",
        inLanguage: "ru",
        author: { "@type": "Person", name: "BroskiPlay", sameAs: SOCIALS },
      },
      { "@type": "ItemList", name: "Библиотека игр", itemListElement: items },
    ],
  };
  return JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // тема у сайта одна — тёмная (светлую убрали 2026-11-19)
    <html lang="ru" data-theme="dark">
      <head>
        <meta name="tdm-reservation" content="1" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={SITE} />
        <meta name="google-site-verification" content="w5dX8oCFLp1BaLMmC01kg5YhtbkIqxx42YPRmtU72vM" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="BroskiPlay" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:title" content={TITLE} />
        <meta
          property="og:description"
          content="Метки на русском для популярных игр. Отмечайте найденное и синхронизируйте прогресс между устройствами через Google."
        />
        <meta property="og:image" content={SITE + "og-preview.jpg"} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={OG_ALT} />
        <meta property="og:url" content={SITE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta
          name="twitter:description"
          content="Метки на русском для популярных игр. Прогресс синхронизируется между устройствами через Google."
        />
        <meta name="twitter:image" content={SITE + "og-preview.jpg"} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
        <HomeHeadAssets />
      </head>
      <body>{children}</body>
    </html>
  );
}
