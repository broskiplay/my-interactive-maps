import { useCallback, useRef, useState } from "react";
import type { AuthState } from "../hooks/useAuth";
import { useDismiss } from "../hooks/useDismiss";
import type { Theme } from "../hooks/useTheme";
import type { TwitchState } from "../hooks/useTwitchLive";
import { DONATE_URL, TWITCH_URL } from "../lib/site";
import { btn, container, cx, extLink, focusRing } from "../lib/ui";
import { GoogleIcon, Icon, Spinner } from "./Icon";

interface TopbarProps {
  auth: AuthState;
  theme: Theme;
  onToggleTheme: () => void;
  twitch: TwitchState;
  hasUnreadUpdates: boolean;
  onSearch: () => void;
}

const NAV: readonly { label: string; href: string }[] = [
  { label: "Игры", href: "#library" },
  { label: "База данных", href: "/db/" },
  { label: "Что нового", href: "#updates" },
  { label: "Исправления", href: "/fixes/" },
  { label: "Сообщество", href: "#community" },
];

const navLink = cx("relative rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink", focusRing);

export function Topbar({ auth, theme, onToggleTheme, twitch, hasUnreadUpdates, onSearch }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useDismiss(menuOpen, panelRef, closeMenu);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
      <div ref={panelRef} className={cx(container, "flex h-16 items-center gap-2")}>
        <a href="/" className={cx("mr-2 flex items-center gap-2.5 rounded-lg", focusRing)} aria-label="BroskiPlay — на главную">
          <img src="/icons/logo-badge-96.png" width={32} height={32} alt="" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-base font-semibold tracking-tight">BroskiPlay</span>
        </a>

        <nav aria-label="Разделы сайта" className="hidden items-center lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className={navLink}>
              {item.label}
              {item.href === "#updates" && hasUnreadUpdates && <UnreadDot />}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <a
            href={TWITCH_URL}
            {...extLink}
            title={twitch.live ? `BroskiPlay в эфире${twitch.status ? `: ${twitch.status}` : ""}` : "Канал BroskiPlay на Twitch"}
            className={cx(
              "hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors sm:inline-flex",
              twitch.live ? "bg-accent/15 text-accent hover:bg-accent/25" : "text-muted hover:bg-raised hover:text-ink",
              focusRing,
            )}
          >
            <Icon name="twitch" className="h-[18px] w-[18px]" />
            {twitch.live ? (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />В эфире
              </>
            ) : (
              "Twitch"
            )}
          </a>
          <a href={DONATE_URL} {...extLink} className={cx(btn.ghost, "max-xl:hidden")}>
            <Icon name="heart" className="h-[18px] w-[18px]" />
            Поддержать
          </a>
          <button type="button" onClick={onSearch} className={btn.icon} aria-label="Найти игру" title="Найти игру (клавиша /)">
            <Icon name="search" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className={btn.icon}
            aria-label={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
            title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
          >
            <Icon name={theme === "light" ? "moon" : "sun"} />
          </button>
          <AuthControl auth={auth} />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={cx(btn.icon, "lg:hidden")}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>

        {menuOpen && (
          <nav
            id="site-menu"
            aria-label="Разделы сайта"
            className="absolute inset-x-0 top-16 border-b border-line bg-canvas px-4 pb-4 pt-2 sm:px-6 lg:hidden"
          >
            <ul className="grid gap-1 sm:grid-cols-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={closeMenu} className={cx(navLink, "flex items-center py-3 text-base")}>
                    {item.label}
                    {item.href === "#updates" && hasUnreadUpdates && <UnreadDot />}
                  </a>
                </li>
              ))}
              <li>
                <a href={TWITCH_URL} {...extLink} className={cx(navLink, "flex items-center gap-2 py-3 text-base")}>
                  <Icon name="twitch" className="h-[18px] w-[18px]" /> Twitch {twitch.live && <span className="text-accent">· в эфире</span>}
                </a>
              </li>
              <li>
                <a href={DONATE_URL} {...extLink} className={cx(navLink, "flex items-center gap-2 py-3 text-base")}>
                  <Icon name="heart" className="h-[18px] w-[18px]" /> Поддержать проект
                </a>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

function UnreadDot() {
  return (
    <span className="absolute right-1 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" role="img" aria-label="Есть непрочитанные обновления" />
  );
}

function AuthControl({ auth }: { auth: AuthState }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, ref, close);

  if (auth.status !== "signed-in" || !auth.user) {
    const loading = auth.status === "loading";
    return (
      <button
        type="button"
        onClick={auth.signIn}
        onPointerEnter={auth.prefetch}
        onFocus={auth.prefetch}
        disabled={loading}
        aria-busy={loading}
        title="Войдите через Google, чтобы прогресс был на всех устройствах"
        className={cx(btn.small, "ml-1")}
      >
        {loading ? <Spinner /> : <GoogleIcon />}
        <span className="hidden sm:inline">{loading ? "Входим…" : "Войти"}</span>
        <span className="sr-only sm:hidden">Войти через Google</span>
      </button>
    );
  }

  const { user } = auth;
  const name = user.displayName || user.email || "Google";
  return (
    <div ref={ref} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="account-menu"
        aria-label={`Аккаунт: ${name}`}
        className={cx("relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-raised", focusRing)}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full" />
        ) : (
          <span className="text-sm font-semibold">{name.slice(0, 1).toUpperCase()}</span>
        )}
        {auth.reports ? <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-canvas bg-danger" /> : null}
      </button>
      {open && (
        <div id="account-menu" className="absolute right-0 top-12 w-64 rounded-2xl border border-line bg-surface p-2 shadow-lg shadow-black/20">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Облачная синхронизация включена
            </p>
          </div>
          {auth.reports !== null && (
            <a href="/reports/" className={btn.menuItem}>
              <Icon name="bug" className="h-[18px] w-[18px]" />
              Очередь правок
              {auth.reports > 0 && (
                <span className="ml-auto rounded-full bg-danger px-2 py-0.5 text-xs font-semibold text-white">
                  {auth.reports >= 99 ? "99+" : auth.reports}
                </span>
              )}
            </a>
          )}
          <button type="button" onClick={auth.signOut} className={btn.menuItem}>
            <Icon name="logout" className="h-[18px] w-[18px]" />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
