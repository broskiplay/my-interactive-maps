import { goal } from "@/lib/data";
import { DonateDaysLeft } from "./donate-days-left";
import { Heart } from "@/components/shell/icons";

const fmt = (n: number, cur: string) => n.toLocaleString("ru-RU") + " " + cur;
const BUG_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSdCjye5hjkhH_ed9R2IUjYKJ43S5MXFg2aUftj4Vu_rk2cv0w/viewform";
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

const SOCIAL: { href: string; label: string; d: string }[] = [
  {
    href: "https://discord.gg/RmdBrh2NqC",
    label: "Discord",
    d: "M19 6.2A16 16 0 0 0 15 5l-.5 1a14 14 0 0 0-5 0L9 5a16 16 0 0 0-4 1.2C2.6 9.8 2 13.3 2.3 16.8A16 16 0 0 0 7.2 19l1-1.6a10 10 0 0 1-1.6-.8l.4-.3a11 11 0 0 0 10 0l.4.3-1.6.8 1 1.6a16 16 0 0 0 4.9-2.2c.4-4-.6-7.5-2.7-10.6ZM9 14.6c-1 0-1.7-.9-1.7-2s.8-2 1.7-2 1.8.9 1.7 2c0 1.1-.8 2-1.7 2Zm6 0c-1 0-1.7-.9-1.7-2s.8-2 1.7-2 1.8.9 1.7 2c0 1.1-.7 2-1.7 2Z",
  },
  {
    href: "https://t.me/broskiplaytw",
    label: "Telegram",
    d: "M21.5 4.3 2.9 11.5c-1.3.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.6ZM9 14.2l9.4-6c.4-.3.9-.1.5.2l-7.9 7.2-.3 3.3L9 14.2Z",
  },
  {
    href: "https://www.youtube.com/@broskiplayt",
    label: "YouTube",
    d: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z",
  },
  {
    href: "https://vk.ru/broski_club",
    label: "ВКонтакте",
    d: "M12.8 17.5c-5.5 0-8.6-3.8-8.7-10h2.7c.1 4.6 2.1 6.5 3.7 6.9V7.5h2.6v4c1.6-.2 3.2-2 3.8-4h2.6a7.7 7.7 0 0 1-3.5 5 8 8 0 0 1 4.1 5h-2.8a5 5 0 0 0-4.2-3.6v3.6h-.3Z",
  },
];

const TWITCH_D =
  "M5 3 3.5 6.5V19h4.2v2.3H10l2.3-2.3h3.4L20.5 14V3H5Zm13.7 10.1-2.6 2.6h-4.2l-2.3 2.3v-2.3H6.1V4.8h12.6v8.3ZM15.5 7.5h-1.8v4.7h1.8V7.5Zm-4.6 0H9.1v4.7h1.8V7.5Z";

/** Подвал: логотип, служебные ссылки, соцсети (Twitch загорается во время стрима — js/twitch-live.js), сбор на проект. */
export function SiteFooter() {
  const g = goal();
  const raised = g ? Math.max(0, Number(g.raised) || 0) : 0;
  const pct = g ? Math.min(100, Math.round((raised / g.goal) * 100)) : 0;
  const cur = g?.currency || "₽";
  return (
    <footer className="bx-footer site-footer">
      <div className="bx-footer-row">
        <a className="bx-brand" href="#top" aria-label="BroskiPlay — наверх">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/logo-badge-96.png" width={36} height={36} alt="" loading="lazy" decoding="async" />
          <span className="bx-brand-name">
            <span>Broski</span>
            <span>Play</span>
          </span>
        </a>
        <nav className="bx-footer-links" aria-label="Ссылки в подвале">
          <button type="button" className="bx-link" data-about-open="">
            О проекте
          </button>
          <a href={BUG_FORM} {...ext}>
            Поддержка
          </a>
          <a href="/fixes/">Исправления</a>
          <a href="/privacy.html">Правила и конфиденциальность</a>
        </nav>
        <div className="bx-social" aria-label="Мы в соцсетях">
          <a
            className="bx-social-btn bx-twitch"
            id="twitch-button"
            href="https://www.twitch.tv/broskiplay"
            {...ext}
            title="Канал BroskiPlay на Twitch"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={TWITCH_D} />
            </svg>
            <span id="twitch-button-label">Twitch</span>
          </a>
          {SOCIAL.map((s) => (
            <a key={s.label} className="bx-social-btn" href={s.href} {...ext} aria-label={s.label} title={s.label}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={s.d} />
              </svg>
            </a>
          ))}
        </div>
      </div>
      <div className="bx-footer-row bx-footer-sub">
        <p className="bx-footer-copy">© 2026 BroskiPlay · карты бесплатные, без подписки</p>
        <a className="bx-donate" id="donate" href="https://www.donationalerts.com/r/broskiplay" {...ext}>
          <Heart />
          <span className="bx-donate-text">
            <b>Поддержать проект</b>
            {g && (
              <span>
                {g.title || "Цель сбора"}: {fmt(raised, cur)} из {fmt(g.goal, cur)}
                {g.deadline && <DonateDaysLeft deadline={g.deadline} />}
              </span>
            )}
          </span>
          {g && (
            <span
              className="bx-donate-bar"
              role="progressbar"
              aria-label="Собрано"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <i style={{ width: pct + "%" }}></i>
            </span>
          )}
        </a>
      </div>
      <dialog className="bx-dialog" id="about" aria-labelledby="about-heading">
        <div className="bx-dialog-head">
          <h2 id="about-heading">О проекте</h2>
          <button type="button" className="bx-round" data-about-close="" aria-label="Закрыть">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 7l10 10M17 7 7 17" />
            </svg>
          </button>
        </div>
        <h3>Что это</h3>
        <p>
          Интерактивные карты игровых миров на русском: названия и описания меток переведены, найденное можно отмечать. Прогресс хранится в
          браузере без аккаунта, а после входа через Google — появится на других ваших устройствах.
        </p>
        <h3>Откуда карты</h3>
        <p>
          Метки и подложки основаны на открытых картах игрового сообщества. Названия мест, предметов и персонажей — по официальной русской
          локализации, чтобы на карте было написано то же, что в игре.
        </p>
        <h3>Нашли ошибку?</h3>
        <p>
          Нажмите «Сообщить об ошибке» в окне метки — принятые правки попадают в <a href="/fixes/">журнал исправлений</a>. Не нашли игру?{" "}
          <a href="https://forms.gle/S1dA8ivejnYkdB1HA" {...ext}>
            Предложите её
          </a>
          . Код сайта —{" "}
          <a href="https://github.com/broskiplay/my-interactive-maps" {...ext}>
            на GitHub
          </a>
          .
        </p>
      </dialog>
    </footer>
  );
}
