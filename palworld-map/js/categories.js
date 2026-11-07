// Palworld — категории меток (из MapGenie). key — внутренний ключ, icon — глиф из images/icons (шрифт icomoon).
// track — метка входит в общий прогресс; dot — ресурсный узел (рисуется точкой), hidden — скрыта при первом открытии.
const CATEGORIES = [
    { title: "Локации", items: [
        { key: "dungeon", name: "Подземелье", icon: "dungeon", color: "#8a6bd1" },
        { key: "fast_travel", name: "Быстрое перемещение", icon: "fast_travel", color: "#4aa3df" },
        { key: "fishing_spot", name: "Место рыбалки", icon: "fishing_spot", color: "#2fb5c9", track: false, hidden: true },
        { key: "location", name: "Локация", icon: "location", color: "#7e8fa6", track: false },
        { key: "point_of_interest", name: "Достопримечательность", icon: "point_of_interest", color: "#9aa7b8", track: false },
        { key: "respawn_point", name: "Точка возрождения", icon: "respawn_point", color: "#e0707a", track: false },
        { key: "sealed_realm", name: "Запечатанное царство", icon: "sealed_realm", color: "#b45bd6" },
        { key: "supply_drop", name: "Сброс припасов", icon: "supply_drop", color: "#e0a030", track: false, hidden: true },
        { key: "syndicate_tower", name: "Башня синдиката", icon: "syndicate_tower", color: "#d65a5a" },
        { key: "watchtower", name: "Сторожевая башня", icon: "fast_travel", color: "#3d8fc4" }
    ] },
    { title: "NPC и торговцы", items: [
        { key: "merchant", name: "Торговец", icon: "merchant", color: "#d79a45", track: false },
        { key: "npc", name: "NPC", icon: "npc", color: "#a364b2", track: false },
        { key: "pal_merchant", name: "Торговец палами", icon: "pal_merchant", color: "#c77ad6", track: false }
    ] },
    { title: "Коллекционные предметы", items: [
        { key: "dog_coin", name: "Собачья монета", icon: "dog_coin", color: "#d8b440" },
        { key: "effigy", name: "Статуэтка лифманка", icon: "lifmunk_effigy", color: "#48a1c2" },
        { key: "journal", name: "Дневник", icon: "memo", color: "#b0a07a" },
        { key: "schematic", name: "Схема", icon: "collectible_1", color: "#4fb0a0" },
        { key: "dig_spot", name: "Место раскопок", icon: "treasure_map_dig_spot", color: "#b5835a" }
    ] },
    { title: "Предметы", items: [
        { key: "egg", name: "Яйцо", icon: "egg", color: "#f0d08a", hidden: true },
        { key: "elemental_chest", name: "Стихийный сундук", icon: "elemental_chest", color: "#55c0e8" },
        { key: "skill_fruit_tree", name: "Дерево плодов навыков", icon: "skill_fruit_tree", color: "#e07a9a" },
        { key: "treasure_chest", name: "Сундук с сокровищами", icon: "treasure_chest", color: "#d9a63b" }
    ] },
    { title: "Враги", items: [
        { key: "alpha_pal", name: "Альфа-пал", icon: "alpha_pal", color: "#d85a5a", track: false },
        { key: "biome_boss", name: "Босс биома", icon: "biome_boss", color: "#a8323e", track: false },
        { key: "bounty", name: "Награда за голову", icon: "bounty", color: "#e08a3a", track: false },
        { key: "enemy_camp", name: "Лагерь врагов", icon: "enemy_camp", color: "#c0504d", track: false },
        { key: "predator_pal", name: "Хищный пал", icon: "predator_pal", color: "#d7694a", track: false }
    ] },
    { title: "Задания", items: [
        { key: "main_quest", name: "Основное задание", icon: "main_quest", color: "#f3af50", track: false },
        { key: "side_quest", name: "Побочное задание", icon: "side_quest", color: "#8fc46a", track: false }
    ] },
    { title: "Прочее", items: [
        { key: "captured_pal", name: "Пленённый пал", icon: "captured_pal", color: "#578e98", track: false },
        { key: "misc", name: "Разное", icon: "miscellaneous", color: "#8a94a0", track: false },
        { key: "statue_of_power", name: "Статуя силы", icon: "statue_of_power", color: "#6fb0e0" }
    ] },
    { title: "Материалы", items: [
        { key: "chromite", name: "Хромит", icon: "chromite", color: "#c2c7cf", dot: true, hidden: true, track: false },
        { key: "coal", name: "Уголь", icon: "chromite", color: "#6b6f78", dot: true, hidden: true, track: false },
        { key: "copper_ore", name: "Медная руда", icon: "chromite", color: "#d2793a", dot: true, hidden: true, track: false },
        { key: "crude_oil", name: "Нефть", icon: "crude_oil", color: "#4a3f45", dot: true, hidden: true, track: false },
        { key: "hexolite_quartz", name: "Гексолитовый кварц", icon: "hexolite_quartz", color: "#e48ad9", dot: true, hidden: true, track: false },
        { key: "mining_site", name: "Место добычи", icon: "mining_site", color: "#b08d57", track: false },
        { key: "paldium", name: "Палдиум", icon: "chromite", color: "#4fa3ff", dot: true, hidden: true, track: false },
        { key: "paloxite", name: "Палоксит", icon: "chromite", color: "#c06bd6", dot: true, hidden: true, track: false },
        { key: "soralite", name: "Соралит", icon: "chromite", color: "#5bc7a6", dot: true, hidden: true, track: false },
        { key: "sulfur", name: "Сера", icon: "chromite", color: "#e5d34a", dot: true, hidden: true, track: false }
    ] }
];
const CAT_BY_KEY = Object.fromEntries(CATEGORIES.flatMap(g => g.items).map(c => [c.key, c]));
