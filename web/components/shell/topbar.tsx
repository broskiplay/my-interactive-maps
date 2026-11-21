import type { ReactNode } from "react";
import { Search, User } from "@/components/shell/icons";
import { GameSearch, type FindGame } from "./game-search";

/** Статус эфира Twitch в шапке и подвале — подключается на всех страницах (главная, карты, страницы, база и категории). */
export const TWITCH_LIVE_SCRIPT = "/js/twitch-live.js?v=1";

/**
 * Шапка сайта — одна для всех страниц: логотип, поиск игры, тема, вход.
 * На главной поиск фильтрует библиотеку (js/script.js, #game-search-input), на остальных страницах —
 * выпадающий список игр (GameSearch). Вход: id #auth-btn / #auth-status / #auth-avatar и класс .has-avatar у .auth-info
 * читают js/script.js на главной и js/app.js каждой карты — не переименовывать.
 */
export function Topbar({ games, children }: { games?: FindGame[]; children?: ReactNode }) {
  return (
    <header className="bx-top" id="topbar">
      {/* #twitch-live и .is-twitch-live у #topbar переключает js/twitch-live.js; «В ЭФИРЕ» — поверх места, шапка не сдвигается */}
      <div className="bx-brand-box">
        <a className="bx-brand" href="/" aria-label="BroskiPlay — на главную">
          <img src="/icons/logo-badge-96.png" width="44" height="44" alt="" />
          <span className="bx-brand-name">
            <span>Broski</span>
            <span>Play</span>
          </span>
        </a>
        <a className="bx-live" id="twitch-live" href="https://www.twitch.tv/broskiplay" target="_blank" rel="noopener" hidden>
          <i aria-hidden="true" />В эфире
        </a>
      </div>

      {games ? (
        <GameSearch games={games} />
      ) : (
        <div className="bx-search" role="search">
          <label className="sr-only" htmlFor="game-search-input">
            Поиск игры
          </label>
          <Search />
          <input
            id="game-search-input"
            type="search"
            placeholder="Поиск игр…"
            autoComplete="off"
            aria-controls="games-container"
            aria-describedby="game-search-status"
          />
          <kbd aria-hidden="true">/</kbd>
          <p className="sr-only" id="game-search-status" role="status" aria-live="polite"></p>
        </div>
      )}

      <div className="bx-actions">
        {/* Видна только автору: очередь правок читается лишь его аккаунтом (правила Firestore), js/script.js → checkAdminReports */}
        <a className="bx-icon-btn admin-reports" id="admin-reports" href="/reports/" title="Очередь правок" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 7a4 4 0 0 1 8 0v1H8V7Z" />
            <rect x="6" y="8" width="12" height="11" rx="6" />
            <path d="M12 11v8M3 13h3M18 13h3M4 8l2.5 2M20 8l-2.5 2M4 19l2.5-2M20 19l-2.5-2" />
          </svg>
          <span className="sr-only">Очередь правок</span>
          <b id="admin-reports-count" hidden></b>
        </a>
        {/* На телефоне — открывает поле поиска */}
        <button type="button" className="bx-icon-btn bx-search-btn" id="tb-search" aria-label="Найти игру" aria-expanded="false">
          <Search />
        </button>
        {children}
        <div className="auth-card">
          <a className="auth-info" href="/cabinet/" title="Личный кабинет" aria-label="Личный кабинет">
            <span className="auth-guest" aria-hidden="true">
              <User />
            </span>
            <img id="auth-avatar" className="auth-avatar" alt="" />
            <span id="auth-status" className="auth-text">
              <b>Кабинет</b>
              <br />
              <span>Войдите через Google для синхронизации меток</span>
            </span>
          </a>
          <button id="auth-btn" className="auth-btn" type="button">
            <svg className="google-icon" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span>Войти с Google</span>
          </button>
        </div>
      </div>
    </header>
  );
}
