import { FOOTER_LINKS } from "../lib/site";
import { container, cx, extLink, focusRing } from "../lib/ui";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className={cx(container, "flex flex-col gap-6 py-8 md:flex-row md:items-start md:justify-between")}>
        <nav aria-label="Ссылки в подвале">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} {...(l.external ? extLink : {})} className={cx("rounded text-sm text-muted transition-colors hover:text-ink", focusRing)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="shrink-0 text-sm text-subtle">© 2026 BroskiPlay</p>
      </div>
    </footer>
  );
}
