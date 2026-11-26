import type { ReactNode } from "react";
import { MAP_VIEWPORT, MapDocument } from "@/components/map/map-shell";

export const viewport = MAP_VIEWPORT;

export default async function MapLayout({ children, params }: { children: ReactNode; params: Promise<{ game: string }> }) {
  const { game } = await params;
  return (
    <MapDocument folder={game} mapId={null}>
      {children}
    </MapDocument>
  );
}
