// Dimraeth — категории (слои) меток. Группы, названия и цвета повторяют карту на dimraethdb.com.
// key — id слоя в данных, icon — имя глифа из images/icons (шрифт icomoon).
const CATEGORIES = [
    { title: "Переместиться", items: [
        { key: "waygates", name: "Путевые врата", icon: "fast_travel", color: "#6ec8ff" },
        { key: "campfires", name: "Костры", icon: "bed", color: "#ff8a4c" }
    ] },
    { title: "Боссы", items: [
        { key: "bosses", name: "Боссы", icon: "boss", color: "#e0443a" },
        { key: "minibosses", name: "Мини-боссы", icon: "shield", color: "#ef8a3a" }
    ] },
    { title: "Лавка и Изготовление", items: [
        { key: "shops", name: "Лавки", icon: "merchant", color: "#9ad06c" },
        { key: "crafting_stations", name: "Станции изготовления", icon: "tool", color: "#d8b070" },
        { key: "forges", name: "Кузницы", icon: "blacksmith", color: "#c4783a" }
    ] },
    { title: "Места", items: [
        { key: "people", name: "Люди", icon: "npc", color: "#7fb6e8" },
        { key: "groves", name: "Рощи", icon: "plant", color: "#6fc06a" },
        { key: "ruins", name: "Руины", icon: "statue", color: "#b49a7a" },
        { key: "homesteads", name: "Усадьбы", icon: "location", color: "#d49a62" },
        { key: "dens", name: "Логова", icon: "ethereal_cobweb", color: "#b5593f" },
        { key: "caves", name: "Пещеры", icon: "dungeon", color: "#8a73b8" },
        { key: "pois", name: "Точки интереса", icon: "point_of_interest", color: "#e8c56a" }
    ] },
    { title: "Коллекционные", items: [
        { key: "fragments", name: "Фрагменты карты", icon: "recipe", color: "#5cc8d8" },
        { key: "spellbooks", name: "Книги заклинаний", icon: "magic_weapon", color: "#b38cff" },
        { key: "pets", name: "Питомцы", icon: "horse", color: "#f0a0c8" },
        { key: "carry", name: "Грузоподъёмность", icon: "supplies", color: "#e8d27a" }
    ] },
    { title: "Добыча", items: [
        { key: "chests", name: "Сундуки", icon: "chest", color: "#f2d24b" },
        { key: "containers", name: "Контейнеры", icon: "stash", color: "#c9a24a" },
        { key: "rewards", name: "Другие награды", icon: "relic", color: "#e0a0ff" },
        { key: "breakables", name: "Ломаемые с добычей", icon: "item", color: "#a08a5a" },
        { key: "resources", name: "Ресурсы", icon: "mineral", color: "#5fd0a8" }
    ] },
    { title: "Существа", items: [
        { key: "monsters", name: "Монстры", icon: "enemy", color: "#d9674f" },
        { key: "event_monsters", name: "Монстры события", icon: "ethereal_cobweb", color: "#c77dff" }
    ] }
];
const CAT_BY_KEY = Object.fromEntries(CATEGORIES.flatMap(g => g.items).map(c => [c.key, c]));

// Слои, скрытые при первом открытии: тысячи появлений существ и узлов ресурсов закрыли бы всю карту
const DEFAULT_HIDDEN = ["monsters", "event_monsters", "resources"];
// Слои, которые не «находят»: в общий прогресс не входят (тот же список в tools конвертера: data/progress-index.json)
const UNTRACKED = new Set(["monsters", "event_monsters", "resources"]);
// Слои-существа: к ним применяется фильтр по уровню
const LEVEL_CATS = new Set(["bosses", "minibosses", "monsters", "event_monsters"]);
