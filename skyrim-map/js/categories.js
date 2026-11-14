// The Elder Scrolls V: Skyrim — категории меток.
// key — ключ категории (совпадает с build_data.py), icon — иконка из ICONS ниже (собственные SVG, 24×24).
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
    grave: { d: "M6 21V10a6 6 0 0 1 12 0v11H6zM11.1 7.2h1.8v2.1H15v1.8h-2.1v4.4h-1.8v-4.4H9V9.3h2.1V7.2z" },
    anchor: { d: "M12 2.500a2.500 2.500 0 1 1 0 5 2.500 2.500 0 0 1 0-5zm0 1.300a1.200 1.200 0 1 0 0 2.400 1.200 1.200 0 0 0 0-2.400zM11 7.500h2V21h-2zM8 9.500h8v1.800H8zM3 13h2.500c.5 3 2.800 5 6.500 5s6-2 6.500-5H21c-.5 4.500-4 8-9 8s-8.500-3.500-9-8z" },
    gear: { d: "M19.620 10.330 L22.380 10.440 L22.380 13.560 L19.620 13.670 L18.570 16.210 L20.450 18.240 L18.240 20.450 L16.210 18.570 L13.670 19.620 L13.560 22.380 L10.440 22.380 L10.330 19.620 L7.790 18.570 L5.760 20.450 L3.550 18.240 L5.430 16.210 L4.380 13.670 L1.620 13.560 L1.620 10.440 L4.380 10.330 L5.430 7.790 L3.550 5.760 L5.760 3.550 L7.790 5.430 L10.330 4.380 L10.440 1.620 L13.560 1.620 L13.670 4.380 L16.210 5.430 L18.240 3.550 L20.450 5.760 L18.570 7.790ZM15.200 12A3.200 3.200 0 1 0 8.800 12A3.200 3.200 0 1 0 15.200 12Z" },
    wing: { d: "M2 5c4-.5 7 1.500 8.500 5C11 8 12 6.500 12 6.500S13 8 13.500 10C15 6.500 18 4.500 22 5c-1.500 2-2 4.500-1.500 7-1.500-1-3-1-4 0 .5 2-.3 4.500-2 6.500-.3-1.800-1.200-3-2.500-3.800C10.700 15.500 9.800 16.700 9.500 18.500 7.800 16.500 7 14 7.500 12c-1-1-2.500-1-4 0C4 9.500 3.500 7 2 5z" },
    mound: { d: "M1.500 20.500c1.500-9 5.500-14 10.500-14s9 5 10.500 14h-21zM12 11.500a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" },
    wheat: { d: "M11.200 10h1.600v12h-1.600zM12 2c1.700 1.700 2.500 3.500 2.500 5.500S13.700 10 12 10s-2.500-.5-2.500-2.500S10.300 3.700 12 2zM7.200 7c2 .6 3.200 2 3.200 3.600-2-.2-3.300-1.200-3.200-3.600zM16.800 7c.1 2.400-1.200 3.400-3.200 3.600 0-1.600 1.200-3 3.200-3.600zM7.200 12c2 .6 3.200 2 3.200 3.600-2-.2-3.300-1.200-3.200-3.600zM16.800 12c.1 2.400-1.200 3.400-3.200 3.600 0-1.600 1.200-3 3.200-3.600z", eo: false },
    tree: { d: "M12 2l5.500 8h-3l4.500 6.500h-6V22h-2v-5.500H5L9.500 10h-3L12 2z" },
    flag: { d: "M5 2h2v20H5zM8 3h12l-3.500 4.500L20 12H8z" },
    axe: { d: "M13.500 3.500c3.500.2 6.500 2.500 7.500 6l-3 .8-.8 3.200-3.300-2 .6-3.600-3.200-2.200 2.200-2.200zM11.200 9.800l2 2L5 22l-2.200-2.200 8.400-10z", eo: false },
    bars: { d: "M3 3h18v18H3zM6 6h2v12H6zM11 6h2v12h-2zM16 6h2v12h-2z" },
    lighthouse: { d: "M10.500 2h3l1 2.500h-5L10.500 2zM9.500 5.500h5L16 21H8L9.500 5.500zM10.800 8h2.400v2.200h-2.400zM10.500 12.500h3V15h-3z" },
    boat: { d: "M2 14h20l-3.500 6h-13L2 14zM11 2v10H4.500L11 2zM13 5l6 7h-6V5z", eo: false },
    door: { d: "M6 2h12v20H6zM9 5h6v6H9zM9 13h6v6H9z" },
    person: { d: "M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21c0-4.500 3.600-7.500 8-7.500s8 3 8 7.500H4z" },
    scroll: { d: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM7.500 7l3.500 3.500L14.500 7l1.500 1.500-3.500 3.500 3.500 3.500-1.500 1.500-3.500-3.500L7.500 16.500 6 15l3.500-3L6 8.500 7.500 7z" },
    hex: { d: "M20.660 17 L12 22 L3.340 17 L3.340 7 L12 2 L20.660 7ZM15.900 14.250 L12 16.500 L8.100 14.250 L8.100 9.750 L12 7.500 L15.900 9.750Z" },
    club: { d: "M16 2c3 0 5.500 2.500 5.500 5.500 0 2.500-1.800 4.500-4 6.500l-3 2.800-1.200 4.200-3.800-1 1.800-3.800L9 14c-.8-3.500.8-7 3-9.500C13 3 14.500 2 16 2z" },
    runes: { d: "M4 3h16v18H4zM7 6.500h1.800v11H7zM11 6.500h1.800v4.500H11zM11 13.500h1.800v4H11zM15 6.500h1.800v11H15z" },
    log: { d: "M3.500 7h11a5 5 0 0 1 0 10h-11a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM14.500 9.300a2.700 2.700 0 1 0 0 5.400 2.700 2.700 0 0 0 0-5.400z" },
    cart: { d: "M2 6h12v9H2zM14 9h4l3 3.500V15h-7zM6.500 16a2.500 2.500 0 1 0 0 5 2.500 2.500 0 0 0 0-5zM17.500 16a2.500 2.500 0 1 0 0 5 2.500 2.500 0 0 0 0-5z", eo: false },
    heart: { d: "M12 21s-8-5.200-8-11.200A4.600 4.600 0 0 1 12 7a4.600 4.600 0 0 1 8 3.800C20 15.800 12 21 12 21z" },
    brick: { d: "M2 6h20v12H2zM3.500 7.500v3h7v-3zM12 7.500v3h8.500v-3zM3.500 12v4.500H8V12zM9.500 12v4.500h5V12zM16 12v4.500h4.500V12z" },
    rock: { d: "M3 18l3-8 5-5 6 2 4 6-2 5H3z" },
    snow: { d: "M1.500 10.900 L22.500 10.900 L22.500 13.100 L1.500 13.100ZM7.700 2.360 L18.200 20.540 L16.300 21.640 L5.800 3.460ZM18.200 3.460 L7.700 21.640 L5.800 20.540 L16.300 2.360Z", eo: false },
    plant: { d: "M11 16C6 16 3 12.500 3 6c5 0 8 3 8 8v2zM13 16c5 0 8-3.500 8-10-5 0-8 3-8 8v2zM11 16h2v6h-2z" }
};

const CATEGORIES = [
    { title: "Поселения", items: [
        { key: "city", name: "Город", icon: "castle", color: "#a8402f" },
        { key: "town", name: "Деревня", icon: "village", color: "#b88a3a" },
        { key: "settlement", name: "Поселение", icon: "house", color: "#a89a4a" },
        { key: "castle", name: "Замок", icon: "tower", color: "#8a3c4a" },
        { key: "guild_hall", name: "Гильдия", icon: "shield", color: "#7a4a2a" },
        { key: "inn", name: "Таверна", icon: "mug", color: "#c46f33" },
        { key: "house_own", name: "Приобретаемый дом", icon: "crown", color: "#d1a02a" },
        { key: "house", name: "Дом", icon: "house", color: "#6f9a65", track: false, hidden: true },
        { key: "stable", name: "Конюшня", icon: "horseshoe", color: "#85654a" },
        { key: "farm", name: "Ферма", icon: "wheat", color: "#9aa04a" },
        { key: "wheat_mill", name: "Пшеничная ферма", icon: "wheat", color: "#c4a53a" },
        { key: "wood_mill", name: "Лесопилка", icon: "log", color: "#8a6a3a" },
        { key: "shack", name: "Хижина", icon: "house", color: "#7a7a5a" },
        { key: "library", name: "Библиотека", icon: "book", color: "#4a6a9a" },
        { key: "jail", name: "Тюрьма", icon: "bars", color: "#6a6a72" },
        { key: "lighthouse", name: "Маяк", icon: "lighthouse", color: "#d0c4a0" },
        { key: "dock", name: "Причал", icon: "anchor", color: "#4a82a0" }
    ] },
    { title: "Форты и лагеря", items: [
        { key: "fort", name: "Форт", icon: "tower", color: "#5f7185" },
        { key: "watchtower", name: "Сторожевая башня", icon: "tower", color: "#7a8a99" },
        { key: "camp", name: "Лагерь", icon: "tent", color: "#c6823a" },
        { key: "imperial_camp", name: "Лагерь Империи", icon: "flag", color: "#b83a3a" },
        { key: "stormcloak_camp", name: "Лагерь Братьев Бури", icon: "flag", color: "#3a6aa8" },
        { key: "giant_camp", name: "Лагерь великанов", icon: "club", color: "#9a7a4a" },
        { key: "orc_stronghold", name: "Орочья крепость", icon: "swords", color: "#5a8a4a" }
    ] },
    { title: "Подземелья и руины", items: [
        { key: "cave", name: "Пещера", icon: "cave", color: "#7a6553" },
        { key: "mine", name: "Шахта", icon: "pick", color: "#85804f" },
        { key: "nordic_ruin", name: "Нордские руины", icon: "pillar", color: "#4f8fb4" },
        { key: "nordic_tower", name: "Нордская башня", icon: "obelisk", color: "#6a8fb0" },
        { key: "dwemer_ruin", name: "Руины двемеров", icon: "gear", color: "#b0842a" },
        { key: "ruin", name: "Руины", icon: "pillar", color: "#8a8478" },
        { key: "temple", name: "Храм", icon: "temple", color: "#caa43a" },
        { key: "cemetery", name: "Зал мёртвых", icon: "grave", color: "#8a7a9a" },
        { key: "shipwreck", name: "Кораблекрушение", icon: "boat", color: "#3a7a8a" }
    ] },
    { title: "Природа и святыни", items: [
        { key: "word_wall", name: "Стена слов", icon: "runes", color: "#2fa9c4" },
        { key: "dragon_lair", name: "Логово дракона", icon: "wing", color: "#c43a2a" },
        { key: "dragon_mound", name: "Драконий курган", icon: "mound", color: "#8a4a3a" },
        { key: "standing_stone", name: "Путевой камень", icon: "stone", color: "#7a5fc4" },
        { key: "shrine", name: "Святилище Божества", icon: "sparkle", color: "#d8b232" },
        { key: "daedric_shrine", name: "Святилище даэдра", icon: "star", color: "#8e2f78" },
        { key: "landmark", name: "Достопримечательность", icon: "peak", color: "#3f8a63" },
        { key: "poi", name: "Примечательное место", icon: "star", color: "#4aa28a" },
        { key: "pass", name: "Перевал", icon: "peak", color: "#8aa0b0" },
        { key: "clearing", name: "Поляна", icon: "plant", color: "#5aa04a" },
        { key: "grove", name: "Роща", icon: "tree", color: "#3a8a4a" }
    ] },
    { title: "Предметы", items: [
        { key: "skill_book", name: "Книга навыков", icon: "openbook", color: "#3a74b0" },
        { key: "dragon_priest", name: "Драконий жрец", icon: "skull", color: "#a82a2a" },
        { key: "unique_item", name: "Уникальный предмет", icon: "sword", color: "#c9962a" },
        { key: "barenziah", name: "Камень Барензии", icon: "gem", color: "#a24aa8" },
        { key: "treasure_chest", name: "Сундук с сокровищами", icon: "chest", color: "#c4883a" },
        { key: "treasure_map", name: "Карта сокровищ", icon: "scroll", color: "#9a7a3a" },
        { key: "pendant", name: "Подвеска Восточно-Имперской компании", icon: "ring", color: "#d1a02a" }
    ] },
    { title: "Службы", items: [
        { key: "follower", name: "Спутник", icon: "person", color: "#4a9a6a", track: false, hidden: true },
        { key: "trainer", name: "Учитель", icon: "swords", color: "#bd5c37", track: false, hidden: true },
        { key: "merchant", name: "Торговец", icon: "coins", color: "#cc9d2c", track: false, hidden: true },
        { key: "blacksmith", name: "Кузнец", icon: "anvil", color: "#876a58", track: false, hidden: true },
        { key: "alchemist", name: "Алхимик", icon: "flask", color: "#4aa266", track: false, hidden: true },
        { key: "spell_vendor", name: "Торговец заклинаниями", icon: "sparkle", color: "#5585cc", track: false, hidden: true },
        { key: "jeweler", name: "Ювелир", icon: "gem", color: "#cc5586", track: false, hidden: true },
        { key: "fence", name: "Скупщик краденого", icon: "bag", color: "#6a5a88", track: false, hidden: true },
        { key: "marriage", name: "Возможный брак", icon: "heart", color: "#d0506a", track: false, hidden: true },
        { key: "smelter", name: "Плавильня", icon: "flame", color: "#d1702a", track: false, hidden: true },
        { key: "carriage", name: "Повозка", icon: "cart", color: "#8a7a5a", track: false, hidden: true }
    ] },
    { title: "Задания", items: [
        { key: "side_quest", name: "Побочное задание", icon: "question", color: "#46965a", track: false }
    ] },
    { title: "Ресурсы", items: [
        { key: "ore_iron", name: "Железная руда", icon: "pick", color: "#8a8a92", dot: true, track: false, hidden: true },
        { key: "ore_corundum", name: "Корундовая руда", icon: "pick", color: "#b0644a", dot: true, track: false, hidden: true },
        { key: "ore_silver", name: "Серебряная руда", icon: "pick", color: "#b8c0cc", dot: true, track: false, hidden: true },
        { key: "ore_gold", name: "Золотая руда", icon: "pick", color: "#d8b232", dot: true, track: false, hidden: true },
        { key: "ore_moonstone", name: "Лунная руда", icon: "pick", color: "#7aa8d8", dot: true, track: false, hidden: true },
        { key: "ore_orichalcum", name: "Орихалковая руда", icon: "pick", color: "#5a9a6a", dot: true, track: false, hidden: true },
        { key: "ore_quicksilver", name: "Ртутная руда", icon: "pick", color: "#8a8aa8", dot: true, track: false, hidden: true },
        { key: "ore_malachite", name: "Малахитовая руда", icon: "pick", color: "#2fa27a", dot: true, track: false, hidden: true },
        { key: "ore_ebony", name: "Эбонитовая руда", icon: "pick", color: "#4a4a58", dot: true, track: false, hidden: true },
        { key: "clay", name: "Глина", icon: "brick", color: "#b07a52", dot: true, track: false, hidden: true },
        { key: "quarry", name: "Каменоломня", icon: "rock", color: "#9a9488", dot: true, track: false, hidden: true },
        { key: "beehive", name: "Улей", icon: "hex", color: "#d8a62a", dot: true, track: false, hidden: true },
        { key: "stalhrim", name: "Сталгрим", icon: "snow", color: "#58bcd6", dot: true, track: false, hidden: true },
        { key: "heartstone", name: "Сердечный камень", icon: "heart", color: "#c4403a", dot: true, track: false, hidden: true },
        { key: "geode", name: "Самоцветная жеода", icon: "gem", color: "#3aa0c4", dot: true, track: false, hidden: true }
    ] },
    { title: "Прочее", items: [
        { key: "door", name: "Дверь", icon: "door", color: "#8a6a4a", dot: true, track: false, hidden: true },
        { key: "other", name: "Прочее", icon: "question", color: "#7a7a7a", track: false, hidden: true }
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
