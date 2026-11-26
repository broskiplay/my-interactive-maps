import { FinalCta } from "@/components/home/cta";
import { GameLibrary } from "@/components/home/game-library";
import { Hero } from "@/components/home/hero";
import { HomeClient } from "@/components/home/home-client";
import { LoadingScreen } from "@/components/home/loading-screen";
import { Recent } from "@/components/home/recent";
import { SiteFooter } from "@/components/shell/footer";
import { LegacyScripts } from "@/components/shell/legacy-scripts";
import { Rail } from "@/components/shell/rail";
import { TWITCH_LIVE_SCRIPT, Topbar } from "@/components/shell/topbar";

const SCRIPTS = ["/js/progress-core.js?v=4", "/js/script.js?v=55", "/js/home-lib.js?v=14", "/js/bp-slot.js?v=12", TWITCH_LIVE_SCRIPT];

export default function HomePage() {
  return (
    <div className="bx-app">
      <a className="bx-skip" href="#main">К содержимому</a>
      <Topbar />
      <Rail active="top" home />
      <div className="bx-body">
        <main className="bx-main" id="main" tabIndex={-1}>
          {/* компактный первый экран, под ним «Продолжить» (у нового посетителя блок скрыт) и каталог */}
          <Hero />
          <Recent />
          <GameLibrary />
          <div className="bp-slot" data-bp-slot="home" />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>
      <LoadingScreen />
      <HomeClient />
      <LegacyScripts srcs={SCRIPTS} />
    </div>
  );
}
