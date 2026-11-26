import { MapBody } from "@/components/map/map-shell";
import { mapGames } from "@/lib/maps";

export const dynamicParams = false;
export const generateStaticParams = () => mapGames().map((game) => ({ game }));

export default async function MapPage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  return <MapBody folder={game} mapId={null} />;
}
