import { GameLibrary } from "@/components/home/game-library";
import { HomeClient } from "@/components/home/home-client";
import { LoadingScreen } from "@/components/home/loading-screen";
import { SiteFooter } from "@/components/shell/footer";
import { LegacyScripts } from "@/components/shell/legacy-scripts";
import { Rail } from "@/components/shell/rail";
import { TWITCH_LIVE_SCRIPT, Topbar } from "@/components/shell/topbar";

// Те же скрипты, что у каталога главной: прогресс, поиск, «Сетка / Список» (script.js), избранное и фильтры (home-lib.js).
const SCRIPTS = ["/js/progress-core.js?v=4", "/js/script.js?v=55", "/js/home-lib.js?v=14", "/js/bp-slot.js?v=12", TWITCH_LIVE_SCRIPT];

export default function GamesPage() {
  return (
    <div className="bx-app">
      <a className="bx-skip" href="#main">К содержимому</a>
      <Topbar />
      <Rail active="games" />
      <div className="bx-body">
        <main className="bx-main" id="main" tabIndex={-1}>
          <GameLibrary full />
          {/* РСЯ (js/bp-slot.js): первое место JS переносит в середину сетки игр, второе — в конце страницы */}
          <div className="bp-slot" data-bp-slot="games" />
          <div className="bp-slot" data-bp-slot="games_end" />
        </main>
        <SiteFooter />
      </div>
      <LoadingScreen />
      <HomeClient />
      <LegacyScripts srcs={SCRIPTS} />
    </div>
  );
}
