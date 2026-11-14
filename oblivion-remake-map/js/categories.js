// TES IV: Oblivion Remastered — категории меток.
// key — ключ категории (совпадает с именем иконки MapGenie), icon — иконка из ICONS ниже (собственные SVG, 24×24).
// track: false — метка не входит в общий прогресс; dot — мелкая метка-точка; hidden — скрыта при первом открытии.

// d — контур в системе 24×24, eo: false — заливка nonzero (по умолчанию evenodd)
const ICONS = {
    pillar: { d: "M6 3h12v3h-2.2v12H18v3H6v-3h2.2V6H6V3z" },
    drop: { d: "M12 2.5S5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5z" },
    tent: { d: "M12 3.5L1.8 20.5h20.4L12 3.5zm0 7.5l4.6 9.5H7.4L12 11z" },
    cave: { d: "M2.5 20.5C2.5 11 6.5 5 12 5s9.5 6 9.5 15.5H16c0-4-1.2-8-4-8s-4 4-4 8H2.5z" },
    temple: { d: "M12 2.5L2.5 8v2h19V8L12 2.5zM5 11.5v7h2.5v-7H5zm5.75 0v7h2.5v-7h-2.5zm5.75 0v7H19v-7h-2.5zM2.5 20v2h19v-2h-19z" },
    castle: { d: "M2.5 21.5V8.5h3V5.5H8v3h2.5v-3H13v3h2.5v-3H18v3h3.5v13H15v-5a3 3 0 0 0-6 0v5H2.5z" },
    star: { d: "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.1 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" },
    tower: { d: "M6 21.5V9H4V3h4v2.5h2V3h4v2.5h2V3h4v6h-2v12.5H6zM10 21.5v-4a2 2 0 0 1 4 0v4h-4z" },
    shield: { d: "M12 2.2L20 5v6.2c0 5-3.4 8.8-8 10.6-4.6-1.8-8-5.6-8-10.6V5l8-2.8z" },
    house: { d: "M12 3L2 12h3v8.5h5.2v-5.5h3.6v5.5H19V12h3L12 3z" },
    mug: { d: "M4.5 5h11v3h2a3.5 3.5 0 0 1 0 7h-2v1a3.5 3.5 0 0 1-3.5 3.5h-4A3.5 3.5 0 0 1 4.5 16V5zm11 5.5v2.5h2a1.25 1.25 0 0 0 0-2.5h-2z" },
    peak: { d: "M1.5 20.5L9.5 6l3.5 6 2.2-3.2 7.3 11.7h-21z" },
    stone: { d: "M8.5 3h7l2.5 7-1.2 11.5H7.2L6 10l2.5-7z" },
    pick: { d: "M3 9C5 5.5 8.5 3.5 12 3.5S19 5.5 21 9l-2.2 1.2C17.200 8 14.800 6.800 12 6.800S6.800 8 5.200 10.200L3 9zM10.700 8.500h2.600l.5 13h-3.600l.5-13z" },
    ring: { d: "M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm0 4a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" },
    village: { d: "M1.5 20.5V13l4.25-4.25L10 13v7.5H1.5zM12 20.5V8l5.25-5L22.5 8v12.5H12z" },
    flame: { d: "M12 2.5c1.8 3 5 5.3 5 9.5a5 5 0 0 1-10 0c0-1.8.7-3.100 1.800-4.300.2 1.200.8 2 1.700 2.300C10 7.600 10.600 5 12 2.500zM6.500 18.500h11v2.500h-11v-2.500z" },
    obelisk: { d: "M12 2l3.5 5.5v14.5h-7V7.5L12 2z" },
    flask: { d: "M9 2.5h6v2h-1v4.500l5.300 9a2.200 2.200 0 0 1-1.900 3.500H6.600a2.200 2.200 0 0 1-1.900-3.500L10 9V4.500H9v-2z" },
    anvil: { d: "M3 6.500h12.500l5 3.500-3 3h-4.700l1.200 4h2v4H6.500v-4h2l1.200-4H6A3 3 0 0 1 3 9.500v-3z" },
    book: { d: "M5 3.500C5 2.700 5.700 2 6.500 2H19v16H7a2 2 0 0 0-2 2V3.500zM7 20h12v2H7a1 1 0 0 1 0-2zM8.500 5.500v2h7v-2h-7z" },
    bag: { d: "M9 2.500h6l-1.300 3c2.700 1.700 4.800 4.400 4.800 8 0 4-3 7-6.500 7s-6.500-3-6.500-7c0-3.600 2.100-6.300 4.800-8L9 2.500z" },
    bed: { d: "M2.500 5h2v14h-2zM4.500 12h17v5h-17zM6.500 8.500H11a1.500 1.500 0 0 1 1.500 1.500v2h-6zM19.500 17h2v2h-2zM4.500 17h2v2h-2z" },
    gem: { d: "M6.500 3h11l4.500 6L12 21.500 2 9l4.500-6zM6 9l6 9 6-9H6z" },
    sparkle: { d: "M11 2l2 6.500 6.500 2-6.500 2L11 19l-2-6.500-6.500-2L9 8.500 11 2zM19 14.500l.9 2.600 2.600.9-2.600.9-.9 2.600-.9-2.600-2.600-.9 2.600-.9.9-2.600z" },
    coins: { d: "M12 3C7.600 3 4 4.800 4 7s3.600 4 8 4 8-1.800 8-4-3.600-4-8-4zM4 9.500V12c0 2.200 3.600 4 8 4s8-1.800 8-4V9.500c-1.700 1.800-4.800 2.800-8 2.800S5.700 11.300 4 9.500zM4 14.500V17c0 2.200 3.600 4 8 4s8-1.800 8-4v-2.500c-1.700 1.800-4.800 2.800-8 2.800s-6.300-1-8-2.800z" },
    horseshoe: { d: "M4 21V11a8 8 0 0 1 16 0v10h-5V11a3 3 0 0 0-6 0v10H4z" },
    swords: { eo: false, d: "M3 3l6.500.9 9.300 9.300-2.100 2.100-9.300-9.300L3 3zM21 3l-.9 6.500-9.300 9.300-2.100-2.100 9.300-9.300L21 3zM2.800 17.500l3.700-3.700 3.700 3.700-3.700 3.700-3.700-3.700zM13.800 17.500l3.700-3.700 3.700 3.700-3.700 3.700-3.700-3.700z" },
    crown: { d: "M2.500 19.500L1.500 7l5.500 4.500L12 4l5 7.500L22.500 7l-1 12.500h-19z" },
    openbook: { d: "M12 6.500C9.800 4.700 6.500 4.200 3 5v14c3.500-.8 6.800-.3 9 1.500 2.200-1.800 5.500-2.300 9-1.500V5c-3.500-.8-6.800-.3-9 1.500zM11.200 7.500v11.600h1.600V7.500h-1.600z" },
    sword: { d: "M12 1.500l2.200 3V14h-4.400V4.500L12 1.500zM7 14.500h10V17H7zM10.800 17h2.400v3.500h-2.400zM10.200 20.500h3.600v2h-3.600z" },
    chest: { d: "M3 8.500A4.500 4.500 0 0 1 7.500 4h9A4.500 4.500 0 0 1 21 8.500V11H3V8.500zM3 12.500h7V14h4v-1.500h7V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6.500z" },
    exclaim: { d: "M10 2.500h4l-.8 12h-2.400L10 2.500zM10 17.500h4v4h-4v-4z" },
    question: { d: "M12 2.500a5.500 5.500 0 0 0-5.500 5.500h3.300A2.200 2.200 0 1 1 12 10.200c-1.800.8-3 2.200-3 4.300v.8h3.200v-.5c0-1 .9-1.700 2-2.500A5.400 5.400 0 0 0 12 2.500zM9.800 17.500h3.400v3.600H9.800v-3.600z" },
    skull: { d: "M12 2a8 8 0 0 0-8 8c0 2.600 1.200 4.400 3 5.600V19a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3.400c1.800-1.200 3-3 3-5.600a8 8 0 0 0-8-8zM9 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" },
    dagger: { d: "M12 1.500l2.800 9.500-2.800 3-2.800-3L12 1.500zM7.500 14.500h9V17h-9zM10.800 17h2.400v5h-2.400z" },
    plant: { d: "M11 16C6 16 3 12.500 3 6c5 0 8 3 8 8v2zM13 16c5 0 8-3.500 8-10-5 0-8 3-8 8v2zM11 16h2v6h-2z" }
};

const CATEGORIES = [
    { title: "Места", items: [
        { key: "city", name: "Город", icon: "castle", color: "#b3402f" },
        { key: "settlement", name: "Поселение", icon: "village", color: "#a8842f" },
        { key: "landmark", name: "Достопримечательность", icon: "peak", color: "#3f8a63" },
        { key: "fort", name: "Форт", icon: "tower", color: "#5f7185" },
        { key: "cave", name: "Пещера", icon: "cave", color: "#7a6553" },
        { key: "mine", name: "Шахта", icon: "pick", color: "#85804f" },
        { key: "ayleid_ruin", name: "Айлейдские руины", icon: "pillar", color: "#4f9fc4" },
        { key: "ayleid_well", name: "Айлейдский колодец", icon: "drop", color: "#2fa9c4" },
        { key: "oblivion_gate", name: "Врата Обливиона", icon: "ring", color: "#d1402a" },
        { key: "daedric_shrine", name: "Святилище даэдра", icon: "star", color: "#8e2f78" },
        { key: "chapel", name: "Часовня", icon: "temple", color: "#caa43a" },
        { key: "wayshrine", name: "Придорожное святилище", icon: "flame", color: "#d8b232" },
        { key: "magical_stone", name: "Магический камень", icon: "stone", color: "#7a5fc4" },
        { key: "obelisk_of_order", name: "Обелиск Порядка", icon: "obelisk", color: "#4f6fd0" },
        { key: "campsite", name: "Лагерь", icon: "tent", color: "#c6823a" },
        { key: "house", name: "Дом", icon: "house", color: "#6f9a45" },
        { key: "inn", name: "Таверна", icon: "mug", color: "#c46f33" },
        { key: "guild_hall", name: "Дом гильдии", icon: "shield", color: "#9a4f2a" }
    ] },
    { title: "Службы", items: [
        { key: "innkeeper", name: "Трактирщик", icon: "bed", color: "#c4904a", track: false, hidden: true },
        { key: "merchant", name: "Торговец", icon: "coins", color: "#cc9d2c", track: false, hidden: true },
        { key: "blacksmith", name: "Кузнец", icon: "anvil", color: "#876a58", track: false, hidden: true },
        { key: "alchemist", name: "Алхимик", icon: "flask", color: "#4aa266", track: false, hidden: true },
        { key: "magical_supplier", name: "Торговец магическими товарами", icon: "sparkle", color: "#5585cc", track: false, hidden: true },
        { key: "bookstore", name: "Книжная лавка", icon: "book", color: "#86652f", track: false, hidden: true },
        { key: "jeweler", name: "Ювелир", icon: "gem", color: "#cc5586", track: false, hidden: true },
        { key: "fence", name: "Скупщик краденого", icon: "bag", color: "#6a5a88", track: false, hidden: true },
        { key: "trainer", name: "Тренер", icon: "swords", color: "#bd5c37", track: false, hidden: true },
        { key: "stable", name: "Конюшня", icon: "horseshoe", color: "#85654a", track: false }
    ] },
    { title: "Предметы", items: [
        { key: "skill_book", name: "Книга навыков", icon: "openbook", color: "#3a74b0" },
        { key: "unique_item", name: "Уникальный предмет", icon: "sword", color: "#c9962a" },
        { key: "daedric_artifact", name: "Даэдрический артефакт", icon: "crown", color: "#a82a2a" },
        { key: "crystal_chest", name: "Кристальный сундук", icon: "chest", color: "#58bcd6" }
    ] },
    { title: "Задания", items: [
        { key: "main_quest", name: "Основное задание", icon: "exclaim", color: "#cf9f1c", track: false },
        { key: "side_quest", name: "Побочное задание", icon: "question", color: "#46965a", track: false },
        { key: "daedric_quest", name: "Задание даэдра", icon: "star", color: "#a03a7a", track: false },
        { key: "fighters_guild_quest", name: "Гильдия бойцов", icon: "shield", color: "#b0502a", track: false },
        { key: "mages_guild_quest", name: "Гильдия магов", icon: "sparkle", color: "#3a62b0", track: false },
        { key: "thieves_guild_quest", name: "Гильдия воров", icon: "dagger", color: "#5a6a7a", track: false },
        { key: "dark_brotherhood_quest", name: "Тёмное Братство", icon: "skull", color: "#7a1f1f", track: false }
    ] },
    { title: "Ресурсы", items: [
        { key: "nirnroot", name: "Корень Нирна", icon: "plant", color: "#33b595", dot: true, hidden: true }
    ] }
];

const CAT_BY_KEY = {};
CATEGORIES.forEach(g => g.items.forEach(c => { CAT_BY_KEY[c.key] = c; }));

// SVG-иконка категории для меню и поиска
function iconSvg(name) {
    const ic = ICONS[name];
    if (!ic) return "";
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ic.d}" fill-rule="${ic.eo === false ? "nonzero" : "evenodd"}"/></svg>`;
}
