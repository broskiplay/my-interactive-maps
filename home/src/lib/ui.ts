// Общие наборы классов: кнопки, фокус, карточки. Один источник вместо копий в каждом компоненте.

export const cx = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(" ");

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

const btnBase = cx(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors",
  "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
  focusRing,
);

export const btn = {
  primary: cx(btnBase, "h-11 px-5 text-sm bg-accent text-accent-ink hover:bg-accent/90"),
  secondary: cx(btnBase, "h-11 px-5 text-sm border border-line bg-surface text-ink hover:border-subtle hover:bg-raised"),
  ghost: cx(btnBase, "h-10 px-3 text-sm text-muted hover:bg-raised hover:text-ink"),
  icon: cx(btnBase, "h-10 w-10 shrink-0 text-muted hover:bg-raised hover:text-ink"),
  /** Компактная основная кнопка в карточке */
  primaryCompact: cx(btnBase, "h-10 px-4 text-sm bg-accent text-accent-ink hover:bg-accent/90"),
  /** Квадратная кнопка-иконка с рамкой */
  iconOutline: cx(btnBase, "h-10 w-10 shrink-0 border border-line bg-surface text-ink hover:border-subtle hover:bg-raised"),
  secondaryCompact: cx(btnBase, "h-10 px-4 text-sm border border-line bg-surface text-ink hover:border-subtle hover:bg-raised"),
  /** Пункт выпадающего меню */
  menuItem: cx(
    "flex h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold text-muted transition-colors hover:bg-raised hover:text-ink",
    focusRing,
  ),
  small: cx(btnBase, "h-9 px-3 text-sm border border-line bg-surface text-ink hover:border-subtle hover:bg-raised"),
};

export const card = "rounded-2xl border border-line bg-surface";

export const sectionTitle = "font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl";

export const container = "mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8";

export const extLink = { target: "_blank", rel: "noopener noreferrer" } as const;
