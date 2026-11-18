import { useEffect, useState } from "react";
import { afterPageLoad } from "../hooks/useAfterLoad";
import { num, percent, plural } from "../lib/format";
import { DONATE_URL } from "../lib/site";
import type { LoadStatus } from "../lib/types";
import { btn, card, cx, extLink, sectionTitle } from "../lib/ui";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";

interface Goal {
  title: string;
  goal: number;
  raised: number;
  currency: string;
  deadline?: string;
}

const isGoal = (g: unknown): g is Goal =>
  typeof g === "object" && g !== null && typeof (g as Goal).goal === "number" && (g as Goal).goal > 0;

/** Цель сбора из data/goal.json (обновляется при публикации). Без цели блок остаётся с текстом и кнопкой. */
function useGoal(): { status: LoadStatus; goal: Goal | null } {
  const [state, setState] = useState<{ status: LoadStatus; goal: Goal | null }>({ status: "loading", goal: null });
  useEffect(
    () =>
      afterPageLoad(() => {
        fetch("/data/goal.json", { cache: "no-cache" })
          .then((r) => (r.ok ? (r.json() as Promise<unknown>) : null))
          .then((g) => setState(isGoal(g) ? { status: "ready", goal: g } : { status: "error", goal: null }))
          .catch(() => setState({ status: "error", goal: null }));
      }),
    [],
  );
  return state;
}

export function Donate() {
  const { status, goal } = useGoal();
  const money = (n: number) => `${num(n)} ${goal?.currency || "₽"}`;
  const days = goal?.deadline ? Math.ceil((new Date(`${goal.deadline}T00:00:00`).getTime() - Date.now()) / 864e5) : 0;
  const raised = Math.max(0, goal?.raised ?? 0);

  return (
    <section id="donate" aria-labelledby="donate-heading" className={cx(card, "flex scroll-mt-20 flex-col gap-5 p-5 sm:p-6")}>
      <div>
        <h2 id="donate-heading" className={sectionTitle}>
          Поддержать проект
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Карты бесплатные: без подписки и без ограничения числа отмеченных меток. Донаты оплачивают новые игры, переводы и работу сайта.
        </p>
      </div>

      {status === "loading" && (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-4 w-2/3 animate-pulse rounded bg-raised" />
          <div className="h-1.5 animate-pulse rounded-full bg-raised" />
        </div>
      )}
      {status === "ready" && goal && (
        <div className="space-y-2">
          <p className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium">{goal.title || "Цель сбора"}</span>
            <strong className="tabular-nums text-accent">{percent(raised, goal.goal)}%</strong>
          </p>
          <ProgressBar value={percent(raised, goal.goal)} label={goal.title || "Цель сбора"} />
          <p className="text-xs text-muted">
            <b className="font-semibold text-ink">{money(raised)}</b> из {money(goal.goal)}
            {days > 0 && ` · осталось ${days} ${plural(days, "день", "дня", "дней")}`}
          </p>
        </div>
      )}

      <a href={DONATE_URL} {...extLink} className={cx(btn.primary, "mt-auto self-start")}>
        <Icon name="heart" className="h-[18px] w-[18px]" />
        Поддержать
      </a>
    </section>
  );
}
