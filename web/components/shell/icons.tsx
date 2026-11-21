// Общие SVG-иконки главной (линейные, 24×24, цвет — currentColor)
import type { ReactNode } from "react";

const I = ({ children, className }: { children: ReactNode; className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

export const ChevronDown = () => (
  <I>
    <path d="m6 9 6 6 6-6"></path>
  </I>
);
export const ChevronRight = () => (
  <I>
    <path d="m9 6 6 6-6 6"></path>
  </I>
);
export const ChevronLeft = () => (
  <I>
    <path d="m15 6-6 6 6 6"></path>
  </I>
);
export const ArrowRight = () => (
  <I>
    <path d="M5 12h14M13 6l6 6-6 6"></path>
  </I>
);
export const MapMarker = () => (
  <I className="map-marker">
    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path>
    <circle cx="12" cy="10" r="2.5"></circle>
  </I>
);
export const BookMarker = () => (
  <I className="map-marker">
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"></path>
    <path d="M4 21V5M9 7h6"></path>
  </I>
);
export const Heart = () => (
  <I>
    <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.7c0 5.4-7.5 10-7.5 10Z" />
  </I>
);
export const Play = () => (
  <I>
    <path className="f" d="M8 5.5v13l10.5-6.5z" />
  </I>
);
export const Search = () => (
  <I>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </I>
);
export const Home = () => (
  <I>
    <path d="M4 10.5 12 4l8 6.5V20h-5v-6h-6v6H4z" />
  </I>
);
export const Gamepad = () => (
  <I>
    {/* геймпад по образцу владельца (Xbox, 512×512), один в один; линия 26/512 — ближе всего к образцу и видна в 22 px */}
    <g transform="translate(.15 .15) scale(.046875)" strokeWidth={26}>
      <path d="M84 106 140 84Q156 78 172 84L196 96H234A22 22 0 0 0 278 96H316L340 84Q356 78 372 84L428 106C466 160 500 300 504 360 506 400 490 422 468 422 452 422 440 414 430 404L382 360C370 350 360 346 348 346H164C152 346 142 350 130 360L82 404C72 414 60 422 44 422 22 422 4 400 6 360 8 300 42 160 84 106Z" />
      <circle cx="130" cy="180" r="36" />
      <circle cx="326" cy="265" r="36" />
      <path d="M178 216H214V248H246V280H214V312H178V280H146V248H178Z" />
      <g fill="currentColor" stroke="none">
        <circle cx="384" cy="147" r="16" />
        <circle cx="349" cy="180" r="16" />
        <circle cx="418" cy="180" r="16" />
        <circle cx="384" cy="213" r="16" />
      </g>
    </g>
  </I>
);
export const Database = () => (
  <I>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
    <path d="M4.5 5.5v6c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v-6M4.5 11.5v6c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v-6" />
  </I>
);
export const Bell = () => (
  <I>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </I>
);
export const User = () => (
  <I>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </I>
);
export const Close = () => (
  <I>
    <path d="M7 7l10 10M17 7 7 17" />
  </I>
);

