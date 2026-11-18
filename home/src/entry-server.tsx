import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";
import type { HomeData } from "./lib/types";

export function render(data: HomeData): string {
  return renderToString(
    <StrictMode>
      <App data={data} />
    </StrictMode>,
  );
}
