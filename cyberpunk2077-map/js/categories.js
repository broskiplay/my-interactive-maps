// Cyberpunk 2077 — категории меток (названия, описания и иконки — etalongame.com; сгенерировано tools/build_data.py).
// key — ключ категории; icon — [x, y] значка 44×44 в ../icons.png (белые глифы, спрайт 2048×112);
// track: false — метка не входит в общий прогресс; dot — мелкая метка-точка; hidden — скрыта при первом открытии;
// ink — цвет значка на светлой метке; about — описание категории (показывается в окне метки).

const CATEGORIES = [
    { title: "Места", items: [
        {"key": "apartment", "name": "Квартира", "icon": [8, 8], "color": "#1fd1e8", "about": "Новые квартиры можно покупать со второго акта."},
        {"key": "fast_travel", "name": "Быстрое перемещение", "icon": [580, 8], "color": "#1fd1e8"},
        {"key": "metro", "name": "Станция метро", "icon": [1152, 8], "color": "#1fd1e8", "about": "Другой способ быстрого перемещения, доступный со второго акта."}
    ] },
    { title: "Коллекционные предметы", items: [
        {"key": "crafting_spec", "name": "Документация", "icon": [1724, 8], "color": "#ff9a2e"},
        {"key": "decoration", "name": "Украшение", "icon": [268, 60], "color": "#ff9a2e", "about": "Появляется в квартире Ви."},
        {"key": "free_vehicle", "name": "Бесплатный транспорт", "icon": [476, 60], "color": "#ff9a2e", "about": "Транспорт, который бесплатно добавляется в вашу коллекцию."},
        {"key": "stash", "name": "Схрон", "icon": [528, 60], "color": "#ff9a2e", "about": "Неотмеченная добыча, возле которой окружение нередко рассказывает интересную историю."},
        {"key": "iconic_clothing", "name": "Культовая одежда", "icon": [580, 60], "color": "#ff9a2e"},
        {"key": "iconic_cyberware", "name": "Культовый имплант", "icon": [632, 60], "color": "#ff9a2e"},
        {"key": "iconic_weapon", "name": "Культовое оружие", "icon": [60, 8], "color": "#ff9a2e", "about": "Культовое оружие обладает уникальными свойствами, но в него нельзя устанавливать оружейные модификации."},
        {"key": "relic_skill", "name": "Чип способности", "icon": [112, 8], "color": "#ff9a2e"},
        {"key": "militech_terminal", "name": "Терминал с секретными данными", "icon": [164, 8], "color": "#ff9a2e", "about": "Даёт очки для дерева навыков биочипа, доступного после начала задания Неизвестная земля."},
        {"key": "special_clothing", "name": "Особая одежда", "icon": [216, 8], "color": "#ff9a2e", "about": "Цельные комплекты, которые надеваются через слот костюма, либо отдельные предметы уникальной одежды."},
        {"key": "tarot", "name": "Карта таро", "icon": [268, 8], "color": "#ff9a2e"},
        {"key": "iconic_quickhack", "name": "Культовый скрипт", "icon": [320, 8], "color": "#ff9a2e"}
    ] },
    { title: "Задания и занятия", items: [
        {"key": "cargo", "name": "Груз", "icon": [372, 8], "color": "#f3e600", "ink": "#1b1a05"},
        {"key": "cyberpsycho_dogtown", "name": "Кибернаркоман", "icon": [424, 8], "color": "#f3e600", "ink": "#1b1a05", "about": "Киберпсихопаты, встречающиеся по всему Пёсьему городу. С ними не связано заданий, а награды за их обезвреживание нет — независимо от того, оставите ли вы их в живых."},
        {"key": "cyberpsycho", "name": "Приступ киберпсихоза", "icon": [476, 8], "color": "#f3e600", "ink": "#1b1a05", "about": "Появляются по всему Найт-Сити после начала задания Анатомия убийства. Обезвреживайте их, не убивая, чтобы получить большую награду."},
        {"key": "gig", "name": "Заказ", "icon": [528, 8], "color": "#f3e600", "ink": "#1b1a05", "about": "Некоторые заказы появляются только после выполнения других."},
        {"key": "main_job", "name": "Основное задание", "icon": [632, 8], "color": "#f3e600", "ink": "#1b1a05"},
        {"key": "ncpd", "name": "Заявка на расследование", "icon": [684, 8], "color": "#f3e600", "ink": "#1b1a05"},
        {"key": "side_job", "name": "Второстепенное задание", "icon": [736, 8], "color": "#f3e600", "ink": "#1b1a05", "about": "Награда:\nОпытРепутацияЕвродоллары"},
        {"key": "vehicle_job", "name": "Транспортный заказ", "icon": [788, 8], "color": "#f3e600", "ink": "#1b1a05", "about": "Появляются в определённых местах, но не всегда."},
        {"key": "criminal", "name": "Преступная деятельность", "icon": [840, 8], "color": "#f3e600", "ink": "#1b1a05", "about": "Здесь ценные предметы охраняют сильные враги."}
    ] },
    { title: "Услуги", items: [
        {"key": "autofixer", "name": "Терминал «Автофиксера»", "icon": [892, 8], "color": "#b07cff", "track": false, "about": "Здесь можно купить транспорт."},
        {"key": "bar", "name": "Бар", "icon": [944, 8], "color": "#b07cff", "track": false, "hidden": true},
        {"key": "contraband", "name": "Торговец контрабандой", "icon": [996, 8], "color": "#b07cff", "track": false},
        {"key": "clothing_store", "name": "Одежда", "icon": [1048, 8], "color": "#b07cff", "track": false, "hidden": true},
        {"key": "dropbox", "name": "Почтомат", "icon": [1100, 8], "color": "#b07cff", "track": false, "hidden": true},
        {"key": "fixer", "name": "Фиксер", "icon": [1204, 8], "color": "#b07cff", "track": false},
        {"key": "food", "name": "Еда и рестораны", "icon": [1256, 8], "color": "#b07cff", "track": false, "hidden": true},
        {"key": "sex_worker", "name": "Секс-работник", "icon": [1308, 8], "color": "#b07cff", "track": false, "hidden": true},
        {"key": "junk_shop", "name": "Лавка старьёвщика", "icon": [1360, 8], "color": "#b07cff", "track": false, "hidden": true},
        {"key": "medpoint", "name": "Аптека", "icon": [1412, 8], "color": "#b07cff", "track": false, "hidden": true},
        {"key": "melee_vendor", "name": "Продавец оружия ближнего боя", "icon": [1464, 8], "color": "#b07cff", "track": false},
        {"key": "netrunner", "name": "Нетраннер", "icon": [1516, 8], "color": "#b07cff", "track": false},
        {"key": "ripperdoc", "name": "Рипер", "icon": [1568, 8], "color": "#b07cff", "track": false, "about": "Здесь можно улучшить, установить или снять импланты."},
        {"key": "weapon_shop", "name": "Магазин оружия", "icon": [1620, 8], "color": "#b07cff", "track": false},
        {"key": "glamour", "name": "Глэмер", "icon": [1672, 8], "color": "#b07cff", "track": false, "about": "Здесь можно изменить внешний вид и окраску имплантов."}
    ] },
    { title: "Чипы", items: [
        {"key": "shard_articles", "name": "Статьи", "icon": [1776, 8], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_cyberpsycho", "name": "Киберпсихопат", "icon": [1828, 8], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_encrypted", "name": "Данные зашифрованы", "icon": [1880, 8], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_flyers", "name": "Листовки", "icon": [1932, 8], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_works", "name": "Произведения", "icon": [1984, 8], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_notes", "name": "Заметки", "icon": [8, 60], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_other", "name": "Прочее", "icon": [60, 60], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_citizens", "name": "Жители Найт-Сити", "icon": [112, 60], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_poetry", "name": "Поэзия", "icon": [164, 60], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_religion", "name": "Религия и философия", "icon": [216, 60], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_tech", "name": "Технологии", "icon": [320, 60], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true},
        {"key": "shard_world", "name": "Мир", "icon": [372, 60], "color": "#2ee6a6", "ink": "#04221a", "dot": true, "hidden": true}
    ] },
    { title: "Прочее", items: [
        {"key": "easter_egg", "name": "Пасхалка", "icon": [424, 60], "color": "#ff3d8b"}
    ] }
];

const CAT_BY_KEY = {};
CATEGORIES.forEach(g => g.items.forEach(c => { CAT_BY_KEY[c.key] = c; }));

// Спрайт иконок: для меню и поиска — CSS-маска (цвет значка задаёт фон), для пинов — canvas (app.js, drawIcon)
const ICON_SHEET = { url: "icons.png?v=1", w: 2048, h: 112, cell: 44 };
const ICON_IMG = new Image();
ICON_IMG.src = ICON_SHEET.url;
function iconSvg(icon, fill) {
    if (!Array.isArray(icon)) return "";
    const px = icon[0] / (ICON_SHEET.w - ICON_SHEET.cell) * 100, py = icon[1] / (ICON_SHEET.h - ICON_SHEET.cell) * 100;
    return `<span class="cp-glyph" aria-hidden="true" style="--gx:${px.toFixed(3)}%;--gy:${py.toFixed(3)}%${fill ? `;background:${fill}` : ""}"></span>`;
}
