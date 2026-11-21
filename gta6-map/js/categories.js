// GTA 6 — категории меток (положение, названия и иконки — MapGenie, русские описания — gta6map.io; сгенерировано tools/build_data.py).
// key — ключ категории; icon — [x, y] значка 96×96 в ../icons.png (белые глифы, спрайт 7776×96);
// track: false — метка не входит в общий прогресс; dot — мелкая метка-точка; hidden — скрыта при первом открытии;
// ink — цвет значка на светлой метке; about — описание категории (показывается в окне метки).

const CATEGORIES = [
    { title: "Интересные места", items: [
        {"key": "atm", "name": "Банкоматы", "icon": [0, 0], "color": "#3f8fd8", "track": false, "hidden": true},
        {"key": "gym", "name": "Спортзалы", "icon": [96, 0], "color": "#3f8fd8", "track": false},
        {"key": "club", "name": "Клубы", "icon": [192, 0], "color": "#3f8fd8", "track": false},
        {"key": "ammunation", "name": "Ammu-Nation", "icon": [288, 0], "color": "#3f8fd8", "track": false}
    ] },
    { title: "Спорт", items: [
        {"key": "basketball", "name": "Баскетбольные кольца", "icon": [384, 0], "color": "#5a74e0"},
        {"key": "golf", "name": "Поля для гольфа", "icon": [480, 0], "color": "#5a74e0"},
        {"key": "minigolf", "name": "Мини-гольф", "icon": [576, 0], "color": "#5a74e0"},
        {"key": "pool", "name": "Бильярдные столы", "icon": [672, 0], "color": "#5a74e0"}
    ] },
    { title: "Развлечения", items: [
        {"key": "shooting_range", "name": "Тиры", "icon": [768, 0], "color": "#b0558f"},
        {"key": "arcade", "name": "Игровые автоматы", "icon": [864, 0], "color": "#b0558f"},
        {"key": "fishing", "name": "Места для рыбалки", "icon": [960, 0], "color": "#b0558f"}
    ] },
    { title: "Трюки", items: [
        {"key": "stunt_jump", "name": "Трюковые прыжки", "icon": [1056, 0], "color": "#e05252"},
        {"key": "base_jump", "name": "Бейс-прыжки", "icon": [1152, 0], "color": "#e05252"},
        {"key": "knife_flight", "name": "Пролёты на ребре", "icon": [1248, 0], "color": "#e05252"},
        {"key": "under_bridge", "name": "Пролёты под мостами", "icon": [1344, 0], "color": "#e05252"}
    ] },
    { title: "Ограбления", items: [
        {"key": "bank", "name": "Банки", "icon": [1440, 0], "color": "#2e9e62"},
        {"key": "big_bank", "name": "Крупные банки", "icon": [1536, 0], "color": "#2e9e62"},
        {"key": "payday_loan", "name": "Займы до зарплаты", "icon": [1632, 0], "color": "#2e9e62"},
        {"key": "jewelry_low", "name": "Недорогие ювелирные", "icon": [1728, 0], "color": "#2e9e62"},
        {"key": "jewelry_high", "name": "Элитные ювелирные", "icon": [1824, 0], "color": "#2e9e62"},
        {"key": "pawn_shop", "name": "Ломбарды", "icon": [1920, 0], "color": "#2e9e62"},
        {"key": "atm_towable", "name": "Банкоматы для эвакуации", "icon": [2016, 0], "color": "#2e9e62"},
        {"key": "convenience", "name": "Круглосуточные магазины", "icon": [2112, 0], "color": "#2e9e62"},
        {"key": "fast_food", "name": "Фастфуд", "icon": [2208, 0], "color": "#2e9e62", "track": false},
        {"key": "liquor", "name": "Алкомаркеты", "icon": [2304, 0], "color": "#2e9e62"},
        {"key": "fence", "name": "Скупщики краденого", "icon": [2400, 0], "color": "#2e9e62", "track": false},
        {"key": "safe", "name": "Сейфы", "icon": [2496, 0], "color": "#2e9e62"}
    ] },
    { title: "Транспорт", items: [
        {"key": "pay_n_spray", "name": "Pay 'n' Spray", "icon": [2592, 0], "color": "#e0782c", "track": false},
        {"key": "mod_shop", "name": "Тюнинг-ателье", "icon": [2688, 0], "color": "#e0782c", "track": false},
        {"key": "gas_station", "name": "Заправки", "icon": [2784, 0], "color": "#e0782c", "track": false},
        {"key": "car_wash", "name": "Автомойки", "icon": [2880, 0], "color": "#e0782c", "track": false},
        {"key": "ev_charger", "name": "Электрозарядки", "icon": [2976, 0], "color": "#e0782c", "track": false, "hidden": true},
        {"key": "bus_stop", "name": "Автобусные остановки", "icon": [3072, 0], "color": "#e0782c", "track": false, "hidden": true},
        {"key": "train_station", "name": "Вокзалы", "icon": [3168, 0], "color": "#e0782c", "track": false},
        {"key": "ferry", "name": "Паромные терминалы", "icon": [3264, 0], "color": "#e0782c", "track": false},
        {"key": "rental", "name": "Прокат транспорта", "icon": [3360, 0], "color": "#e0782c", "track": false},
        {"key": "garage_buy", "name": "Гаражи на продажу", "icon": [3456, 0], "color": "#e0782c", "track": false},
        {"key": "garage", "name": "Гаражи", "icon": [3552, 0], "color": "#e0782c", "track": false},
        {"key": "standout_vehicle", "name": "Особые машины", "icon": [3648, 0], "color": "#e0782c"},
        {"key": "randy_vehicle", "name": "Список желаний Рэнди", "icon": [3744, 0], "color": "#e0782c"},
        {"key": "moses_vehicle", "name": "Машины для Мозеса", "icon": [3840, 0], "color": "#e0782c"}
    ] },
    { title: "Стиль", items: [
        {"key": "casual", "name": "Повседневная и уличная одежда", "icon": [3936, 0], "color": "#d9468f", "track": false},
        {"key": "sportswear", "name": "Спортивная одежда", "icon": [4032, 0], "color": "#d9468f", "track": false},
        {"key": "formal", "name": "Деловая одежда", "icon": [4128, 0], "color": "#d9468f", "track": false},
        {"key": "souvenir", "name": "Сувениры и купальники", "icon": [4224, 0], "color": "#d9468f", "track": false},
        {"key": "thrift", "name": "Секонд-хенд", "icon": [4320, 0], "color": "#d9468f", "track": false},
        {"key": "footwear", "name": "Обувь", "icon": [4416, 0], "color": "#d9468f", "track": false},
        {"key": "hair", "name": "Причёски и красота", "icon": [4512, 0], "color": "#d9468f", "track": false},
        {"key": "tattoo", "name": "Тату-салоны", "icon": [4608, 0], "color": "#d9468f", "track": false},
        {"key": "electronics", "name": "Электроника", "icon": [4704, 0], "color": "#d9468f", "track": false}
    ] },
    { title: "Еда и напитки", items: [
        {"key": "cafe", "name": "Кафе и еда навынос", "icon": [4800, 0], "color": "#c94f3d", "track": false},
        {"key": "bar", "name": "Бары", "icon": [4896, 0], "color": "#c94f3d", "track": false},
        {"key": "street_food", "name": "Уличная еда", "icon": [4992, 0], "color": "#c94f3d", "track": false}
    ] },
    { title: "Места WAiNK", items: [
        {"key": "waink_landmark", "name": "Достопримечательности", "icon": [5088, 0], "color": "#8e5bd6"},
        {"key": "waink_curiosity", "name": "Диковинки", "icon": [5184, 0], "color": "#8e5bd6"},
        {"key": "waink_sculpture", "name": "Скульптуры", "icon": [5280, 0], "color": "#8e5bd6"}
    ] },
    { title: "Гонки", items: [
        {"key": "race_intro", "name": "Вводная гонка", "icon": [5376, 0], "color": "#4e9c3a"},
        {"key": "race_challenge", "name": "Гоночные испытания", "icon": [5472, 0], "color": "#4e9c3a"},
        {"key": "mud_club", "name": "Thrillbilly Mud Club", "icon": [5568, 0], "color": "#4e9c3a"},
        {"key": "animal_crackers", "name": "Animal Crackers", "icon": [5664, 0], "color": "#4e9c3a"},
        {"key": "hit_n_run", "name": "Hit 'n' Run VC", "icon": [5760, 0], "color": "#4e9c3a"},
        {"key": "hamlet_speedway", "name": "Hamlet Boone Speedway", "icon": [5856, 0], "color": "#4e9c3a"},
        {"key": "ambrosia_raceway", "name": "Ambrosia Raceway", "icon": [5952, 0], "color": "#4e9c3a"},
        {"key": "gellhorn_raceway", "name": "Gellhorn Raceway", "icon": [6048, 0], "color": "#4e9c3a"},
        {"key": "drone_race", "name": "Гонки дронов Top Fun", "icon": [6144, 0], "color": "#4e9c3a"}
    ] },
    { title: "Исследование", items: [
        {"key": "book_swap", "name": "Книжные обменники", "icon": [6240, 0], "color": "#1f9e9a"},
        {"key": "magazine", "name": "Журналы", "icon": [6336, 0], "color": "#1f9e9a"},
        {"key": "playlist", "name": "Уникальные плейлисты", "icon": [6432, 0], "color": "#1f9e9a"},
        {"key": "mural", "name": "Муралы 1010", "icon": [6528, 0], "color": "#1f9e9a"}
    ] },
    { title: "Коллекционные карточки", items: [
        {"key": "card_jack", "name": "Jack of Hearts", "icon": [6624, 0], "color": "#e3a92a", "ink": "#2a1c04"},
        {"key": "card_delights", "name": "Delights", "icon": [6720, 0], "color": "#e3a92a", "ink": "#2a1c04"},
        {"key": "card_n1n", "name": "Nine1Nine", "icon": [6816, 0], "color": "#e3a92a", "ink": "#2a1c04"}
    ] },
    { title: "Нелегальные точки", items: [
        {"key": "gang_kingfishers", "name": "Kingfishers", "icon": [6912, 0], "color": "#6b5a86"},
        {"key": "gang_kolt", "name": "Kolt & Associates", "icon": [7008, 0], "color": "#6b5a86"},
        {"key": "gang_m7", "name": "M7", "icon": [7104, 0], "color": "#6b5a86"},
        {"key": "gang_polilla", "name": "La Polilla Negra", "icon": [7200, 0], "color": "#6b5a86"},
        {"key": "gang_final_chapter", "name": "Final Chapter", "icon": [7296, 0], "color": "#6b5a86"},
        {"key": "gang_san4san", "name": "San4San", "icon": [7392, 0], "color": "#6b5a86"},
        {"key": "gang_ptt", "name": "PTT Youngin$", "icon": [7488, 0], "color": "#6b5a86"},
        {"key": "gang_guardia", "name": "The Guardia Brothers", "icon": [7584, 0], "color": "#6b5a86"},
        {"key": "gang_criminals", "name": "Преступники", "icon": [7680, 0], "color": "#6b5a86"}
    ] }
];

const CAT_BY_KEY = {};
CATEGORIES.forEach(g => g.items.forEach(c => { CAT_BY_KEY[c.key] = c; }));

// Спрайт цветных значков MapGenie: для меню и поиска — фон CSS, для меток — canvas (app.js, drawIcon)
const ICON_SHEET = { url: "icons.png?v=3", w: 7776, h: 96, cell: 96 };
const ICON_IMG = new Image();
ICON_IMG.src = ICON_SHEET.url;
function iconSvg(icon, fill) {
    if (!Array.isArray(icon)) return "";
    const px = icon[0] / (ICON_SHEET.w - ICON_SHEET.cell) * 100, py = ICON_SHEET.h > ICON_SHEET.cell ? icon[1] / (ICON_SHEET.h - ICON_SHEET.cell) * 100 : 0;
    return `<span class="g6-glyph" aria-hidden="true" style="--gx:${px.toFixed(3)}%;--gy:${py.toFixed(3)}%"></span>`;
}
