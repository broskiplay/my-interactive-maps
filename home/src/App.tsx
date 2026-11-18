import { useCallback, useEffect, useRef, useState } from "react";
import { About } from "./components/About";
import { AuthError } from "./components/AuthError";
import { Community } from "./components/Community";
import { Donate } from "./components/Donate";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { GameLibrary } from "./components/GameLibrary";
import { Hero } from "./components/Hero";
import { MapLoadingOverlay } from "./components/MapLoadingOverlay";
import { RecentMaps, type RecentVisit } from "./components/RecentMaps";
import { Topbar } from "./components/Topbar";
import { Updates } from "./components/Updates";
import { useAuth } from "./hooks/useAuth";
import { useProgress } from "./hooks/useProgress";
import { useStoredState } from "./hooks/useStoredState";
import { useTheme } from "./hooks/useTheme";
import { useTwitchLive } from "./hooks/useTwitchLive";
import { readArray, readString, write } from "./lib/storage";
import type { HomeData, LibraryMode, LibraryView } from "./lib/types";
import { container, cx } from "./lib/ui";

const MODES: readonly LibraryMode[] = ["all", "new", "mine", "recent", "az"];
const isMode = (v: unknown): v is LibraryMode => MODES.includes(v as LibraryMode);
const isView = (v: unknown): v is LibraryView => v === "grid" || v === "list";
const isKeys = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

const isRecent = (v: unknown): v is RecentVisit =>
  typeof v === "object" && v !== null && typeof (v as RecentVisit).game === "string" && (v as RecentVisit).map != null;

export function App({ data }: { data: HomeData }) {
  const { theme, toggle } = useTheme();
  const twitch = useTwitchLive();
  const auth = useAuth();
  const progress = useProgress(auth.user);
  const searchRef = useRef<HTMLInputElement>(null);

  const [favorites, setFavorites] = useStoredState<string[]>("bp_fav", [], isKeys);
  const [mode, setMode] = useStoredState<LibraryMode>("bp_home_sort", "all", isMode);
  const [view, setView] = useStoredState<LibraryView>("bp_home_view", "grid", isView);
  const [recent, setRecent] = useState<RecentVisit[]>([]);
  const [unread, setUnread] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  // Всё, что зависит от браузера и времени, — после гидратации: пререндер остаётся одинаковым для всех
  useEffect(() => {
    setNow(Date.now());
    setRecent(readArray("bp_recent").filter(isRecent));
    setUnread(Boolean(data.updates.token) && readString("bp_updates_seen") !== data.updates.token);
    const params = new URLSearchParams(location.search);
    if (params.get("view") === "list") setView("list");
    if (params.get("search") === "1") {
      document.getElementById("library")?.scrollIntoView();
      searchRef.current?.focus({ preventScroll: true });
    }
    const onShow = (e: PageTransitionEvent) => e.persisted && setRecent(readArray("bp_recent").filter(isRecent));
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [data.updates.token, setView]);

  const focusSearch = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("library")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    searchRef.current?.focus({ preventScroll: true });
  }, []);

  // «/» — к поиску игр (как на картах и в базе данных)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      e.preventDefault();
      focusSearch();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focusSearch]);

  const toggleFavorite = useCallback(
    (key: string) => setFavorites((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])),
    [setFavorites],
  );

  const dismissRecent = useCallback((visit: RecentVisit) => {
    setRecent((prev) => {
      const next = prev.filter((r) => !(r.game === visit.game && String(r.map) === String(visit.map)));
      write("bp_recent", next);
      return next;
    });
  }, []);

  const markSeen = useCallback(() => {
    write("bp_updates_seen", data.updates.token);
    setUnread(false);
  }, [data.updates.token]);

  return (
    <>
      <a
        href="#library"
        className="sr-only z-50 rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        К библиотеке игр
      </a>
      <Topbar auth={auth} theme={theme} onToggleTheme={toggle} twitch={twitch} hasUnreadUpdates={unread} onSearch={focusSearch} />
      {auth.error && <AuthError message={auth.error} onClose={auth.dismissError} />}
      <main>
        <Hero latest={data.updates.entries[0] ?? null} />
        <Features />
        <RecentMaps visits={recent} progress={progress} onDismiss={dismissRecent} />
        <GameLibrary
          progress={progress}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          recent={recent}
          mode={mode}
          onModeChange={setMode}
          view={view}
          onViewChange={setView}
          now={now}
          searchRef={searchRef}
        />
        <div className={cx(container, "grid gap-4 pb-16 lg:grid-cols-2")}>
          <Community />
          <Donate />
        </div>
        <Updates data={data.updates} unread={unread} onSeen={markSeen} />
        <About />
      </main>
      <Footer />
      <MapLoadingOverlay />
    </>
  );
}
