// Stellar Blade — категории меток (из MapGenie). key и icon — одно и то же имя: глиф берётся из images/icons (шрифт icomoon).
// Цвет метки — цвет группы на MapGenie (у самих категорий своего цвета нет). Группы MapGenie: локации #434b60, коллекционные предметы и косметика #ac64ce,
// снаряжение #5e7fb9, задания #cf9045, враги #ba4a4f, прочее #4bb47a.
// track: false — метка не входит в общий прогресс (задания, враги, торговцы и прочее, что нельзя «собрать»).
const CATEGORIES = [
    { title: "Локации", items: [
        { key: "camp", name: "Лагерь", icon: "camp", color: "#434b60", hint: "Посещайте лагеря, чтобы сохранять игру, слушать музыку, покупать предметы, открывать навыки и восстанавливать заряды шейкера-дозатора. В некоторых лагерях также можно быстро перемещаться и улучшать снаряжение." },
        { key: "fast_travel", name: "Быстрое перемещение", icon: "fast_travel", color: "#434b60" },
        { key: "safehouse", name: "Убежище", icon: "safehouse", color: "#434b60" },
        { key: "transition", name: "Переход между зонами", icon: "transition", color: "#434b60", track: false },
        { key: "point_of_interest", name: "Достопримечательность", icon: "point_of_interest", color: "#434b60", track: false },
        { key: "traversal", name: "Паркур", icon: "traversal", color: "#434b60", track: false },
        { key: "vendor", name: "Магазин", icon: "vendor", color: "#434b60", track: false },
        { key: "bulletin_board", name: "Доска объявлений", icon: "bulletin_board", color: "#434b60", track: false }
    ] },
    { title: "Коллекционные предметы", items: [
        { key: "memory_stick", name: "Карта памяти", icon: "memory_stick", color: "#ac64ce" },
        { key: "data_bank", name: "Банк данных", icon: "data_bank", color: "#ac64ce" },
        { key: "can", name: "Банка", icon: "can", color: "#ac64ce" },
        { key: "box", name: "Ящик", icon: "box", color: "#ac64ce" },
        { key: "passcode", name: "Пароль", icon: "passcode", color: "#ac64ce" },
        { key: "lost_song", name: "Музыка", icon: "lost_song", color: "#ac64ce", hint: "Подбирайте музыку, чтобы пополнить список композиций, которые можно включать в лагерях." },
        { key: "stellar_tear", name: "Звёздная слеза", icon: "stellar_tear", color: "#ac64ce" },
        { key: "fish", name: "Рыба", icon: "fish", color: "#ac64ce" },
        { key: "photo_spot", name: "Место для фото", icon: "photo_spot", color: "#ac64ce" }
    ] },
    { title: "Косметика", items: [
        { key: "nano_suit", name: "Наносьют", icon: "nano_suit", color: "#ac64ce" },
        { key: "adams_clothes", name: "Одежда Адама", icon: "adams_clothes", color: "#ac64ce" },
        { key: "lilys_clothes", name: "Одежда Лили", icon: "lilys_clothes", color: "#ac64ce" },
        { key: "hairstyle", name: "Причёска", icon: "hairstyle", color: "#ac64ce" },
        { key: "face_decoration", name: "Украшение для лица", icon: "face_decoration", color: "#ac64ce" },
        { key: "earrings", name: "Серьги", icon: "earrings", color: "#ac64ce" },
        { key: "drone_appearance", name: "Внешний вид дрона", icon: "drone_appearance", color: "#ac64ce" }
    ] },
    { title: "Снаряжение", items: [
        { key: "body_core", name: "Ядро тела", icon: "body_core", color: "#5e7fb9", hint: "Собирайте ядра тела, чтобы увеличить максимальный запас здоровья." },
        { key: "beta_core", name: "Бета-ядро", icon: "beta_core", color: "#5e7fb9", hint: "Собирайте бета-ядра, чтобы увеличить максимальный запас бета-энергии." },
        { key: "weapon_core", name: "Ядро оружия", icon: "weapon_core", color: "#5e7fb9", hint: "Ядра оружия повышают силу вашей атаки." },
        { key: "tumbler_expansion_module", name: "Модуль для шейкера-дозатора", icon: "tumbler_expansion_module", color: "#5e7fb9", hint: "Модули для шейкера-дозатора — материал для его улучшения." },
        { key: "drone_upgrade_module", name: "Модуль для улучшения дронов", icon: "drone_upgrade_module", color: "#5e7fb9", hint: "Модули для улучшения дронов нужны, чтобы открывать новые улучшения дрона на ремонтной консоли." },
        { key: "exospine", name: "Экзохребет", icon: "exospine", color: "#5e7fb9", hint: "Эффекты экзохребта открываются при его улучшении на ремонтной консоли." },
        { key: "gear", name: "Гаджет", icon: "gear", color: "#5e7fb9", hint: "Эффекты гаджета открываются, когда вы находите другие экземпляры того же гаджета." },
        { key: "omnibolt", name: "Омнизатвор", icon: "omnibolt", color: "#5e7fb9" }
    ] },
    { title: "Задания", items: [
        { key: "main_quest", name: "Основное задание", icon: "main_quest", color: "#cf9045", track: false },
        { key: "side_quest", name: "Побочное задание", icon: "side_quest", color: "#cf9045", track: false },
        { key: "bulletin_board_request", name: "Запрос с доски объявлений", icon: "bulletin_board_request", color: "#cf9045", track: false },
        { key: "mission_item", name: "Предмет из задания", icon: "mission_item", color: "#cf9045", track: false }
    ] },
    { title: "Враги", items: [
        { key: "boss", name: "Босс", icon: "boss", color: "#ba4a4f", track: false },
        { key: "naytiba", name: "Биотив", icon: "naytiba", color: "#ba4a4f", track: false, hint: "Биотивы могут бродить вокруг своих меток." }
    ] },
    { title: "Прочее", items: [
        { key: "easter_egg", name: "Пасхалка", icon: "easter_egg", color: "#4bb47a" },
        { key: "miscellaneous", name: "Разное", icon: "miscellaneous", color: "#4bb47a", track: false }
    ] }
];
const CAT_BY_KEY = Object.fromEntries(CATEGORIES.flatMap(g => g.items).map(c => [c.key, c]));
