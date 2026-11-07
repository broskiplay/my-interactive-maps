// =========================================================
// 1. ДАННЫЕ ДЛЯ РЕНДЕРА (Шаблоны)
// =========================================================

// Данные карт Stellar Blade
const stellarMapConfigs = [
    { id: "eidos7", name: "Эйдос-7 (Eidos 7)", page: "eidos7.html", markersFile: "stellar_blade_eidos-7_markers.json" },
    { id: "xion", name: "Ксион (Xion City)", page: "xion.html", markersFile: "stellar_blade_xion-city_markers.json" },
    { id: "wasteland", name: "Пустошь (Wasteland)", page: "wasteland.html", markersFile: "stellar_blade_wasteland_markers.json" },
    { id: "altess-levoire", name: "Левуар «Высь» (Altess Levoire)", page: "altess_levoire.html", markersFile: "stellar_blade_altess-levoire_markers.json" },
    { id: "matrix-11", name: "Матрица-11 (Matrix 11)", page: "matrix11.html", markersFile: "stellar_blade_matrix-11_markers.json" },
    { id: "great-desert", name: "Великая пустыня (Great Desert)", page: "great_desert.html", markersFile: "stellar_blade_great-desert_markers.json" },
    { id: "abyss-levoire", name: "Левуар «Бездна» (Abyss Levoire)", page: "abyss_levoire.html", markersFile: "stellar_blade_abyss-levoire_markers.json" },
    { id: "spire-4", name: "Шпиль-4 (Spire 4)", page: "spire4.html", markersFile: "stellar_blade_spire-4_markers.json" },
    { id: "eidos-9", name: "Эйдос-9 (Eidos 9)", page: "eidos9.html", markersFile: "stellar_blade_eidos-9_markers.json" }
];

// Данные карт Tainted Grail
const taintedMapConfigs = [
    { id: "horns-of-the-south", name: "Рога Юга", markersFile: "tainted_grail_horns-of-the-south_markers.json" },
    { id: "cuanacht", name: "Куанахт", markersFile: "tainted_grail_cuanacht_markers.json" },
    { id: "forlorn-swords", name: "Вершины Заброшенных мечей", markersFile: "tainted_grail_forlorn-swords_markers.json" },
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
    { id: "solstheim", name: "Солстхейм", markersFile: "skyrim_solstheim_markers.json" }
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


// Данные заглушек
const placeholderGames = [];

// =========================================================
// 2. ГЕНЕРАЦИЯ HTML
// =========================================================

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
                    <img class="game-banner-art" src="./stellar-blade-map/logo-card.webp" decoding="async" alt="Stellar Blade — выбрать локацию">
                    <a class="game-continue" id="stellar-continue" href="#" hidden>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        <span>Продолжить: <strong id="stellar-continue-name"></strong></span>
                    </a>
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
            <a href="./stellar-blade-map/${config.page}" class="map-link">
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
                    <img class="game-banner-art" src="./tainted-grail-map/logo-card.webp" decoding="async" alt="Tainted Grail: The Fall of Avalon — выбрать локацию">
                    <a class="game-continue" id="tainted-continue" href="#" hidden>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        <span>Продолжить: <strong id="tainted-continue-name"></strong></span>
                    </a>
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
            <a href="./tainted-grail-map/?map=${config.id}" class="map-link">
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
    taintedHTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', taintedHTML);

    // Рендер Gothic 1 Remake
    let gothicHTML = `
        <details class="game-dropdown theme-gothic">
            <summary>
                <div class="game-banner gothic-banner">
                    <img class="game-banner-art" src="./gothic-remake-map/logo.svg" loading="lazy" decoding="async" alt="Gothic 1 Remake — выбрать локацию">
                    <a class="game-continue" id="gothic-continue" href="#" hidden>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        <span>Продолжить: <strong id="gothic-continue-name"></strong></span>
                    </a>
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
            <a href="./gothic-remake-map/?map=${config.id}" class="map-link">
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
    gothicHTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', gothicHTML);

    // Рендер Dimraeth
    let dimraethHTML = `
        <details class="game-dropdown theme-dimraeth">
            <summary>
                <div class="game-banner dimraeth-banner">
                    <img class="game-banner-image" src="./dimraeth-map/logo.webp" loading="lazy" decoding="async" alt="Dimraeth — выбрать локацию">
                    <a class="game-continue" id="dimraeth-continue" href="#" hidden>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        <span>Продолжить: <strong id="dimraeth-continue-name"></strong></span>
                    </a>
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
            <a href="./dimraeth-map/?map=${config.id}" class="map-link">
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
                <div class="game-banner palworld-banner">
                    <img class="game-banner-image" src="./palworld-map/logo-title.png" loading="lazy" decoding="async" alt="Palworld — выбрать локацию">
                    <a class="game-continue" id="palworld-continue" href="#" hidden>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        <span>Продолжить: <strong id="palworld-continue-name"></strong></span>
                    </a>
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
            <a href="./palworld-map/?map=${config.id}" class="map-link">
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
                    <img class="game-banner-art" src="./oblivion-remake-map/logo-card.webp" loading="lazy" decoding="async" alt="Oblivion Remastered — выбрать карту">
                    <a class="game-continue" id="oblivion-continue" href="#" hidden>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        <span>Продолжить: <strong id="oblivion-continue-name"></strong></span>
                    </a>
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
            <a href="./oblivion-remake-map/?map=${config.id}" class="map-link">
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
                    <img class="game-banner-art" src="./skyrim-map/logo-card.webp" loading="lazy" decoding="async" alt="Skyrim — выбрать карту">
                    <a class="game-continue" id="skyrim-continue" href="#" hidden>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        <span>Продолжить: <strong id="skyrim-continue-name"></strong></span>
                    </a>
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
            <a href="./skyrim-map/?map=${config.id}" class="map-link">
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
    skyrimHTML += `
            </div>
        </details>
    `;
    container.insertAdjacentHTML('beforeend', skyrimHTML);

    // Рендер Ведьмак 3
    let witcher3HTML = `
        <details class="game-dropdown theme-witcher3">
            <summary>
                <div class="game-banner witcher3-banner">
                    <span class="game-new">Новое</span>
                    <img class="game-banner-art" src="./witcher3-map/logo-card.webp" loading="lazy" decoding="async" alt="Ведьмак 3: Дикая Охота — выбрать карту">
                    <a class="game-continue" id="witcher3-continue" href="#" hidden>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        <span>Продолжить: <strong id="witcher3-continue-name"></strong></span>
                    </a>
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
            <a href="./witcher3-map/?map=${config.id}" class="map-link">
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

    // Карточка «Предложить игру»: занимает свободное место в сетке (CSS .game-suggest) и ведёт на форму с предложением игры
    container.insertAdjacentHTML('beforeend', `
        <a class="game-placeholder game-suggest" href="https://forms.gle/S1dA8ivejnYkdB1HA" target="_blank" rel="noopener noreferrer" aria-label="Предложить игру для новой карты">
            <div class="game-banner placeholder-banner">
                <span class="game-badge">Ваша идея</span>
                <svg class="placeholder-lock" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 7v18M7 16h18"/></svg>
            </div>
            <div class="game-suggest-text">
                <div class="game-info"><h3 class="game-title">Нет вашей игры?</h3></div>
                <p class="placeholder-copy">Предложите карту, и она попадёт в очередь на добавление.</p>
            </div>
        </a>
    `);
}

// Запускаем рендер сразу (скрипт подключен с defer)
renderGames();


// =========================================================
// 3. ЛОГИКА (Twitch, YouTube, Поиск, Прогресс, Загрузка)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    // --- Twitch и YouTube ---
    const twitchButton = document.getElementById("twitch-button");
    const twitchButtonLabel = document.getElementById("twitch-button-label");
    const previewTwitchLive = new URLSearchParams(window.location.search).get("previewTwitch") === "live";

    function renderTwitchButton(isLive, status = "") {
        twitchButton.classList.toggle("is-live", isLive);
        twitchButton.href = "https://www.twitch.tv/broskiplay";
        twitchButtonLabel.textContent = isLive ? "МОЙ СТРИМ · ONLINE" : "Twitch";
        twitchButton.title = isLive ? `BroskiPlay в эфире${status ? `: ${status}` : ""}` : "Канал BroskiPlay на Twitch";
    }

    async function updateTwitchButton() {
        if (previewTwitchLive) { renderTwitchButton(true, "Предпросмотр"); return; }
        try {
            const response = await fetch("https://decapi.me/twitch/uptime/broskiplay", { cache: "no-store" });
            if (!response.ok) throw new Error(`Twitch status returned ${response.status}`);
            const status = (await response.text()).trim();
            const isLive = Boolean(status) && !/offline|not found|error|invalid|rate limit/i.test(status);
            renderTwitchButton(isLive, isLive ? status : "");
        } catch (error) {
            renderTwitchButton(false);
            console.warn("Не удалось проверить статус Twitch:", error);
        }
    }

    updateTwitchButton();
    if (!previewTwitchLive) window.setInterval(updateTwitchButton, 5 * 60 * 1000);

    const youtubeButton = document.getElementById("youtube-button");
    const youtubeCacheKey = "broskiplay_latest_video";
    const youtubeFreshWindow = 12 * 60 * 60 * 1000;
    let youtubeExpiryTimer = null;

    function renderYoutubeButton(video) {
        const age = Date.now() - video.publishedAt;
        const isNew = age >= 0 && age < youtubeFreshWindow;
        youtubeButton.classList.toggle("has-new-video", isNew);
        youtubeButton.href = isNew ? `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}` : "https://www.youtube.com/@broskiplayt/videos";
        youtubeButton.title = isNew ? `Новое видео: ${video.title}` : "Видео BroskiPlay на YouTube";
        youtubeButton.setAttribute("aria-label", isNew ? `Новое видео на YouTube: ${video.title}` : "Видео BroskiPlay на YouTube");
        window.clearTimeout(youtubeExpiryTimer);
        if (isNew) youtubeExpiryTimer = window.setTimeout(() => renderYoutubeButton(video), youtubeFreshWindow - age + 50);
    }

    function readCachedYoutubeVideo() {
        try {
            const video = JSON.parse(localStorage.getItem(youtubeCacheKey) || "null");
            return video && typeof video.id === "string" && Number.isFinite(video.publishedAt) ? video : null;
        } catch (error) { return null; }
    }

    function getXmlValue(element, localName) {
        return Array.from(element.getElementsByTagName("*")).find(node => node.localName === localName)?.textContent.trim() || "";
    }

    async function updateYoutubeButton() {
        const cachedVideo = readCachedYoutubeVideo();
        if (cachedVideo) renderYoutubeButton(cachedVideo);
        try {
            const feedUrl = "https://r.jina.ai/http://www.youtube.com/feeds/videos.xml?channel_id=UCOEXmcNe8D9bf_tnBE-gMkA";
            const response = await fetch(feedUrl, { cache: "no-store", headers: { "X-Respond-With": "html", "X-No-Cache": "true" } });
            if (!response.ok) throw new Error(`YouTube feed returned ${response.status}`);
            const feed = new DOMParser().parseFromString(await response.text(), "application/xml");
            const entry = Array.from(feed.getElementsByTagName("*")).find(node => node.localName === "entry");
            if (!entry) throw new Error("YouTube feed contains no video entries");
            const video = {
                id: getXmlValue(entry, "videoId"),
                title: getXmlValue(entry, "title"),
                publishedAt: Date.parse(getXmlValue(entry, "published"))
            };
            if (!video.id || !video.title || !Number.isFinite(video.publishedAt)) throw new Error("YouTube feed has invalid video metadata");
            localStorage.setItem(youtubeCacheKey, JSON.stringify(video));
            renderYoutubeButton(video);
        } catch (error) {
            if (!cachedVideo) renderYoutubeButton({ id: "", title: "", publishedAt: 0 });
            console.warn("Не удалось проверить последнее видео YouTube:", error);
        }
    }
    updateYoutubeButton();
    window.setInterval(updateYoutubeButton, 15 * 60 * 1000);

    // --- Поиск, Прогресс, Переходы ---
    const mapLinks = [...document.querySelectorAll(".map-link")];
    const gameSearchInput = document.getElementById("game-search-input");
    const gameSearchStatus = document.getElementById("game-search-status");
    const gameCards = [...document.querySelectorAll("#games-container > .game-dropdown, #games-container > .game-placeholder")];

    // Поиск
    gameSearchInput.addEventListener("input", () => {
        const query = gameSearchInput.value.trim().toLocaleLowerCase("ru");
        let visibleCount = 0;
        gameCards.forEach(card => {
            const title = card.querySelector(".game-title").textContent.trim().toLocaleLowerCase("ru");
            const isMatch = !query || title.includes(query);
            card.hidden = !isMatch;
            if (isMatch) visibleCount++;
        });
        gameSearchStatus.textContent = query ? (visibleCount ? `Найдено: ${visibleCount} из ${gameCards.length}` : "Игры не найдены. Проверьте запрос.") : "";
    });

    // Кнопка "Продолжить последнюю карту"
    let savedMap = null;
    try { savedMap = localStorage.getItem("sb_last_map"); } catch (error) { console.error("Не удалось прочитать последнюю карту:", error); }
    if (savedMap && mapLinks.length) {
        const gameRoot = new URL(".", mapLinks[0].href);
        let savedMapUrl;
        try { savedMapUrl = new URL(savedMap, gameRoot); } catch (error) { console.error("Не удалось открыть последнюю карту:", error); }
        const lastMap = savedMapUrl && mapLinks.find((link) => {
            const mapUrl = new URL(link.href);
            return mapUrl.origin === savedMapUrl.origin && mapUrl.pathname === savedMapUrl.pathname;
        });
        if (lastMap) {
            const cont = document.getElementById("stellar-continue");
            cont.href = lastMap.href;
            document.getElementById("stellar-continue-name").textContent = lastMap.querySelector(".map-name").textContent.trim();
            cont.hidden = false;
        }
    }

    // Конфиги карт для подсчета прогресса
    const mapDataPromises = new Map();

    function readLocalArray(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) { return []; }
    }

    const progressIndexPromises = new Map();

    function formatMarkers(n) {
        const mod10 = n % 10, mod100 = n % 100;
        const word = mod10 === 1 && mod100 !== 11 ? "метка" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "метки" : "меток";
        return `${n.toLocaleString("ru-RU")} ${word}`;
    }

    // Компактный индекс id меток (tools/build_progress_index.py); при его отсутствии грузим полные JSON
    function loadProgressIndex(dir) {
        if (!progressIndexPromises.has(dir)) {
            progressIndexPromises.set(dir, fetch(`./${dir}/data/progress-index.json`)
                .then(response => response.ok ? response.json() : null)
                .catch(() => null));
        }
        return progressIndexPromises.get(dir);
    }

    function loadMarkerIds(config, dir = "stellar-blade-map") {
        const cacheKey = `${dir}/${config.id}`;
        if (!mapDataPromises.has(cacheKey)) {
            const promise = loadProgressIndex(dir)
                .then(index => {
                    if (Array.isArray(index?.[config.markersFile])) return index[config.markersFile].map(id => ({ id }));
                    return fetch(`./${dir}/data/${config.markersFile}`)
                        .then(response => {
                            if (!response.ok) throw new Error(`Не удалось загрузить ${config.markersFile}`);
                            return response.json();
                        })
                        .then(data => Array.isArray(data) ? data : data.markers);
                })
                .then(markers => Array.isArray(markers) ? markers : []);
            mapDataPromises.set(cacheKey, promise);
        }
        return mapDataPromises.get(cacheKey);
    }

    const progressGames = {
        stellar: {
            configs: stellarMapConfigs, dir: "stellar-blade-map", prefix: "stellar",
            findLink: config => mapLinks.find(item => new URL(item.href).pathname.endsWith(`/${config.page}`)),
            markersKey: id => `sb_user2_${id}`, foundKey: id => `sb_found_${id}`, cloudId: id => id
        },
        tainted: {
            configs: taintedMapConfigs, dir: "tainted-grail-map", prefix: "tainted",
            findLink: config => mapLinks.find(item => new URL(item.href).searchParams.get("map") === config.id),
            markersKey: id => `tg_user_${id}`, foundKey: id => `tg_found_${id}`, cloudId: id => `tg_${id}`
        },
        gothic: {
            configs: gothicMapConfigs, dir: "gothic-remake-map", prefix: "gothic",
            findLink: config => mapLinks.find(item => new URL(item.href).searchParams.get("map") === config.id),
            markersKey: id => `gr_user_${id}`, foundKey: id => `gr_found_${id}`, cloudId: id => `gr_${id}`
        },
        dimraeth: {
            configs: dimraethMapConfigs, dir: "dimraeth-map", prefix: "dimraeth",
            findLink: config => mapLinks.find(item => new URL(item.href).searchParams.get("map") === config.id && item.href.includes("/dimraeth-map/")),
            markersKey: id => `dr_user_${id}`, foundKey: id => `dr_found_${id}`, cloudId: id => `dr_${id}`
        },
        palworld: {
            configs: palworldMapConfigs, dir: "palworld-map", prefix: "palworld",
            findLink: config => mapLinks.find(item => item.href.includes("/palworld-map/") && new URL(item.href).searchParams.get("map") === config.id),
            markersKey: id => `pw_user_${id}`, foundKey: id => `pw_found_${id}`, cloudId: id => `pw_${id}`
        },
        oblivion: {
            configs: oblivionMapConfigs, dir: "oblivion-remake-map", prefix: "oblivion",
            findLink: config => mapLinks.find(item => item.href.includes("/oblivion-remake-map/") && new URL(item.href).searchParams.get("map") === config.id),
            markersKey: id => `ob_user_${id}`, foundKey: id => `ob_found_${id}`, cloudId: id => `ob_${id}`
        },
        skyrim: {
            configs: skyrimMapConfigs, dir: "skyrim-map", prefix: "skyrim",
            findLink: config => mapLinks.find(item => item.href.includes("/skyrim-map/") && new URL(item.href).searchParams.get("map") === config.id),
            markersKey: id => `sk_user_${id}`, foundKey: id => `sk_found_${id}`, cloudId: id => `sk_${id}`
        },
        witcher3: {
            configs: witcher3MapConfigs, dir: "witcher3-map", prefix: "witcher3",
            findLink: config => mapLinks.find(item => item.href.includes("/witcher3-map/") && new URL(item.href).searchParams.get("map") === config.id),
            markersKey: id => `w3_user_${id}`, foundKey: id => `w3_found_${id}`, cloudId: id => `w3_${id}`
        }
    };

    async function renderProgress(game, cloudProgress = new Map()) {
        const results = await Promise.all(game.configs.map(async config => {
            const link = game.findLink(config);
            const name = link?.querySelector(".map-name")?.textContent.trim() || config.id;
            const ids = new Set();
            try {
                const markers = await loadMarkerIds(config, game.dir);
                markers.forEach(marker => { if (marker?.id != null) ids.add(String(marker.id)); });
            } catch (error) { console.warn(`Не удалось загрузить метки карты ${config.id}:`, error); }

            readLocalArray(game.markersKey(config.id)).forEach(marker => { if (marker?.id != null) ids.add(String(marker.id)); });

            const foundIds = new Set([...readLocalArray(game.foundKey(config.id)), ...(cloudProgress.get(config.id) || [])].map(String));
            const found = [...ids].filter(id => foundIds.has(id)).length;
            const total = ids.size;
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
            return { found, total };
        }));

        const found = results.reduce((sum, item) => sum + item.found, 0);
        const total = results.reduce((sum, item) => sum + item.total, 0);
        const percent = total ? Math.round(found / total * 100) : null;
        
        const value = document.getElementById(`${game.prefix}-progress-value`);
        const count = document.getElementById(`${game.prefix}-progress-count`);
        const fill = document.getElementById(`${game.prefix}-progress-fill`);
        const bar = document.getElementById(`${game.prefix}-progress-bar`);
        if (value) value.textContent = percent === null ? "—%" : `${percent}%`;
        // Гость или новая игра: пустую полоску «0%» не показываем, только объём карты
        if (count) count.textContent = !total ? "Прогресс пока недоступен" : found ? `${found.toLocaleString("ru-RU")} / ${formatMarkers(total)}` : `${formatMarkers(total)} на русском`;
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
                    cloudProgress.set(config.id, Array.isArray(data?.foundIds) ? data.foundIds : Array.isArray(data?.found) ? data.found : []);
                } catch (error) { cloudProgress.set(config.id, []); }
            }));
        }
        await renderProgress(game, cloudProgress);
    }
    window.refreshStellarProgress = user => Promise.all([refreshProgress(progressGames.stellar, user), refreshProgress(progressGames.tainted, user), refreshProgress(progressGames.gothic, user), refreshProgress(progressGames.dimraeth, user), refreshProgress(progressGames.palworld, user), refreshProgress(progressGames.oblivion, user), refreshProgress(progressGames.skyrim, user), refreshProgress(progressGames.witcher3, user)]);
    renderProgress(progressGames.stellar);
    renderProgress(progressGames.tainted);
    renderProgress(progressGames.gothic);
    renderProgress(progressGames.dimraeth);
    renderProgress(progressGames.palworld);
    renderProgress(progressGames.oblivion);
    renderProgress(progressGames.skyrim);
    renderProgress(progressGames.witcher3);

    // Кнопка «Продолжить» в карточке Tainted Grail
    let taintedLast = null;
    try { taintedLast = localStorage.getItem("tg_last_map"); } catch (error) { /* localStorage недоступен */ }
    const taintedLastConfig = taintedMapConfigs.find(config => config.id === taintedLast);
    if (taintedLastConfig) {
        const taintedContinue = document.getElementById("tainted-continue");
        taintedContinue.href = `./tainted-grail-map/?map=${taintedLastConfig.id}`;
        document.getElementById("tainted-continue-name").textContent = taintedLastConfig.name;
        taintedContinue.hidden = false;
    }

    // Кнопка «Продолжить» в карточке Gothic 1 Remake
    let gothicLast = null;
    try { gothicLast = localStorage.getItem("gr_last_map"); } catch (error) { /* localStorage недоступен */ }
    const gothicLastConfig = gothicMapConfigs.find(config => config.id === gothicLast);
    if (gothicLastConfig) {
        const gothicContinue = document.getElementById("gothic-continue");
        gothicContinue.href = `./gothic-remake-map/?map=${gothicLastConfig.id}`;
        document.getElementById("gothic-continue-name").textContent = gothicLastConfig.name;
        gothicContinue.hidden = false;
    }

    // Кнопка «Продолжить» в карточке Dimraeth
    let dimraethLast = null;
    try { dimraethLast = localStorage.getItem("dr_last_map"); } catch (error) { /* localStorage недоступен */ }
    const dimraethLastConfig = dimraethMapConfigs.find(config => config.id === dimraethLast);
    if (dimraethLastConfig) {
        const dimraethContinue = document.getElementById("dimraeth-continue");
        dimraethContinue.href = `./dimraeth-map/?map=${dimraethLastConfig.id}`;
        document.getElementById("dimraeth-continue-name").textContent = dimraethLastConfig.name;
        dimraethContinue.hidden = false;
    }

    // Кнопка «Продолжить» в карточке Palworld
    let palworldLast = null;
    try { palworldLast = localStorage.getItem("pw_last_map"); } catch (error) { /* localStorage недоступен */ }
    const palworldLastConfig = palworldMapConfigs.find(config => config.id === palworldLast);
    if (palworldLastConfig) {
        const palworldContinue = document.getElementById("palworld-continue");
        palworldContinue.href = `./palworld-map/?map=${palworldLastConfig.id}`;
        document.getElementById("palworld-continue-name").textContent = palworldLastConfig.name;
        palworldContinue.hidden = false;
    }

    // Кнопка «Продолжить» в карточке Oblivion Remastered
    let oblivionLast = null;
    try { oblivionLast = localStorage.getItem("ob_last_map"); } catch (error) { /* localStorage недоступен */ }
    const oblivionLastConfig = oblivionMapConfigs.find(config => config.id === oblivionLast);
    if (oblivionLastConfig) {
        const oblivionContinue = document.getElementById("oblivion-continue");
        oblivionContinue.href = `./oblivion-remake-map/?map=${oblivionLastConfig.id}`;
        document.getElementById("oblivion-continue-name").textContent = oblivionLastConfig.name;
        oblivionContinue.hidden = false;
    }

    // Кнопка «Продолжить» в карточке Skyrim
    let skyrimLast = null;
    try { skyrimLast = localStorage.getItem("sk_last_map"); } catch (error) { /* localStorage недоступен */ }
    const skyrimLastConfig = skyrimMapConfigs.find(config => config.id === skyrimLast);
    if (skyrimLastConfig) {
        const skyrimContinue = document.getElementById("skyrim-continue");
        skyrimContinue.href = `./skyrim-map/?map=${skyrimLastConfig.id}`;
        document.getElementById("skyrim-continue-name").textContent = skyrimLastConfig.name;
        skyrimContinue.hidden = false;
    }

    // Кнопка «Продолжить» в карточке Ведьмак 3
    let witcher3Last = null;
    try { witcher3Last = localStorage.getItem("w3_last_map"); } catch (error) { /* localStorage недоступен */ }
    const witcher3LastConfig = witcher3MapConfigs.find(config => config.id === witcher3Last);
    if (witcher3LastConfig) {
        const witcher3Continue = document.getElementById("witcher3-continue");
        witcher3Continue.href = `./witcher3-map/?map=${witcher3LastConfig.id}`;
        document.getElementById("witcher3-continue-name").textContent = witcher3LastConfig.name;
        witcher3Continue.hidden = false;
    }

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

    [...mapLinks, document.getElementById("stellar-continue"), document.getElementById("tainted-continue"), document.getElementById("dimraeth-continue")].forEach(link => {
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

    const auth = (() => {
        if (typeof firebase === "undefined") {
            console.warn("Firebase не загружен — вход через Google недоступен, остальной сайт работает.");
            return null;
        }
        try {
            firebase.initializeApp(firebaseConfig);
            return firebase.auth();
        } catch (error) {
            console.warn("Не удалось инициализировать Firebase:", error);
            return null;
        }
    })();

    auth?.onAuthStateChanged((user) => {
        const statusEl = document.getElementById("auth-status");
        const btnEl = document.getElementById("auth-btn");
        const avatarEl = document.getElementById("auth-avatar");

        if (user) {
            const displayName = String(user.displayName || user.email || "Google").replace(/[&<>"']/g, ch => ({
                "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
            }[ch]));
            // Заменен инлайн-стиль на класс .auth-success-text
            statusEl.innerHTML = `<b>${displayName}</b><br><span class="auth-success-text">● Облачная синхронизация активна</span>`;
            btnEl.innerHTML = `<svg class="logout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg><span>Выйти</span>`;
            btnEl.classList.add("logout");
            if (user.photoURL) {
                avatarEl.src = user.photoURL;
                avatarEl.style.display = "block"; // Оставлено, так как управляет видимостью
            }
        } else {
            statusEl.innerHTML = `<b>Гостевой режим</b><br><span>Войдите через Google для синхронизации меток</span>`;
            btnEl.innerHTML = `<svg class="google-icon" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span>Войти с Google</span>`;
            btnEl.classList.remove("logout");
            avatarEl.style.display = "none";
        }
        
        if (typeof window.refreshStellarProgress === 'function') {
            window.refreshStellarProgress(user).catch((error) => {
                console.warn("Не удалось обновить общий прогресс Stellar Blade:", error);
            });
        }
    });

    function toggleGoogleAuth() {
        if (!auth) {
            alert("Вход через Google сейчас недоступен: Firebase не загрузился. Проверьте подключение к интернету и обновите страницу.");
            return;
        }
        if (auth.currentUser) {
            auth.signOut();
        } else {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).catch((err) => {
                alert("Ошибка авторизации Google: " + err.message);
            });
        }
    }

    document.getElementById("auth-btn").addEventListener("click", toggleGoogleAuth);
});