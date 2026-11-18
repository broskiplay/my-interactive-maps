// Silver Palace — категории меток (сгенерировано tools/build_data.py). Иконки — цветной спрайт icons.png (ячейка 64);
// track: false — метка не входит в общий прогресс; ink — цвет глифа на светлом пине; about — описание в окне метки.

const CATEGORIES = [
    { title: "Места", items: [
        {"key": "landmark", "name": "Достопримечательности", "icon": [0, 0], "color": "#c7ccda", "ink": "#10141f", "track": false, "about": "Крупные места Серебряного дворца: площади, банки, больницы, универмаги."}
    ] },
    { title: "Тайники с добычей", items: [
        {"key": "tier1", "name": "Тайник I", "icon": [64, 0], "color": "#3c58b8", "about": "Унции, кристаллы реактора, репутация, бумажная закладка и том I «Науки обо всём»."},
        {"key": "tier2", "name": "Тайник II", "icon": [128, 0], "color": "#6d4fc7", "about": "Больше унций и кристаллов, стальные закладки и тома I–II."},
        {"key": "tier3", "name": "Тайник III", "icon": [192, 0], "color": "#b8902f", "about": "Лучшая добыча: золотая закладка Симуляции, 2000 унций и том III."},
        {"key": "ounce", "name": "Унции", "icon": [256, 0], "color": "#7d8696", "about": "Только валюта — 1000 унций."}
    ] },
    { title: "Материалы", items: [
        {"key": "core", "name": "Быстрое заряженное ядро", "icon": [320, 0], "color": "#2b8a99"},
        {"key": "mistletoe", "name": "Золотая омела", "icon": [384, 0], "color": "#2f8a55"},
        {"key": "conch", "name": "Консервная раковина", "icon": [448, 0], "color": "#2c72b0"},
        {"key": "whitesand", "name": "Вторичный белый песок", "icon": [0, 64], "color": "#8a90a0"},
        {"key": "cognito", "name": "Песок когнито", "icon": [64, 64], "color": "#8f43a8", "about": "За один раз даёт 15 единиц песка когнито."},
        {"key": "package", "name": "Потерянная посылка", "icon": [128, 64], "color": "#a2703c"}
    ] },
    { title: "Документы", items: [
        {"key": "docs", "name": "Записки и документы", "icon": [192, 64], "color": "#97855f", "about": "Письма, плакаты, брошюры и записки — каждая единственная в своём месте."}
    ] }
];

const CAT_BY_KEY = {};
CATEGORIES.forEach(g => g.items.forEach(c => { CAT_BY_KEY[c.key] = c; }));

// Цветной спрайт (не маска): значки рисуются как есть. Ячейка 64 px
const ICON_SHEET = { url: "icons.png?v=1", w: 512, h: 128, cell: 64 };
const ICON_IMG = new Image();
ICON_IMG.src = ICON_SHEET.url;
function iconSvg(icon) {
    if (!Array.isArray(icon)) return "";
    const px = icon[0] / (ICON_SHEET.w - ICON_SHEET.cell) * 100, py = icon[1] / (ICON_SHEET.h - ICON_SHEET.cell) * 100;
    return `<span class="cp-glyph" aria-hidden="true" style="--gx:${px.toFixed(3)}%;--gy:${py.toFixed(3)}%"></span>`;
}
