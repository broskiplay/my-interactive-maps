import { useEffect, type RefObject } from "react";

/** Закрыть всплывающее окно по Escape и по клику снаружи. */
export function useDismiss(open: boolean, ref: RefObject<HTMLElement>, close: () => void): void {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onPointer = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, ref, close]);
}
