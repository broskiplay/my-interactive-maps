import { container, cx, focusRing } from "../lib/ui";
import { Icon } from "./Icon";

export function AuthError({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className={cx(container, "pt-4")}>
      <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm">
        <Icon name="alert" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-danger" />
        <p className="flex-1">{message}</p>
        <button type="button" onClick={onClose} aria-label="Закрыть сообщение" className={cx("inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:text-ink", focusRing)}>
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
