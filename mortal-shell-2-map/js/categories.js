// Mortal Shell II — категории меток (положение, названия и иконки — MapGenie, русский текст — lootiq.ru и свой перевод; сгенерировано tools/build_data.py).
// key — ключ категории; icon — [x, y] значка 96×96 в ../icons.png (белые глифы, спрайт 5280×96);
// track: false — метка не входит в общий прогресс; dot — мелкая метка-точка; hidden — скрыта при первом открытии;
// ink — цвет значка на светлой метке; about — описание категории (показывается в окне метки).

const CATEGORIES = [
    { title: "Точки интереса", items: [
        {"key": "area", "name": "Местности", "icon": [0, 0], "color": "#9a8f84", "track": false, "hidden": true},
        {"key": "beacon", "name": "Светочи", "icon": [96, 0], "color": "#9a8f84"},
        {"key": "gate", "name": "Врата", "icon": [192, 0], "color": "#9a8f84"},
        {"key": "dungeon", "name": "Подземелья", "icon": [288, 0], "color": "#9a8f84"},
        {"key": "bone_gate", "name": "Костяные врата", "icon": [384, 0], "color": "#9a8f84"},
        {"key": "corrupted_statue", "name": "Осквернённые статуи", "icon": [480, 0], "color": "#9a8f84"},
        {"key": "small_beacon", "name": "Малые светочи", "icon": [576, 0], "color": "#9a8f84"},
        {"key": "ghost_beacon", "name": "Призрачные светочи", "icon": [672, 0], "color": "#9a8f84"}
    ] },
    { title: "Предметы", items: [
        {"key": "key", "name": "Ключи", "icon": [768, 0], "color": "#b08d57"},
        {"key": "map_fragment", "name": "Фрагменты карты", "icon": [864, 0], "color": "#b08d57"},
        {"key": "key_item", "name": "Ключевые предметы", "icon": [960, 0], "color": "#b08d57"},
        {"key": "chest", "name": "Сундуки", "icon": [1056, 0], "color": "#b08d57"},
        {"key": "offering_chest", "name": "Сундуки подношения", "icon": [1152, 0], "color": "#b08d57"},
        {"key": "ovum", "name": "Плоды", "icon": [1248, 0], "color": "#b08d57"},
        {"key": "valuable", "name": "Предметы для продажи", "icon": [1344, 0], "color": "#b08d57"}
    ] },
    { title: "ПП-предметы", items: [
        {"key": "weltcap", "name": "Мухоморы", "icon": [1440, 0], "color": "#9a6fb3"},
        {"key": "moonshine", "name": "Обычный самогон", "icon": [1536, 0], "color": "#9a6fb3"},
        {"key": "burnt_effigy", "name": "Обгоревшие фигурки", "icon": [1632, 0], "color": "#9a6fb3"},
        {"key": "tarspore", "name": "Тарницы", "icon": [1728, 0], "color": "#9a6fb3"},
        {"key": "martyrs_ash", "name": "Прах Великомученика", "icon": [1824, 0], "color": "#9a6fb3"},
        {"key": "bloodseed", "name": "Семена крови", "icon": [1920, 0], "color": "#9a6fb3"},
        {"key": "galvanic_shard", "name": "Гальванические осколки", "icon": [2016, 0], "color": "#9a6fb3"},
        {"key": "sheephead_totem", "name": "Овцеглавые тотемы", "icon": [2112, 0], "color": "#9a6fb3"},
        {"key": "grisha_remnant", "name": "Останки гриши", "icon": [2208, 0], "color": "#9a6fb3"},
        {"key": "mango", "name": "Манго", "icon": [2304, 0], "color": "#9a6fb3"},
        {"key": "scripture", "name": "Парадоксальные писания", "icon": [2400, 0], "color": "#9a6fb3"}
    ] },
    { title: "Снаряжение", items: [
        {"key": "tarstone", "name": "Тариты", "icon": [2496, 0], "color": "#4f9a6a"},
        {"key": "shell", "name": "Оболочки", "icon": [2592, 0], "color": "#4f9a6a"},
        {"key": "weapon", "name": "Оружие", "icon": [2688, 0], "color": "#4f9a6a"},
        {"key": "sidearm", "name": "Самострелы", "icon": [2784, 0], "color": "#4f9a6a"},
        {"key": "seal", "name": "Печати", "icon": [2880, 0], "color": "#4f9a6a"},
        {"key": "shade", "name": "Оттенки", "icon": [2976, 0], "color": "#4f9a6a"},
        {"key": "fragile_tarstone", "name": "Хрупкие тариты", "icon": [3072, 0], "color": "#4f9a6a"},
        {"key": "mask", "name": "Маски", "icon": [3168, 0], "color": "#4f9a6a"},
        {"key": "mortal_clothing", "name": "Одежда смертного", "icon": [3264, 0], "color": "#4f9a6a"}
    ] },
    { title: "Задания", items: [
        {"key": "quest", "name": "Задания", "icon": [3360, 0], "color": "#b9b84a"}
    ] },
    { title: "Материалы для улучшения", items: [
        {"key": "smithing_stone", "name": "Кузнечные камни", "icon": [3456, 0], "color": "#5fa3b0"},
        {"key": "revered_gland", "name": "Железы Всечтимого", "icon": [3552, 0], "color": "#5fa3b0"},
        {"key": "synaptic_vessel", "name": "Синаптические сосуды", "icon": [3648, 0], "color": "#5fa3b0"},
        {"key": "glimpse", "name": "Отсветы", "icon": [3744, 0], "color": "#5fa3b0"}
    ] },
    { title: "Персонажи", items: [
        {"key": "npc", "name": "НИП", "icon": [3840, 0], "color": "#d9822b", "track": false},
        {"key": "merchant", "name": "Торговцы", "icon": [3936, 0], "color": "#d9822b", "track": false}
    ] },
    { title: "Записи", items: [
        {"key": "tattered_note", "name": "Потрёпанные записки", "icon": [4032, 0], "color": "#6a5cc0"},
        {"key": "journal", "name": "Дневники", "icon": [4128, 0], "color": "#6a5cc0"},
        {"key": "tattered_page", "name": "Потрёпанные страницы", "icon": [4224, 0], "color": "#6a5cc0"},
        {"key": "portrait", "name": "Портреты", "icon": [4320, 0], "color": "#6a5cc0"},
        {"key": "engraving", "name": "Гравюры", "icon": [4416, 0], "color": "#6a5cc0"}
    ] },
    { title: "Боссы", items: [
        {"key": "major_boss", "name": "Боссы", "icon": [4512, 0], "color": "#c8443a"},
        {"key": "boss", "name": "Мини-боссы", "icon": [4608, 0], "color": "#c8443a"}
    ] },
    { title: "Прочее", items: [
        {"key": "offering_candle", "name": "Свечи подношения", "icon": [4704, 0], "color": "#8a8a8a"},
        {"key": "stone_platform", "name": "Платформы для прыжка", "icon": [4800, 0], "color": "#8a8a8a"},
        {"key": "locked_door", "name": "Запертые двери", "icon": [4896, 0], "color": "#8a8a8a"},
        {"key": "misc", "name": "Разное", "icon": [4992, 0], "color": "#8a8a8a", "track": false},
        {"key": "corruption", "name": "Барьеры скверны", "icon": [5088, 0], "color": "#8a8a8a"},
        {"key": "coins", "name": "Монеты", "icon": [5184, 0], "color": "#8a8a8a"}
    ] }
];

const CAT_BY_KEY = {};
CATEGORIES.forEach(g => g.items.forEach(c => { CAT_BY_KEY[c.key] = c; }));

// Спрайт цветных значков MapGenie: для меню и поиска — фон CSS, для меток — canvas (app.js, drawIcon)
const ICON_SHEET = { url: "icons.png?v=3", w: 5280, h: 96, cell: 96 };
const ICON_IMG = new Image();
ICON_IMG.src = ICON_SHEET.url;
function iconSvg(icon, fill) {
    if (!Array.isArray(icon)) return "";
    const px = icon[0] / (ICON_SHEET.w - ICON_SHEET.cell) * 100, py = ICON_SHEET.h > ICON_SHEET.cell ? icon[1] / (ICON_SHEET.h - ICON_SHEET.cell) * 100 : 0;
    return `<span class="ms2-glyph" aria-hidden="true" style="--gx:${px.toFixed(3)}%;--gy:${py.toFixed(3)}%"></span>`;
}
