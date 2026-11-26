import type { Sidebar } from "@/lib/sidebar";

/**
 * Общая боковая панель всех карт. Порядок: логотип → «Карта | База данных» → карта и область → поиск → прогресс →
 * действия → дополнительные фильтры → активные фильтры и сброс → категории → «О карте».
 * Игра даёт только данные и свои элементы: их id и разметка не меняются (их ищут js/app.js, js/map-extras.js,
 * js/map-ux.js), а прямые потомки .section/.scroll-body остаются прямыми — поэтому слоты собираются строкой, без обёрток.
 * Поведение (подсчёт, «Показать/скрыть все», сворачивание групп, двойное нажатие строки, активные фильтры) — js/map-ux.js и js/map-extras.js.
 */
const ICON = {
  map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>',
  area: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  db: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>',
};
const FIELD = {
  map: { label: "Карта", hint: "Открыть другую карту игры" },
  area: { label: "Область", hint: "Приблизить к области на этой карте" },
};
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/**
 * Логотип панели — полное название игры текстом (вместо картинок): верхняя строка — серия/подзаголовок,
 * основная — название. Шрифт и цвет — из палитры игры (--font-display, --sp-accent), размер подгоняется под ширину
 * панели через --n (длина самой длинной строки) в css/map-ux.css §5б (.bp-wm).
 */
const WORDMARK: Record<string, [string, string]> = {
  "cyberpunk2077-map": ["", "Cyberpunk 2077"],
  "dimraeth-map": ["", "Dimraeth"],
  "gothic-remake-map": ["", "Gothic 1 Remake"],
  "hogwarts-legacy-map": ["", "Hogwarts Legacy"],
  "oblivion-remake-map": ["The Elder Scrolls IV", "Oblivion Remastered"],
  "palworld-map": ["", "Palworld"],
  "phantom-blade-zero-map": ["", "Phantom Blade Zero"],
  "rdr2-map": ["", "Red Dead Redemption 2"],
  "gta6-map": ["", "Grand Theft Auto VI"],
  "silver-palace-map": ["", "Silver Palace"],
  "dragonsword-awakening-map": ["", "DragonSword: Awakening"],
  "mortal-shell-2-map": ["", "Mortal Shell II"],
  "cs2-map": ["", "Counter-Strike 2"],
  "skyrim-map": ["The Elder Scrolls V", "Skyrim"],
  "stellar-blade-map": ["", "Stellar Blade"],
  "tainted-grail-map": ["Tainted Grail", "The Fall of Avalon"],
  "witcher3-map": ["", "Ведьмак 3: Дикая Охота"],
};

function wordmark(sb: Sidebar, folder: string) {
  const w = WORDMARK[folder];
  if (!w) return sb.logo;
  const [top, main] = w;
  const top_ = top ? `<span class="bp-wm-top">${esc(top)}</span>` : "";
  return `<span class="bp-wm${top ? " has-top" : ""}" style="--n:${main.length}">${top_}<span class="bp-wm-main">${esc(main)}</span></span>`;
}

function fullName(folder: string, fallback: string) {
  const w = WORDMARK[folder];
  return w ? [w[0], w[1]].filter(Boolean).join(": ") : fallback;
}

function header(sb: Sidebar, folder: string) {
  return (
    '<div class="sidebar-header"><div class="header-top-row bp-sb-head"><h1 class="bp-sb-brand">' +
    `<a class="bp-sb-logo" href="/${folder}/" title="К началу карты" aria-label="${esc(fullName(folder, sb.logoAlt))} — интерактивная карта">${wordmark(sb, folder)}</a>` +
    "</h1></div></div>"
  );
}

function tabs(db: string | null) {
  if (!db) return "";
  return (
    '<div class="bp-nav"><div class="bp-seg" role="group" aria-label="Раздел игры">' +
    `<span aria-current="page">${ICON.map}Карта</span><a href="${db}" data-bp-db>${ICON.db}База данных</a></div></div>`
  );
}

function fields(sb: Sidebar) {
  if (!sb.fields.length) return "";
  const out = sb.fields.map((f) => {
    const k = FIELD[f.kind];
    const label = `<p class="section-label bp-sb-label" title="${k.hint}">${ICON[f.kind]}${k.label}</p>`;
    if (f.wrap) return `<div class="bp-sb-field" data-kind="${f.kind}">${label}${f.html}</div>`;
    // блок сам управляет видимостью (атрибут hidden, Dimraeth): он и есть поле, подпись — внутрь
    const open = /^<[^>]*>/.exec(f.html)![0];
    return open.replace(/^<div\b/, `<div class="bp-sb-field" data-kind="${f.kind}"`) + label + f.html.slice(open.length);
  });
  return `<div class="bp-sb-maps">${out.join("")}</div>`;
}

function search(sb: Sidebar) {
  const box = sb.search.replace('class="search-wrap', 'class="search-wrap bp-sb-search');
  // особая возможность поиска игры — отдельной подсказкой прямо под полем (не в свёрнутом блоке)
  return sb.hint ? box.replace(/<\/div>\s*$/, `<p class="bp-sb-hint">${sb.hint}</p></div>`) : box;
}

// прогресс и кнопки сразу в компактном виде js/map-ux.js (compactSidebar): строка и пояснение — пустые заготовки
// под текст скрипта, чтобы панель не меняла высоту после загрузки движка (CLS)
function progress(html: string) {
  if (!html) return "";
  return html
    .replace(/^<div class="progress-card"/, '<div class="progress-card bp-sb-prog"')
    .replace(/^(<[^>]*>)/, '$1<div class="bp-prog-line">&nbsp;</div>')
    .replace(/<\/div>\s*$/, '<div class="bp-prog-note">&nbsp;</div></div>');
}

function section(sb: Sidebar) {
  const more = sb.extra.length ? `<details class="bp-sb-more"><summary>Дополнительные фильтры</summary>${sb.extra.join("\n")}</details>` : "";
  const actions = sb.actions.map((a) => a.replace(/^<div class="btn-group"/, '<div class="btn-group bp-sb-actions"'));
  return `<div class="section">${progress(sb.progress)}${actions.join("\n")}${sb.misc.join("\n")}${more}</div>`;
}

// активные ограничения и сброс — видны всегда, даже при закрытых «Дополнительных фильтрах» (чипы заполняет js/map-ux.js)
function active(sb: Sidebar) {
  return `<div class="bp-sb-active" aria-label="Активные фильтры"><div class="bp-sb-chips" role="status" aria-live="polite"></div>${sb.active.join("\n")}</div>`;
}

/** Готовая разметка #sidebar: вставляется в body страницы на место исходной панели игры (DOM вокруг не меняется). */
export function sidebarHtml(sb: Sidebar, folder: string, db: string | null): string {
  const html = [header(sb, folder), tabs(db), fields(sb), search(sb), section(sb), active(sb), sb.categories, ...sb.footer].join("\n");
  const open = sb.open.replace(/^<div\b/, '<div data-bp-sb="2"');
  return `${open}<div class="scroll-body">${html}</div></div>`;
}
