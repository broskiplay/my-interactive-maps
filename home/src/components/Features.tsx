import { container, cx } from "../lib/ui";
import { Icon, type IconName } from "./Icon";

interface Feature {
  icon: IconName;
  title: string;
  text: string;
  href?: string;
}

const FEATURES: readonly Feature[] = [
  { icon: "sync", title: "Синхронизация", text: "Вход через Google — найденные метки и на телефоне, и на ПК." },
  { icon: "translate", title: "Как в игре", text: "Названия мест и предметов из официальной русской локализации." },
  { icon: "database", title: "База данных", text: "Предметы, задания и книги прямо из файлов игр.", href: "/db/" },
  { icon: "twitch", title: "Стримы", text: "Прохождения на Twitch и YouTube — карты делаются под них." },
];

export function Features() {
  return (
    <section aria-label="Возможности сайта" className={cx(container, "pb-12 lg:pb-16")}>
      <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const body = (
            <>
              <Icon name={f.icon} className="h-5 w-5 text-accent" />
              <h2 className="mt-4 text-sm font-semibold text-ink">{f.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
            </>
          );
          return (
            <li key={f.title} className="bg-surface">
              {f.href ? (
                <a href={f.href} className="block h-full p-5 outline-none transition-colors hover:bg-raised focus-visible:bg-raised focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">
                  {body}
                </a>
              ) : (
                <div className="h-full p-5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
