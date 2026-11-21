// =========================================================
// 1. ДАННЫЕ ДЛЯ РЕНДЕРА (Шаблоны)
// =========================================================

// Данные карт Stellar Blade (у каждой локации своя страница stellar-blade-map/<id>/;
// legacyPage — бывшие отдельные страницы, их старые адреса перенаправляет 404.html)
const stellarMapConfigs = [
    { id: "eidos7", name: "Эйдос-7 (Eidos 7)", legacyPage: "eidos7.html", markersFile: "stellar_blade_eidos-7_markers.json" },
    { id: "xion", name: "Ксион (Xion City)", legacyPage: "xion.html", markersFile: "stellar_blade_xion-city_markers.json" },
    { id: "wasteland", name: "Пустошь (Wasteland)", legacyPage: "wasteland.html", markersFile: "stellar_blade_wasteland_markers.json" },
    { id: "altess-levoire", name: "Левуар «Высь» (Altess Levoire)", legacyPage: "altess_levoire.html", markersFile: "stellar_blade_altess-levoire_markers.json" },
    { id: "matrix-11", name: "Матрица-11 (Matrix 11)", legacyPage: "matrix11.html", markersFile: "stellar_blade_matrix-11_markers.json" },
    { id: "great-desert", name: "Великая пустыня (Great Desert)", legacyPage: "great_desert.html", markersFile: "stellar_blade_great-desert_markers.json" },
    { id: "abyss-levoire", name: "Левуар «Бездна» (Abyss Levoire)", legacyPage: "abyss_levoire.html", markersFile: "stellar_blade_abyss-levoire_markers.json" },
    { id: "spire-4", name: "Шпиль-4 (Spire 4)", legacyPage: "spire4.html", markersFile: "stellar_blade_spire-4_markers.json" },
    { id: "eidos-9", name: "Эйдос-9 (Eidos 9)", legacyPage: "eidos9.html", markersFile: "stellar_blade_eidos-9_markers.json" }
];

// Данные карт Tainted Grail
const taintedMapConfigs = [
    { id: "horns-of-the-south", name: "Рога Юга", markersFile: "tainted_grail_horns-of-the-south_markers.json" },
    { id: "cuanacht", name: "Кунахт", markersFile: "tainted_grail_cuanacht_markers.json" },
    { id: "forlorn-swords", name: "Забытые Мечи", markersFile: "tainted_grail_forlorn-swords_markers.json" },
    { id: "sarras", name: "Саррас", markersFile: "tainted_grail_sarras_markers.json" }
];

// Данные карт Gothic 1 Remake
const gothicMapConfigs = [
    { id: "valley-of-mines", name: "Долина рудников", markersFile: "gothic_remake_valley-of-mines_markers.json" }
];

// Данные карт Dimraeth
const dimraethMapConfigs = [
    { id: "wildwood", name: "Эрлвуд", markersFile: "dimraeth_wildwood_markers.json" },
    { id: "thelostcaverns", name: "Затерянные пещеры", markersFile: "dimraeth_thelostcaverns_markers.json" },
    { id: "playerbase", name: "Святилище", markersFile: "dimraeth_playerbase_markers.json" },
    { id: "thegoblincaves", name: "Гоблинские пещеры", markersFile: "dimraeth_thegoblincaves_markers.json" }
];

// Данные карт Palworld
const palworldMapConfigs = [
    { id: "palpagos-islands", name: "Острова Палпагос", markersFile: "palworld_palpagos-islands_markers.json" }
];

// Данные карт TES IV: Oblivion Remastered
const oblivionMapConfigs = [
    { id: "cyrodiil", name: "Сиродил", markersFile: "oblivion_cyrodiil_markers.json" },
    { id: "shivering-isles", name: "Дрожащие острова", markersFile: "oblivion_shivering-isles_markers.json" }
];

// Данные карт The Elder Scrolls V: Skyrim
const skyrimMapConfigs = [
    { id: "skyrim", name: "Скайрим", markersFile: "skyrim_skyrim_markers.json" },
    { id: "solstheim", name: "Солстейм", markersFile: "skyrim_solstheim_markers.json" }
];
// Данные карт «Ведьмак 3: Дикая Охота»
const witcher3MapConfigs = [
    { id: "velen-novigrad", name: "Велен и Новиград", markersFile: "witcher3_velen-novigrad_markers.json" },
    { id: "skellige", name: "Скеллиге", markersFile: "witcher3_skellige_markers.json" },
    { id: "toussaint", name: "Туссент", markersFile: "witcher3_toussaint_markers.json" },
    { id: "white-orchard", name: "Белый Сад", markersFile: "witcher3_white-orchard_markers.json" },
    { id: "kaer-morhen", name: "Каэр Морхен", markersFile: "witcher3_kaer-morhen_markers.json" },
    { id: "isle-of-mists", name: "Остров Туманов", markersFile: "witcher3_isle-of-mists_markers.json" },
    { id: "vizima-castle", name: "Королевский замок в Вызиме", markersFile: "witcher3_vizima-castle_markers.json" },
    { id: "time-and-space", name: "Время и пространство", markersFile: "witcher3_time-and-space_markers.json" },
    { id: "olgierd-world", name: "Мир Гюнтера о'Дима", markersFile: "witcher3_olgierd-world_markers.json" },
    { id: "land-of-fables", name: "Страна Сказок", markersFile: "witcher3_land-of-fables_markers.json" }
];
// Данные карты Cyberpunk 2077 (одна карта: Найт-Сити с Пёсьим городом и Пустошами)
const cyberpunkMapConfigs = [
    { id: "night-city", name: "Найт-Сити", markersFile: "cyberpunk2077_night-city_markers.json" }
];
// Данные карт Hogwarts Legacy
const hogwartsMapConfigs = [
    { id: "world", name: "Мир", markersFile: "hogwarts_world_markers.json" },
    { id: "hogwarts", name: "Хогвартс", markersFile: "hogwarts_hogwarts_markers.json" },
    { id: "hogsmeade", name: "Хогсмид", markersFile: "hogwarts_hogsmeade_markers.json" }
];

// Данные карты Silver Palace (одна карта: Серебряный дворец)
// Данные карты Red Dead Redemption 2 (одна карта: весь Запад)
const rdr2MapConfigs = [
    { id: "rdr2", name: "Запад: Нью-Ханаан, Амбарино, Гуарма", markersFile: "rdr2_markers.json" }
];
const gta6MapConfigs = [
    { id: "leonida", name: "Штат Леонида", markersFile: "gta6_markers.json" }
];
const silverPalaceMapConfigs = [
    { id: "silver-palace", name: "Серебряный дворец", markersFile: "silver-palace_markers.json" }
];

// Данные карт Phantom Blade Zero
const phantomBladeMapConfigs = [
    { id: "weeping-creek-valley", name: "Долина Плачущего ручья", markersFile: "phantomblade_weeping-creek-valley_markers.json" },
    { id: "crimson-forest", name: "Багровый лес", markersFile: "phantomblade_crimson-forest_markers.json" },
    { id: "village-of-lu", name: "Деревня Лу", markersFile: "phantomblade_village-of-lu_markers.json" },
    { id: "pangzhen", name: "Панчжэнь", markersFile: "phantomblade_pangzhen_markers.json" },
    { id: "the-mandates-encampment", name: "Лагерь Союза", markersFile: "phantomblade_the-mandates-encampment_markers.json" },
    { id: "meigu-lake", name: "Озеро Мэйгу", markersFile: "phantomblade_meigu-lake_markers.json" },
    { id: "mountain-of-imprisonment", name: "Гора Заточения", markersFile: "phantomblade_mountain-of-imprisonment_markers.json" },
    { id: "mount-soulrend", name: "Гора Разбитых Душ", markersFile: "phantomblade_mount-soulrend_markers.json" }
];


// Данные заглушек
const placeholderGames = [];

// =========================================================
// 2. ГЕНЕРАЦИЯ HTML
// =========================================================

// Пункт «База данных» в списке карт карточки (/db/<slug>/) — ставится последним
function dbLinkHTML(slug, title) {
    return `
            <a href="./db/${slug}/" class="map-link map-link-db" title="${title}">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"/><path d="M4 21V5M9 7h6"/></svg>
                    База данных
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>`;
}

function renderGames() {
    const container = document.getElementById("games-container");
    if (!container) return;
    // Карточки уже лежат в index.html (tools/prerender_home.py) — повторно не рисуем
    if (container.querySelector(".game-dropdown")) return;

    // Рендер Stellar Blade
    let stellarHTML = `
        <details class="game-dropdown theme-stellar">
            <summary>
                <div class="game-banner stellar-banner">
                    <img class="game-banner-art" src="./stellar-blade-map/logo-card.webp" srcset="./stellar-blade-map/logo-card-720.webp 720w, ./stellar-blade-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" fetchpriority="high" decoding="async" alt="Stellar Blade — выбрать локацию">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Stellar Blade</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="stellar-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="stellar-progress-bar" role="progressbar" aria-label="Общий прогресс Stellar Blade" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="stellar-progress-fill"></span></div>
                            <span class="game-progress-count" id="stellar-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${stellarMapConfigs.length} карт</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;

    stellarMapConfigs.forEach(config => {
        stellarHTML += `
            <a href="./stellar-blade-map/${config.id}/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });

    stellarHTML += `
            </div>
        </details>
    `;
    container.innerHTML = stellarHTML;

    // Рендер Tainted Grail
    let taintedHTML = `
        <details class="game-dropdown theme-tainted">
            <summary>
                <div class="game-banner tainted-banner">
                    <img class="game-banner-art" src="./tainted-grail-map/logo-card.webp" srcset="./tainted-grail-map/logo-card-720.webp 720w, ./tainted-grail-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" decoding="async" alt="Tainted Grail: The Fall of Avalon — выбрать локацию">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Tainted Grail: The Fall of Avalon</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="tainted-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="tainted-progress-bar" role="progressbar" aria-label="Общий прогресс Tainted Grail" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="tainted-progress-fill"></span></div>
                            <span class="game-progress-count" id="tainted-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${taintedMapConfigs.length} карты</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    taintedMapConfigs.forEach(config => {
        taintedHTML += `
            <a href="./tainted-grail-map/${config.id}/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    // База данных игры (/db/tainted-grail/) — последним пунктом списка карт
    taintedHTML += dbLinkHTML("tainted-grail", "Предметы, задания, бестиарий, таланты") + `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', taintedHTML);

    // Рендер Gothic 1 Remake
    let gothicHTML = `
        <details class="game-dropdown theme-gothic">
            <summary>
                <div class="game-banner">
                    <img class="game-banner-art" src="./gothic-remake-map/logo-card.webp" srcset="./gothic-remake-map/logo-card-720.webp 720w, ./gothic-remake-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Gothic 1 Remake — выбрать локацию">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Gothic 1 Remake</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="gothic-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="gothic-progress-bar" role="progressbar" aria-label="Общий прогресс Gothic 1 Remake" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="gothic-progress-fill"></span></div>
                            <span class="game-progress-count" id="gothic-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${gothicMapConfigs.length} карта</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    gothicMapConfigs.forEach(config => {
        gothicHTML += `
            <a href="./gothic-remake-map/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    gothicHTML += dbLinkHTML("gothic-remake", "Предметы, задания, бестиарий, гильдии") + `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', gothicHTML);

    // Рендер Dimraeth
    let dimraethHTML = `
        <details class="game-dropdown theme-dimraeth">
            <summary>
                <div class="game-banner">
                    <img class="game-banner-art" src="./dimraeth-map/logo-card.webp" srcset="./dimraeth-map/logo-card-720.webp 720w, ./dimraeth-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Dimraeth — выбрать локацию">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Dimraeth</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="dimraeth-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="dimraeth-progress-bar" role="progressbar" aria-label="Общий прогресс Dimraeth" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="dimraeth-progress-fill"></span></div>
                            <span class="game-progress-count" id="dimraeth-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${dimraethMapConfigs.length} карты</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    dimraethMapConfigs.forEach(config => {
        dimraethHTML += `
            <a href="./dimraeth-map/${config.id}/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    dimraethHTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', dimraethHTML);

    // Рендер Palworld
    let palworldHTML = `
        <details class="game-dropdown theme-palworld">
            <summary>
                <div class="game-banner">
                    <img class="game-banner-art" src="./palworld-map/logo-card.webp" srcset="./palworld-map/logo-card-720.webp 720w, ./palworld-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Palworld — выбрать локацию">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Palworld</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="palworld-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="palworld-progress-bar" role="progressbar" aria-label="Общий прогресс Palworld" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="palworld-progress-fill"></span></div>
                            <span class="game-progress-count" id="palworld-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${palworldMapConfigs.length} карта</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    palworldMapConfigs.forEach(config => {
        palworldHTML += `
            <a href="./palworld-map/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    palworldHTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', palworldHTML);

    // Рендер Oblivion Remastered
    let oblivionHTML = `
        <details class="game-dropdown theme-oblivion">
            <summary>
                <div class="game-banner oblivion-banner">
                    <img class="game-banner-art" src="./oblivion-remake-map/logo-card.webp" srcset="./oblivion-remake-map/logo-card-720.webp 720w, ./oblivion-remake-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Oblivion Remastered — выбрать карту">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Oblivion Remastered</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="oblivion-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="oblivion-progress-bar" role="progressbar" aria-label="Общий прогресс Oblivion Remastered" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="oblivion-progress-fill"></span></div>
                            <span class="game-progress-count" id="oblivion-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${oblivionMapConfigs.length} карты</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    oblivionMapConfigs.forEach(config => {
        oblivionHTML += `
            <a href="./oblivion-remake-map/${config.id}/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    oblivionHTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', oblivionHTML);

    // Рендер Skyrim
    let skyrimHTML = `
        <details class="game-dropdown theme-skyrim">
            <summary>
                <div class="game-banner skyrim-banner">
                    <img class="game-banner-art" src="./skyrim-map/logo-card.webp" srcset="./skyrim-map/logo-card-720.webp 720w, ./skyrim-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Skyrim — выбрать карту">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Skyrim</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="skyrim-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="skyrim-progress-bar" role="progressbar" aria-label="Общий прогресс Skyrim" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="skyrim-progress-fill"></span></div>
                            <span class="game-progress-count" id="skyrim-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${skyrimMapConfigs.length} карты</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    skyrimMapConfigs.forEach(config => {
        skyrimHTML += `
            <a href="./skyrim-map/${config.id}/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    skyrimHTML += dbLinkHTML("skyrim", "Предметы, задания, бестиарий, заклинания") + `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', skyrimHTML);

    // Рендер Ведьмак 3
    let witcher3HTML = `
        <details class="game-dropdown theme-witcher3">
            <summary>
                <div class="game-banner witcher3-banner">
                    <img class="game-banner-art" src="./witcher3-map/logo-card.webp" srcset="./witcher3-map/logo-card-720.webp 720w, ./witcher3-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Ведьмак 3: Дикая Охота — выбрать карту">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Ведьмак 3</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="witcher3-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="witcher3-progress-bar" role="progressbar" aria-label="Общий прогресс Ведьмак 3" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="witcher3-progress-fill"></span></div>
                            <span class="game-progress-count" id="witcher3-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${witcher3MapConfigs.length} карт</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    witcher3MapConfigs.forEach(config => {
        witcher3HTML += `
            <a href="./witcher3-map/${config.id}/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    witcher3HTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', witcher3HTML);

    // Рендер Cyberpunk 2077
    let cyberpunkHTML = `
        <details class="game-dropdown theme-cyberpunk2077">
            <summary>
                <div class="game-banner cyberpunk2077-banner">
                    <img class="game-banner-art" src="./cyberpunk2077-map/logo-card.webp" srcset="./cyberpunk2077-map/logo-card-720.webp 720w, ./cyberpunk2077-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Cyberpunk 2077 — открыть карту Найт-Сити">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Cyberpunk 2077</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="cyberpunk2077-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="cyberpunk2077-progress-bar" role="progressbar" aria-label="Общий прогресс Cyberpunk 2077" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="cyberpunk2077-progress-fill"></span></div>
                            <span class="game-progress-count" id="cyberpunk2077-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${cyberpunkMapConfigs.length} карта</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    cyberpunkMapConfigs.forEach(config => {
        cyberpunkHTML += `
            <a href="./cyberpunk2077-map/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    cyberpunkHTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', cyberpunkHTML);

    // Рендер Hogwarts Legacy
    let hogwartsHTML = `
        <details class="game-dropdown theme-hogwarts">
            <summary>
                <div class="game-banner hogwarts-banner">
                    <img class="game-banner-art" src="./hogwarts-legacy-map/logo-card.webp" srcset="./hogwarts-legacy-map/logo-card-720.webp 720w, ./hogwarts-legacy-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Hogwarts Legacy — выбрать карту">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Hogwarts Legacy</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="hogwarts-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="hogwarts-progress-bar" role="progressbar" aria-label="Общий прогресс Hogwarts Legacy" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="hogwarts-progress-fill"></span></div>
                            <span class="game-progress-count" id="hogwarts-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${hogwartsMapConfigs.length} карты</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    hogwartsMapConfigs.forEach(config => {
        hogwartsHTML += `
            <a href="./hogwarts-legacy-map/${config.id}/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    hogwartsHTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', hogwartsHTML);

    // Рендер Phantom Blade Zero
    let phantomBladeHTML = `
        <details class="game-dropdown theme-phantomblade">
            <summary>
                <div class="game-banner phantomblade-banner">
                    <img class="game-banner-art" src="./phantom-blade-zero-map/logo-card.webp" srcset="./phantom-blade-zero-map/logo-card-720.webp 720w, ./phantom-blade-zero-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Phantom Blade Zero — выбрать карту">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Phantom Blade Zero</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="phantomblade-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="phantomblade-progress-bar" role="progressbar" aria-label="Общий прогресс Phantom Blade Zero" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="phantomblade-progress-fill"></span></div>
                            <span class="game-progress-count" id="phantomblade-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${phantomBladeMapConfigs.length} карт</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    phantomBladeMapConfigs.forEach(config => {
        phantomBladeHTML += `
            <a href="./phantom-blade-zero-map/${config.id}/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    phantomBladeHTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', phantomBladeHTML);

    // Рендер Red Dead Redemption 2
    let rdr2HTML = `
        <details class="game-dropdown theme-rdr2">
            <summary>
                <div class="game-banner rdr2-banner">
                    <img class="game-banner-art" src="./rdr2-map/logo-card.webp" srcset="./rdr2-map/logo-card-720.webp 720w, ./rdr2-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Red Dead Redemption 2 — открыть карту Дикого Запада">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Red Dead Redemption 2</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="rdr2-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="rdr2-progress-bar" role="progressbar" aria-label="Общий прогресс Red Dead Redemption 2" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="rdr2-progress-fill"></span></div>
                            <span class="game-progress-count" id="rdr2-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${rdr2MapConfigs.length} карта</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    rdr2MapConfigs.forEach(config => {
        rdr2HTML += `
            <a href="./rdr2-map/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    rdr2HTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', rdr2HTML);

    // Рендер Grand Theft Auto VI
    let gta6HTML = `
        <details class="game-dropdown theme-gta6">
            <summary>
                <div class="game-banner gta6-banner">
                    <img class="game-banner-art" src="./gta6-map/logo-card.webp" srcset="./gta6-map/logo-card-720.webp 720w, ./gta6-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Grand Theft Auto VI — открыть карту штата Леонида">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Grand Theft Auto VI</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="gta6-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="gta6-progress-bar" role="progressbar" aria-label="Общий прогресс Grand Theft Auto VI" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="gta6-progress-fill"></span></div>
                            <span class="game-progress-count" id="gta6-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${gta6MapConfigs.length} карта</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    gta6MapConfigs.forEach(config => {
        gta6HTML += `
            <a href="./gta6-map/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    gta6HTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', gta6HTML);

    // Рендер Silver Palace
    let silverPalaceHTML = `
        <details class="game-dropdown theme-silverpalace">
            <summary>
                <div class="game-banner silverpalace-banner">
                    <img class="game-banner-art" src="./silver-palace-map/logo-card.webp" srcset="./silver-palace-map/logo-card-720.webp 720w, ./silver-palace-map/logo-card.webp 1080w" sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 860px) calc(100vw - 48px), 560px" loading="lazy" decoding="async" alt="Silver Palace — открыть карту Серебряного дворца">
                </div>
                <div class="game-info">
                    <div class="game-title-block">
                        <span class="game-title">Silver Palace</span>
                        <div class="game-progress">
                            <div class="game-progress-heading"><span>Найдено меток</span><strong id="silverpalace-progress-value">—%</strong></div>
                            <div class="game-progress-track" id="silverpalace-progress-bar" role="progressbar" aria-label="Общий прогресс Silver Palace" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="silverpalace-progress-fill"></span></div>
                            <span class="game-progress-count" id="silverpalace-progress-count">Загрузка меток...</span>
                        </div>
                    </div>
                    <span class="game-indicators">
                        <span class="game-badge">${silverPalaceMapConfigs.length} карта</span>
                        <span class="game-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
                    </span>
                </div>
            </summary>
            <div class="maps-list">
    `;
    silverPalaceMapConfigs.forEach(config => {
        silverPalaceHTML += `
            <a href="./silver-palace-map/" class="map-link">
                <span class="map-name">
                    <svg class="map-marker" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                    ${config.name}
                </span>
                <span class="status" aria-label="Открыть">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </span>
            </a>
        `;
    });
    silverPalaceHTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', silverPalaceHTML);

    // Рендер заглушек
    placeholderGames.forEach(game => {
        const placeholderHTML = `
            <article class="game-placeholder ${game.theme} ${game.placeholderClass}" aria-label="${game.title} — карта в разработке">
                <div class="game-banner placeholder-banner">
                    <span class="game-badge">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                        Заблокировано
                    </span>
                    <svg class="placeholder-lock" viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="14" width="24" height="15" rx="3"/><path d="M9 14V9a7 7 0 0 1 14 0v5M16 20v4"/></svg>
                </div>
                <div class="game-info"><h3 class="game-title">${game.title}</h3></div>
                <p class="placeholder-copy">Интерактивная карта для этого мира появится здесь.</p>
            </article>
        `;
        container.insertAdjacentHTML('beforeend', placeholderHTML);
    });

    // Баннер «Здесь могла бы быть ваша игра»: во всю ширину сетки под карточками, ведёт на форму с предложением игры
    container.insertAdjacentHTML('beforeend', `
        <a class="game-suggest-banner" href="https://forms.gle/S1dA8ivejnYkdB1HA" target="_blank" rel="noopener noreferrer">
            <span class="game-suggest-plus" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span>
            <span class="game-suggest-copy">
                <span class="game-suggest-title">Здесь могла бы быть ваша игра</span>
                <span class="game-suggest-sub">Предложите карту — она попадёт в очередь на добавление.</span>
            </span>
            <span class="game-suggest-cta">Предложить игру →</span>
        </a>
    `);
}

// Баннер «Здесь могла бы быть ваша игра» занимает свободные клетки последнего ряда сетки:
// одна клетка — вертикальная карточка, несколько — горизонтальный баннер, ряд заполнен — строка во всю ширину.
// Число колонок берётся из сетки (на главной 2, на /games/ — сколько влезает), скрытые поиском карточки не считаются.
function fitSuggestBanner() {
    const container = document.getElementById("games-container");
    const banner = container && container.querySelector(":scope > .game-suggest-banner");
    if (!banner) return;
    const cols = getComputedStyle(container).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    const visible = container.querySelectorAll(":scope > .game-dropdown:not([hidden]):not(.is-filtered), :scope > .game-placeholder:not([hidden])").length;
    const free = visible % cols ? cols - visible % cols : cols;
    banner.style.gridColumn = free === cols ? "1 / -1" : `span ${free}`;
    banner.classList.toggle("is-cell", free === 1);
}

// Бейджи на баннерах: «Новое» — неделю после добавления игры, «Обновлено» — неделю после крупного обновления
// (новый перевод, новые локации). Ключ — тема карточки (theme-…), дата — день публикации. Через 7 дней бейдж пропадает сам,
// в том числе из карточек, заранее запечённых в index.html (scripts/prerender_home.py).
const GAME_FRESH = {
    skyrim: { added: "2026-11-05" },
    witcher3: { added: "2026-11-07" },
    cyberpunk2077: { added: "2026-11-09" },
    hogwarts: { added: "2026-11-11" },
    phantomblade: { added: "2026-11-13" },
    rdr2: { added: "2026-11-18" },
    gta6: { added: "2026-11-21" },
    silverpalace: { release: "2026-12-14", added: "2026-12-14" },
    stellar: { updated: "2026-11-07" },
    gothic: { updated: "2026-11-07" },
    tainted: { updated: "2026-11-16" }
};
function applyFreshBadges() {
    const WEEK = 7 * 864e5, now = Date.now();
    const fresh = (d) => d && now - new Date(d + "T00:00:00").getTime() < WEEK;
    document.querySelectorAll("#games-container > .game-dropdown").forEach((card) => {
        const banner = card.querySelector(".game-banner");
        if (!banner) return;
        banner.querySelectorAll(".game-new").forEach((b) => b.remove());
        const theme = [...card.classList].find((c) => c.startsWith("theme-"));
        const info = theme && GAME_FRESH[theme.slice(6)];
        if (!info) return;
        // игра ещё не вышла, карта закрыта до даты релиза (00:00 по Москве): вместо «Новое» — «Скоро»
        const soon = info.release && now < new Date(info.release + "T00:00:00+03:00").getTime();
        const kind = soon ? "soon" : fresh(info.added) ? "new" : fresh(info.updated) ? "upd" : "";
        if (!kind) return;
        const badge = document.createElement("span");
        badge.className = kind === "upd" ? "game-new is-upd" : kind === "soon" ? "game-new is-soon" : "game-new";
        badge.textContent = kind === "upd" ? "Обновлено" : kind === "soon" ? "Скоро" : "Новое";
        // дата — отдельными элементами: в «Списке» на телефоне плашка складывается в две строки без «·»
        if (kind === "soon") badge.insertAdjacentHTML("beforeend", '<i class="game-new-sep"> · </i><span>14 декабря</span>');
        banner.prepend(badge);
    });
}

// Кнопка «Открыть карту» на карточке игры. Игра с одной картой — прямая ссылка на неё (карточка целиком ведёт на карту),
// несколько карт — «Выбрать карту» со счётчиком. Список карт показывается по наведению (мышь, как всплывающая панель поверх
// страницы, вёрстка не двигается) и по нажатию (раскрывается в карточке). Функция идемпотентна: её результат запекается в index.html.
function enhanceGameCards() {
    const word = (n) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? "карта" : a >= 2 && a <= 4 && (b < 12 || b > 14) ? "карты" : "карт"; };
    document.querySelectorAll("#games-container > details.game-dropdown").forEach((card) => {
        const box = card.querySelector(".game-indicators");
        if (!box || box.querySelector(".game-cta")) return;
        const maps = [...card.querySelectorAll(".maps-list .map-link:not(.map-link-db)")];
        const extras = card.querySelectorAll(".maps-list .map-link-db").length;
        const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
        const chev = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
        const title = (card.querySelector(".game-title") || {}).textContent || "";
        card.dataset.maps = String(maps.length);
        // одна карта и больше ничего — сразу «Открыть карту»; есть база данных — список «карта + база»
        if (maps.length === 1 && !extras) {
            box.innerHTML = `<a class="game-cta is-direct" href="${maps[0].getAttribute("href")}" aria-label="Открыть карту: ${title.trim()}">Открыть карту${arrow}</a>` +
                (extras ? `<span class="game-arrow" aria-hidden="true" title="Ещё разделы">${chev}</span>` : "");
        } else {
            box.innerHTML = `<span class="game-cta is-pick">Выбрать карту<b>${maps.length}</b></span><span class="game-arrow" aria-hidden="true">${chev}</span>`;
            box.setAttribute("title", `${maps.length} ${word(maps.length)}`);
        }
    });
}

// Всплывающий список карт по наведению мыши (экраны без hover — только по нажатию).
function initCardPeek() {
    const container = document.getElementById("games-container");
    if (!container || container.dataset.peek || document.body.classList.contains("games-page") || !window.matchMedia("(hover: hover) and (min-width: 681px)").matches) return;
    container.dataset.peek = "1";
    const timers = new WeakMap();
    container.addEventListener("pointerover", (e) => {
        if (e.pointerType && e.pointerType !== "mouse") return;
        const card = e.target.closest("details.game-dropdown");
        if (!card || card.open || container.classList.contains("is-list") || card.dataset.maps === "1" && !card.querySelector(".map-link-db")) return;
        clearTimeout(timers.get(card));
        timers.set(card, setTimeout(() => { card.classList.add("is-peek"); card.open = true; }, 160));
    });
    container.addEventListener("pointerout", (e) => {
        const card = e.target.closest("details.game-dropdown");
        if (!card || card.contains(e.relatedTarget)) return;
        clearTimeout(timers.get(card));
        if (card.classList.contains("is-peek")) timers.set(card, setTimeout(() => { card.open = false; card.classList.remove("is-peek"); }, 220));
    });
    container.addEventListener("click", (e) => {      // нажатие закрепляет список внутри карточки
        const card = e.target.closest("details.game-dropdown");
        if (card && card.classList.contains("is-peek") && e.target.closest("summary")) { card.classList.remove("is-peek"); }
    }, true);
    container.addEventListener("toggle", (e) => { if (!e.target.open) e.target.classList.remove("is-peek"); }, true);
}

// Переключатель «Сетка / Список» над библиотекой; выбор запоминается в браузере.
function initViewToggle() {
    const container = document.getElementById("games-container");
    const search = document.querySelector(".game-search");
    if (!container || !search || document.querySelector(".view-toggle") || document.body.classList.contains("games-page")) return;
    const ico = {
        grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
        list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>'
    };
    const wrap = document.createElement("div");
    wrap.className = "view-toggle"; wrap.setAttribute("role", "group"); wrap.setAttribute("aria-label", "Вид библиотеки");
    wrap.innerHTML = `<button type="button" data-view="grid" aria-label="Сетка" title="Сетка">${ico.grid}</button><button type="button" data-view="list" aria-label="Список" title="Список">${ico.list}</button>`;
    search.appendChild(wrap);
    const apply = (v) => {
        container.classList.toggle("is-list", v === "list");
        wrap.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === v)));
        if (typeof fitSuggestBanner === "function") fitSuggestBanner();
    };
    let view = "grid";
    try { view = localStorage.getItem("bp_home_view") === "list" ? "list" : "grid"; } catch (e) { /* без хранилища — сетка */ }
    const asked = new URLSearchParams(location.search).get("view");   // ?view=list — ссылка сразу на нужный вид
    if (asked === "list" || asked === "grid") view = asked;
    apply(view);
    wrap.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        view = b.dataset.view; apply(view);
        try { localStorage.setItem("bp_home_view", view); } catch (err) { /* не страшно */ }
    });
}

// Запускаем рендер сразу (скрипт подключен с defer)
renderGames();
applyFreshBadges();
enhanceGameCards();
// Карточка игры с одной картой открывает её по нажатию на любое место карточки
(function () {
    const box = document.getElementById("games-container");
    if (!box || document.body.classList.contains("games-page")) return;
    box.addEventListener("click", (e) => {
        const sum = e.target.closest("details.game-dropdown > summary");
        if (!sum || e.target.closest("a, button") || e.defaultPrevented) return;
        const direct = sum.querySelector(".game-cta.is-direct");
        if (direct) { e.preventDefault(); location.href = direct.href; }
    });
})();
initViewToggle();
fitSuggestBanner();
if ("ResizeObserver" in window && document.getElementById("games-container")) {
    let fitFrame = 0;
    new ResizeObserver(() => { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(fitSuggestBanner); })
        .observe(document.getElementById("games-container"));
}


// =========================================================
// 3. ЛОГИКА (Поиск, Прогресс, Загрузка)
// =========================================================

// Запустить после полной загрузки страницы и в свободную минуту браузера,
// чтобы второстепенные запросы не отбирали сеть у картинок и шрифтов первого экрана
function afterPageLoad(fn) {
    const run = () => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 200));
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
}

// Главная собирается Next.js (web/): этот файл подключается после гидратации React, когда
// DOMContentLoaded уже прошёл, — поэтому запускаем сразу, если документ готов.
function onDomReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
}

onDomReady(() => {
    // Статус Twitch (кнопка в подвале и шапка) — общий модуль js/twitch-live.js

    try { localStorage.removeItem("broskiplay_latest_video"); } catch (error) { /* кэш ленты YouTube больше не нужен */ }

    // --- Поиск, Прогресс, Переходы ---
    const mapLinks = [...document.querySelectorAll(".map-link:not(.map-link-db)")];
    // Ссылка карты в списке: ./<игра>/<карта>/, у игры с одной картой — ./<игра>/
    const findMapLink = (dir, id) => mapLinks.find(item => {
        const path = new URL(item.href).pathname;
        return path.endsWith(`/${dir}/${id}/`) || path.endsWith(`/${dir}/`);
    });
    const gameSearchInput = document.getElementById("game-search-input");
    const gameSearchStatus = document.getElementById("game-search-status");
    const gameCards = [...document.querySelectorAll("#games-container > .game-dropdown, #games-container > .game-placeholder")];

    // Поиск: учитывает фильтр библиотеки (js/home-lib.js ставит .is-filtered и заново вызывает поиск при смене фильтра)
    gameSearchInput.addEventListener("input", () => {
        const query = gameSearchInput.value.trim().toLocaleLowerCase("ru");
        const inFilter = gameCards.filter(card => !card.classList.contains("is-filtered"));
        let visibleCount = 0, outside = 0;
        gameCards.forEach(card => {
            const title = (card.querySelector(".game-title").textContent + " " + (card.dataset.alias || "")).trim().toLocaleLowerCase("ru"); // data-alias — другие написания (web/lib/maps.ts)
            const isMatch = !query || title.includes(query);
            card.hidden = !isMatch;
            if (!isMatch) return;
            if (card.classList.contains("is-filtered")) outside++;
            else visibleCount++;
        });
        fitSuggestBanner();
        gameSearchStatus.textContent = !query ? ""
            : visibleCount ? `Найдено: ${visibleCount} из ${inFilter.length}`
            : outside ? `В выбранном фильтре ничего нет, но есть совпадения среди всех игр (${outside}) — выберите «Все».`
            : "Игры не найдены. Проверьте запрос.";
        // видимое сообщение (status выше — только для скринридера)
        const emptyNote = document.getElementById("bx-empty");
        if (emptyNote) {
            emptyNote.hidden = !query || visibleCount > 0;
            if (!emptyNote.hidden) emptyNote.textContent = gameSearchStatus.textContent;
        }
    });


    // Корень сайта относительно страницы: главная — "./", /games/ — "../" (html[data-root])
    const SITE_ROOT = document.documentElement.dataset.root || "./";

    function formatMarkers(n) {
        const mod10 = n % 10, mod100 = n % 100;
        const word = mod10 === 1 && mod100 !== 11 ? "метка" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "метки" : "меток";
        return `${n.toLocaleString("ru-RU")} ${word}`;
    }

    // Игры, ключи хранения и подсчёт меток — общий модуль js/progress-core.js (его же использует кабинет)
    const MAP_CONFIGS = {
        stellarMapConfigs, taintedMapConfigs, gothicMapConfigs, dimraethMapConfigs, palworldMapConfigs, oblivionMapConfigs, skyrimMapConfigs,
        witcher3MapConfigs, cyberpunkMapConfigs, hogwartsMapConfigs, phantomBladeMapConfigs, rdr2MapConfigs, gta6MapConfigs, silverPalaceMapConfigs
    };
    const progressGames = Object.fromEntries(BPP.GAMES.map(g => [g.key, {
        ...g, configs: MAP_CONFIGS[g.conf], prefix: g.key, cloudId: id => g.c + id
    }]));

    // Крестик на карточке «Продолжить»: убрать карту из последних (снова появится, когда её откроют)
    document.getElementById("recent-list")?.addEventListener("click", event => {
        const btn = event.target.closest(".recent-dismiss");
        if (!btn) return;
        event.preventDefault();
        try {
            const list = JSON.parse(localStorage.getItem("bp_recent") || "[]");
            localStorage.setItem("bp_recent", JSON.stringify((Array.isArray(list) ? list : []).filter(r => !(r && r.game === btn.dataset.game && r.map === btn.dataset.map))));
        } catch (error) { /* localStorage недоступен */ }
        renderRecent();
        document.dispatchEvent(new Event("bp:progress"));
    });
    // «Показать ещё» (только компьютер): раскрыть карточки после первых двух / свернуть обратно
    document.getElementById("recent-more")?.addEventListener("click", event => {
        const list = document.getElementById("recent-list"), all = list.classList.toggle("is-all");
        event.currentTarget.setAttribute("aria-expanded", String(all));
        event.currentTarget.textContent = all ? "Свернуть" : "Показать ещё";   // home-lib.js: пересчитать фильтр «Недавние» и сводку кабинета
    });

    // Блок «Продолжить» над библиотекой: последние открытые карты всех игр (bp_recent пишет js/map-extras.js на картах)
    const recentStore = new Map();
    window.bpProgress = { games: {}, maps: recentStore };   // читает js/home-lib.js («Продолжить» в шапке, «Мой прогресс», фильтры)
    function renderRecent() {
        const box = document.getElementById("recent-maps");
        if (!box) return;
        let list = [];
        try { list = JSON.parse(localStorage.getItem("bp_recent") || "[]"); } catch (error) { list = []; }
        const items = (Array.isArray(list) ? list : []).map(r => r && recentStore.get(`${r.game}/${r.map}`) && { ...recentStore.get(`${r.game}/${r.map}`), game: r.game, map: r.map })
            .filter(r => r && r.href).slice(0, 6);   // ПК: 2 + «Показать ещё»; телефон: до 3 (css/home-v3.css)
        box.hidden = !items.length;
        const more = document.getElementById("recent-more");
        if (more) more.hidden = items.length < 3;
        // нижний блок главной: «Продолжить» последнюю карту, иначе главная кнопка — кабинет
        const cta = document.getElementById("cta-continue"), cab = document.getElementById("cta-cabinet");
        if (cta) {
            const last = items[0], card = last && document.querySelector(`details.theme-${last.game}`);
            const title = card?.querySelector(".game-title")?.textContent.trim() || "";
            cta.hidden = !last;
            if (last) {
                cta.href = last.href;
                document.getElementById("cta-continue-text").textContent = "Продолжить: " + (title && last.name !== title ? `${title} — ${last.name}` : title || last.name);
            }
            cab?.classList.toggle("bx-btn-primary", !last);
            cab?.classList.toggle("bx-btn-ghost", !!last);
        }
        if (!items.length) return;
        const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
        document.getElementById("recent-list").innerHTML = items.map(r => {
            const card = document.querySelector(`details.theme-${r.game}`);
            const title = card?.querySelector(".game-title")?.textContent.trim() || "";
            const accent = card ? getComputedStyle(card).getPropertyValue("--game-accent").trim() : "";
            const pct = r.total ? Math.round(r.found / r.total * 100) : 0;
            const sameName = !title || r.name === title;
            // миниатюра — обложка карточки игры (та же картинка, уже в кэше браузера)
            const art = card?.querySelector(".game-banner-art");
            const thumb = art ? `<span class="recent-thumb" aria-hidden="true"><img src="${esc(art.getAttribute("src"))}"${art.getAttribute("srcset") ? ` srcset="${esc(art.getAttribute("srcset"))}" sizes="176px"` : ""} alt="" loading="lazy" decoding="async"></span>` : "";
            const count = r.found ? `${r.found.toLocaleString("ru-RU")} из ${formatMarkers(r.total)}` : formatMarkers(r.total);
            // карточка как в макете: превью игры, название (+ карта, если у игры их несколько), полоса, процент, стрелка
            return `<div class="recent-cell"><a class="recent-item${thumb ? " has-thumb" : ""}" href="${esc(r.href)}"${accent ? ` style="--recent-accent:${esc(accent)}"` : ""} aria-label="Продолжить: ${esc(sameName ? title || r.name : `${title} — ${r.name}`)}, ${pct}%">` + thumb +
                `<span class="recent-body"><span class="recent-game">${esc(title || r.name)}</span>${sameName ? "" : `<span class="recent-map">${esc(r.name)}</span>`}` +
                `<span class="recent-prog" title="${esc(count)}"><span class="recent-bar" aria-hidden="true"><i style="width:${pct}%"></i></span><span class="recent-pct">${pct}%</span></span></span>` +
                `<span class="recent-go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></span></a>` +
                `<button type="button" class="recent-dismiss" data-game="${esc(r.game)}" data-map="${esc(r.map)}" title="Убрать из «Продолжить»" aria-label="Убрать «${esc(sameName ? title : r.name)}» из «Продолжить»">` +
                `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg></button></div>`;
        }).join("");
    }

    async function renderProgress(game, cloudProgress = new Map()) {
        const results = await Promise.all(game.configs.map(async config => {
            const link = findMapLink(game.dir, config.id);
            const name = link?.querySelector(".map-name")?.textContent.trim() || config.id;
            // Как на картах: если документ в облаке есть, он главный — иначе удалённые на другом устройстве отметки «воскресали» бы здесь
            const { found, total } = await BPP.countMap(SITE_ROOT, game, config, cloudProgress.get(config.id));
            const percent = total ? Math.round(found / total * 100) : null;
            
            const progressLabel = link?.querySelector(".status");
            if (progressLabel) {
                let progress = progressLabel.querySelector(".map-progress");
                if (!progress) {
                    progress = document.createElement("span");
                    progress.className = "map-progress";
                    progressLabel.prepend(progress);
                }
                // Пока на карте ничего не отмечено, вместо «0%» показываем, сколько там меток
                progress.textContent = percent === null ? "—" : found ? `${percent}%` : formatMarkers(total);
                link.classList.toggle("is-untouched", !found);
                link.title = percent === null ? `${name}: прогресс пока недоступен` : `${name}: ${found} из ${total} меток, ${percent}% исследовано`;
            }
            recentStore.set(`${game.prefix}/${config.id}`, { found, total, name, href: link?.href });
            return { found, total };
        }));
        renderRecent();

        const found = results.reduce((sum, item) => sum + item.found, 0);
        const total = results.reduce((sum, item) => sum + item.total, 0);
        const percent = total ? Math.round(found / total * 100) : null;
        window.bpProgress.games[game.prefix] = { found, total };
        document.dispatchEvent(new Event("bp:progress"));
        
        const value = document.getElementById(`${game.prefix}-progress-value`);
        const count = document.getElementById(`${game.prefix}-progress-count`);
        const fill = document.getElementById(`${game.prefix}-progress-fill`);
        const bar = document.getElementById(`${game.prefix}-progress-bar`);
        if (value) value.textContent = percent === null ? "—%" : `${percent}%`;
        // Гость или новая игра: пустую полоску «0%» не показываем, только объём карты
        // Считаются только метки, которые можно отметить найденными (progress-index.json): служебные категории в прогресс не входят
        if (count) {
            count.textContent = !total ? "Прогресс пока недоступен" : found ? `${found.toLocaleString("ru-RU")} / ${formatMarkers(total)}` : `${formatMarkers(total)} в прогрессе`;
            if (total) count.title = "Метки, которые можно отметить найденными. Служебные метки (города, торговцы, точки быстрого перемещения и т. п.) есть на карте, но в прогресс не входят.";
        }
        bar?.closest(".game-progress")?.classList.toggle("is-empty", !found);
        if (fill) fill.style.width = `${percent ?? 0}%`;
        if (bar) bar.setAttribute("aria-valuenow", String(percent ?? 0));
    }

    async function refreshProgress(game, user) {
        const cloudProgress = new Map();
        if (user) {
            const db = firebase.firestore();
            await Promise.all(game.configs.map(async config => {
                try {
                    const snapshot = await db.collection("users").doc(user.uid).collection("mapProgress").doc(game.cloudId(config.id)).get();
                    const data = snapshot.exists ? snapshot.data() : null;
                    const ids = Array.isArray(data?.foundIds) ? data.foundIds : Array.isArray(data?.found) ? data.found : null;
                    if (ids) cloudProgress.set(config.id, ids);   // нет документа или ошибка — считаем по локальным отметкам
                } catch (error) { /* облако недоступно — остаётся локальный прогресс */ }
            }));
        }
        await renderProgress(game, cloudProgress);
    }
    window.refreshStellarProgress = user => Promise.all([refreshProgress(progressGames.stellar, user), refreshProgress(progressGames.tainted, user), refreshProgress(progressGames.gothic, user), refreshProgress(progressGames.dimraeth, user), refreshProgress(progressGames.palworld, user), refreshProgress(progressGames.oblivion, user), refreshProgress(progressGames.skyrim, user), refreshProgress(progressGames.witcher3, user), refreshProgress(progressGames.cyberpunk2077, user), refreshProgress(progressGames.hogwarts, user), refreshProgress(progressGames.phantomblade, user), refreshProgress(progressGames.rdr2, user), refreshProgress(progressGames.gta6, user), refreshProgress(progressGames.silverpalace, user)]);
    renderProgress(progressGames.stellar);
    renderProgress(progressGames.tainted);
    renderProgress(progressGames.gothic);
    renderProgress(progressGames.dimraeth);
    renderProgress(progressGames.palworld);
    renderProgress(progressGames.oblivion);
    renderProgress(progressGames.skyrim);
    renderProgress(progressGames.witcher3);
    renderProgress(progressGames.cyberpunk2077);
    renderProgress(progressGames.hogwarts);
    renderProgress(progressGames.phantomblade);
    renderProgress(progressGames.rdr2);
    renderProgress(progressGames.gta6);
    renderProgress(progressGames.silverpalace);

    // Экран загрузки карты и фикс bfcache
    const loadingTips = [
        "Отмечайте найденные метки прямо в карточке: прогресс сохранится автоматически.",
        "Правый клик по метке на карте быстро отмечает её найденной.",
        "Используйте фильтры категорий, чтобы быстрее находить нужные предметы.",
        "Войдите через Google, чтобы синхронизировать личный прогресс между устройствами."
    ];
    const loadingScreen = document.getElementById("map-loading-screen");
    let loadingTimer = null;

    window.addEventListener("pagehide", () => {
        if (loadingTimer) { clearTimeout(loadingTimer); loadingTimer = null; }
        loadingScreen.hidden = true;
    });
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) loadingScreen.hidden = true;
    });

    mapLinks.forEach(link => {
        if(!link) return;
        link.addEventListener("click", event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            const mapName = link.querySelector(".map-name, strong")?.textContent.trim();
            document.getElementById("map-loading-title").textContent = mapName || "Подготовка карты";
            document.getElementById("map-loading-tip").textContent = loadingTips[Math.floor(Math.random() * loadingTips.length)];
            loadingScreen.hidden = false;
            // Переходим сразу после отрисовки экрана загрузки: он остаётся на экране, пока грузится карта
            loadingTimer = window.setTimeout(() => window.location.assign(link.href), 0);
        });
    });

    // --- Firebase Авторизация ---
    const firebaseConfig = {
        apiKey: "AIzaSyBZ29h18Z1k0gE4dAEca5JH8yePQgxhaII",
        authDomain: "broskiplaymaps.firebaseapp.com",
        projectId: "broskiplaymaps",
        storageBucket: "broskiplaymaps.firebasestorage.app",
        messagingSenderId: "418362476965",
        appId: "1:418362476965:web:59ce4e677b1a0a84d7404c",
        measurementId: "G-D5PQJQ7HZG"
    };

    // Firebase (~240 КБ вместе с iframe авторизации) грузится только когда нужен:
    // человек уже входил (сессия Firebase лежит в IndexedDB) или собирается войти
    // (навёл/коснулся кнопки «Войти»). Гостям он не скачивается вовсе.
    const FIREBASE_SDK = "https://www.gstatic.com/firebasejs/10.8.0/";
    const SIGNED_IN_KEY = "bp_signed_in";
    let authPromise = null;
    let auth = null;
    let lastUid = null;

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const el = document.createElement("script");
            el.src = src;
            el.onload = resolve;
            el.onerror = () => reject(new Error("Не загрузился " + src));
            document.head.appendChild(el);
        });
    }

    function loadFirebase() {
        if (authPromise) return authPromise;
        authPromise = loadScript(FIREBASE_SDK + "firebase-app-compat.js")
            .then(() => Promise.all([
                loadScript(FIREBASE_SDK + "firebase-auth-compat.js"),
                loadScript(FIREBASE_SDK + "firebase-firestore-compat.js")
            ]))
            .then(() => {
                if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
                auth = firebase.auth();
                auth.onAuthStateChanged(renderAuthState);
                return auth;
            })
            .catch((error) => {
                console.warn("Firebase не загружен — вход через Google недоступен, остальной сайт работает.", error);
                authPromise = null; // следующая попытка загрузит заново
                return null;
            });
        return authPromise;
    }

    // Есть ли сохранённая сессия Firebase (вход мог быть и на странице карты).
    // indexedDB.open вызываем только для уже существующей базы, чтобы не создать пустую.
    async function hasSavedSession() {
        try { if (localStorage.getItem(SIGNED_IN_KEY) === "1") return true; } catch (e) { /* нет доступа */ }
        try {
            if (!window.indexedDB || typeof indexedDB.databases !== "function") return false;
            const dbs = await indexedDB.databases();
            if (!dbs.some(d => d.name === "firebaseLocalStorageDb")) return false;
            return await new Promise((resolve) => {
                const req = indexedDB.open("firebaseLocalStorageDb");
                req.onerror = () => resolve(false);
                req.onsuccess = () => {
                    const db = req.result;
                    try {
                        if (!db.objectStoreNames.contains("firebaseLocalStorage")) { db.close(); resolve(false); return; }
                        const count = db.transaction("firebaseLocalStorage", "readonly").objectStore("firebaseLocalStorage").count();
                        count.onsuccess = () => { db.close(); resolve(count.result > 0); };
                        count.onerror = () => { db.close(); resolve(false); };
                    } catch (e) { db.close(); resolve(false); }
                };
            });
        } catch (e) { return false; }
    }

    function renderAuthState(user) {
        try { user ? localStorage.setItem(SIGNED_IN_KEY, "1") : localStorage.removeItem(SIGNED_IN_KEY); } catch (e) { /* нет доступа */ }
        const statusEl = document.getElementById("auth-status");
        const btnEl = document.getElementById("auth-btn");
        const avatarEl = document.getElementById("auth-avatar");
        const avatarInfo = avatarEl.closest(".auth-info");

        if (user) {
            const displayName = String(user.displayName || user.email || "Google").replace(/[&<>"']/g, ch => ({
                "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
            }[ch]));
            // Заменен инлайн-стиль на класс .auth-success-text
            statusEl.innerHTML = `<b>${displayName}</b><br><span class="auth-online">● Личный кабинет</span>`;
            btnEl.innerHTML = `<svg class="logout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg><span>Выйти</span>`;
            btnEl.classList.add("logout");
            if (user.photoURL) {
                // Класс на .auth-info прячет значок гостя (без :has — его нет в старом iOS Safari)
                avatarEl.onload = () => avatarInfo.classList.add("has-avatar");
                avatarEl.onerror = () => avatarInfo.classList.remove("has-avatar");
                avatarEl.referrerPolicy = "no-referrer"; // googleusercontent иначе может отдать 403
                if (avatarEl.src !== user.photoURL) avatarEl.src = user.photoURL;
                else if (avatarEl.complete && avatarEl.naturalWidth) avatarInfo.classList.add("has-avatar");
            } else {
                avatarInfo.classList.remove("has-avatar");
            }
        } else {
            statusEl.innerHTML = `<b>Кабинет</b><br><span>Войдите через Google для синхронизации меток</span>`;
            btnEl.innerHTML = `<svg class="google-icon" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span>Войти с Google</span>`;
            btnEl.classList.remove("logout");
            avatarEl.onload = avatarEl.onerror = null;
            avatarInfo.classList.remove("has-avatar");
            avatarEl.removeAttribute("src");
        }
        
        checkAdminReports(user);

        // Гостю прогресс уже отрисован из localStorage; облако нужно вошедшему, а после выхода его надо убрать
        const hadUser = lastUid !== null;
        lastUid = user ? user.uid : null;
        if ((user || hadUser) && typeof window.refreshStellarProgress === 'function') {
            window.refreshStellarProgress(user).catch((error) => {
                console.warn("Не удалось обновить общий прогресс Stellar Blade:", error);
            });
        }
    }

    // Кнопка «Очередь правок» для автора. Почты в коде нет: главная пробует прочитать новые сообщения,
    // а правила Firestore разрешают это только аккаунту автора — у остальных запрос отклоняется и кнопка не появляется.
    async function checkAdminReports(user) {
        const link = document.getElementById("admin-reports");
        if (!link) return;
        if (!user) { link.hidden = true; return; }
        try {
            const snap = await firebase.firestore().collection("reports").where("status", "==", "new").limit(99).get();
            if (!auth?.currentUser || auth.currentUser.uid !== user.uid) return;
            const n = snap.size, badge = document.getElementById("admin-reports-count");
            badge.textContent = n >= 99 ? "99+" : String(n);
            badge.hidden = !n;
            link.title = n ? `Новых сообщений: ${n}` : "Новых сообщений нет";
            link.hidden = false;
        } catch (error) { link.hidden = true; }
    }

    const authBtn = document.getElementById("auth-btn");

    async function toggleGoogleAuth() {
        if (auth?.currentUser) { auth.signOut(); return; }
        const ready = auth;
        if (!ready) authBtn.classList.add("is-loading");
        const a = ready || await loadFirebase();
        authBtn.classList.remove("is-loading");
        if (!a) {
            alert("Вход через Google сейчас недоступен: Firebase не загрузился. Проверьте подключение к интернету и попробуйте ещё раз.");
            return;
        }
        if (a.currentUser) return; // сессия восстановилась сама, пока грузился Firebase
        a.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch((err) => {
            // Браузер мог заблокировать окно, если Firebase догружался дольше, чем живёт «нажатие»
            if (err && (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request")) {
                const label = authBtn.querySelector("span");
                if (label) label.textContent = "Нажмите ещё раз";
                return;
            }
            if (err && err.code === "auth/popup-closed-by-user") return;
            alert("Ошибка авторизации Google: " + err.message);
        });
    }

    authBtn.addEventListener("click", toggleGoogleAuth);
    // Намерение войти: начинаем качать Firebase заранее, чтобы к клику он был готов
    ["pointerenter", "touchstart", "focus"].forEach(type =>
        authBtn.addEventListener(type, () => { loadFirebase(); }, { once: true, passive: true }));
    // Уже входил — поднимаем сессию после загрузки страницы, не мешая первой отрисовке
    afterPageLoad(() => hasSavedSession().then(saved => { if (saved) loadFirebase(); }));
});