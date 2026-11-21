import { MapBody } from "@/components/map/map-shell";
import { gameMaps, mapGames } from "@/lib/maps";

// Страницы локаций /<игра>/<карта>/ (раньше — копии от scripts/map_pages.py)
export const dynamicParams = false;
export const generateStaticParams = () => mapGames().flatMap((game) => gameMaps(game).map(([map]) => ({ game, map })));

export default async function LocPage({ params }: { params: Promise<{ game: string; map: string }> }) {
  const { game, map } = await params;
  return <MapBody folder={game} mapId={map} />;
}
