import { cx } from "../lib/ui";

interface ProgressBarProps {
  value: number; // 0–100
  label: string;
  size?: "sm" | "md";
  className?: string;
}

/** Полоса прогресса. Ширина заливки — единственное значение, которое задаётся стилем: оно динамическое. */
export function ProgressBar({ value, label, size = "md", className }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className={cx("w-full overflow-hidden rounded-full bg-raised", size === "sm" ? "h-1" : "h-1.5", className)}
    >
      <span className="block h-full rounded-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${v}%` }} />
    </div>
  );
}
