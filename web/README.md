# Сайт на Next.js + Tailwind + shadcn/ui

Исходник страниц broskiplay.ru, собранных Next (статический экспорт). Дизайн главной — образец: шапка, навигация
и подвал (`components/shell/`, стили `/css/shell.css`) общие для всех страниц, у каждой игры остаётся своя палитра
(`<html data-game>` + `css/spatial.css`). Tailwind без preflight (только theme + utilities, в слоях), токены shadcn — `--ui-*`.

## Что собирается

- `app/(home)/` — главная (блоки — `components/home/`, стили — `/css/home-neo.css`).
- `app/(map)/[game]/` — страницы карт `/<игра>-map/`, `app/(loc)/[game]/[map]/` — страницы локаций `/<игра>-map/<карта>/`
  (раньше их копировал `scripts/map_pages.py`). Источник — `../<игра>-map/index.html`: `lib/maps.ts` берёт оттуда `<head>`,
  разметку карты и список скриптов, верхнее меню карты (`mtb`) заменяется общей шапкой. Движок карты (`js/app.js` игры,
  `js/bp-map.js`, `map-core`, `map-extras`, `map-ux`) не переписан — `components/shell/legacy-scripts.tsx` подключает
  его после гидратации в прежнем порядке. Раскладка карты в каркасе — в конце `css/map-base.css` (`.bx-map`).

- `app/(page)/<страница>/` — отдельные страницы: `/updates/`, `/cabinet/`, `/fixes/`, `/reports/`, `/design/`, `/privacy.html`,
  `/404.html` (маршрут `page-404`; `assemble.mjs` кладёт `privacy` и `page-404` по прежним адресам). Как у карт, исходник — прежний
  HTML в корне (`updates/index.html`, `privacy.html`, `404.html`…), его правят как раньше; `lib/pages.ts` берёт `<head>`, тело и
  скрипты (встроенные `<script>` тоже — выполняются после гидратации по порядку), старое меню `topbar` (site_menu.py) выбрасывается.
- `app/(wrap)/wrap/[kind]/` — шаблон каркаса для базы данных `/db/` (по одному на игру: `db`, `db-<игра>`) и для страниц
  категорий `/<игра>-map/c/` (`c-<игра>-map`, их генерирует `scripts/category_pages.py`). Страницы базы
  (16 тыс.) по-прежнему генерирует `scripts/db_pages.py`; `scripts/assemble.mjs` вставляет их `<head>` и тело в шаблон.
  Каркас там статичный (скрипты Next убираются, чтобы не утяжелять 16 тыс. страниц): поиск игры — `/js/shell-lite.js`,
  вход — `/js/auth-lite.js`. Сам шаблон в `_site` не попадает. Правки раскладки базы в каркасе — `html[data-shell]` в `css/db.css`.

## Команды

- `npm ci && npm run build` — `next build` + `scripts/install-home.mjs` (кладёт главную `out/index.html` и `out/_next` в корень,
  чтобы её можно было открыть и без `_site`).
- `npm run site` — `scripts/assemble.mjs` собирает готовый сайт в `../_site/`: файлы из корня + страницы Next поверх.
  Исходные `<игра>-map/index.html` в корне не трогаются. Проверка: `python3 -m http.server -d _site`.
- На GitHub: `.github/workflows/pages.yml` — генераторы (`category_pages.py`, `db_pages.py`), потом `build` и `site`, выкладывается `_site/`.

## Данные при сборке

`data/home-games.json` (карточки игр; `python3 scripts/prerender_home.py`), `../data/changelog.json`, `../data/goal.json`,
`../<игра>-map/index.html` и `js/app.js` / `js/maps.js` (список карт игры для страниц локаций).

При смене подключаемых css/js поднимай `?v=` в странице, где они подключены (`app/(home)/page.tsx`, `<игра>-map/index.html`).
`index.html` в корне и всё в `_site/` — результат сборки, руками не править.
