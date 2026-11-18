export interface MapEntry {
  id: string;
  name: string;
  markersFile: string;
}

export interface GameBanner {
  /** art — широкая обложка во весь баннер, logo — логотип на нейтральном фоне */
  kind: "art" | "logo";
  src: string;
  srcset?: string;
  alt: string;
}

export interface GameFresh {
  added?: string;
  updated?: string;
  /** Игра ещё не вышла: карта откроется в этот день */
  release?: string;
}

export interface Game {
  key: string;
  title: string;
  folder: string;
  banner: GameBanner;
  /** Префиксы ключей прогресса: localStorage (свои метки, найденные) и документ в Firestore */
  storage: { user: string; found: string; cloud: string };
  maps: MapEntry[];
  db?: string;
  fresh?: GameFresh;
}

export interface UpdateEntry {
  date: string;
  items: string[];
}

/** Данные, которые пререндер кладёт в страницу (#home-data) и читает гидратация */
export interface HomeData {
  updates: {
    token: string;
    entries: UpdateEntry[];
    more: number;
  };
}

export type LoadStatus = "loading" | "ready" | "error";

export interface MapProgress {
  found: number;
  total: number;
}

export interface GameProgress {
  status: LoadStatus;
  found: number;
  total: number;
  maps: Record<string, MapProgress>;
}

export type FreshKind = "new" | "upd" | "soon";
export type LibraryView = "grid" | "list";
export type LibraryMode = "all" | "new" | "mine" | "recent" | "az";
