import { useCallback, useEffect, useState } from "react";
import { remove, write } from "../lib/storage";

export type Theme = "light" | "dark";

const systemTheme = (): Theme => {
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
};

/** Тема сайта: тот же формат, что у карт (bp_theme + bp_theme_sys). Ручной выбор сбрасывается, когда система сменит тему. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
    let query: MediaQueryList;
    try {
      query = window.matchMedia("(prefers-color-scheme: light)");
    } catch {
      return;
    }
    const onChange = () => {
      remove("bp_theme");
      remove("bp_theme_sys");
      const next = systemTheme();
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      write("bp_theme", next);
      write("bp_theme_sys", systemTheme());
      return next;
    });
  }, []);

  return { theme, toggle };
}
