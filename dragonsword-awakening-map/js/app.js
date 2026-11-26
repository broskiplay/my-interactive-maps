// Интерактивная карта DragonSword: Awakening: Орбис и 56 подземелий, арен и башен.
// Метки, русские названия и описания, значки и тайлы — dragonswordawakening.th.gl (tools/build_data.py, tools/make_tiles.py);
// категории — в categories.js. Здесь: карта, метки, прогресс, облако. Движок — копия карты Phantom Blade Zero
// (страницы /dragonsword-awakening-map/<карта>/ делает scripts/map_pages.py).

// ---------- Карты и координаты ----------
// Картинка карты th.gl (z0 = 512 px) — весь мир Web Mercator: тайл th.gl z/x/y — это XYZ-тайл MapLibre.
// Тайлы — репозиторий dragonsword-awakening-assets (GitHub Pages): tiles/<карта>/<z>/<x>/<y>.webp, 512×512,
// Орбис z0–3, подземелья z0–1 (морские и пустые тайлы выкинуты, арены стихий делят одну папку).
// Список существующих тайлов — manifest.json в той же папке. play — рамка карты, labels — зумы подписей регионов.
// Блок MAPS генерирует tools/make_maps_js.py.
const ASSETS_ROOT = "https://broskiplay.github.io/dragonsword-awakening-assets";
// MAPS:begin
const MAPS = {
    "orbis": {
        id: "orbis", name: "Орбис", markersFile: "data/dragonsword_orbis_markers.json", tiles: `${ASSETS_ROOT}/tiles/orbis`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [2.75, 5.5],
        tileMinZ: 1, tileMaxZ: 4, minZoom: 1.25, maxZoom: 6.5, pinFull: 4.5, focusZoom: 4.75,
        play: [[-79.17133, -180.0], [85.05113, 180.0]], tileBounds: [[-79.17133, -180.0], [85.05113, 180.0]], background: "#36bdd6"
    },
    "altar-of-the-dragon": {
        id: "altar-of-the-dragon", name: "Алтарь Дракона", markersFile: "data/dragonsword_altar-of-the-dragon_markers.json", tiles: `${ASSETS_ROOT}/tiles/altar-of-the-dragon`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1.25, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -100.55948], [85.05113, 121.18161]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "fang-bandits-arena": {
        id: "fang-bandits-arena", name: "Арена Клыков Разбойников", markersFile: "data/dragonsword_fang-bandits-arena_markers.json", tiles: `${ASSETS_ROOT}/tiles/fang-bandits-arena`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-49.48461, -38.98179], [1.58353, 23.66583]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "rock-tribe-base": {
        id: "rock-tribe-base", name: "База Каменного племени", markersFile: "data/dragonsword_rock-tribe-base_markers.json", tiles: `${ASSETS_ROOT}/tiles/rock-tribe-base`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -54.32965], [85.05113, 77.91675]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "coastal-cliff-cave-outpost": {
        id: "coastal-cliff-cave-outpost", name: "База в пещере прибрежных утёсов", markersFile: "data/dragonsword_coastal-cliff-cave-outpost_markers.json", tiles: `${ASSETS_ROOT}/tiles/coastal-cliff-cave-outpost`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-48.24238, -173.07373], [85.05113, 180.0]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "vanak-the-bloody-hook": {
        id: "vanak-the-bloody-hook", name: "Банак Кровавый Крюк", markersFile: "data/dragonsword_vanak-the-bloody-hook_markers.json", tiles: `${ASSETS_ROOT}/tiles/vanak-the-bloody-hook`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[6.09568, 27.82213], [7.23822, 28.96768]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "tower-of-amplitude": {
        id: "tower-of-amplitude", name: "Башня Вибрации", markersFile: "data/dragonsword_tower-of-amplitude_markers.json", tiles: `${ASSETS_ROOT}/tiles/tower-of-amplitude`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-33.79173, 6.19451], [12.14284, 52.89483]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "tower-of-crushing": {
        id: "tower-of-crushing", name: "Башня Сокрушения", markersFile: "data/dragonsword_tower-of-crushing_markers.json", tiles: `${ASSETS_ROOT}/tiles/tower-of-amplitude`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-42.41206, -1.58635], [19.28351, 58.71349]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "tower-of-gale": {
        id: "tower-of-gale", name: "Башня Шквала", markersFile: "data/dragonsword_tower-of-gale_markers.json", tiles: `${ASSETS_ROOT}/tiles/tower-of-amplitude`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-44.69416, -4.94474], [21.76029, 64.33595]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "endless-summoning-grounds": {
        id: "endless-summoning-grounds", name: "Бесконечное место призыва", markersFile: "data/dragonsword_endless-summoning-grounds_markers.json", tiles: `${ASSETS_ROOT}/tiles/endless-summoning-grounds`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[31.39854, -64.513], [63.05867, 14.59325]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "ghagaroach-of-blazeflame": {
        id: "ghagaroach-of-blazeflame", name: "Гагарочи Алого Пламени", markersFile: "data/dragonsword_ghagaroach-of-blazeflame_markers.json", tiles: `${ASSETS_ROOT}/tiles/ghagaroach-of-blazeflame`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-41.12859, -51.05463], [49.86163, 64.74336]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "ghagaroach-of-thunderbolt": {
        id: "ghagaroach-of-thunderbolt", name: "Гагарочи Молнии", markersFile: "data/dragonsword_ghagaroach-of-thunderbolt_markers.json", tiles: `${ASSETS_ROOT}/tiles/ghagaroach-of-blazeflame`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-41.12859, -51.05463], [49.86163, 64.74336]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "ghagaroach-of-venom": {
        id: "ghagaroach-of-venom", name: "Гагарочи Мутности", markersFile: "data/dragonsword_ghagaroach-of-venom_markers.json", tiles: `${ASSETS_ROOT}/tiles/ghagaroach-of-blazeflame`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-41.12859, -51.05463], [49.86163, 64.74336]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "ghagaroach-of-frostbite": {
        id: "ghagaroach-of-frostbite", name: "Гагарочи Хладолёда", markersFile: "data/dragonsword_ghagaroach-of-frostbite_markers.json", tiles: `${ASSETS_ROOT}/tiles/ghagaroach-of-blazeflame`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-41.12859, -51.05463], [49.86163, 64.74336]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "gallore-the-collapse": {
        id: "gallore-the-collapse", name: "Галор Распада", markersFile: "data/dragonsword_gallore-the-collapse_markers.json", tiles: `${ASSETS_ROOT}/tiles/gallore-the-collapse`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-8.98251, -7.16469], [-8.034, -6.21341]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "furcas-the-starving-ghost-of-corrosion": {
        id: "furcas-the-starving-ghost-of-corrosion", name: "Голодный дух коррозии Фуркас", markersFile: "data/dragonsword_furcas-the-starving-ghost-of-corrosion_markers.json", tiles: `${ASSETS_ROOT}/tiles/furcas-the-starving-ghost-of-corrosion`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-38.23202, -0.64204], [-37.3057, 0.34427]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "ghoul-greed": {
        id: "ghoul-greed", name: "Гуль жадности", markersFile: "data/dragonsword_ghoul-greed_markers.json", tiles: `${ASSETS_ROOT}/tiles/ghoul-greed`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[46.01095, 25.1682], [46.83383, 26.04646]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "drosophia-of-breaker": {
        id: "drosophia-of-breaker", name: "Драсофир Ударной волны", markersFile: "data/dragonsword_drosophia-of-breaker_markers.json", tiles: `${ASSETS_ROOT}/tiles/ghagaroach-of-blazeflame`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-41.12859, -51.05463], [49.86163, 64.74336]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "drosophia-of-bloodburst": {
        id: "drosophia-of-bloodburst", name: "Драсофир Ярости", markersFile: "data/dragonsword_drosophia-of-bloodburst_markers.json", tiles: `${ASSETS_ROOT}/tiles/ghagaroach-of-blazeflame`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-41.12859, -51.05463], [49.86163, 64.74336]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "corrupted-cave": {
        id: "corrupted-cave", name: "Заражённая пещера", markersFile: "data/dragonsword_corrupted-cave_markers.json", tiles: `${ASSETS_ROOT}/tiles/corrupted-cave`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-12.13848, -61.13371], [-11.43848, -60.43371]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "sunken-ruins": {
        id: "sunken-ruins", name: "Затонувшие руины / Руины под волнами", markersFile: "data/dragonsword_sunken-ruins_markers.json", tiles: `${ASSETS_ROOT}/tiles/sunken-ruins`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-6.06596, 1.28745], [11.51035, 40.68646]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "earthlander-of-the-ravenous-earth": {
        id: "earthlander-of-the-ravenous-earth", name: "Землянин Голодной Земли", markersFile: "data/dragonsword_earthlander-of-the-ravenous-earth_markers.json", tiles: `${ASSETS_ROOT}/tiles/earthlander-of-the-ravenous-earth`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[12.90186, 15.06565], [13.87434, 16.04574]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "residual-worm-cleanup-zone": {
        id: "residual-worm-cleanup-zone", name: "Зона зачистки оставшихся Червей", markersFile: "data/dragonsword_residual-worm-cleanup-zone_markers.json", tiles: `${ASSETS_ROOT}/tiles/residual-worm-cleanup-zone`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-50.30902, -31.42762], [42.31565, 28.29076]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "forest-of-entangled-roots": {
        id: "forest-of-entangled-roots", name: "Лес Переплетённых Корней", markersFile: "data/dragonsword_forest-of-entangled-roots_markers.json", tiles: `${ASSETS_ROOT}/tiles/forest-of-entangled-roots`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-43.25281, -161.38261], [85.05113, 119.1549]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "dragon-worshipper-hideout": {
        id: "dragon-worshipper-hideout", name: "Логово Поклонников дракона", markersFile: "data/dragonsword_dragon-worshipper-hideout_markers.json", tiles: `${ASSETS_ROOT}/tiles/dragon-worshipper-hideout`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1.25, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -55.60635], [85.05113, 134.54301]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "nest-of-the-great-worm": {
        id: "nest-of-the-great-worm", name: "Логово гигантского червя", markersFile: "data/dragonsword_nest-of-the-great-worm_markers.json", tiles: `${ASSETS_ROOT}/tiles/nest-of-the-great-worm`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1.25, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -89.77736], [85.05113, 128.69625]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "mantius-of-amplitude": {
        id: "mantius-of-amplitude", name: "Мантиас Вибрации", markersFile: "data/dragonsword_mantius-of-amplitude_markers.json", tiles: `${ASSETS_ROOT}/tiles/ghagaroach-of-blazeflame`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-41.12859, -51.05463], [49.86163, 64.74336]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "mantius-of-crushing": {
        id: "mantius-of-crushing", name: "Мантиас Сокрушения", markersFile: "data/dragonsword_mantius-of-crushing_markers.json", tiles: `${ASSETS_ROOT}/tiles/ghagaroach-of-blazeflame`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-41.12859, -51.05463], [49.86163, 64.74336]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "mantius-of-gale": {
        id: "mantius-of-gale", name: "Мантиас Шквала", markersFile: "data/dragonsword_mantius-of-gale_markers.json", tiles: `${ASSETS_ROOT}/tiles/mantius-of-gale`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-41.12859, -51.05463], [49.86163, 64.74336]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "where-the-giant-sleeps": {
        id: "where-the-giant-sleeps", name: "Место, где спит Великан", markersFile: "data/dragonsword_where-the-giant-sleeps_markers.json", tiles: `${ASSETS_ROOT}/tiles/where-the-giant-sleeps`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-10.03731, 19.82444], [-9.33731, 20.52444]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "tomb-of-greed": {
        id: "tomb-of-greed", name: "Могила жадности", markersFile: "data/dragonsword_tomb-of-greed_markers.json", tiles: `${ASSETS_ROOT}/tiles/tomb-of-greed`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -57.54227], [85.05113, 33.96329]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "the-graveyard-where-tragedy-sleeps": {
        id: "the-graveyard-where-tragedy-sleeps", name: "Некрополь, где спит трагедия", markersFile: "data/dragonsword_the-graveyard-where-tragedy-sleeps_markers.json", tiles: `${ASSETS_ROOT}/tiles/the-graveyard-where-tragedy-sleeps`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-44.45426, -160.96006], [26.40218, 180.0]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "steelheart-fortress-defense-raid": {
        id: "steelheart-fortress-defense-raid", name: "Оборона крепости Стального сердца (Рейд)", markersFile: "data/dragonsword_steelheart-fortress-defense-raid_markers.json", tiles: `${ASSETS_ROOT}/tiles/steelheart-fortress-defense-raid`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -144.78323], [85.05113, 140.95827]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "steelheart-fortress-defense-scenario": {
        id: "steelheart-fortress-defense-scenario", name: "Оборона крепости Стального сердца (Сюжет)", markersFile: "data/dragonsword_steelheart-fortress-defense-scenario_markers.json", tiles: `${ASSETS_ROOT}/tiles/steelheart-fortress-defense-scenario`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -155.19688], [85.05113, 146.35368]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "steelheart-fortress-armory": {
        id: "steelheart-fortress-armory", name: "Оружейная крепости Стального сердца", markersFile: "data/dragonsword_steelheart-fortress-armory_markers.json", tiles: `${ASSETS_ROOT}/tiles/steelheart-fortress-armory`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -7.16669], [85.05113, 111.27385]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "corrupted-bedchamber": {
        id: "corrupted-bedchamber", name: "Оскверненная спальня", markersFile: "data/dragonsword_corrupted-bedchamber_markers.json", tiles: `${ASSETS_ROOT}/tiles/corrupted-bedchamber`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -139.23457], [85.05113, 178.23063]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "barduk-the-corrupted": {
        id: "barduk-the-corrupted", name: "Падший Бардук", markersFile: "data/dragonsword_barduk-the-corrupted_markers.json", tiles: `${ASSETS_ROOT}/tiles/barduk-the-corrupted`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[17.03593, 46.66788], [17.73593, 47.36788]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "warg-cave": {
        id: "warg-cave", name: "Пещера Варгов", markersFile: "data/dragonsword_warg-cave_markers.json", tiles: `${ASSETS_ROOT}/tiles/warg-cave`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-51.55233, -153.47693], [54.63466, 103.62277]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "goblin-bandits-cave": {
        id: "goblin-bandits-cave", name: "Пещера шайки гоблинов", markersFile: "data/dragonsword_goblin-bandits-cave_markers.json", tiles: `${ASSETS_ROOT}/tiles/goblin-bandits-cave`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-61.91571, -129.39893], [71.96498, 138.88413]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "warg-enclosure": {
        id: "warg-enclosure", name: "Питомник Варгов", markersFile: "data/dragonsword_warg-enclosure_markers.json", tiles: `${ASSETS_ROOT}/tiles/warg-enclosure`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-27.89373, -104.74407], [26.66991, 153.13203]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "chase-toward-the-end-raid": {
        id: "chase-toward-the-end-raid", name: "Погоня к финалу (Рейд)", markersFile: "data/dragonsword_chase-toward-the-end-raid_markers.json", tiles: `${ASSETS_ROOT}/tiles/chase-toward-the-end-raid`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1.5, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -83.68223], [85.05113, 86.88573]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "chase-toward-the-end-scenario": {
        id: "chase-toward-the-end-scenario", name: "Погоня к финалу (Сюжет)", markersFile: "data/dragonsword_chase-toward-the-end-scenario_markers.json", tiles: `${ASSETS_ROOT}/tiles/chase-toward-the-end-scenario`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1.75, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -77.42878], [85.05113, 74.8982]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "underground-goblin-village": {
        id: "underground-goblin-village", name: "Подземная деревня гоблинов", markersFile: "data/dragonsword_underground-goblin-village_markers.json", tiles: `${ASSETS_ROOT}/tiles/underground-goblin-village`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-35.25835, -137.36325], [36.01027, 158.1372]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "the-elemental-sanctuary": {
        id: "the-elemental-sanctuary", name: "Пристанище духов", markersFile: "data/dragonsword_the-elemental-sanctuary_markers.json", tiles: `${ASSETS_ROOT}/tiles/the-elemental-sanctuary`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-29.01816, -120.69429], [40.853, 132.76011]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "collapsed-sanctuary": {
        id: "collapsed-sanctuary", name: "Разрушенное Святилище", markersFile: "data/dragonsword_collapsed-sanctuary_markers.json", tiles: `${ASSETS_ROOT}/tiles/collapsed-sanctuary`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-34.78093, -164.78901], [32.0606, 180.0]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "cracked-crevice": {
        id: "cracked-crevice", name: "Расщелина", markersFile: "data/dragonsword_cracked-crevice_markers.json", tiles: `${ASSETS_ROOT}/tiles/cracked-crevice`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -180.0], [85.05113, 180.0]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "dragon-worshipper-ruins": {
        id: "dragon-worshipper-ruins", name: "Руины Поклонников дракона", markersFile: "data/dragonsword_dragon-worshipper-ruins_markers.json", tiles: `${ASSETS_ROOT}/tiles/dragon-worshipper-ruins`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -23.07153], [85.05113, 31.39512]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "ancient-ruins": {
        id: "ancient-ruins", name: "Руины старого замка", markersFile: "data/dragonsword_ancient-ruins_markers.json", tiles: `${ASSETS_ROOT}/tiles/ancient-ruins`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, 26.95813], [85.05113, 93.38389]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "silver-tusk-bandits-supply-depot": {
        id: "silver-tusk-bandits-supply-depot", name: "Склад припасов банды Серебряного Клыка", markersFile: "data/dragonsword_silver-tusk-bandits-supply-depot_markers.json", tiles: `${ASSETS_ROOT}/tiles/silver-tusk-bandits-supply-depot`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1.75, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -91.10494], [85.05113, 66.41313]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "trace-of-the-giant": {
        id: "trace-of-the-giant", name: "След великана", markersFile: "data/dragonsword_trace-of-the-giant_markers.json", tiles: `${ASSETS_ROOT}/tiles/trace-of-the-giant`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1.75, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-50.40929, -73.37388], [17.98366, 74.77093]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "rusted-tusk-bandits-treasure-vault": {
        id: "rusted-tusk-bandits-treasure-vault", name: "Сокровищница банды Ржавого Клыка", markersFile: "data/dragonsword_rusted-tusk-bandits-treasure-vault_markers.json", tiles: `${ASSETS_ROOT}/tiles/rusted-tusk-bandits-treasure-vault`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1.25, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -87.56414], [85.05113, 105.26409]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "dark-swamp": {
        id: "dark-swamp", name: "Тёмное болото", markersFile: "data/dragonsword_dark-swamp_markers.json", tiles: `${ASSETS_ROOT}/tiles/dark-swamp`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -65.60668], [85.05113, 49.29093]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "ashen-ruins": {
        id: "ashen-ruins", name: "Цитадель Пепла", markersFile: "data/dragonsword_ashen-ruins_markers.json", tiles: `${ASSETS_ROOT}/tiles/ashen-ruins`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2.0, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -72.85871], [85.05113, 53.05693]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "mercenary-crew-promotion-exam-veteran": {
        id: "mercenary-crew-promotion-exam-veteran", name: "Экзамен корпуса наёмников на повышение ранга (ветеран)", markersFile: "data/dragonsword_mercenary-crew-promotion-exam-veteran_markers.json", tiles: `${ASSETS_ROOT}/tiles/mercenary-crew-promotion-exam-veteran`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-63.52418, -150.17175], [84.73589, 150.32953]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "mercenary-crew-promotion-exam-novice": {
        id: "mercenary-crew-promotion-exam-novice", name: "Экзамен корпуса наёмников на повышение ранга (низкий ранг)", markersFile: "data/dragonsword_mercenary-crew-promotion-exam-novice_markers.json", tiles: `${ASSETS_ROOT}/tiles/mercenary-crew-promotion-exam-novice`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-30.80316, -119.64078], [34.85522, 153.54248]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "mercenary-crew-promotion-exam-intermediate": {
        id: "mercenary-crew-promotion-exam-intermediate", name: "Экзамен корпуса наёмников на повышение ранга (средний ранг)", markersFile: "data/dragonsword_mercenary-crew-promotion-exam-intermediate_markers.json", tiles: `${ASSETS_ROOT}/tiles/mercenary-crew-promotion-exam-intermediate`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 1.75, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[-85.05113, -75.41819], [85.05113, 65.24835]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    },
    "eroded-underground-cemetery": {
        id: "eroded-underground-cemetery", name: "Эродированные катакомбы", markersFile: "data/dragonsword_eroded-underground-cemetery_markers.json", tiles: `${ASSETS_ROOT}/tiles/eroded-underground-cemetery`,
        tileExt: "webp", tileSize: 512, zoomOffset: -1, fit: true, labels: [0, 0],
        tileMinZ: 1, tileMaxZ: 2, minZoom: 2, maxZoom: 4.5, pinFull: 2.5, focusZoom: 2.75,
        play: [[2.64687, -90.55747], [38.66871, -41.65464]], tileBounds: [[-85.05113, -180.0], [85.05113, 180.0]], background: "#000000"
    }
};
const MAP_ORDER = ["orbis", "altar-of-the-dragon", "fang-bandits-arena", "rock-tribe-base", "coastal-cliff-cave-outpost", "vanak-the-bloody-hook", "tower-of-amplitude", "tower-of-crushing", "tower-of-gale", "endless-summoning-grounds", "ghagaroach-of-blazeflame", "ghagaroach-of-thunderbolt", "ghagaroach-of-venom", "ghagaroach-of-frostbite", "gallore-the-collapse", "furcas-the-starving-ghost-of-corrosion", "ghoul-greed", "drosophia-of-breaker", "drosophia-of-bloodburst", "corrupted-cave", "sunken-ruins", "earthlander-of-the-ravenous-earth", "residual-worm-cleanup-zone", "forest-of-entangled-roots", "dragon-worshipper-hideout", "nest-of-the-great-worm", "mantius-of-amplitude", "mantius-of-crushing", "mantius-of-gale", "where-the-giant-sleeps", "tomb-of-greed", "the-graveyard-where-tragedy-sleeps", "steelheart-fortress-defense-raid", "steelheart-fortress-defense-scenario", "steelheart-fortress-armory", "corrupted-bedchamber", "barduk-the-corrupted", "warg-cave", "goblin-bandits-cave", "warg-enclosure", "chase-toward-the-end-raid", "chase-toward-the-end-scenario", "underground-goblin-village", "the-elemental-sanctuary", "collapsed-sanctuary", "cracked-crevice", "dragon-worshipper-ruins", "ancient-ruins", "silver-tusk-bandits-supply-depot", "trace-of-the-giant", "rusted-tusk-bandits-treasure-vault", "dark-swamp", "ashen-ruins", "mercenary-crew-promotion-exam-veteran", "mercenary-crew-promotion-exam-novice", "mercenary-crew-promotion-exam-intermediate", "eroded-underground-cemetery"];
// MAPS:end

const mapHref = (id, marker) => `${MAP_HOME}${id}/` + (marker == null ? "" : `?marker=${encodeURIComponent(marker)}`);
function pickMapId() {
    const q = urlMapId();
    if (q && MAPS[q]) return q;
    try { const last = localStorage.getItem("dsa_last_map"); if (last && MAPS[last]) return last; } catch (e) { /* localStorage недоступен */ }
    return MAP_ORDER[0];
}
const state = {
    loaded: false, raw: null, adding: false, map: null, mapId: pickMapId(), xlinks: {},
    hidden: new Set(), markers: [], found: new Set(), layers: null, pins: null, hideFound: false, query: ""
};
const mapCfg = MAPS[state.mapId];
try { state.hideFound = !!localStorage.getItem("dsa_hide_found"); } catch (e) { /* localStorage недоступен */ }
// Первый запуск: скрыты категории с hidden (сейчас таких нет); дальше — выбор игрока
state.hidden = new Set(LS.read("dsa_hidden_cats", null) ? LS.read("dsa_hidden_cats", []).filter(k => CAT_BY_KEY[k]) : Object.keys(CAT_BY_KEY).filter(k => CAT_BY_KEY[k].hidden));
LS.write("dsa_last_map", state.mapId);
document.title = `Интерактивная карта DragonSword: Awakening — ${mapCfg.name} — BroskiPlay`;
document.documentElement.style.setProperty("--map-bg", mapCfg.background);

// ---------- Описания (markdown MapGenie): **жирный**, [названия], списки, таблицы ----------
function renderDesc(src) {
    // Ссылки вида [Название](loc:123) превращаются в переход к метке (на этой или соседней карте)
    const inline = s => escapeHtml(s)
        .replace(/\[([^\]]+)\]\(loc:([\w-]+)\)/g, '<a href="#" class="ds-link" data-goto="$2">$1</a>')
        .replace(/\[([^\]]+)\]\s*\(https?:[^)]*\)/g, "$1")
        .replace(/\s*\(https?:\/\/[^)]*\)/g, "")
        .replace(/\((основное задание|побочное задание|задание спутника)\)/g, (_, k) => `<span class="ds-qtag ds-qtag-${k.startsWith("основное") ? "main" : "side"}">${k}</span>`)
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[([^\]]+)\]/g, "<i>$1</i>").replace(/\*\*/g, "");
    const lines = String(src || "").replace(/\r/g, "").split("\n");
    let out = "", para = [], list = [], rows = [];
    const flushPara = () => { if (para.length) { out += `<p>${para.join("<br>")}</p>`; para = []; } };
    const flushList = () => { while (list.length) { out += "</li></ul>"; list.pop(); } };
    const flushTable = () => {
        if (!rows.length) return;
        const [head, ...body] = rows;
        out += `<table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>` +
            body.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join("")}</tr>`).join("") + "</tbody></table>";
        rows = [];
    };
    for (const raw of lines) {
        const line = raw.replace(/\s+$/, "");
        if (!line.trim()) { flushPara(); flushList(); flushTable(); continue; }
        if (/^\s*\|/.test(line)) {
            flushPara(); flushList();
            if (/^\s*\|[\s:|-]+\|?\s*$/.test(line)) continue; // строка-разделитель |---|:--:|
            rows.push(line.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
            continue;
        }
        flushTable();
        const li = /^(\s*)[-*]\s+(.*)$/.exec(line);
        if (li) {
            flushPara();
            const n = li[1].length;
            if (!list.length || n > list[list.length - 1]) { out += "<ul>"; list.push(n); }
            else {
                while (list.length > 1 && n < list[list.length - 1]) { out += "</li></ul>"; list.pop(); }
                out += "</li>";
            }
            out += `<li>${inline(li[2])}`;
            continue;
        }
        flushList();
        para.push(inline(line.trim()));
    }
    flushPara(); flushList(); flushTable();
    return out;
}

// ---------- Прогресс (найдено) ----------
const foundKey = () => "dsa_found_" + state.mapId;

// ---------- Облако: users/{uid}/mapProgress|customMarkers/dsa_<карта> ----------
// Если документ в облаке есть — он главный (так удаления не «воскресают» со старых устройств).
const cloud = { db: null, user: null };
const cloudRef = (col, uid = cloud.user.uid) => cloud.db.collection("users").doc(uid).collection(col).doc("dsa_" + state.mapId);

async function cloudPull() {
    if (!cloud.db || !cloud.user || !state.loaded) return;
    const uid = cloud.user.uid;
    try {
        const [prog, cm] = await Promise.all([cloudRef("mapProgress", uid).get(), cloudRef("customMarkers", uid).get()]);
        if (!cloud.user || cloud.user.uid !== uid) return;
        cloud.synced = uid; // облако прочитано: с этого момента можно писать (до этого .set() затёр бы облачный прогресс)
        if (prog.exists && Array.isArray(prog.data().foundIds)) {
            state.found = mergeLocalEdits(new Set(prog.data().foundIds.map(String)));
            LS.write(foundKey(), [...state.found]);
        } else if (state.found.size) cloudPush("mapProgress", { foundIds: [...state.found] });
        if (marks.fromCloud(prog.exists ? prog.data() : null)) setTimeout(() => cloudPush("mapProgress", { foundIds: [...state.found] }), 0);
        if (cm.exists && Array.isArray(cm.data().markers)) {
            const mine = cm.data().markers.filter(m => m && m.pos && CAT_BY_KEY[m.cat]).map(m => ({ ...m, user: true }));
            state.markers = state.markers.filter(m => !m.user).concat(mine);
            saveUserMarkers(false);
        } else if (state.markers.some(m => m.user)) saveUserMarkers();
        buildMarkers();
        renderFilters();
        renderProgress();
        cloud.base = null;
        extrasAfterPull();
    } catch (err) { console.warn("Не удалось загрузить из Firestore:", err); }
}

// ---------- Прогресс и фильтры ----------
function counts() {
    const total = {}, done = {};
    state.markers.forEach(m => {
        total[m.cat] = (total[m.cat] || 0) + 1;
        if (state.found.has(String(m.id))) done[m.cat] = (done[m.cat] || 0) + 1;
    });
    return { total, done };
}

// В общий прогресс не входят торговцы, персонажи, «интересные места» и «прочее» (категории с track: false)
const tracked = m => CAT_BY_KEY[m.cat] && CAT_BY_KEY[m.cat].track !== false;

function renderProgress() {
    const list = state.markers.filter(tracked);
    const total = list.length;
    const found = list.reduce((n, m) => n + (state.found.has(String(m.id)) ? 1 : 0), 0);
    const pct = total ? Math.round(found / total * 100) : 0;
    document.getElementById("progress-value").textContent = pct + "%";
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-bar").setAttribute("aria-valuenow", String(pct));
    document.getElementById("progress-count").textContent = total ? `${found} из ${total} меток (без торговцев и персонажей)` : "";
    renderRegionProgress(found, total);
}

function renderFilters() {
    const q = state.query;
    const { total, done } = counts();
    pruneLocate(total);
    document.getElementById("filters-container").innerHTML = locateClearBtn() + CATEGORIES.map(group => {
        // Категории, которых нет на текущей карте, в меню не показываем
        const items = group.items.filter(c => total[c.key] && (!q || c.name.toLowerCase().includes(q)));
        if (!items.length) return "";
        const gTotal = items.reduce((n, c) => n + (total[c.key] || 0), 0);
        const gDone = items.reduce((n, c) => n + (done[c.key] || 0), 0);
        const anyShown = items.some(c => !state.hidden.has(c.key));
        return `<div class="filter-group" style="--g:${items[0].color}"><div class="filter-group-head"><div class="filter-group-title">${group.title} <span class="filter-hint">${gDone}/${gTotal}</span></div>` +
            `<button type="button" class="group-toggle" data-group="${escapeHtml(group.title)}">${anyShown ? "скрыть" : "показать"}</button></div>` +
            items.map(c => `<div class="filter-row"><button type="button" class="filter-item${state.hidden.has(c.key) ? " disabled" : ""}${total[c.key] ? "" : " is-empty"}" data-cat="${c.key}"><span class="filter-name"><i class="ds-filter-icon" style="--c:${c.color}">${iconSvg(c.icon, c.ink)}</i>${c.name}</span><span class="filter-count">${done[c.key] || 0}/${total[c.key] || 0}</span></button>${locateBtn(c, total)}</div>`).join("") +
            `</div>`;
    }).join("") + `<p class="filters-note">Двойной клик по категории — показать только её.</p>`;
}

// ---------- Метки на canvas ----------
// Тысяча DOM-элементов с тенями и поворотом перерисовывается при каждом сдвиге и зуме, поэтому карта
// дёргалась. Метки рисуются одним canvas из готовых спрайтов: панорамирование — это сдвиг одного слоя.
// Спрайт: размер w×h, остриё капельки в точке (ax, ay) — она совпадает с координатой метки.
const PIN = { w: 48, h: 64, cx: 24, cy: 26, r: 14, ax: 24, ay: 46, hover: 1.15 };
// Меток тысячи, и стоят они густо: рисуем их мельче, а при приближении (с z14) — крупнее
const pinScale = z => z >= mapCfg.pinFull ? 1.05 : z <= mapCfg.minZoom ? 0.62 : 0.62 + 0.43 * (z - mapCfg.minZoom) / (mapCfg.pinFull - mapCfg.minZoom);

// Иконки — белые глифы из спрайта icons.png (categories.js: ICON_IMG). Цветной значок (ink) — глиф,
// перекрашенный через source-in на отдельном холсте. Пока спрайт не загрузился, пины рисуются без значка,
// после загрузки кэш спрайтов пинов сбрасывается и слой перерисовывается.
const tintedGlyphs = new Map();
function glyphCanvas(icon, color) {
    const key = icon.join(",") + "|" + (color || "");
    let c = tintedGlyphs.get(key);
    if (c) return c;
    const n = ICON_SHEET.cell;
    c = document.createElement("canvas");
    c.width = c.height = n;
    const g = getCtx(c);
    g.drawImage(ICON_IMG, icon[0], icon[1], n, n, 0, 0, n, n);
    if (color) { g.globalCompositeOperation = "source-in"; g.fillStyle = color; g.fillRect(0, 0, n, n); }
    tintedGlyphs.set(key, c);
    return c;
}
function drawIcon(ctx, icon, cx, cy, size, color) {
    if (!Array.isArray(icon) || !ICON_IMG.complete || !ICON_IMG.naturalWidth) return;
    ctx.drawImage(glyphCanvas(icon, color), cx - size / 2, cy - size / 2, size, size);
}
// спрайты уже лежат в WebGL — после загрузки иконок перерисовываем их там
if (!ICON_IMG.complete) ICON_IMG.addEventListener("load", () => { pinSprites.clear(); if (state.pins) state.pins.redrawSprites(); });

// Как у найденных меток: цвет на 70% к серому
function desaturate(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const gray = r * 0.3 + g * 0.59 + b * 0.11;
    const mix = v => Math.round(v + (gray - v) * k);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function buildPinSprite(cat, found) {
    const k = SPRITE_K;
    const def = CAT_BY_KEY[cat];
    const g = geom(cat);
    const canvas = document.createElement("canvas");
    canvas.width = g.w * k; canvas.height = g.h * k;
    const ctx = getCtx(canvas);
    ctx.scale(k, k);

    if (g === DOT) {
        NMPin.dot(ctx, g.cx, g.cy, g.r, found ? desaturate(def.color, 0.7) : def.color, k, def.ink ? "rgba(20,14,0,.7)" : "rgba(255,255,255,.85)");
        drawIcon(ctx, def.icon, g.cx, g.cy, 12, "#fff");
        if (!found) return canvas;
        ctx.font = "700 10px sans-serif";
        ctx.fillStyle = "#9be29b";
        ctx.fillText("✓", g.cx, g.cy - 14);
        const faded = document.createElement("canvas");
        faded.width = canvas.width; faded.height = canvas.height;
        const fctx = getCtx(faded);
        fctx.globalAlpha = 0.45;
        fctx.drawImage(canvas, 0, 0);
        return faded;
    }

    // Капелька в цвет категории (как на других картах), внутри — цветной значок th.gl на тёмном медальоне
    ctx.save();
    ctx.translate(PIN.cx, PIN.cy);
    ctx.rotate(-Math.PI / 4);
    NMPin.drop(ctx, r => teardropPath(ctx, r), PIN.r, found ? desaturate(def.color, 0.7) : def.color, k, "rgba(255,255,255,.85)"); // объёмный пин: ../js/nm-pin.js
    ctx.restore();

    // значки th.gl цветные и детальные — белый силуэт читается плохо: тёмный медальон и оригинальный значок
    ctx.beginPath(); ctx.arc(PIN.cx, PIN.cy, PIN.r - 2.5, 0, Math.PI * 2);
    ctx.fillStyle = found ? "#2a2f38" : "#0c1424"; ctx.fill();
    ctx.save();
    if (found) ctx.filter = "grayscale(.7)";
    drawIcon(ctx, def.icon, PIN.cx, PIN.cy, 22);
    ctx.restore();

    if (!found) return canvas;
    ctx.font = "700 11px sans-serif";
    ctx.shadowColor = "#000"; ctx.shadowBlur = 3 * k;
    ctx.fillStyle = "#9be29b";
    ctx.fillText("✓", PIN.cx, PIN.cy - 20);

    // Найденные — полупрозрачные целиком
    const faded = document.createElement("canvas");
    faded.width = canvas.width; faded.height = canvas.height;
    const fctx = getCtx(faded);
    fctx.globalAlpha = 0.45;
    fctx.drawImage(canvas, 0, 0);
    return faded;
}



function popupHtml(m) {
    const c = CAT_BY_KEY[m.cat];
    const done = state.found.has(String(m.id));
    const tags = "";
    const en = `<span class="ds-popup-en">${escapeHtml(mapCfg.name)}</span>`;
    return `<div class="ds-popup" style="--c:${c.color}">
        <div class="ds-popup-cat" style="color:${c.color}"><span class="ds-popup-icon" style="background:${c.color}">${iconSvg(c.icon, c.ink)}</span>${c.name}</div>
        <h3>${escapeHtml(m.title || "Без названия")}</h3>
        <div class="ds-popup-meta">${en}<button type="button" class="ds-link-btn" data-copy="${m.id}" title="Скопировать ссылку на эту метку">Ссылка</button></div>
        ${tags ? `<div class="ds-tags">${tags}</div>` : ""}
        ${[].concat(m.img || []).map(p => `<img class="ds-popup-img" loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(popupImgUrl(p))}" data-full="${escapeHtml(popupImgUrl(p))}" alt="" title="Открыть изображение" onerror="this.remove()">`).join("")}
        ${m.desc ? `<div class="ds-desc">${renderDesc(m.desc)}</div>` : ""}
        ${c.about && !m.user ? `<div class="ds-about">${escapeHtml(c.about)}</div>` : ""}
        ${m.user ? `<button type="button" class="ds-del-btn" data-id="${m.id}">Удалить свою метку</button>` : ""}
        ${marks.html(m.id)}
        <button type="button" class="ds-done-btn${done ? " is-done" : ""}" data-id="${m.id}">${done ? "✓ Найдено — отменить" : "Отметить найденным"}</button>
    </div>`;
}

function toast(text) {
    const el = document.getElementById("ds-toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2200);
}

// Метки, стоящие «друг в друге» (при сильном сближении на карте): в попапе появляются стрелки для переключения между ними (../js/marker-stack.js)
const markerStack = MarkerStack.init({
    map: () => state.map, markers: () => state.markers, render: popupHtml, radius: m => 1.6 * geom(m.cat).r * pinScale(state.map.getZoom()),
    // как _point у Leaflet: мировые пиксели текущего зума, округлённые — та же граница «рядом», что на старой карте
    point: m => {
        if (!state.pins || !state.pins.has(m)) return null;
        const p = state.map.project(m.pos);
        return { x: Math.round(p.x), y: Math.round(p.y) };
    }
});

function toggleFound(id) {
    id = String(id);
    state.found.has(id) ? state.found.delete(id) : state.found.add(id);
    saveFound();
    if (state.found.has(id)) window.dispatchEvent(new CustomEvent("bp:found", { detail: { map: state.mapId, count: state.found.size } })); // окошко «Поддержать» (js/support-toast.js)
    const m = state.markers.find(x => String(x.id) === id);
    applyFoundVisibility(); // перестраивает метки на карте (state.pins.refresh)
    if (m) markerStack.refresh(m);
    renderFilters();
    renderProgress();
    renderSearchResults();
}

// ---------- Метки на карте (../js/bp-map.js: символы WebGL) ----------
// Показываются метки видимых категорий, кроме скрытых фильтрами «Скрыть отмеченные» / «Мои отметки»
const shownMarkers = () => state.markers.filter(m => !catHidden(m.cat) && !markerHidden(m));
const pinAnchor = m => () => [0, (geom(m.cat) === PIN ? -36 : -14) * pinScale(state.map.getZoom())];
// Окно метки — над остриём; markerStack добавляет полоску «‹ 1 из 3 ›», если метки стоят друг в друге
const openMarkerPopup = m => state.map.openPopup({ latlng: m.pos, content: () => markerStack.html(m), className: "ds-popup-wrap", source: m, anchor: pinAnchor(m) });

function initPins() {
    state.pins = state.map.addPins({
        geoms: [PIN, DOT], geom: m => geom(m.cat), scale: pinScale, ratio: SPRITE_K,
        list: shownMarkers, pos: m => m.pos,
        sprite: m => {
            const found = state.found.has(String(m.id));
            return { key: "ds-" + m.cat + (found ? "|1" : "|0"), draw: () => pinSprite(m.cat, found) };
        },
        // подсвеченные категории (кнопка с лупой): над остальными и со свечением; найденные не подсвечиваются
        lit: m => locateCats.size > 0 && locateCats.has(m.cat) && !state.found.has(String(m.id)),
        glow: glowSprite, glowScale: g => g.r / 14 < 0.8 ? 0.72 : 1,
        badges: m => MapExtras.markOf(String(m.id)), badgeSprite: MapExtras.badgeSprite, badgeR: 7, badgeRatio: 3,
        // круг по «головке» капельки (или по самой точке) с запасом под палец — как было на Leaflet
        hit: g => ({ dy: g === PIN ? PIN.r : 0, r: g.r + 1 }), tol: BPMap.Browser.touch ? 8 : 0
    });
    state.pins.on("click", m => openMarkerPopup(m));
    // Подсказка с названием метки; на тач-экранах не нужна
    state.pins.on("mouseover", m => { if (m.title && !BPMap.Browser.mobile) state.map.showTip(escapeHtml(m.title), m.pos, pinAnchor(m), "ds-tip"); });
    state.pins.on("mouseout", () => state.map.hideTip());
    // Правая кнопка мыши — быстро отметить найденным
    state.pins.on("contextmenu", m => {
        const wasFound = state.found.has(String(m.id));
        toggleFound(m.id);
        toast(wasFound ? "Отметка снята" : "Отмечено найденным: " + (m.title || "метка"));
    });
}

function refreshVisibility() { if (state.pins) state.pins.refresh(); }

function applyVisibility() {
    refreshVisibility();
    LS.write("dsa_hidden_cats", [...state.hidden]);
    settings.touch();
}

function buildMarkers() {
    if (!state.pins) initPins();
    applyVisibility();
    searchIndex = null;
}

// ---------- Поиск по меткам ----------
let searchIndex = null;
function buildSearchIndex() {
    return searchIndex = state.markers.map(m => ({ m, title: String(m.title || "").toLowerCase(), hay: (String(m.title || "") + " " + String(m.titleEn || "") + " " + (CAT_BY_KEY[m.cat] ? CAT_BY_KEY[m.cat].name : "")).toLowerCase(), desc: String(m.desc || "").toLowerCase() }));
}
function renderSearchResults() {
    const box = document.getElementById("search-results");
    const q = state.query;
    if (q.length < 2) { box.classList.remove("open"); box.innerHTML = ""; return; }
    const words = q.split(/\s+/).filter(Boolean);
    const scored = [];
    for (const it of searchIndex || buildSearchIndex()) {
        if (!words.every(w => it.hay.includes(w) || it.desc.includes(w))) continue;
        const inTitle = words.every(w => it.title.includes(w));
        scored.push({ it, score: (it.title === q ? 0 : it.title.startsWith(q) ? 1 : inTitle ? 2 : words.every(w => it.hay.includes(w)) ? 3 : 4) });
    }
    scored.sort((a, b) => a.score - b.score || a.it.title.localeCompare(b.it.title));
    const shown = scored.slice(0, 40);
    box.classList.add("open");
    box.innerHTML = shown.length
        ? shown.map(({ it }) => {
            const m = it.m, c = CAT_BY_KEY[m.cat];
            return `<button type="button" class="search-item${state.found.has(String(m.id)) ? " is-done" : ""}" data-marker="${escapeHtml(m.id)}" role="option"><i class="ds-filter-icon" style="--c:${c.color}">${iconSvg(c.icon, c.ink)}</i><span class="si-title">${escapeHtml(m.title || "Без названия")}</span><span class="si-zone">${escapeHtml(c.name)}</span></button>`;
        }).join("") + (scored.length > shown.length ? `<div class="search-empty">Показано ${shown.length} из ${scored.length}. Уточните запрос.</div>` : "")
        : `<div class="search-empty">Ничего не найдено</div>`;
}

function focusMarker(id, { fly = true } = {}) {
    const m = state.markers.find(x => String(x.id) === String(id));
    if (!m) return false;
    if (state.hidden.has(m.cat)) { state.hidden.delete(m.cat); renderFilters(); applyVisibility(); }
    const open = () => {
        if (state.pins && state.pins.has(m)) openMarkerPopup(m);
        else state.map.openPopup({ latlng: m.pos, content: popupHtml(m), className: "ds-popup-wrap", offset: [0, -4] });
    };
    const zoom = Math.max(state.map.getZoom(), mapCfg.focusZoom);
    if (!fly) { state.map.setView(m.pos, zoom, { animate: false }); open(); return true; }
    state.map.once("moveend", open);
    state.map.flyTo(m.pos, zoom, { duration: 0.7 });
    return true;
}

// Метка может быть на другой карте (например, «Дверь в Сиродил» на Дрожащих островах): тогда переключаем карту
function goToMarker(id) {
    if (focusMarker(id)) return;
    const other = state.xlinks[String(id)];
    if (other && MAPS[other]) { location.href = mapHref(other, id); return; }
    toast("Эта метка не найдена на карте");
}

function closeLightbox() { const lb = document.getElementById("ds-lightbox"); if (lb) lb.remove(); }
function openLightbox(src) {
    closeLightbox();
    const lb = document.createElement("div");
    lb.id = "ds-lightbox";
    lb.innerHTML = `<img src="${escapeHtml(src)}" alt=""><button type="button" aria-label="Закрыть">×</button>`;
    lb.addEventListener("click", closeLightbox);
    document.body.appendChild(lb);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

document.addEventListener("click", async e => {
    const img = e.target.closest(".ds-popup-img");
    if (img) { openLightbox(img.dataset.full || img.src); return; }
    const del = e.target.closest(".ds-del-btn");
    if (del) { deleteUserMarker(del.dataset.id); return; }
    if (e.target.closest("#ds-add-save")) { saveNewMarker(); return; }
    const btn = e.target.closest(".ds-done-btn");
    if (btn) { toggleFound(btn.dataset.id); return; }
    const go = e.target.closest(".ds-link");
    if (go) { e.preventDefault(); goToMarker(go.dataset.goto); return; }
    const copy = e.target.closest("[data-copy]");
    if (copy) { copyMarkerLink(copy.dataset.copy); return; }
    const hit = e.target.closest(".search-item");
    if (hit) { focusMarker(hit.dataset.marker); if (BPMap.Browser.mobile && window.innerWidth <= 480) toggleSidebar(); return; }
    const gt = e.target.closest(".group-toggle");
    if (gt) {
        const group = CATEGORIES.find(g => g.title === gt.dataset.group);
        const anyShown = group.items.some(c => !state.hidden.has(c.key));
        group.items.forEach(c => anyShown ? state.hidden.add(c.key) : state.hidden.delete(c.key));
        renderFilters();
        applyVisibility();
        return;
    }
    if (e.target.closest(".locate-clear")) { clearLocate(); return; }
    const loc = e.target.closest(".filter-locate");
    if (loc) { locateCategory(loc.dataset.locate); return; }
    const item = e.target.closest(".filter-item");
    if (!item) return;
    const n = item.dataset.cat;
    state.hidden.has(n) ? state.hidden.delete(n) : state.hidden.add(n);
    item.classList.toggle("disabled");
    applyVisibility();
});
document.addEventListener("dblclick", e => {
    const item = e.target.closest(".filter-item");
    if (!item) return;
    state.hidden = new Set(Object.keys(CAT_BY_KEY).filter(k => k !== item.dataset.cat));
    renderFilters();
    applyVisibility();
});
document.getElementById("show-all-btn").addEventListener("click", () => setAll(true));
document.getElementById("hide-all-btn").addEventListener("click", () => setAll(false));
if (state.hideFound) {
    const b = document.getElementById("hide-found-btn");
    b.setAttribute("aria-pressed", "true");
    b.textContent = "Показать отмеченные";
}
document.getElementById("hide-found-btn").addEventListener("click", e => {
    state.hideFound = !state.hideFound;
    e.currentTarget.setAttribute("aria-pressed", state.hideFound);
    e.currentTarget.textContent = state.hideFound ? "Показать отмеченные" : "Скрыть отмеченные";
    LS.write("dsa_hide_found", state.hideFound ? "1" : "");
    settings.touch();
    applyFoundVisibility();
});
document.getElementById("search-input").addEventListener("input", e => {
    state.query = e.target.value.trim().toLowerCase();
    renderFilters();
    renderSearchResults();
});

document.getElementById("sidebar-toggle-btn").addEventListener("click", toggleSidebar);
document.getElementById("sidebar-collapse-mobile").addEventListener("click", toggleSidebar);

// ---------- Карта ----------
// Запас вокруг игровой области: иначе maxBounds ограничивает автопрокрутку попапа и карта «отпрыгивает» назад
// Карты MapGenie — клочок мира в 1–1,4°, поэтому запас — доля размера карты, а не градусы
const padLat = (mapCfg.play[1][0] - mapCfg.play[0][0]) * 0.25, padLng = (mapCfg.play[1][1] - mapCfg.play[0][1]) * 0.25;
state.map = BPMap.create("map", {
    minZoom: mapCfg.minZoom, maxZoom: mapCfg.maxZoom, zoomSnap: 0.25,
    // широта Web Mercator — не дальше ±85° (Орбис занимает весь мир th.gl, запас иначе уходит за полюс)
    maxBounds: [[Math.max(-85.05, mapCfg.play[0][0] - padLat), mapCfg.play[0][1] - padLng], [Math.min(85.05, mapCfg.play[1][0] + padLat), mapCfg.play[1][1] + padLng]]
});

// Положение карты запоминаем отдельно для каждой карты: при следующем открытии продолжаем с того же места
const VIEW_KEY = "dsa_view_" + state.mapId;
function restoreView() {
    const v = LS.read(VIEW_KEY, null);
    if (v && isFinite(v.lat) && isFinite(v.lng) && isFinite(v.zoom) && v.zoom >= mapCfg.minZoom) { state.map.setView([v.lat, v.lng], v.zoom, { animate: false }); return true; }
    // Первое открытие: пока нет меток — вся карта, после загрузки — область меток (fitToMarkers)
    state.map.fitBounds(mapCfg.play, { padding: [30, 30], animate: false, cover: true });
    return false;
}
// Первое открытие: вписываем в окно область меток, а не всю подложку
function fitToMarkers() {
    const pts = state.markers.filter(m => !m.user).map(m => m.pos);
    if (pts.length) state.map.fitBounds(pts, { padding: [40, 40], animate: false });
}
state.map.on("moveend", () => {
    const c = state.map.getCenter();
    LS.write(VIEW_KEY, { lat: +c.lat.toFixed(5), lng: +c.lng.toFixed(5), zoom: state.map.getZoom() });
});
const viewRestored = restoreView();

// Локальные тайлы (экспорт tools/export-tiles.js). Список существующих лежит в manifest.json
function addTiles(tileSet) {
    // Глубже tileMaxZ тайлов нет — картинка просто увеличивается; тайлы 512 px: тайл z6 рисуется на зуме карты 7, как в Leaflet с zoomOffset -1
    state.map.addTiles({
        url: (z, x, y) => tileSet.has(`${z}/${x}/${y}`) ? `${mapCfg.tiles}/${z}/${x}/${y}.${mapCfg.tileExt}` : null,
        tileSize: mapCfg.tileSize, minNative: mapCfg.tileMinZ + mapCfg.zoomOffset, maxNative: mapCfg.tileMaxZ + mapCfg.zoomOffset, bounds: mapCfg.tileBounds
    });
}

function copyMarkerLink(id) {
    const url = location.origin + mapHref(state.mapId, id);
    const done = () => toast("Ссылка на метку скопирована");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => prompt("Ссылка на метку:", url));
    else prompt("Ссылка на метку:", url);
}

// ---------- Свои метки (хранятся в браузере пользователя) ----------
const userKey = () => "dsa_user_" + state.mapId;
function loadUserMarkers() {
    return LS.read(userKey(), []).filter(m => m && m.pos && CAT_BY_KEY[m.cat]).map(m => ({ ...m, user: true }));
}
function saveUserMarkers(push = true) {
    const list = state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }));
    LS.write(userKey(), list);
    if (push) cloudPush("customMarkers", { markers: list });
}

state.map.on("click", e => {
    if (!state.adding) return;
    pendingPos = [e.latlng.lat, e.latlng.lng];
    const opts = CATEGORIES.map(g => `<optgroup label="${g.title}">${g.items.map(c => `<option value="${c.key}">${c.name}</option>`).join("")}</optgroup>`).join("");
    state.map.openPopup({ latlng: e.latlng, className: "ds-popup-wrap", closeOnClick: false, content: `<div class="ds-popup ds-add-form">
            <h3>Новая метка</h3>
            <select id="ds-add-cat">${opts}</select>
            <input type="text" id="ds-add-title" placeholder="Название" maxlength="80">
            <textarea id="ds-add-desc" placeholder="Описание (необязательно)" maxlength="500" rows="3"></textarea>
            <button type="button" class="ds-done-btn" id="ds-add-save">Сохранить</button>
        </div>` });
});

function saveNewMarker() {
    if (!pendingPos) return;
    const m = {
        id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        title: document.getElementById("ds-add-title").value.trim() || "Моя метка",
        desc: document.getElementById("ds-add-desc").value.trim(),
        cat: document.getElementById("ds-add-cat").value,
        pos: pendingPos, user: true
    };
    pendingPos = null;
    state.markers.push(m);
    saveUserMarkers();
    state.map.closePopup();
    setAddMode(false);
    buildMarkers();
    renderFilters();
    renderProgress();
}

function deleteUserMarker(id) {
    const m = state.markers.find(x => String(x.id) === String(id) && x.user);
    if (!m || !confirm("Удалить эту метку?")) return;
    state.map.closePopup();
    state.markers = state.markers.filter(x => x !== m);
    state.found.delete(String(m.id));
    saveFound();
    saveUserMarkers();
    buildMarkers();
    renderFilters();
    renderProgress();
}
document.getElementById("add-marker-btn").addEventListener("click", () => setAddMode(!state.adding));
document.addEventListener("keydown", e => { if (e.key === "Escape" && state.adding) setAddMode(false); });

function exportProgress() {
    const payload = {
        app: "dragonsword_map_progress",
        map: state.mapId,
        updatedAt: new Date().toISOString(),
        foundCount: state.found.size,
        found: [...state.found],
        ...marks.exportFields(),
        customMarkers: state.markers.filter(m => m.user).map(({ id, title, desc, cat, pos }) => ({ id, title, desc, cat, pos }))
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    a.download = `dragonsword_progress_${state.mapId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setIoStatus(`Сохранено: ${payload.found.length} отметок, ${payload.customMarkers.length} своих меток.`);
}
async function importProgress(file) {
    try {
        const data = JSON.parse(await file.text());
        if (!data || data.app !== "dragonsword_map_progress" || !Array.isArray(data.found)) throw new Error("это не файл прогресса карты DragonSword: Awakening");
        if (data.map && data.map !== state.mapId) throw new Error("файл от другой карты — откройте её и импортируйте там");
        const known = new Set(state.markers.map(m => String(m.id)));
        const before = state.found.size;
        data.found.map(String).forEach(id => state.found.add(id));
        const notesAdded = marks.merge(data);
        let added = 0;
        (Array.isArray(data.customMarkers) ? data.customMarkers : []).forEach(m => {
            if (!m || !m.pos || !CAT_BY_KEY[m.cat] || !isFinite(m.pos[0]) || !isFinite(m.pos[1]) || known.has(String(m.id))) return;
            state.markers.push({ id: String(m.id), title: String(m.title || "Моя метка").slice(0, 80), desc: String(m.desc || "").slice(0, 500), cat: m.cat, pos: [+m.pos[0], +m.pos[1]], user: true });
            added++;
        });
        saveFound();
        if (added) saveUserMarkers();
        buildMarkers();
        renderFilters();
        renderProgress();
        setIoStatus(`Импортировано: +${state.found.size - before} отметок, +${added} своих меток${notesAdded ? `, +${notesAdded} заметок и флажков` : ""}.`);
    } catch (err) {
        setIoStatus("Ошибка импорта: " + (err.message || "неверный файл"));
    }
}
document.getElementById("export-progress-btn").addEventListener("click", exportProgress);
document.getElementById("import-progress-btn").addEventListener("click", () => document.getElementById("import-progress-input").click());
document.getElementById("import-progress-input").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0];
    if (f) importProgress(f);
    e.target.value = "";
});

// ---------- Загрузочный экран ----------
const loaderShownAt = performance.now();

// Основные метки карты: тексты уже на русском, английское название лежит в titleEn (для поиска)
// Одинаковые описания лежат один раз в data.descs, у метки — номер в поле d (tools/build_data.py)
function buildBase() {
    const descs = (state.raw && state.raw.descs) || [];
    return ((state.raw && state.raw.markers) || [])
        .map(m => m.d != null && descs[m.d] ? { ...m, desc: descs[m.d] } : m)
        .filter(m => isFinite(m.lat) && isFinite(m.lng) && CAT_BY_KEY[m.cat])
        .map(m => ({ ...m, id: String(m.id), pos: [m.lat, m.lng] }));
}

// ---------- Заметки к меткам, настройки показа в облаке, прогресс по регионам (../js/map-extras.js) ----------
const marks = MapExtras.marks({
    key: kind => "dsa_" + kind + "_" + state.mapId, map: () => state.map, markers: () => state.markers,
    onSave: () => cloudPush("mapProgress", { foundIds: [...state.found] }),
    onChange: () => redrawPins(),
    onFilter: () => { applyVisibility(); applyFoundVisibility(); redrawPins(); }
});
const settings = MapExtras.settingsSync({
    pfx: "pb", cloud: () => cloud,
    read: () => ({ hidden: [...state.hidden], hideFound: state.hideFound }),
    apply: applySettings
});
// Выбор категорий и «Скрыть отмеченные», пришедшие с другого устройства
function applySettings(s) {
    state.hidden = new Set(s.hidden.filter(k => CAT_BY_KEY[k]));
    state.hideFound = s.hideFound;
    try { localStorage.setItem("dsa_hide_found", state.hideFound ? "1" : ""); } catch (e) { /* localStorage недоступен */ }
    const b = document.getElementById("hide-found-btn");
    b.setAttribute("aria-pressed", String(state.hideFound));
    b.textContent = state.hideFound ? "Показать отмеченные" : "Скрыть отмеченные";
    renderFilters();
    applyVisibility();
    applyFoundVisibility();
}
// «По картам»: прогресс всех семи карт (у меток источника нет районов)
const regionProgress = MapExtras.mapsProgress({
    anchor: document.querySelector(".progress-card"), title: "По картам", storeKey: "dsa_regions_open",
    maps: MAP_ORDER.map(id => ({ id, name: MAPS[id].name, file: MAPS[id].markersFile.split("/").pop(), href: mapHref(id) })),
    currentId: state.mapId, foundKey: id => "dsa_found_" + id, cloud: () => cloud, cloudDocId: id => "dsa_" + id
});
const renderRegionProgress = (found, total) => regionProgress.render({ found, total });

// Подписи районов на карте (у источника для этих карт их нет; оставлено для будущих данных): зумы mapCfg.labels
let regionLabels = [];
function buildRegionLabels(list) {
    regionLabels.forEach(t => t.remove());
    regionLabels = (list || []).map(l => {
        const el = document.createElement("div");
        el.className = "ds-region-label";
        el.innerHTML = `<span>${escapeHtml(l.name)}</span>`;
        return state.map.addLabel([l.lat, l.lng], el);
    });
    updateRegionLabels();
}
function updateRegionLabels() {
    const z = state.map.getZoom(), [a, b] = mapCfg.labels || [0, 0];
    state.map.getContainer().classList.toggle("ds-labels-on", z >= a && z < b);
}
state.map.on("zoomend", updateRegionLabels);
// Фильтр «Мои отметки», режим «только карта», горячие клавиши, правка места метки, последняя карта для главной
marks.filterUI(document.getElementById("hide-found-btn").closest(".btn-group"));
MapExtras.hotkeys({ map: () => state.map, focus: focusView });
MapExtras.recordVisit("dragonsword", state.mapId);
MapExtras.setContext({
    map: () => state.map, toast,
    marker: id => state.markers.find(x => String(x.id) === String(id) && !x.user),
});

loadFound();
renderFilters();
renderProgress();

// ---------- Загрузка данных ----------
// Подложка не ждёт меток: тайлы добавляем, как только пришёл manifest.json (метки и прочие данные догружаются параллельно)
const tilesReady = fetch(`${mapCfg.tiles}/manifest.json`).then(r => r.ok ? r.json() : null).catch(() => null).then(manifest => {
    if (manifest) addTiles(new Set(manifest));
    else {
        const el = document.getElementById("map-empty");
        el.textContent = "Тайлы карты ещё не загружены: метки показаны без подложки";
        el.classList.add("is-note");
    }
});
Promise.all([
    tilesReady,
    fetch(mapCfg.markersFile).then(r => r.json())
]).then(([, data]) => {
    state.raw = data;
    state.xlinks = data.xlinks || {};
    buildRegionLabels(data.labels);
    state.markers = buildBase().concat(loadUserMarkers());
    state.loaded = true;
    if (!viewRestored && !new URLSearchParams(location.search).get("marker")) fitToMarkers();
    cloud.base = new Set(state.found);
    marks.snapshot();
    buildMarkers();
    renderFilters();
    renderProgress();
    cloudPull();
    hideMapLoader();
    applyUrlCategory(); // ?cat=<категория>
    // Ссылка на метку: /<игра>/<карта>/?marker=<id>
    const wanted = new URLSearchParams(location.search).get("marker");
    if (wanted && !focusMarker(wanted, { fly: false })) toast("Метка по ссылке не найдена");
}).catch(() => {
    hideMapLoader();
    const el = document.getElementById("map-empty");
    el.textContent = "Не удалось загрузить карту (откройте страницу через веб-сервер, а не file://)";
    el.style.display = "grid";
});

// Переключатель карт: группа → карта (57 карт одним списком не читаются). Орбис — отдельный пункт.
// Те же группы на главной — MAP_GROUPS в web/lib/home.ts; ID и адреса карт не меняются.
const MAP_GROUPS = [
    { title: "Сюжет и рейды", ids: ["steelheart-fortress-defense-raid", "steelheart-fortress-defense-scenario", "steelheart-fortress-armory", "chase-toward-the-end-raid", "chase-toward-the-end-scenario", "corrupted-cave", "cracked-crevice", "ancient-ruins", "where-the-giant-sleeps", "altar-of-the-dragon"] },
    { title: "Боссы и арены", ids: ["ghagaroach-of-blazeflame", "ghagaroach-of-thunderbolt", "ghagaroach-of-venom", "ghagaroach-of-frostbite", "drosophia-of-breaker", "drosophia-of-bloodburst", "mantius-of-amplitude", "mantius-of-crushing", "mantius-of-gale", "gallore-the-collapse", "furcas-the-starving-ghost-of-corrosion", "ghoul-greed", "earthlander-of-the-ravenous-earth", "vanak-the-bloody-hook", "barduk-the-corrupted", "fang-bandits-arena"] },
    { title: "Башни и испытания", ids: ["tower-of-amplitude", "tower-of-crushing", "tower-of-gale", "mercenary-crew-promotion-exam-novice", "mercenary-crew-promotion-exam-intermediate", "mercenary-crew-promotion-exam-veteran"] },
    { title: "Пещеры и руины", ids: null },   // null — все остальные карты
];
{
    const LEAD = MAP_ORDER[0];
    const placed = new Set(MAP_GROUPS.flatMap(g => g.ids || []).concat(LEAD));
    // порядок внутри группы — как в MAP_ORDER (по русскому названию)
    const groups = MAP_GROUPS.map(g => ({ title: g.title, ids: MAP_ORDER.filter(id => g.ids ? g.ids.includes(id) : !placed.has(id)) }));
    const groupOf = id => groups.findIndex(g => g.ids.includes(id));
    const box = document.getElementById("map-switch");
    box.classList.add("map-switch-2");
    box.innerHTML = `<select class="map-select map-group-select" aria-label="Раздел карт">
        <option value="lead">${escapeHtml(MAPS[LEAD].name)}</option>
        ${groups.map((g, n) => `<option value="${n}">${escapeHtml(g.title)} · ${g.ids.length}</option>`).join("")}
    </select><select class="map-select map-item-select" aria-label="Выбор карты"></select>`;
    const [gSel, mSel] = box.querySelectorAll("select");
    const fill = n => {
        mSel.hidden = n === "lead";
        if (n === "lead") return;
        const ids = groups[n].ids, cur = ids.includes(state.mapId);
        mSel.innerHTML = (cur ? "" : `<option value="" selected disabled>Выберите карту…</option>`) +
            ids.map(id => `<option value="${id}"${id === state.mapId ? " selected" : ""}>${escapeHtml(MAPS[id].name)}</option>`).join("");
    };
    const g0 = state.mapId === LEAD ? "lead" : String(Math.max(0, groupOf(state.mapId)));
    gSel.value = g0;
    fill(g0);
    gSel.addEventListener("change", () => {
        if (gSel.value === "lead") { location.href = mapHref(LEAD); return; }
        fill(gSel.value);
        mSel.focus();
    });
    mSel.addEventListener("change", () => { if (mSel.value) location.href = mapHref(mSel.value); });
}

// ---------- Вход через Google (тот же Firebase-проект, что и у остальных карт) ----------
const GOOGLE_BTN_HTML = '<svg class="google-icon" width="14" height="14" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span>Войти с Google</span>';

function initAuth() {
    const btn = document.getElementById("auth-btn");
    const statusEl = document.getElementById("auth-status");
    const avatar = document.getElementById("auth-avatar");
    btn.innerHTML = GOOGLE_BTN_HTML;
    const lazy = window.BPFirebase; // ../js/firebase-lazy.js: Firebase грузится по требованию, а не в <head>
    if (!lazy) return;
    let auth = null, ready = null;

    function start() {
        if (ready) return ready;
        ready = lazy.load().then(firebase => {
            if (!firebase.apps.length) firebase.initializeApp({
                apiKey: "AIzaSyBZ29h18Z1k0gE4dAEca5JH8yePQgxhaII",
                authDomain: "broskiplaymaps.firebaseapp.com",
                projectId: "broskiplaymaps",
                appId: "1:418362476965:web:59ce4e677b1a0a84d7404c"
            });
            auth = firebase.auth();
            if (typeof firebase.firestore === "function") cloud.db = firebase.firestore();
            auth.onAuthStateChanged(onUser);
            return auth;
        }).catch(err => {
            console.warn("Firebase не загружен — вход через Google недоступен, карта работает локально.", err);
            ready = null;
            return null;
        });
        return ready;
    }

    function onUser(user) {
        lazy.setSignedIn(!!user);
        cloud.user = user;
        if (user) {
            cloudPull();
            statusEl.innerHTML = `<b>${escapeHtml(user.displayName || user.email || "Google")}</b><br><span class="auth-online">● Личный кабинет</span>`;
            btn.innerHTML = '<svg class="logout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg><span>Выйти</span>'; // как на главной: на телефоне видна только иконка
            btn.classList.add("logout");
            if (user.photoURL) {
                avatar.referrerPolicy = "no-referrer";
                avatar.onload = () => { avatar.style.display = "block"; avatar.parentElement.classList.add("has-avatar"); };
                avatar.onerror = () => { avatar.style.display = "none"; avatar.parentElement.classList.remove("has-avatar"); };
                avatar.src = user.photoURL;
            }
        } else {
            statusEl.innerHTML = "<b>Кабинет</b><br><span>Войдите через Google для синхронизации меток</span>";
            btn.innerHTML = GOOGLE_BTN_HTML;
            btn.classList.remove("logout");
            avatar.style.display = "none";
            avatar.parentElement.classList.remove("has-avatar");
        }
    }

    btn.addEventListener("click", async () => {
        if (auth && auth.currentUser) { auth.signOut(); return; }
        if (!auth) btn.classList.add("is-loading");
        const a = auth || await start();
        btn.classList.remove("is-loading");
        if (!a) { alert("Вход через Google сейчас недоступен: Firebase не загрузился. Проверьте интернет и попробуйте ещё раз."); return; }
        if (a.currentUser) return; // сессия восстановилась сама, пока грузился Firebase
        a.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(err => {
            // Окно могли заблокировать, если Firebase догружался дольше, чем браузер помнит нажатие
            if (err && (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request")) {
                const label = btn.querySelector("span");
                if (label) label.textContent = "Ещё раз";
                return;
            }
            if (err && err.code === "auth/popup-closed-by-user") return;
            alert("Ошибка входа через Google: " + err.message);
        });
    });
    // Намерение войти: качаем Firebase заранее, чтобы к клику он был готов
    ["pointerenter", "touchstart", "focus"].forEach(type => btn.addEventListener(type, () => { start(); }, { once: true, passive: true }));
    // Уже входил — поднимаем сессию и облако после загрузки карты
    lazy.afterLoad(() => lazy.hasSavedSession().then(saved => { if (saved) start(); }));
}
initAuth();
