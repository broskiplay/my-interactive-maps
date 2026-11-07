// Gothic 1 Remake — категории меток и классификатор.
// В исходном JSON почти всё лежит в "miscellaneous": тип метки определяем по названию, описанию и зоне.
// Набор категорий повторяет MapGenie (44 штуки); сундуки разделены на запертые и открытые.
// key — внутренний ключ, icon — имя глифа из images/icons (шрифт icomoon).
const CATEGORIES = [
    { title: "Локации", items: [
        { key: "area", name: "Область", icon: "location", color: "#9aa3ad" },
        { key: "camp", name: "Лагерь", icon: "region_transition", color: "#d4903f" },
        { key: "cave", name: "Пещера", icon: "dungeon", color: "#8a73b8" },
        { key: "transition", name: "Переход", icon: "transition", color: "#5b86d6" }
    ] },
    { title: "Предметы", items: [
        { key: "chest_locked", name: "Запертый сундук", icon: "stash", color: "#d8a93a" },
        { key: "chest_open", name: "Открытый сундук", icon: "chest", color: "#3aa5b5" },
        { key: "herb", name: "Травы", icon: "plant", color: "#58a55a" },
        { key: "material", name: "Материалы", icon: "supplies", color: "#b58a4e" },
        { key: "ore_nugget", name: "Куски руды", icon: "mineral", color: "#6a9fc2" },
        { key: "potion", name: "Зелья и эссенции", icon: "alchemy_station", color: "#b862c9" },
        { key: "key", name: "Ключи", icon: "item", color: "#e0c040" },
        { key: "arrow", name: "Стрелы", icon: "ranged_weapon", color: "#9c8f6a" },
        { key: "quest_item", name: "Квестовые предметы", icon: "quest_item", color: "#e8b020" },
        { key: "recipe", name: "Рецепты и чертежи", icon: "note", color: "#c27a52" },
        { key: "area_map", name: "Карты местности", icon: "recipe", color: "#8fae7a" }
    ] },
    { title: "Снаряжение", items: [
        { key: "armor", name: "Броня", icon: "armor", color: "#6f9470" },
        { key: "weapon", name: "Оружие", icon: "melee_weapon", color: "#b5594a" },
        { key: "ranged", name: "Луки и арбалеты", icon: "ranged_weapon", color: "#b88436" },
        { key: "amulet", name: "Амулеты", icon: "amulet", color: "#cf9d3c" },
        { key: "ring", name: "Кольца", icon: "ring", color: "#e6b94d" },
        { key: "scroll", name: "Магические свитки", icon: "magic_weapon", color: "#8d63c9" },
        { key: "rune", name: "Руны", icon: "shrine", color: "#5ea0c4" }
    ] },
    { title: "Персонажи", items: [
        { key: "boss", name: "Боссы", icon: "boss", color: "#c24040" },
        { key: "npc", name: "Важные NPC", icon: "npc", color: "#6a88c4" },
        { key: "trader", name: "Торговцы", icon: "merchant", color: "#4fb08a" },
        { key: "teacher", name: "Учителя", icon: "statue", color: "#d3a05a" },
        { key: "armorer", name: "Бронники", icon: "cuirass", color: "#7f9fb0" },
        { key: "blacksmith", name: "Кузнецы", icon: "blacksmith", color: "#c77a4a" },
        { key: "shadowbeast", name: "Мракорисы", icon: "enemy", color: "#8f3a4a" }
    ] },
    { title: "Задания", items: [
        { key: "quest_old", name: "Задания Старого лагеря", icon: "main_quest", color: "#e0a82a" },
        { key: "quest_new", name: "Задания Нового лагеря", icon: "side_quest", color: "#46b078" },
        { key: "quest_swamp", name: "Задания Болотного лагеря", icon: "misc_quest", color: "#4ba7a0" },
        { key: "quest_colony", name: "Задания Колонии", icon: "quest_item", color: "#d97a3a" }
    ] },
    { title: "Станции ремесла", items: [
        { key: "alchemy_table", name: "Стол алхимика", icon: "alchemy_station", color: "#4aa59a" },
        { key: "anvil", name: "Наковальня", icon: "blacksmith", color: "#9aa3ad" },
        { key: "cauldron", name: "Котёл", icon: "cooking_pot", color: "#d27c3a" },
        { key: "inscription", name: "Стол заклинателя", icon: "lore_entry", color: "#9b7ad0" },
        { key: "pan", name: "Сковорода", icon: "cooking_pot", color: "#b5654a" },
        { key: "water_tub", name: "Корыто", icon: "supplies", color: "#5b9bd0" },
        { key: "whetstone", name: "Точило", icon: "grindstone", color: "#8a95a0" },
        { key: "workbench", name: "Верстак", icon: "tool", color: "#a08a5a" }
    ] },
    { title: "Прочее", items: [
        { key: "climb", name: "Стены для лазания", icon: "point_of_interest", color: "#7fb050" },
        { key: "document", name: "Книги и записки", icon: "lore_entry", color: "#a98ad8" },
        { key: "locked_door", name: "Запертые двери", icon: "door", color: "#c9784a" },
        { key: "easter_egg", name: "Пасхалки", icon: "easter_egg", color: "#d05aa6" },
        { key: "misc", name: "Разное", icon: "miscellaneous", color: "#9a8d78" }
    ] }
];
const CAT_BY_KEY = Object.fromEntries(CATEGORIES.flatMap(g => g.items).map(c => [c.key, c]));

// ---------- Зоны ----------
// Долина лежит в центре общей картинки, интерьеры лагерей и Орочий анклав — врезки вокруг неё.
// Координаты данных (lat — вверх, lng — вправо).
function zoneOf(m) {
    const { lat, lng } = m;
    if (lat > 5950) return "old_camp";
    if (lng > 5400) return "swamp_camp";
    if (lng < 2300 && lat > 2800) return "new_camp";
    if (lat < 2100) return lng >= 4400 ? "orc_enclave" : "sleeper_temple";
    return "valley";
}

// ---------- Правила ----------
const HERBS = /^(Kingstide|Seraphis|Hellcap|Solanaceae|Darkshade|Stoneroot|Mild Healing Herbs?|Mistcap|Dragonroot|Slave's (Bread|Berard)|Widow's Veil|Flame Thorn|Swampweed|Healing Herbs?|Duskbell|Cavern Dewleaf|Strong Healing Herbs?|Mountain Moss|Velayis|Dark Herbs|Copper Beech Seed|Raven Herbs|Grave Moss|Orc Leaf|Oak Leaf|Redspine|Siren's Hair|Herb Hotspot|Lunanaceae|Wild Berries)\b/i;
const MATERIAL = /^(Willow Wood|Iron Wood|Oak Wood|Iron|Leather Strips|Mercury|Steel|Ruby|Gold|Lab Flask|Obsidian|Petrified Wood|Troll Skin|Trollbane Nettle|Raw (White )?Meat|Lockpick|Torch|Grapes|Judge's Hat|Sulfur|Salt)\b/i;
const POTION = /^(Essence|Extract|Elixir|Elexir|Potion) of\b|^Orc Medicine\b/i;
const QUEST_ITEM = /^(Almanac|Cog|Hunter's Knife|Remedy|Bran's Axe|Detached Winch|Strange Amulet|Queen's Pheromone Gland|Orc Lever|Certificate|Heart of|Horn of a Great|Prime |Teeth of a Swampshark|Worldcleaver|Lightbringer|Timesplinter|Banstone|Fiendeye|Tower Stone|Focus from|Dreamcall|Kalom's Recipe|Old Recipe|Innos' Grace|Royal Weapon Design|Magic Ore|The Bestiary of Khorinis|Chromanin|The Old Ways of the Druids|Magic Runes and Rituals)/i;
const DOCUMENT = /^Recipes -|Circle of Magic|Words of the Gods|Poetry|Letter$|Note$|Arcanum|Demonology|Astranomy|Secrets of Magic|True Power|Battle of Varant|Compendium|Rituals of the Order|Art of Fighting|Hunt and Prey|Magic Runes and Rituals|Powerful Art|Drawing of Abandoned|Woman Drawing/i;
const SPELL = /^(Transform|Summon|Telekinesis|Pyrokinesis|Charm|Fist of Wind|Light\b|Sleep|Ice Bolt|Ice Block|Fireball|Fire Bolt|Control|Storm Fist|Healing\b|Fear|Chain Lightning|Ball Lightning|Death to the Undead|Rain of Fire|Storm of Fire|Breath of Death|Teleport|Rune Teleport|Uriziel)/i;
const WATER_STATIONS = [
    ["alchemy_table", /^Alchemy Table/], ["anvil", /^Anvil/], ["cauldron", /^Cauldron/], ["inscription", /^Inscription Station/],
    ["pan", /^Pan$/], ["water_tub", /^Water Tub/], ["whetstone", /^(Orc )?Whetstone/], ["workbench", /^Workbench/]
];
const AREA_TITLES = new Set(["Exchange Zone", "Old Camp", "Marketplace", "Arena", "Fire Mages Chambers", "Ore Barons' Residence", "The Inner Castle", "The Outer Ring",
    "Swamp Camp", "New Camp", "Orc Enclave", "Sleeper Temple", "Orc Cemetery", "Stonehenge", "Old Mine", "Troll Canyon", "Free Mine", "Monastery Ruins",
    "Mountain Fortress", "Xardas Tower", "Old Citadel", "Xardas Sunken Tower", "New Camp's Tavern", "Cor Kalom's Laboratory", "Temple of the Sleeper",
    "Fogtower - Lighthouse", "Herb Mashers", "Templar's Training Grounds", "Old Camp Smithy", "Swamp Camp Smithy", "Mess Hall and Barracks", "Crashed Ship",
    "Broken Tower", "Orc's Territory", "Blackmailers Birdge", "Raven's Tower", "Abandoned Mine", "Old Camp's Dungeons Area", "Shrine of Innos - Waterfall",
    "Shrine of Innos - Cliff", "Sunken Temple of Adanos", "Temple of Innos", "Fire Mages Chambers - Locked Door", "Tundra"]);
// Квесты Долины и «ничьи» квесты относим к лагерю, с которым они связаны сюжетно (как в MapGenie)
const QUEST_CAMP = {
    "The Brotherhood's Plan": "swamp", "Aiming High": "swamp", "Point of No Return": "swamp",
    "A Letter from the Fire Mages": "old", "Special Pieces": "old", "The Rogues' Camp": "old",
    "The Water Mages' Plan": "new", "Recovering the Free Mine": "new", "The Focus in the Monastery Ruins": "new"
};
const CAVE = /\b(Cave|Lair|Tunnel)\b|^Mineshaft|^Underground Stonehenge|^Orc Cemetery Main Chamber|^Abandoned Mine$/i;
const LOCKED_DOOR = /^(Locked (Door|Gate|Cells|Catacombs)|Cell Door|Abandoned Mine - Locked Gate|Crashed Ship Locked Door|Raven's Tower Locked Door|Orc Cemetery (Gates|Locked Door)|Xardas Sunken Tower (Locked Door|Door Puzzle)|Red Barrier)/i;

// Квест: описание начинается со структурированных полей квеста
const isQuest = d => /\*\*(How to Start|Quest Steps|Next Quest)/.test(d) || /^\*\*POINT OF NO RETURN/.test(d);
const hasTable = (d, h) => d.indexOf("| **" + h) >= 0;

function classify(m) {
    const t = String(m.title || "").trim();
    const d = String(m.desc || "");
    const c = m.category;
    if (c === "camp" || c === "boss" || c === "transition" || c === "easter_egg") return c === "easter_egg" ? "easter_egg" : c;
    if (CAT_BY_KEY[c] && c !== "miscellaneous") return c;

    // Квесты — по зоне, в которой лежит метка
    if (isQuest(d)) {
        const z = QUEST_CAMP[t] || { old_camp: "old", new_camp: "new", swamp_camp: "swamp" }[zoneOf(m)] || "colony";
        return "quest_" + z;
    }
    for (const [key, re] of WATER_STATIONS) if (re.test(t)) return key;
    if (/^Climbable/.test(t)) return "climb";
    if (LOCKED_DOOR.test(t)) return "locked_door";
    if (/\bchest\b/i.test(t)) return /locked/i.test(t) ? "chest_locked" : "chest_open";

    // Персонажи
    if (/^Shadowbeast$|^Frost Shadowbeast$/.test(t)) return "shadowbeast";
    if (/^Orc Blacksmith$/.test(t) || /Smithing\(/.test(d)) return "blacksmith";
    if (d.indexOf("**Armor Alterations:**") >= 0) return "armorer";
    if (/^\*\*Chapters? /.test(d) || /^\*\*Skills:\*\*/.test(d) || /^\*\*Chapter/.test(d) || hasTable(d, "Items") && /Chapters?/.test(d)) {
        if (/\*\*Store:\*\*|\| \*\*(Items|Documents|Drugs|Melee Weapons|Amulets|Armor|Equipment)\*\*/.test(d)) return "trader";
        if (/\*\*(Hunting )?Skills:\*\*/.test(d) || /\*\*Chapters 4-6 Skills\*\*/.test(d)) return "teacher";
        return "npc";
    }
    if (/^\*\*Skills:\*\*/.test(d)) return "teacher";

    // Предметы
    if (/^(Map of|Drawing of the Orc Territory|Sketch of the Temple)/.test(t)) return "area_map";
    if (/^Arrow x\d/.test(t)) return "arrow";
    if (/\bKey\b/.test(t) && !/Locked/.test(t)) return "key";
    if (/^Ore Nugget x/.test(t)) return "ore_nugget";
    if (QUEST_ITEM.test(t)) return "quest_item";
    if (/^(Recipe|Schematic|Formula|Inscription of)\b|Recipe$/.test(t)) return "recipe";
    if (DOCUMENT.test(t)) return "document";

    // Снаряжение
    if (/^Amulet of|^Armor Amulet$|^Orc Talisman$/.test(t)) return "amulet";
    if (/^(Ring of|Protection of Fire|Mordrag's Ring|Scatty's Ring|Warrior's Ring)/.test(t)) return "ring";
    if (/Magic Circle/.test(d)) return "rune";
    if (SPELL.test(t) && /\*\*Effect:\*\*|Magic Scroll|^\*\*Location/.test(d) || (SPELL.test(t) && !/Damage/.test(d) && !/Protection/.test(d))) return "scroll";
    if (/^\*\*(Bow|Crossbow)\*\*/.test(d)) return "ranged";
    if (/Damage \|/.test(d) || /^\*\*(One-Handed|Two-Handed|Staff|Orc Weapon)/.test(d)) return "weapon";
    if (/Protection \||Max Mana \|/.test(d) || /Armor|Dress|Robe|Breastplate|Greaves|Boots|Belt|Bracers|Vest|Jerkin|Pauldrons|Kneepads|Gloves|Shoulderpad|Wrappings|Tabard|Shirt|Trousers/.test(t)) return "armor";

    if (POTION.test(t)) return "potion";
    if (HERBS.test(t)) return "herb";
    if (MATERIAL.test(t)) return "material";
    if (/^(Shortbow|Hunting Bow|Rider's Bow|Hedge Bow|Oak Bow|Army Bow|Wolfshredder|Demon's Bow|Heavy Crossbow|Light Crowssbow|Crossbow)/.test(t)) return "ranged";

    // Места
    if (AREA_TITLES.has(t) && !(t === "Abandoned Mine" && d)) return "area";
    if (CAVE.test(t)) return "cave";
    return "misc";
}

// Сводка для проверки: { key: count }
function summarize(markers) {
    const out = {};
    markers.forEach(m => { const k = classify(m); out[k] = (out[k] || 0) + 1; });
    return out;
}
