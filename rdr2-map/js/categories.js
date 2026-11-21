// Red Dead Redemption 2 — категории меток (названия, описания и иконки — etalongame.com; сгенерировано tools/build_data.py).
// key — ключ категории; icon — [x, y] значка 64×64 в ../icons.png (белые глифы, спрайт 3712×64);
// track: false — метка не входит в общий прогресс; dot — мелкая метка-точка; hidden — скрыта при первом открытии;
// ink — цвет значка на светлой метке; about — описание категории (показывается в окне метки).

const CATEGORIES = [
    { title: "Коллекционные предметы", items: [
        {"key": "bounty_poster", "name": "Плакат о вознаграждении", "icon": [0, 0], "color": "#b8452e", "about": "Ищите плакаты о розыске местных преступников в тюрьмах, полицейских участках и офисах шерифа."},
        {"key": "cigarette_card", "name": "Сигаретная карточка", "icon": [64, 0], "color": "#b8452e", "about": "Декоративные карточки можно найти в открытом мире или в купленных пачках дорогих сигарет. Повторные карточки можно продавать скупщикам.\nСоберите каждый из двенадцати наборов карточек, чтобы получить дополнительные награды."},
        {"key": "dinosaur_bone", "name": "Кость динозавра", "icon": [128, 0], "color": "#b8452e", "about": "Помогите Деборе Макгиннесс в палеонтологических исследованиях, отправляя по почте сведения о местонахождении костей динозавров."},
        {"key": "dreamcatcher", "name": "Ловец снов", "icon": [192, 0], "color": "#b8452e", "about": "Ищите искусно сплетённые украшения, висящие на ветвях деревьев.\nНайдите все ловцы снов, чтобы на карте появилась подсказка, ведущая к тайному сокровищу!"},
        {"key": "exotic", "name": "Экзотика", "icon": [256, 0], "color": "#b8452e"},
        {"key": "grave", "name": "Могила", "icon": [320, 0], "color": "#b8452e", "about": "Посетите все могилы, чтобы открыть трофей или достижение «Дань уважения»."},
        {"key": "hunter_request", "name": "Запрос охотнику", "icon": [384, 0], "color": "#b8452e"},
        {"key": "item_request", "name": "Запрос предмета", "icon": [448, 0], "color": "#b8452e", "about": "Доставьте 5 запрошенных предметов, чтобы открыть трофей или достижение «Мальчик на побегушках». Предметы появляются независимо от прогресса, но члены банды просят их только в определённых главах."},
        {"key": "legendary_animal", "name": "Легендарное животное", "icon": [512, 0], "color": "#b8452e", "about": "Проверьте свои охотничьи навыки, выслеживая уникальных животных. Их шкуры можно обменять у охотников, чтобы открыть элементы внешнего вида и снаряжение; части животных можно обменять у скупщиков на талисманы.\nВ отмеченной области изучите все жёлтые улики, чтобы определить точное местонахождение животного. Перед поиском убедитесь, что на экране появилось сообщение: «Вы вошли в область, где можно выследить легендарное животное. Охотьтесь на этого зверя, разыскивая и изучая его следы.»"},
        {"key": "legendary_fish", "name": "Легендарная рыба", "icon": [576, 0], "color": "#b8452e"},
        {"key": "plant", "name": "Растение", "icon": [640, 0], "color": "#b8452e", "dot": true, "hidden": true, "track": false, "about": "Совет: используйте строку поиска на карте, чтобы находить конкретные растения по запросам «Морковь», «Камыш» и т. п."},
        {"key": "point_of_interest", "name": "Интересное место", "icon": [704, 0], "color": "#b8452e", "about": "Достопримечательности можно осматривать, чтобы добавлять их в журнал и на карту."},
        {"key": "robbery", "name": "Ограбление", "icon": [768, 0], "color": "#b8452e"},
        {"key": "rock_carving", "name": "Наскальное изображение", "icon": [832, 0], "color": "#b8452e"},
        {"key": "cabin", "name": "Хижина", "icon": [896, 0], "color": "#b8452e", "about": "Подойдите к хижине, чтобы она появилась на карте как достопримечательность."},
        {"key": "treasure", "name": "Сокровища", "icon": [960, 0], "color": "#b8452e"}
    ] },
    { title: "Подбираемые предметы", items: [
        {"key": "item", "name": "Предмет", "icon": [1024, 0], "color": "#8a5f2c"},
        {"key": "loot", "name": "Добыча", "icon": [1088, 0], "color": "#8a5f2c", "about": "Используйте строку поиска на карте, чтобы находить определённые предметы, например брошюры, корень валерианы, эликсир из женьшеня и выдержанный пиратский ром."},
        {"key": "weapon", "name": "Оружие", "icon": [1152, 0], "color": "#8a5f2c"},
        {"key": "wild_horse", "name": "Дикая лошадь", "icon": [1216, 0], "color": "#8a5f2c"}
    ] },
    { title: "Услуги", items: [
        {"key": "fishing_shop", "name": "Рыболовный магазин", "icon": [1280, 0], "color": "#2f6f8f", "track": false},
        {"key": "barber", "name": "Цирюльник", "icon": [1344, 0], "color": "#2f6f8f", "track": false},
        {"key": "butcher", "name": "Мясник", "icon": [1408, 0], "color": "#2f6f8f", "track": false},
        {"key": "doctor", "name": "Доктор", "icon": [1472, 0], "color": "#2f6f8f", "track": false},
        {"key": "fast_travel", "name": "Быстрое перемещение", "icon": [1536, 0], "color": "#2f6f8f", "track": false},
        {"key": "fence", "name": "Скупщик", "icon": [1600, 0], "color": "#2f6f8f", "track": false},
        {"key": "general_store", "name": "Магазин", "icon": [1664, 0], "color": "#2f6f8f", "track": false},
        {"key": "gunsmith", "name": "Оружейный магазин", "icon": [1728, 0], "color": "#2f6f8f", "track": false},
        {"key": "hotel", "name": "Отель", "icon": [1792, 0], "color": "#2f6f8f", "track": false},
        {"key": "newspaper_seller", "name": "Продавец газет", "icon": [1856, 0], "color": "#2f6f8f", "track": false},
        {"key": "photo_studio", "name": "Фотостудия", "icon": [1920, 0], "color": "#2f6f8f", "track": false},
        {"key": "post_office", "name": "Почта", "icon": [1984, 0], "color": "#2f6f8f", "track": false},
        {"key": "saloon", "name": "Салун", "icon": [2048, 0], "color": "#2f6f8f", "track": false},
        {"key": "theater", "name": "Представление", "icon": [2112, 0], "color": "#2f6f8f", "track": false},
        {"key": "stable", "name": "Конюшня", "icon": [2176, 0], "color": "#2f6f8f", "track": false},
        {"key": "stagecoach", "name": "Дилижанс", "icon": [2240, 0], "color": "#2f6f8f", "track": false},
        {"key": "tailor", "name": "Портной", "icon": [2304, 0], "color": "#2f6f8f", "track": false},
        {"key": "train_station", "name": "Железнодорожная станция", "icon": [2368, 0], "color": "#2f6f8f", "track": false},
        {"key": "hunter", "name": "Охотник", "icon": [2432, 0], "color": "#2f6f8f", "track": false}
    ] },
    { title: "События", items: [
        {"key": "gang_hideout", "name": "Логово банды", "icon": [2496, 0], "color": "#d9a024", "ink": "#2a1c04"},
        {"key": "random_event", "name": "Случайное событие", "icon": [2560, 0], "color": "#d9a024", "ink": "#2a1c04", "about": "Случайные события не гарантированы: вместо них вам может встретиться нечто совершенно иное!"},
        {"key": "stranger", "name": "Незнакомец", "icon": [2624, 0], "color": "#d9a024", "ink": "#2a1c04"}
    ] },
    { title: "Мини-игры", items: [
        {"key": "blackjack", "name": "Блэкджек", "icon": [2688, 0], "color": "#6b8f3c"},
        {"key": "dominoes", "name": "Домино", "icon": [2752, 0], "color": "#6b8f3c"},
        {"key": "five_finger_fillet", "name": "Филе в пять пальцев", "icon": [2816, 0], "color": "#6b8f3c"},
        {"key": "poker", "name": "Покер", "icon": [2880, 0], "color": "#6b8f3c"}
    ] },
    { title: "Другое", items: [
        {"key": "camp", "name": "Лагерь", "icon": [2944, 0], "color": "#5d636b", "track": false},
        {"key": "cheat_code", "name": "Чит-код", "icon": [3008, 0], "color": "#5d636b", "track": false, "about": "Чит-коды активируются в меню настроек. Регистр букв не важен, но знаки препинания необходимо вводить точно так, как они указаны выше в кавычках."},
        {"key": "easter_egg", "name": "Пасхалка", "icon": [3072, 0], "color": "#5d636b", "track": false},
        {"key": "landmark", "name": "Достопримечательность", "icon": [3136, 0], "color": "#5d636b", "track": false, "about": "Подойдите к достопримечательности, чтобы она появилась на карте."},
        {"key": "misc", "name": "Прочее", "icon": [3200, 0], "color": "#5d636b", "track": false}
    ] },
    { title: "Сетевая игра", items: [
        {"key": "online_campfire", "name": "Лагерный костер", "icon": [3264, 0], "color": "#8e3f6b", "hidden": true, "track": false},
        {"key": "online_harriet", "name": "Гариетум лекарственный", "icon": [3328, 0], "color": "#8e3f6b", "hidden": true, "track": false},
        {"key": "online_lair", "name": "Логово", "icon": [3392, 0], "color": "#8e3f6b", "hidden": true, "track": false},
        {"key": "online_legendary", "name": "Легендарное животное", "icon": [3456, 0], "color": "#8e3f6b", "hidden": true, "track": false},
        {"key": "online_treasure_hunter", "name": "Охотник за сокровищами", "icon": [3520, 0], "color": "#8e3f6b", "hidden": true, "track": false},
        {"key": "online_treasure_map", "name": "Карта сокровищ", "icon": [3584, 0], "color": "#8e3f6b", "hidden": true, "track": false},
        {"key": "online_treasure", "name": "Сокровище", "icon": [3648, 0], "color": "#8e3f6b", "hidden": true, "track": false}
    ] }
];

const CAT_BY_KEY = {};
CATEGORIES.forEach(g => g.items.forEach(c => { CAT_BY_KEY[c.key] = c; }));

// Спрайт иконок: для меню и поиска — CSS-маска (цвет значка задаёт фон), для пинов — canvas (app.js, drawIcon)
const ICON_SHEET = { url: "icons.png?v=1", w: 3712, h: 64, cell: 64 };
const ICON_IMG = new Image();
ICON_IMG.src = ICON_SHEET.url;
function iconSvg(icon, fill) {
    if (!Array.isArray(icon)) return "";
    const px = icon[0] / (ICON_SHEET.w - ICON_SHEET.cell) * 100, py = ICON_SHEET.h > ICON_SHEET.cell ? icon[1] / (ICON_SHEET.h - ICON_SHEET.cell) * 100 : 0;
    return `<span class="rd-glyph" aria-hidden="true" style="--gx:${px.toFixed(3)}%;--gy:${py.toFixed(3)}%${fill ? `;background:${fill}` : ""}"></span>`;
}
