<div align="center">

# 🗺️ BroskiPlay — Интерактивные карты

**Отмечайте найденное, синхронизируйте прогресс между устройствами и ничего не пропускайте.**

[![Сайт](https://img.shields.io/badge/🌐_Сайт-broskiplay.ru-54dcff?style=for-the-badge)](https://broskiplay.ru/)
[![Twitch](https://img.shields.io/badge/Twitch-broskiplay-9146FF?style=for-the-badge&logo=twitch&logoColor=white)](https://www.twitch.tv/broskiplay)
[![YouTube](https://img.shields.io/badge/YouTube-@broskiplayt-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@broskiplayt)
[![Поддержать](https://img.shields.io/badge/💝_Поддержать-DonationAlerts-D97706?style=for-the-badge)](https://www.donationalerts.com/r/broskiplay)

</div>

---

## 📍 Карты

Интерактивные карты игровых миров на русском: открыл, отметил найденное, закрыл.

Игр: **15** · карт: **105** · меток: **66 140**

| | Игра | Карт | Меток | Открыть |
| :---: | --- | :---: | :---: | :---: |
| 🌌 | **Stellar Blade** | 9 | 2 325 | [Открыть →](https://broskiplay.ru/stellar-blade-map/) |
| ⚔️ | **Tainted Grail: The Fall of Avalon** | 4 | 4 657 | [Открыть →](https://broskiplay.ru/tainted-grail-map/) |
| 🏔️ | **Gothic 1 Remake** | 1 | 1 714 | [Открыть →](https://broskiplay.ru/gothic-remake-map/) |
| 🗡️ | **Dimraeth** | 4 | 3 253 | [Открыть →](https://broskiplay.ru/dimraeth-map/) |
| 🐾 | **Palworld** | 1 | 11 114 | [Открыть →](https://broskiplay.ru/palworld-map/) |
| 📜 | **The Elder Scrolls IV: Oblivion Remastered** | 2 | 1 703 | [Открыть →](https://broskiplay.ru/oblivion-remake-map/) |
| 🐉 | **The Elder Scrolls V: Skyrim** | 2 | 2 802 | [Открыть →](https://broskiplay.ru/skyrim-map/) |
| 🐺 | **Ведьмак 3: Дикая Охота** | 10 | 3 186 | [Открыть →](https://broskiplay.ru/witcher3-map/) |
| 🌃 | **Cyberpunk 2077** | 1 | 2 602 | [Открыть →](https://broskiplay.ru/cyberpunk2077-map/) |
| 🪄 | **Hogwarts Legacy** | 3 | 2 061 | [Открыть →](https://broskiplay.ru/hogwarts-legacy-map/) |
| 🏮 | **Phantom Blade Zero** | 8 | 2 498 | [Открыть →](https://broskiplay.ru/phantom-blade-zero-map/) |
| 🤠 | **Red Dead Redemption 2** | 1 | 5 523 | [Открыть →](https://broskiplay.ru/rdr2-map/) |
| 🌴 | **Grand Theft Auto VI** | 1 | 2 532 | [Открыть →](https://broskiplay.ru/gta6-map/) |
| 🗡️ | **Mortal Shell II** | 1 | 1 724 | [Открыть →](https://broskiplay.ru/mortal-shell-2-map/) |
| 🏛️ | **Silver Palace** | 1 | 2 089 | [Открыть →](https://broskiplay.ru/silver-palace-map/) |
| ⚔️ | **DragonSword: Awakening** | 57 | 18 081 | [Открыть →](https://broskiplay.ru/dragonsword-awakening-map/) |

---

## ✨ Возможности

- ✅ **Отметки и прогресс.** Найденное отмечается кнопкой в карточке метки или правой кнопкой мыши; прогресс считается по категориям и по каждой карте.
- 🔎 **Поиск и фильтры.** Поиск по названию, описанию и категории; категории включаются и скрываются, отмеченное можно спрятать.
- ➕ **Свои метки** — видны только вам.
- ☁️ **Сохранение.** Всё хранится в браузере и работает без аккаунта; после входа через Google синхронизируется между устройствами. Есть экспорт и импорт в JSON.
- 📖 **Страницы категорий.** Сколько меток и где искать, кнопка «Открыть на карте».
- 🔗 **Ссылки.** `?marker=<id>` открывает карту на нужной метке, `?cat=<ключ>` — с одной категорией.
- 📚 **База данных.** Справочники по играм ([/db/](https://broskiplay.ru/db/)): предметы, задания, существа, персонажи, локации — тексты из файлов игры; у записей ссылки на точные метки на карте, а на карте — мини-карта «Где найти».
- 🆕 **Что нового.** История обновлений — на странице [/updates/](https://broskiplay.ru/updates/).
- 📱 **PWA.** Сайт можно установить как приложение; тайлы карт кэшируются service worker'ом (`sw.js`).
- 🛠️ **Исправления.** Правки по сообщениям игроков публикуются на странице [/fixes/](https://broskiplay.ru/fixes/).

---

## 🚀 Запуск локально

Сайт собирается: генераторы на Python (stdlib) делают страницы категорий и базы данных, Next.js (`web/`) — главную, страницы карт и общий каркас, а `npm run site` складывает всё в `_site/`. Нужны Python 3.12+ и Node.js 22.

```bash
python3 scripts/category_pages.py && python3 scripts/db_pages.py   # страницы категорий и базы (db/)
npm ci --prefix web && npm run build --prefix web && npm run site --prefix web   # → _site/
python3 scripts/check_links.py                                      # битые локальные ссылки
python3 -m http.server 8000 -d _site                                # http://localhost:8000/
```

Корневой `index.html` и страницы в `_site/` руками не правьте — они пересобираются (подробно — [web/README.md](web/README.md) и [web/ARCHITECTURE.md](web/ARCHITECTURE.md)).

> [!WARNING]
> Не открывайте `index.html` двойным кликом: по адресу `file://` браузер блокирует `fetch`, и карта останется пустой.

Firebase подключается с CDN, а тайлы и картинки загружаются из репозиториев `*-assets`, поэтому нужен интернет.

---

## 🧰 Устройство

- **Игра** — папка `<игра>-map/` со своими `index.html`, `js/app.js`, `js/categories.js`, стилями и метками в `data/*.json`. Если данные собираются скриптом, он лежит в `<игра>-map/tools/`.
- **Общий код** — в корне: движок карт на MapLibre `js/bp-map.js` (библиотека в `vendor/maplibre/`), `js/map-core.js`, `js/map-extras.js` (регионы, заметки, горячие клавиши и др.), `css/map-nm.css`, `css/sidebar-common.css`, `css/spatial.css` (тема и токены `--sp-*`, образец — `/design/`).
- **База данных** — `data/db/` и `scripts/db_pages.py`; страницы `db/` генерируются. Извлечение данных из файлов игр (`tools/tg_db`, `tools/sk_db`, `tools/g1r_db`) и часть утилит `scripts/` хранятся только локально у автора: из репозитория сайт собирается полностью, но заново выгрузить данные из игр нельзя.
- **Служебное:** `scripts/seo.py`, `scripts/site_menu.py`, `scripts/changelog.py` + `data/changelog.json`, `data/goal.json` (цель сбора на главной), `llms.txt`, `sitemap.xml`.
- **Тайлы и картинки** — в отдельных репозиториях `broskiplay/<игра>-assets` (GitHub Pages).
- **Публикация — только через `scripts/publish.sh`.** Страницы локаций, категорий и базы данных (`db/`) в git не хранятся: их собирает GitHub Actions ([.github/workflows/pages.yml](.github/workflows/pages.yml)) при каждом push в `main`.
- **Числа в таблице выше** обновляет `python3 scripts/build_readme.py`. Для новой игры добавьте в таблицу одну строку.
- **Стек:** [MapLibre GL](https://maplibre.org/), [Firebase](https://firebase.google.com/) Authentication и Cloud Firestore, GitHub Pages.

<div align="center">

<sub>Сделано с ❤️ для охотников за коллекциями · <a href="https://broskiplay.ru/">broskiplay.ru</a></sub>

</div>
