import { useEffect, useRef } from "react";
import { humanDate, plural } from "../lib/format";
import type { HomeData } from "../lib/types";
import { card, container, cx, focusRing, sectionTitle } from "../lib/ui";
import { Icon } from "./Icon";

interface UpdatesProps {
  data: HomeData["updates"];
  unread: boolean;
  onSeen: () => void;
}

/** «Что нового»: две последние даты из data/changelog.json. Прочитанным считается, когда блок показался на экране. */
export function Updates({ data, unread, onSeen }: UpdatesProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!unread || !el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onSeen();
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [unread, onSeen]);

  if (!data.entries.length) return null;

  return (
    <section ref={ref} id="updates" aria-labelledby="updates-heading" className={cx(container, "scroll-mt-20 pb-16")}>
      <h2 id="updates-heading" className={cx(sectionTitle, "mb-5 flex items-center gap-3")}>
        Что нового
        {unread && <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-ink">Новое</span>}
      </h2>
      <ol className={cx(card, "divide-y divide-line")}>
        {data.entries.map((entry) => (
          <li key={entry.date} className="grid gap-3 p-5 sm:grid-cols-[10rem_1fr] sm:gap-6 sm:p-6">
            <time dateTime={entry.date} className="text-sm font-semibold">
              {humanDate(entry.date, true)}
            </time>
            <ul className="space-y-2.5">
              {entry.items.map((item) => (
                <li key={item} className="relative pl-4 text-sm leading-relaxed text-muted before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-line">
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {data.more > 0 && (
        <a href="/updates/" className={cx("mt-4 inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-accent hover:underline", focusRing)}>
          Все обновления — ещё {data.more} {plural(data.more, "дата", "даты", "дат")}
          <Icon name="arrowRight" className="h-4 w-4" />
        </a>
      )}
    </section>
  );
}
