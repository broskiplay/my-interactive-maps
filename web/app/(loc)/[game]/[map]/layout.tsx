import type { ReactNode } from "react";
import { MAP_VIEWPORT, MapDocument } from "@/components/map/map-shell";

export const viewport = MAP_VIEWPORT;

export default async function LocLayout({ children, params }: { children: ReactNode; params: Promise<{ game: string; map: string }> }) {
  const { game, map } = await params;
  return (
    <MapDocument folder={game} mapId={map}>
      {children}
    </MapDocument>
  );
}
