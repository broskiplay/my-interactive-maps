/**
 * Разбор боковой панели исходной страницы карты (`<div id="sidebar">` в `<игра>-map/index.html`) на слоты
 * общего компонента `components/map/map-sidebar.tsx`. Игра даёт данные: логотип, свои элементы управления
 * (id и разметка сохраняются — их ищут js/app.js и общие модули), особые фильтры. Порядок и подписи задаёт компонент.
 */

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

export type Node = { html: string; tag: string; open: string; inner: string };

/** Конец элемента, начинающегося с `<` в позиции start (учитывает вложенные одноимённые теги). */
function elementEnd(s: string, start: number): number {
  const m = /^<([a-zA-Z][\w-]*)[^>]*>/.exec(s.slice(start));
  if (!m) return s.indexOf(">", start) + 1;
  const tag = m[1].toLowerCase();
  const openEnd = start + m[0].length;
  if (VOID.has(tag) || m[0].endsWith("/>")) return openEnd;
  if (tag === "script" || tag === "style") {
    const e = s.toLowerCase().indexOf("</" + tag, openEnd);
    return s.indexOf(">", e) + 1;
  }
  const re = new RegExp("<(/?)" + tag + "\\b[^>]*>", "gi");
  re.lastIndex = openEnd;
  let depth = 1;
  for (let x = re.exec(s); x; x = re.exec(s)) {
    depth += x[1] ? -1 : 1;
    if (!depth) return x.index + x[0].length;
  }
  throw new Error("незакрытый <" + tag + ">");
}

function node(s: string, a: number, b: number): Node {
  const html = s.slice(a, b);
  const open = /^<[^>]*>/.exec(html)?.[0] ?? "";
  const tag = (/^<([a-zA-Z][\w-]*)/.exec(html)?.[1] ?? "").toLowerCase();
  const close = VOID.has(tag) || !html.endsWith(">") ? html.length : html.lastIndexOf("</");
  return { html, tag, open, inner: html.slice(open.length, Math.max(open.length, close)) };
}

/** Дочерние элементы верхнего уровня (комментарии и пробелы отбрасываются). */
export function children(s: string): Node[] {
  const out: Node[] = [];
  let i = 0;
  while (i < s.length) {
    const lt = s.indexOf("<", i);
    if (lt < 0) break;
    if (s.startsWith("<!--", lt)) { i = s.indexOf("-->", lt) + 3; continue; }
    const end = elementEnd(s, lt);
    out.push(node(s, lt, end));
    i = end;
  }
  return out;
}

const attr = (n: Node, name: string) => new RegExp("\\b" + name + '="([^"]*)"').exec(n.open)?.[1] ?? "";
export const hasClass = (n: Node, c: string) => attr(n, "class").split(/\s+/).includes(c);
export const idOf = (n: Node) => attr(n, "id");
/** Убрать из html дочерние элементы верхнего уровня, подходящие под условие; вернуть остаток и убранное. */
function pluck(html: string, test: (n: Node) => boolean): [string, Node[]] {
  const got: Node[] = [];
  let rest = html;
  for (const n of children(html)) if (test(n)) { got.push(n); rest = rest.replace(n.html, ""); }
  return [rest, got];
}

export type Field = { kind: "map" | "area"; html: string; wrap: boolean };
export type Sidebar = {
  before: string;
  after: string;
  open: string; // открывающий тег #sidebar (атрибуты игры)
  logo: string; // содержимое ссылки-логотипа
  logoAlt: string;
  fields: Field[];
  search: string;
  hint: string; // особая возможность поиска игры (Dimraeth: источники предметов)
  progress: string;
  actions: string[];
  extra: string[]; // особые фильтры игры → «Дополнительные фильтры»
  active: string[]; // активные ограничения игры (баннер источников Dimraeth)
  misc: string[];
  categories: string;
  footer: string[];
};

function logoOf(header: string, game: string): [string, string] {
  const row = children(header).find((n) => hasClass(n, "header-top-row"));
  const src = row ? row.inner : header;
  const img = /<img\b[^>]*>/.exec(src)?.[0];
  const main = /<span class="logo-main">([\s\S]*?)<\/span>/.exec(src);
  const alt = (img && /\balt="([^"]*)"/.exec(img)?.[1]) || (main ? main[1].trim() : game);
  if (img) return [img, alt];
  return [(main ? main[0] : `<span class="logo-main">${game}</span>`), alt];
}

/** Делит body страницы на «до панели», слоты панели и «после панели». */
export function parseSidebar(body: string, game: string): Sidebar | null {
  const at = body.indexOf('<div id="sidebar"');
  if (at < 0) return null;
  const end = elementEnd(body, at);
  const root = node(body, at, end);
  // .scroll-body — обёртка прокрутки у части игр; компонент ставит свою, поэтому раскрываем её
  const top = children(root.inner).flatMap((n) => (hasClass(n, "scroll-body") ? children(n.inner) : [n]));

  const sb: Sidebar = {
    before: body.slice(0, at), after: body.slice(end), open: root.open,
    logo: "", logoAlt: game, fields: [], search: "", hint: "", progress: "",
    actions: [], extra: [], active: [], misc: [], categories: "", footer: [],
  };
  let last: string[] = sb.misc;
  const put = (list: string[], html: string) => { list.push(html); last = list; };

  for (const n of top) {
    if (hasClass(n, "sidebar-header")) [sb.logo, sb.logoAlt] = logoOf(n.inner, game);
    else if (idOf(n) === "filters-container") sb.categories = n.html;
    else if (hasClass(n, "section")) {
      for (const c of children(n.inner)) {
        const id = idOf(c);
        if (c.tag === "script") { last.push(c.html); continue; } // встроенный скрипт — рядом со своим элементом
        if (hasClass(c, "section-label")) continue; // подписи полей ставит компонент
        if (hasClass(c, "map-switch") || id === "map-select") { sb.fields.push({ kind: "map", html: c.html, wrap: true }); last = []; continue; }
        if (id === "region-select" || hasClass(c, "zone-switch")) { sb.fields.push({ kind: "area", html: c.html, wrap: true }); last = []; continue; }
        if (id === "zone-block") {
          // блок зон Dimraeth сам скрывается/показывается (атрибут hidden): он и есть поле, подпись — своя
          const [inner] = pluck(c.inner, (x) => hasClass(x, "section-label"));
          sb.fields.push({ kind: "area", html: c.open + inner + "</div>", wrap: false });
          last = [];
          continue;
        }
        if (hasClass(c, "progress-card")) { sb.progress = c.html; last = []; continue; }
        if (hasClass(c, "search-wrap")) {
          const [rest, hints] = pluck(c.inner, (x) => hasClass(x, "search-hint"));
          sb.search = c.open + rest + "</div>";
          sb.hint = hints.map((h) => h.inner.trim()).join(" ");
          last = [];
          continue;
        }
        if (hasClass(c, "focus-banner")) { put(sb.active, c.html); continue; }
        if (hasClass(c, "level-filter")) { put(sb.extra, c.html); continue; }
        if (hasClass(c, "btn-group") || hasClass(c, "io-row") || ["add-marker-btn", "import-progress-input", "io-status"].includes(id)) { put(sb.actions, c.html); continue; }
        put(sb.misc, c.html);
      }
    } else put(sb.footer, n.html); // подпись источника данных, «О карте» и прочее — внизу, в исходном порядке
  }
  return sb;
}
