// Общий расчёт прогресса BroskiPlay: подсчёт найденных меток, сводка для кабинета (bp_prog) и достижения (bp_ach).
// Подключают главная (js/script.js считает игры, js/home-lib.js сохраняет сводку) и кабинет (js/cabinet.js — BPP.refresh()
// пересчитывает всё сам по каталогу /data/progress-maps.json, его пишет web/scripts/assemble.mjs).
// При загрузке ничего не трогает в DOM: assemble.mjs выполняет файл в Node, чтобы взять список игр.
(function (w) {
    "use strict";
    // Игры с прогрессом: папка, переменная конфигов карт в js/script.js и префиксы ключей localStorage / документов Firestore.
    // Ключи — часть совместимости с сохранённым прогрессом: не менять. c — префикс документа mapProgress, m — customMarkers (по умолчанию = c).
    var GAMES = [
        { key: "stellar", dir: "stellar-blade-map", conf: "stellarMapConfigs", u: "sb_user2_", f: "sb_found_", c: "", m: "sb2_" },
        { key: "tainted", dir: "tainted-grail-map", conf: "taintedMapConfigs", u: "tg_user_", f: "tg_found_", c: "tg_" },
        { key: "gothic", dir: "gothic-remake-map", conf: "gothicMapConfigs", u: "gr_user_", f: "gr_found_", c: "gr_" },
        { key: "dimraeth", dir: "dimraeth-map", conf: "dimraethMapConfigs", u: "dr_user_", f: "dr_found_", c: "dr_" },
        { key: "palworld", dir: "palworld-map", conf: "palworldMapConfigs", u: "pw_user_", f: "pw_found_", c: "pw_" },
        { key: "oblivion", dir: "oblivion-remake-map", conf: "oblivionMapConfigs", u: "ob_user_", f: "ob_found_", c: "ob_" },
        { key: "skyrim", dir: "skyrim-map", conf: "skyrimMapConfigs", u: "sk_user_", f: "sk_found_", c: "sk_" },
        { key: "witcher3", dir: "witcher3-map", conf: "witcher3MapConfigs", u: "w3_user_", f: "w3_found_", c: "w3_" },
        { key: "cyberpunk2077", dir: "cyberpunk2077-map", conf: "cyberpunkMapConfigs", u: "cp_user_", f: "cp_found_", c: "cp_" },
        { key: "hogwarts", dir: "hogwarts-legacy-map", conf: "hogwartsMapConfigs", u: "hl_user_", f: "hl_found_", c: "hl_" },
        { key: "phantomblade", dir: "phantom-blade-zero-map", conf: "phantomBladeMapConfigs", u: "pb_user_", f: "pb_found_", c: "pb_" },
        { key: "rdr2", dir: "rdr2-map", conf: "rdr2MapConfigs", u: "rd_user_", f: "rd_found_", c: "rd_" },
        { key: "gta6", dir: "gta6-map", conf: "gta6MapConfigs", u: "g6_user_", f: "g6_found_", c: "g6_" },
        { key: "silverpalace", dir: "silver-palace-map", conf: "silverPalaceMapConfigs", u: "slv_user_", f: "slv_found_", c: "slv_" },
        { key: "dragonsword", dir: "dragonsword-awakening-map", conf: "dragonswordMapConfigs", u: "dsa_user_", f: "dsa_found_", c: "dsa_" },
        { key: "ms2", dir: "mortal-shell-2-map", conf: "ms2MapConfigs", u: "ms2_user_", f: "ms2_found_", c: "ms2_" }
    ];
    // Достижения: id, название, условие (подсказка), правило по сводке, [показатель сводки, цель] — для полосы прогресса в кабинете.
    // Даты получения — в bp_ach, кабинет их синхронизирует. id не менять: они в localStorage и в облаке.
    var ACH = [
        ["first", "Первая находка", "Отметьте первую метку", function (s) { return s.found >= 1; }, ["found", 1]],
        ["f100", "Следопыт", "100 найденных меток", function (s) { return s.found >= 100; }, ["found", 100]],
        ["f500", "Исследователь", "500 найденных меток", function (s) { return s.found >= 500; }, ["found", 500]],
        ["f1000", "Картограф", "1 000 найденных меток", function (s) { return s.found >= 1000; }, ["found", 1000]],
        ["f5000", "Хранитель миров", "5 000 найденных меток", function (s) { return s.found >= 5000; }, ["found", 5000]],
        ["g3", "Путешественник", "Прогресс в 3 играх", function (s) { return s.games >= 3; }, ["games", 3]],
        ["half", "На полпути", "50% в одной из игр", function (s) { return s.maxPct >= .5; }, ["maxPct", .5]],
        ["full", "Стопроцентник", "Игра пройдена на 100%", function (s) { return s.done >= 1; }, ["maxPct", 1]],
        ["fav", "Любимчик", "Добавьте игру в избранное", function (s) { return s.fav >= 1; }, ["fav", 1]]
    ];

    var read = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* без хранилища — только на время визита */ } };
    var arr = function (k) { var v = read(k, []); return Array.isArray(v) ? v : []; };

    // Компактный индекс id меток (progress-index.json); без него — полный файл меток
    var indexes = new Map(), ids = new Map();
    function loadIndex(root, dir) {
        if (!indexes.has(dir)) indexes.set(dir, fetch(root + dir + "/data/progress-index.json")
            .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }));
        return indexes.get(dir);
    }
    /** id меток карты, которые входят в прогресс: Promise<[{id}]> */
    function markerIds(root, dir, cfg) {
        var k = dir + "/" + cfg.id;
        if (!ids.has(k)) ids.set(k, loadIndex(root, dir).then(function (index) {
            if (index && Array.isArray(index[cfg.markersFile])) return index[cfg.markersFile].map(function (id) { return { id: id }; });
            return fetch(root + dir + "/data/" + cfg.markersFile).then(function (r) {
                if (!r.ok) throw new Error("Не удалось загрузить " + cfg.markersFile);
                return r.json();
            }).then(function (d) { return Array.isArray(d) ? d : d.markers; });
        }).then(function (m) { return Array.isArray(m) ? m : []; }));
        return ids.get(k);
    }
    /** Прогресс одной карты: {found, total}. cloudIds — найденное из облака (если документ есть, он главный). */
    function countMap(root, game, cfg, cloudIds) {
        var all = new Set();
        return markerIds(root, game.dir, cfg).catch(function (e) { console.warn("Не удалось загрузить метки карты " + cfg.id + ":", e); return []; })
            .then(function (markers) {
                markers.forEach(function (m) { if (m && m.id != null) all.add(String(m.id)); });
                arr(game.u + cfg.id).forEach(function (m) { if (m && m.id != null) all.add(String(m.id)); });   // свои метки
                var got = new Set((cloudIds || arr(game.f + cfg.id)).map(String)), found = 0;
                all.forEach(function (id) { if (got.has(id)) found++; });
                return { found: found, total: all.size };
            });
    }

    /** Сохраняет сводку для кабинета и выдаёт новые достижения.
     *  rows — все игры [{id, title, accent, found, total}], last — {href, name, title} или null, fav — число игр в избранном. */
    function saveSummary(rows, last, fav) {
        var found = 0, total = 0, maxPct = 0, pct = function (r) { return r.total ? Math.round(r.found / r.total * 100) : 0; };
        rows.forEach(function (r) { total += r.total || 0; });
        var on = rows.filter(function (r) { return r.found > 0; });
        on.forEach(function (r) { found += r.found; maxPct = Math.max(maxPct, r.total ? r.found / r.total : 0); });
        on.sort(function (a, b) { return pct(b) - pct(a) || b.found - a.found; });
        var done = on.filter(function (r) { return r.total && r.found >= r.total; }).length;
        var stat = { found: found, games: on.length, maxPct: maxPct, done: done, fav: fav };
        var got = read("bp_ach", {}), today = new Date().toISOString().slice(0, 10), ch = false;
        if (!got || typeof got !== "object") got = {};
        ACH.forEach(function (a) { if (!got[a[0]] && a[3](stat)) { got[a[0]] = today; ch = true; } });
        if (ch) write("bp_ach", got);
        var sum = {
            t: Date.now(), all: total ? Math.round(found / total * 100) : 0, found: found, total: total, done: done, fav: fav,
            games: on.map(function (r) { return { id: r.id, title: r.title, found: r.found, total: r.total, accent: r.accent || "" }; }),
            last: last || null
        };
        write("bp_prog", sum);
        return sum;
    }

    /** Полный пересчёт без главной (кабинет): каталог карт из /data/progress-maps.json + localStorage. Promise<сводка|null>
     *  cloud — {id документа mapProgress: [найденные id]} у вошедшего: где документ есть, он главный (как на картах и главной). */
    var refreshing = null;
    function refresh(root, cloud) {
        root = root || "/";
        if (refreshing) return cloud ? refreshing.then(function () { return refresh(root, cloud); }) : refreshing;
        refreshing = fetch(root + "data/progress-maps.json").then(function (r) { if (!r.ok) throw new Error("каталог " + r.status); return r.json(); })
            .then(function (cat) {
                var byKey = {}; GAMES.forEach(function (g) { byKey[g.key] = g; });
                var list = (cat && cat.games || []).filter(function (g) { return byKey[g.key]; }), maps = {};
                return Promise.all(list.map(function (g) {
                    return Promise.all(g.maps.map(function (m) {
                        var gm = byKey[g.key], ids = cloud && cloud[gm.c + m.id];
                        return countMap(root, gm, m, Array.isArray(ids) ? ids : null).then(function (p) { maps[g.key + "/" + m.id] = { href: m.href, name: m.name, title: g.title }; return p; });
                    })).then(function (res) {
                        var r = { id: g.key, title: g.title, accent: g.accent, found: 0, total: 0 };
                        res.forEach(function (p) { r.found += p.found; r.total += p.total; });
                        return r;
                    });
                })).then(function (rows) {
                    var last = null;
                    arr("bp_recent").some(function (r) { var m = r && maps[r.game + "/" + r.map]; if (m) last = m; return !!m; });
                    var fav = arr("bp_fav").filter(function (k) { return byKey[k]; }).length;
                    return saveSummary(rows, last, fav);
                });
            })
            .catch(function (e) { console.warn("Сводка прогресса не пересчитана:", e); return null; })
            .then(function (s) { refreshing = null; return s; });
        return refreshing;
    }

    w.BPP = { GAMES: GAMES, ACH: ACH, markerIds: markerIds, countMap: countMap, saveSummary: saveSummary, refresh: refresh };
})(typeof window !== "undefined" ? window : this);
