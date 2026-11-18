export interface SocialLink {
  id: "twitch" | "youtube" | "vk" | "telegram" | "discord" | "lolka";
  label: string;
  href: string;
}

export const SOCIAL: readonly SocialLink[] = [
  { id: "vk", label: "ВКонтакте", href: "https://vk.ru/broski_club" },
  { id: "telegram", label: "Telegram", href: "https://t.me/broskiplaytw" },
  { id: "discord", label: "Discord", href: "https://discord.gg/RmdBrh2NqC" },
  { id: "lolka", label: "Lolka", href: "https://lolka.gg/G53N4TVyp" },
];

export const TWITCH_URL = "https://www.twitch.tv/broskiplay";
export const YOUTUBE_URL = "https://www.youtube.com/@broskiplayt/videos";
export const DONATE_URL = "https://www.donationalerts.com/r/broskiplay";
export const BUG_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdCjye5hjkhH_ed9R2IUjYKJ43S5MXFg2aUftj4Vu_rk2cv0w/viewform";
export const GITHUB_URL = "https://github.com/broskiplay/my-interactive-maps";

export const FOOTER_LINKS: readonly { label: string; href: string; external?: boolean }[] = [
  { label: "Twitch", href: TWITCH_URL, external: true },
  { label: "YouTube", href: "https://www.youtube.com/@broskiplayt", external: true },
  ...SOCIAL.map((s) => ({ label: s.label, href: s.href, external: true })),
  { label: "GitHub", href: GITHUB_URL, external: true },
  { label: "Сообщить об ошибке", href: BUG_FORM_URL, external: true },
  { label: "Журнал исправлений", href: "/fixes/" },
  { label: "Политика конфиденциальности", href: "/privacy.html" },
];
