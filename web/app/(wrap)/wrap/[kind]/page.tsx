import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { Rail } from "@/components/shell/rail";
import { TWITCH_LIVE_SCRIPT, Topbar } from "@/components/shell/topbar";
import { dbHref, findGames, mapGames } from "@/lib/maps";

const DB = path.join(process.cwd(), "..", "data", "db");

/** db — раздел «База данных», db-<игра> — база игры (ссылка «База» ведёт в неё), c-<игра>-map — страницы категорий карты. */
export const dynamicParams = false;
export const generateStaticParams = () => [
  { kind: "db" },
  ...(existsSync(DB) ? readdirSync(DB, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => ({ kind: "db-" + d.name })) : []),
  ...mapGames().map((f) => ({ kind: "c-" + f })),
];

const SCRIPTS = ["/js/firebase-lazy.js?v=1", "/js/auth-lite.js?v=4", "/js/shell-lite.js?v=2", "/js/pwa.js?v=4", TWITCH_LIVE_SCRIPT];

export default async function WrapPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const games = findGames();
  return (
    <div className="bx-app bx-app-page">
      <Topbar games={games} />
      {kind.startsWith("c-") ? (
        <Rail active="games" dbHref={dbHref(kind.slice(2))} />
      ) : (
        <Rail active="db" dbHref={kind === "db" ? "/db/" : `/db/${kind.slice(3)}/`} />
      )}
      <div className="bx-body">
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
