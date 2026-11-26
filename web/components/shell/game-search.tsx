"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "@/components/shell/icons";

export type FindGame = { key: string; title: string; href: string; sub: string; alias?: string };

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, " ")
    .trim();

/**
 * Поиск игры в шапке на всех страницах, кроме главной (там поле фильтрует библиотеку — js/script.js).
 * Выпадающий список игр: стрелки, Enter — перейти, Esc — закрыть, «/» — фокус. На телефоне поле открывает
 * кнопка-лупа #tb-search (как на главной: класс .is-search у шапки).
 */
export function GameSearch({ games }: { games: FindGame[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  const found = useMemo(() => {
    const n = norm(q);
    if (!n) return games;
    return games.filter((g) => norm(g.title + " " + g.key.replace(/-/g, " ") + " " + (g.alias || "")).includes(n));
  }, [q, games]);

  useEffect(() => setSel(0), [q]);

  useEffect(() => {
    const top = document.getElementById("topbar");
    const btn = document.getElementById("tb-search");
    const setMobile = (on: boolean) => {
      top?.classList.toggle("is-search", on);
      btn?.setAttribute("aria-expanded", String(on));
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !t.closest("input, textarea, select, [contenteditable]")) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    const onBtn = () => {
      const on = !top?.classList.contains("is-search");
      setMobile(on);
      if (on) input.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node) && e.target !== btn && !btn?.contains(e.target as Node)) {
        setOpen(false);
        setMobile(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    btn?.addEventListener("click", onBtn);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      btn?.removeEventListener("click", onBtn);
    };
  }, []);

  const go = (g?: FindGame) => {
    if (g) location.href = g.href;
  };

  return (
    <div className="bx-search bx-find" role="search" ref={box}>
      <label className="sr-only" htmlFor="bx-find-input">
        Найти игру
      </label>
      <Search />
      <input
        ref={input}
        id="bx-find-input"
        type="search"
        placeholder="Поиск игр…"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="bx-find-list"
        aria-activedescendant={open && found[sel] ? "bx-find-" + found[sel].key : undefined}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            const n = found.length || 1;
            setSel((s) => (s + (e.key === "ArrowDown" ? 1 : n - 1)) % n);
          } else if (e.key === "Enter") {
            e.preventDefault();
            go(found[sel]);
          } else if (e.key === "Escape") {
            setOpen(false);
            input.current?.blur();
            document.getElementById("topbar")?.classList.remove("is-search");
          }
        }}
      />
      <kbd aria-hidden="true">/</kbd>
      {open && (
        <ul className="bx-find-list" id="bx-find-list" role="listbox" aria-label="Игры">
          {found.length ? (
            found.map((g, i) => (
              <li key={g.key} id={"bx-find-" + g.key} role="option" aria-selected={i === sel}>
                <a href={g.href} onMouseEnter={() => setSel(i)}>
                  <b>{g.title}</b>
                  <span>{g.sub}</span>
                </a>
              </li>
            ))
          ) : (
            <li className="bx-find-empty" role="presentation">
              Такой игры пока нет
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
