import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { Rail } from "@/components/shell/rail";
import { TWITCH_LIVE_SCRIPT, Topbar } from "@/components/shell/topbar";
import { dbHref, findGames, mapGames } from "@/lib/maps";

const DB = path.join(process.cwd(), "..", "data", "db");

/** db — раздел «База данных», db-<игра> — база игры; «База» в обоих случаях ведёт к выбору игр. c-<игра>-map — категории карты. */
export const dynamicParams = false;
export const generateStaticParams = () => [
  { kind: "db" },
  ...(existsSync(DB) ? readdirSync(DB, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => ({ kind: "db-" + d.name })) : []),
  ...mapGames().map((f) => ({ kind: "c-" + f })),
];

const SCRIPTS = ["/js/firebase-lazy.js?v=1", "/js/auth-lite.js?v=6", "/js/shell-lite.js?v=2", "/js/pwa.js?v=6", TWITCH_LIVE_SCRIPT];

export default async function WrapPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const games = findGames();
  return (
    <div className="bx-app bx-app-page">
      <a className="bx-skip" href="#bx-content">К содержимому</a>
      <Topbar games={games} />
      {kind.startsWith("c-") ? (
        <Rail active="games" dbHref={dbHref(kind.slice(2))} />
      ) : (
        <Rail active="db" />
      )}
      <div className="bx-body" id="bx-content" tabIndex={-1}>
        {/* сюда scripts/assemble.mjs вставляет тело страницы */}
        <div id="bx-raw" />
      </div>
      <script type="application/json" id="bx-games" dangerouslySetInnerHTML={{ __html: JSON.stringify(games).replace(/</g, "\\u003c") }} />
      {SCRIPTS.map((s) => (
        <script key={s} src={s} defer />
      ))}
    </div>
  );
}
