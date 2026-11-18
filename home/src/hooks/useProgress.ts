import { useEffect, useState } from "react";
import { cloudFound, type FbUser } from "../lib/firebase";
import { GAMES } from "../lib/games";
import { readArray } from "../lib/storage";
import type { Game, GameProgress, MapEntry, MapProgress } from "../lib/types";

// Прогресс по играм: все метки карты (компактный индекс <игра>/data/progress-index.json, без него — полный JSON меток)
// плюс свои метки из localStorage; найденные — из localStorage и, после входа, из Firestore.

const indexCache = new Map<string, Promise<Record<string, unknown> | null>>();
const idsCache = new Map<string, Promise<string[]>>();

function progressIndex(folder: string) {
  let p = indexCache.get(folder);
  if (!p) {
    p = fetch(`/${folder}/data/progress-index.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, unknown>>) : null))
      .catch(() => null);
    indexCache.set(folder, p);
  }
  return p;
}

const idsOf = (list: unknown): string[] =>
  Array.isArray(list)
    ? list.map((m) => (m && typeof m === "object" ? (m as { id?: unknown }).id : m)).filter((id) => id != null).map(String)
    : [];

function markerIds(game: Game, map: MapEntry): Promise<string[]> {
  const key = `${game.folder}/${map.id}`;
  let p = idsCache.get(key);
  if (!p) {
    p = progressIndex(game.folder).then(async (index) => {
      const fromIndex = index?.[map.markersFile];
      if (Array.isArray(fromIndex)) return fromIndex.map(String);
      const res = await fetch(`/${game.folder}/data/${map.markersFile}`);
      if (!res.ok) throw new Error(`Не удалось загрузить ${map.markersFile}`);
      const data = (await res.json()) as unknown;
      return idsOf(Array.isArray(data) ? data : (data as { markers?: unknown }).markers);
    });
    idsCache.set(key, p);
  }
  return p;
}

async function gameProgress(game: Game, user: FbUser | null): Promise<GameProgress> {
  let failed = 0;
  const maps: Record<string, MapProgress> = {};
  await Promise.all(
    game.maps.map(async (map) => {
      const ids = new Set<string>();
      try {
        (await markerIds(game, map)).forEach((id) => ids.add(id));
      } catch {
        failed++;
      }
      idsOf(readArray(game.storage.user + map.id)).forEach((id) => ids.add(id));
      const found = new Set(readArray(game.storage.found + map.id).map(String));
      if (user) (await cloudFound(user.uid, game.storage.cloud + map.id)).forEach((id) => found.add(id));
      let n = 0;
      ids.forEach((id) => found.has(id) && n++);
      maps[map.id] = { found: n, total: ids.size };
    }),
  );
  const list = Object.values(maps);
  return {
    status: failed === game.maps.length ? "error" : "ready",
    found: list.reduce((s, m) => s + m.found, 0),
    total: list.reduce((s, m) => s + m.total, 0),
    maps,
  };
}

const LOADING: GameProgress = { status: "loading", found: 0, total: 0, maps: {} };

export function useProgress(user: FbUser | null): Record<string, GameProgress> {
  const [progress, setProgress] = useState<Record<string, GameProgress>>(() =>
    Object.fromEntries(GAMES.map((g) => [g.key, LOADING])),
  );

  useEffect(() => {
    let alive = true;
    GAMES.forEach((game) => {
      gameProgress(game, user)
        .catch((): GameProgress => ({ ...LOADING, status: "error" }))
        .then((p) => alive && setProgress((prev) => ({ ...prev, [game.key]: p })));
    });
    return () => {
      alive = false;
    };
  }, [user]);

  return progress;
}
