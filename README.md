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

Игр: **11** · карт: **45** · меток: **37 680**

| | Игра | Карт | Меток | Открыть |
| :---: | --- | :---: | :---: | :---: |
| 🌌 | **Stellar Blade** | 9 | 2 325 | [Открыть →](https://broskiplay.ru/stellar-blade-map/) |
| ⚔️ | **Tainted Grail: The Fall of Avalon** | 4 | 4 422 | [Открыть →](https://broskiplay.ru/tainted-grail-map/) |
| 🏔️ | **Gothic 1 Remake** | 1 | 1 714 | [Открыть →](https://broskiplay.ru/gothic-remake-map/) |
| 🗡️ | **Dimraeth** | 4 | 3 253 | [Открыть →](https://broskiplay.ru/dimraeth-map/) |
| 🐾 | **Palworld** | 1 | 11 114 | [Открыть →](https://broskiplay.ru/palworld-map/) |
| 📜 | **The Elder Scrolls IV: Oblivion Remastered** | 2 | 1 703 | [Открыть →](https://broskiplay.ru/oblivion-remake-map/) |
| 🐉 | **The Elder Scrolls V: Skyrim** | 2 | 2 802 | [Открыть →](https://broskiplay.ru/skyrim-map/) |
| 🐺 | **Ведьмак 3: Дикая Охота** | 10 | 3 186 | [Открыть →](https://broskiplay.ru/witcher3-map/) |
| 🌃 | **Cyberpunk 2077** | 1 | 2 602 | [Открыть →](https://broskiplay.ru/cyberpunk2077-map/) |
| 🪄 | **Hogwarts Legacy** | 3 | 2 061 | [Открыть →](https://broskiplay.ru/hogwarts-legacy-map/) |
| 🏮 | **Phantom Blade Zero** | 8 | 2 498 | [Открыть →](https://broskiplay.ru/phantom-blade-zero-map/) |

---

## ✨ Возможности

- ✅ **Отметки и прогресс.** Найденное отмечается кнопкой в карточке метки или правой кнопкой мыши; прогресс считается по категориям и по каждой карте.
- 🔎 **Поиск и фильтры.** Поиск по названию, описанию и категории; категории включаются и скрываются, отмеченное можно спрятать.
- ➕ **Свои метки** — видны только вам.
- ☁️ **Сохранение.** Всё хранится в браузере и работает без аккаунта; после входа через Google синхронизируется между устройствами. Есть экспорт и импорт в JSON.
- 📖 **Страницы категорий.** Сколько меток и где искать, кнопка «Открыть на карте».
- 🔗 **Ссылки.** `?marker=<id>` открывает карту на нужной метке, `?cat=<ключ>` — с одной категорией.
- 🛠️ **Исправления.** Правки по сообщениям игроков публикуются на странице [/fixes/](https://broskiplay.ru/fixes/).

---

## 🚀 Запуск локально

Сборка не нужна — это статические HTML, CSS и JavaScript. Запустите HTTP-сервер из корня репозитория и откройте <http://localhost:8000/>:

```bash
python3 -m http.server 8000
```

> [!WARNING]
> Не открывайте `index.html` двойным кликом: по адресу `file://` браузер блокирует `fetch`, и карта останется пустой.

Leaflet и Firebase подключаются с CDN, поэтому нужен интернет.

---

## 🧰 Устройство

- **Игра** — папка `<игра>-map/` со своими `index.html`, `js/app.js`, `js/categories.js`, стилями и метками в `data/*.json`. Если данные собираются скриптом, он лежит в `<игра>-map/tools/`.
- **Общий код** — в корне: `js/map-core.js`, `js/map-extras.js`, `css/map-nm.css`, `css/sidebar-common.css`, `css/spatial.css`.
- **Тайлы и картинки** — в отдельных репозиториях `broskiplay/<игра>-assets` (GitHub Pages).
- **Публикация — только через `scripts/publish.sh`.** Страницы локаций и категорий в git не хранятся, скрипт создаёт их перед публикацией.
- **Числа в таблице выше** обновляет `python3 scripts/build_readme.py`. Для новой игры добавьте в таблицу одну строку.
- **Стек:** [Leaflet](https://leafletjs.com/) (метки на canvas), [Firebase](https://firebase.google.com/) Authentication и Cloud Firestore, GitHub Pages.

<div align="center">

<sub>Сделано с ❤️ для охотников за коллекциями · <a href="https://broskiplay.ru/">broskiplay.ru</a></sub>

</div>
