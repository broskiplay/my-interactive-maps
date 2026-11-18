import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import type { HomeData } from "./lib/types";
import "./index.css";

const root = document.getElementById("root") as HTMLElement;
const script = document.getElementById("home-data");

if (script?.textContent) {
  const data = JSON.parse(script.textContent) as HomeData;
  hydrateRoot(
    root,
    <StrictMode>
      <App data={data} />
    </StrictMode>,
  );
} else if (import.meta.env.DEV) {
  // npm run dev: пререндера нет — данные «Что нового» берём прямо из data/changelog.json
  void import("../../data/changelog.json").then(({ default: log }) => {
    const entries = (log as HomeData["updates"]["entries"]).slice(0, 2);
    createRoot(root).render(
      <StrictMode>
        <App data={{ updates: { token: "dev", entries, more: Math.max(0, log.length - 2) } }} />
      </StrictMode>,
    );
  });
}
