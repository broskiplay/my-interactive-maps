import { SOCIAL, TWITCH_URL, YOUTUBE_URL } from "../lib/site";
import { card, cx, extLink, focusRing, sectionTitle } from "../lib/ui";
import { Icon, type IconName } from "./Icon";

const LINKS: readonly { icon: IconName; label: string; href: string }[] = [
  { icon: "twitch", label: "Twitch", href: TWITCH_URL },
  { icon: "youtube", label: "YouTube", href: YOUTUBE_URL },
  ...SOCIAL.map((s) => ({ icon: s.id, label: s.label, href: s.href })),
];

export function Community() {
  return (
    <section id="community" aria-labelledby="community-heading" className={cx(card, "flex scroll-mt-20 flex-col gap-5 p-5 sm:p-6")}>
      <div>
        <h2 id="community-heading" className={sectionTitle}>
          Мы в соцсетях
        </h2>
        <p className="mt-2 text-sm text-muted">Новости карт, вопросы и пожелания по новым играм.</p>
      </div>
      <ul className="grid grid-cols-2 gap-2 xs:grid-cols-3">
        {LINKS.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              {...extLink}
              className={cx(
                "flex h-11 items-center gap-2.5 rounded-xl border border-line px-3 text-sm font-medium transition-colors hover:border-subtle hover:bg-raised",
                focusRing,
              )}
            >
              <Icon name={l.icon} className="h-[18px] w-[18px] shrink-0 text-muted" />
              <span className="truncate">{l.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

