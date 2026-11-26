// Личный кабинет BroskiPlay (/cabinet/) — одна страница: профиль, «Продолжить», «Избранное», «Достижения», служебная полоса,
// окна «Профиль», «Настройки» (резервная копия, история синхронизаций, выход, режим создателя) и «Избранные игры».
// Разметка — cabinet/index.html, стили — css/cabinet.css.
//
// Данные (ключи — часть совместимости, не менять):
//   localStorage: bp_fav (избранное, ключи игр BPP.GAMES), bp_ach ({id: "ГГГГ-ММ-ДД"}), bp_recent (пишет js/map-extras.js на картах),
//                 bp_prog (сводка BPP.refresh), bp_fav_sync:<uid> (база трёхстороннего слияния избранного),
//                 bp_profile:<uid> ({name, avatar, src, at} — его же читает js/auth-lite.js для шапки),
//                 bp_cab_synced:<uid> (время последней подтверждённой синхронизации), bp_cab_hist:<uid> (копия истории);
//   Firestore:    users/{uid}/mapProgress/bp_cabinet — {fav, ach, recent, hist, profile, updatedAt} (те же правила, что у прогресса карт).
// Вход — js/auth-lite.js (BPAuth, всплывающее окно Google: установленное приложение не уходит в браузер).
// Статус кабинета — только про данные кабинета; облачный прогресс меток карты сохраняют сами (js/map-core.js).
(function () {
    "use strict";
    var $ = function (id) { return document.getElementById(id); };
    var read = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
    var arr = function (k) { var v = read(k, []); return Array.isArray(v) ? v : []; };
    var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    var plural = function (n, one, few, many) { var a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many; };
    var num = function (n) { return Number(n || 0).toLocaleString("ru-RU"); };
    var pct = function (f, t) { return t ? Math.min(100, Math.round(f / t * 100)) : 0; };
    var BPP = window.BPP;
    if (!BPP || !$("cab")) return;

    var DOC = "bp_cabinet", ROOT = "/";
    var GAMES = BPP.GAMES, byKey = {};
    GAMES.forEach(function (g) { byKey[g.key] = g; });
    var fb = null, user = null, authKnown = false;

    // ---------- живой регион для экранных дикторов ----------
    var live = document.createElement("p");
    live.className = "cab-sr"; live.setAttribute("aria-live", "polite");
    $("cab").appendChild(live);
    var announce = function (t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 30); };

    // ---------- каталог игр и карт (/data/progress-maps.json пишет web/scripts/assemble.mjs) ----------
    var catalogP = null;
    function catalog() {
        if (!catalogP) catalogP = fetch(ROOT + "data/progress-maps.json").then(function (r) {
            if (!r.ok) throw new Error("каталог " + r.status);
            return r.json();
        }).then(function (c) {
            var games = {};
            (c && c.games || []).forEach(function (g) {
                var meta = byKey[g.key]; if (!meta || !Array.isArray(g.maps)) return;
                var maps = {}; g.maps.forEach(function (m) { maps[m.id] = m; });
                games[g.key] = { key: g.key, title: g.title, accent: g.accent, dir: meta.dir, maps: maps, count: g.maps.length,
                    href: "/" + meta.dir + "/", cover: "/" + meta.dir + "/logo-card-720.webp", coverBig: "/" + meta.dir + "/logo-card.webp" };
            });
            if (!Object.keys(games).length) throw new Error("каталог пуст");
            return { games: games, order: (c.games || []).map(function (g) { return g.key; }).filter(function (k) { return games[k]; }) };
        }).catch(function (e) { catalogP = null; throw e; });
        return catalogP;
    }
    var coverImg = function (g, cls, sizes) {
        return '<img class="' + cls + '" src="' + esc(g.cover) + '" srcset="' + esc(g.cover) + " 720w, " + esc(g.coverBig) + ' 1080w" sizes="' + sizes + '" alt="" loading="lazy" decoding="async">';
    };
    // обложка шире 16:9 (Stellar Blade — 2,4:1) показывается целиком на тёмном поле, а не обрезается по краям
    var markWide = function (img) { if (img.naturalWidth && img.naturalWidth / img.naturalHeight > 1.9) img.classList.add("is-wide"); };
    document.addEventListener("load", function (e) { if (e.target.classList && e.target.classList.contains("cab-cover")) markWide(e.target); }, true);
    var markWideAll = function () { [].forEach.call(document.querySelectorAll("img.cab-cover"), function (i) { if (i.complete) markWide(i); }); };

    // ---------- аватары: Google или один из готовых значков (SVG без внешних файлов) ----------
    var AVAS = [
        ["compass", "Компас", "#54dcff", '<circle cx="32" cy="32" r="13"/><path d="m37.5 26.5-3.6 7.4-7.4 3.6 3.6-7.4z"/>'],
        ["peaks", "Горы", "#c7ff3f", '<path d="m14 44 12-17 7 9 5-6 12 14z"/><path d="m23 31 3-4 3 4"/>'],
        ["pin", "Метка", "#c7ff3f", '<path d="M32 47s-11-9.5-11-18.5a11 11 0 0 1 22 0C43 37.5 32 47 32 47z"/><circle cx="32" cy="28.5" r="4"/>'],
        ["blade", "Клинок", "#54dcff", '<path d="M42 16 28 30l3 3 14-14 1-4z"/><path d="m24 34 6 6M22 42l4-4M25 31l8 8"/>'],
        ["castle", "Замок", "#c7ff3f", '<path d="M18 46V26h5v4h5v-6h8v6h5v-4h5v20z"/><path d="M29 46v-7a3 3 0 0 1 6 0v7"/>'],
        ["star", "Звезда", "#54dcff", '<path d="m32 17 4.5 9.2 10.1 1.4-7.3 7.1 1.7 10-9-4.8-9 4.8 1.7-10-7.3-7.1 10.1-1.4z"/>']
    ];
    function avaSrc(id) {
        var a = AVAS.filter(function (x) { return x[0] === id; })[0]; if (!a) return "";
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><radialGradient id="g" cx="30%" cy="25%" r="85%">' +
            '<stop offset="0" stop-opacity="1" stop-color="#22344a"/><stop offset="1" stop-color="#0d111b"/></radialGradient></defs>' +
            '<rect width="64" height="64" fill="url(#g)"/><g fill="none" stroke="' + a[2] + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + a[3] + "</g></svg>";
        return "data:image/svg+xml," + encodeURIComponent(svg);
    }
    var cleanName = function (s) { return String(s || "").replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim(); };
    function profile() {
        if (!user) return null;
        var p = read("bp_profile:" + user.uid, null);
        var name = p && cleanName(p.name) || cleanName(user.displayName) || "Исследователь";
        var avatar = p && p.avatar || "google", src = avatar === "google" ? user.photoURL || "" : avaSrc(avatar);
        if (!src && avatar === "google") src = avaSrc("compass");
        return { name: name, avatar: avatar, src: src, at: p && p.at || 0, saved: !!p };
    }
    function paintProfile() {
        var p = profile(), img = $("cab-ava");
        $("cab-name").textContent = p ? p.name : "Гость";
        if (p && p.src) {
            img.referrerPolicy = "no-referrer";
            img.onerror = function () { img.hidden = true; };
            img.src = p.src; img.hidden = false;
        } else { img.hidden = true; img.removeAttribute("src"); }
        if (window.BPAuth && BPAuth.repaint) BPAuth.repaint();   // шапка: то же имя и аватар
    }

    // ---------- статус данных: гость (только устройство) / проверка входа / синхронизация / облако / ошибка / нет сети ----------
    var phase = "loading", lastErr = "", lastOk = 0;
    var ICON = { guest: "cab-i-device", offline: "cab-i-device", authfail: "cab-i-device" };
    function ago(t) {
        var s = Math.round((Date.now() - t) / 1000), m = Math.round(s / 60), d = new Date(t), now = new Date();
        if (s < 60) return "только что";
        if (m < 60) return m + " " + plural(m, "минуту", "минуты", "минут") + " назад";
        var hm = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        if (d.toDateString() === now.toDateString()) return "сегодня в " + hm;
        return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) + " в " + hm;
    }
    function setPhase(p) { phase = p; paintState(); }
    function paintState() {
        var top, bar, ok = lastOk ? " · " + ago(lastOk) : "";
        switch (phase) {
            case "loading": top = bar = "Проверяем вход…"; break;
            case "guest": top = "Сохранено на этом устройстве"; bar = "Данные хранятся только в этом браузере. Войдите через Google, чтобы синхронизировать их между устройствами."; break;
            case "authfail": top = "Сохранено на этом устройстве"; bar = "Сервер входа сейчас недоступен — данные сохранены в этом браузере."; break;
            case "sync": top = bar = "Синхронизация…"; break;
            case "ok": top = "Сохранено в облаке" + ok; bar = "Данные синхронизированы" + ok; break;
            case "dirty": top = "Сохранено на устройстве, ждёт отправки в облако"; bar = "Есть изменения, которые ещё не в облаке."; break;
            case "offline": top = "Нет сети — сохранено на устройстве"; bar = "Нет сети. Изменения сохранены в этом браузере и уйдут в облако, когда связь вернётся."; break;
            default: top = "Не удалось синхронизировать"; bar = "Ошибка синхронизации: " + lastErr + ". Изменения сохранены в этом браузере." +
                (read(syncedKey(), 0) ? " Последняя успешная — " + ago(read(syncedKey(), 0)) + "." : "");
        }
        var state = phase === "error" ? "error" : phase === "ok" ? "ok" : phase === "sync" ? "sync" : phase;
        [["cab-state", "cab-state-text", top], ["cab-bar-state", "cab-bar-text", bar]].forEach(function (x) {
            var el = $(x[0]); el.dataset.state = state; $(x[1]).textContent = x[2];
            var use = el.querySelector("use"); if (use) use.setAttribute("href", "#" + (ICON[phase] || "cab-i-cloud"));
        });
        var b = $("cab-sync");
        b.hidden = !user;
        var busy = phase === "sync";
        b.disabled = busy; b.setAttribute("aria-busy", String(busy));
        b.textContent = busy ? "Синхронизация…" : phase === "error" || phase === "offline" ? "Повторить" : "Синхронизировать";
    }
    setInterval(function () { if (phase === "ok") paintState(); }, 30000);
    var syncedKey = function () { return user ? "bp_cab_synced:" + user.uid : "bp_cab_synced:-"; };

    // ---------- слияние кабинета с облаком ----------
    // Избранное — трёхстороннее относительно прошлой синхронизации (bp_fav_sync): к облачному списку добавляем то, что добавили здесь,
    // и убираем то, что здесь удалили после прошлой синхронизации. Без базы (первая синхронизация на устройстве) — объединение.
    // Достижения — самая ранняя дата; последние карты — запись с большей меткой времени; профиль — более поздний.
    function merge(local, remote, base) {
        var lf = Array.isArray(local.fav) ? local.fav : [], rf = Array.isArray(remote.fav) ? remote.fav : [];
        var fav = rf.slice();
        lf.forEach(function (g) { if (fav.indexOf(g) < 0 && (!base || base.indexOf(g) < 0)) fav.push(g); });
        if (base) fav = fav.filter(function (g) { return !(base.indexOf(g) >= 0 && lf.indexOf(g) < 0); });
        else lf.forEach(function (g) { if (fav.indexOf(g) < 0) fav.push(g); });
        var ach = Object.assign({}, remote.ach && typeof remote.ach === "object" ? remote.ach : {});
        Object.keys(local.ach || {}).forEach(function (k) { if (!ach[k] || local.ach[k] < ach[k]) ach[k] = local.ach[k]; });
        var del = mergeDel(local.recentDel, remote.recentDel);
        var seen = {}, recent = (Array.isArray(local.recent) ? local.recent : []).concat(Array.isArray(remote.recent) ? remote.recent : [])
            .filter(function (r) { return r && r.game && r.map && !(del[r.game + "/" + r.map] >= (r.at || 0)); })
            .sort(function (x, y) { return (y.at || 0) - (x.at || 0); })
            .filter(function (r) { var k = r.game + "/" + r.map; return seen[k] ? false : (seen[k] = true); }).slice(0, 8);
        var lp = local.profile, rp = remote.profile && typeof remote.profile === "object" ? remote.profile : null;
        var prof = lp && (!rp || (lp.at || 0) >= (rp.at || 0)) ? lp : rp;
        return { fav: fav, ach: ach, recent: recent, recentDel: del, profile: prof ? { name: cleanName(prof.name).slice(0, 32), avatar: String(prof.avatar || "google"), at: +prof.at || 0 } : null };
    }
    // убранные крестиком карты: {"игра/карта": время}; запись в bp_recent новее времени удаления (карту открыли снова) — показывается
    function mergeDel(a, b) {
        var d = {}, now = Date.now();
        [a, b].forEach(function (x) { if (x && typeof x === "object") Object.keys(x).forEach(function (k) { var t = +x[k] || 0; if (now - t < 180 * 864e5 && (!d[k] || t > d[k])) d[k] = t; }); });
        return d;
    }
    function localState() {
        var p = user && read("bp_profile:" + user.uid, null);
        return { fav: arr("bp_fav"), ach: read("bp_ach", {}), recent: arr("bp_recent"), recentDel: read("bp_recent_del", {}), profile: p && p.at ? p : null };
    }
    var ref = function (id) { return fb.firestore().collection("users").doc(user.uid).collection("mapProgress").doc(id || DOC); };
    var timeout = function (p, ms) { return Promise.race([p, new Promise(function (_, no) { setTimeout(function () { no({ code: "timeout" }); }, ms); })]); };
    function errText(e) {
        var c = e && e.code || "";
        if (c === "timeout") return "сервер не ответил";
        if (/permission/.test(c)) return "нет доступа к данным аккаунта";
        if (/unavailable|network/.test(c) || !navigator.onLine) return "нет связи с сервером";
        if (/unauthenticated/.test(c)) return "вход устарел — войдите снова";
        return (e && e.message) || "неизвестная ошибка";
    }

    var hist = [], busy = null, again = false, dirtyTimer = 0;
    var fresh = BPP.refresh(ROOT);   // сводка и новые достижения — до первой синхронизации, чтобы они ушли в облако сразу

    // Облачные отметки всех карт {id документа: [id]} — один раз после входа и по кнопке «Синхронизировать».
    // По ним считаются и карточки «Продолжить», и сводка достижений (облачный документ главный, как на картах).
    // cloudMiss — сколько документов карт не прочитано в последний раз (-1 — не прочитан даже каталог); по ним остаются прежние или локальные отметки
    var cloudIdx = null, wantCloud = false, cloudMiss = 0;
    var foundOf = function (d) { return d && Array.isArray(d.foundIds) ? d.foundIds : d && Array.isArray(d.found) ? d.found : null; };
    function loadCloudIdx() {
        if (!user || !fb) return Promise.resolve(null);
        var uid = user.uid;
        return catalog().then(function (cat) {
            var docs = [];
            cat.order.forEach(function (k) { Object.keys(cat.games[k].maps).forEach(function (id) { docs.push(byKey[k].c + id); }); });
            // каждая карта отдельно: сбой одной не отменяет остальные
            return Promise.all(docs.map(function (d) {
                return timeout(ref(d).get(), 12000).then(function (s) { return [d, foundOf(s.exists ? s.data() : null), false]; },
                    function (e) { console.warn("Кабинет: облачный прогресс карты " + d + " не прочитан:", e); return [d, null, true]; });
            }));
        }).then(function (rows) {
            if (!user || user.uid !== uid) return null;
            var o = {}, miss = 0;
            rows.forEach(function (r) {
                if (r[2]) { miss++; if (cloudIdx && cloudIdx[r[0]]) o[r[0]] = cloudIdx[r[0]]; }
                else if (r[1]) o[r[0]] = r[1].map(String);
            });
            cloudMiss = miss;
            return (cloudIdx = o);
        }, function (e) { console.warn("Кабинет: облачный прогресс карт не прочитан:", e); cloudMiss = -1; return cloudIdx; });
    }
    function missText(n) { return n < 0 ? "облачный прогресс карт не прочитан" : "не прочитан облачный прогресс карт: " + n; }
    // пересчёт сводки (облако у вошедшего, иначе устройство); новые достижения — в облако кабинета
    function recount() {
        var before = JSON.stringify(read("bp_ach", {}));
        return BPP.refresh(ROOT, user ? cloudIdx : null).then(function () {
            award(); renderCont();
            if (JSON.stringify(read("bp_ach", {})) !== before) markDirty();
        });
    }
    function sync() {
        if (!user || !fb) return Promise.resolve();
        clearTimeout(dirtyTimer);
        if (busy) { again = true; return busy; }   // повторный запуск не начинает вторую синхронизацию — только ещё одну после текущей
        if (navigator.onLine === false) { setPhase("offline"); return Promise.resolve(); }
        var uid = user.uid;
        setPhase("sync");
        var withCloud = wantCloud; wantCloud = false;
        busy = fresh.then(function () {
            // сводка по облачным отметкам — до слияния, чтобы выданные по ней достижения ушли в этой же записи
            return withCloud && loadCloudIdx().then(function (c) { if (c && user && user.uid === uid) return BPP.refresh(ROOT, c).then(award); });
        }).then(function () { return timeout(ref().get(), 15000); }).then(function (snap) {
            if (!user || user.uid !== uid) throw { code: "aborted" };
            var remote = snap.exists ? snap.data() || {} : {};
            var base = read("bp_fav_sync:" + uid, null);
            var before = JSON.stringify(arr("bp_fav"));
            var m = merge(localState(), remote, Array.isArray(base) ? base : null);
            write("bp_fav", m.fav); write("bp_ach", m.ach); write("bp_recent", m.recent); write("bp_recent_del", m.recentDel);
            if (m.profile) write("bp_profile:" + uid, Object.assign({}, m.profile, { src: m.profile.avatar === "google" ? "" : avaSrc(m.profile.avatar) }));
            var h = [{ at: Date.now(), info: "избранное " + m.fav.length + ", достижений " + Object.keys(m.ach).length }]
                .concat(Array.isArray(remote.hist) ? remote.hist : []).slice(0, 10);
            var doc = { fav: m.fav, ach: m.ach, recent: m.recent, recentDel: m.recentDel, hist: h, updatedAt: fb.firestore.FieldValue.serverTimestamp() };
            if (m.profile) doc.profile = m.profile;
            return timeout(ref().set(doc, { merge: true }), 15000).then(function () {
                write("bp_fav_sync:" + uid, m.fav);   // база следующего слияния — то, что теперь и здесь, и в облаке
                hist = h; write("bp_cab_hist:" + uid, h);
                lastOk = Date.now(); write("bp_cab_synced:" + uid, lastOk);
                if (JSON.stringify(m.fav) !== before) dispatchEvent(new Event("bp:fav"));
            });
        }).then(function () {
            if (!user || user.uid !== uid) return;
            // кабинет записан, но часть карт из облака не прочиталась — это не «сохранено», а ошибка; следующая синхронизация перечитает их
            if (withCloud && cloudMiss) { wantCloud = true; lastErr = missText(cloudMiss); setPhase("error"); }
            else { lastErr = ""; setPhase("ok"); }
            paintProfile(); renderFav(); renderAch(); renderCont(); renderHist();
        }, function (e) {
            if (e && e.code === "aborted") return;
            if (withCloud) wantCloud = true;
            lastErr = errText(e);
            setPhase(navigator.onLine === false ? "offline" : "error");
        }).then(function () {
            busy = null;
            if (again) { again = false; sync(); }
        });
        return busy;
    }
    // локальные правки (избранное, профиль) — сохранены сразу; в облако уходят через секунду, без двойного запуска
    function markDirty() {
        if (!user) return;
        if (!busy) setPhase("dirty");
        clearTimeout(dirtyTimer);
        dirtyTimer = setTimeout(sync, 1200);
    }
    addEventListener("online", function () { if (user && (phase === "offline" || phase === "error" || phase === "dirty")) sync(); });
    addEventListener("offline", function () { if (user && phase !== "sync") setPhase("offline"); });

    // ---------- 2. Продолжить ----------
    var contToken = 0;
    function cloudFound(g, mapId) {
        if (!user || !fb) return Promise.resolve(null);
        if (cloudIdx) return Promise.resolve(cloudIdx[g.c + mapId] || null);
        return timeout(ref(g.c + mapId).get(), 8000).then(function (s) { return foundOf(s.exists ? s.data() : null); })
            .catch(function () { return null; });   // облако недоступно — считаем по отметкам этого устройства
    }
    function renderCont() {
        var box = $("cab-cont"), token = ++contToken;
        return catalog().then(function (cat) {
            var list = arr("bp_recent").filter(function (r) { return r && cat.games[r.game] && cat.games[r.game].maps[r.map]; }).slice(0, 4);
            if (!list.length) {
                if (token !== contToken) return;
                box.className = "cab-cont is-single";
                box.innerHTML = '<div class="cab-empty"><b>Здесь появятся карты, которые вы открывали</b>' +
                    "<span>Откройте карту любой игры — кабинет запомнит её и покажет, сколько меток уже найдено.</span>" +
                    '<a class="bx-btn bx-btn-primary" href="/games/">Выбрать игру<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#cab-i-arrow"/></svg></a></div>';
                return;
            }
            return Promise.all(list.map(function (r) {
                var g = byKey[r.game], m = cat.games[r.game].maps[r.map];
                return cloudFound(g, r.map).then(function (ids) { return BPP.countMap(ROOT, g, { id: r.map, markersFile: m.markersFile }, ids); })
                    .then(function (p) { return { r: r, g: cat.games[r.game], m: m, p: p }; });
            })).then(function (rows) {
                if (token !== contToken) return;
                box.className = "cab-cont" + (rows.length === 1 ? " is-single" : "");
                var html = mainCard(rows[0]);
                if (rows.length > 1) html += '<div class="cab-side' + '">' + rows.slice(1).map(function (x) { return miniCard(x, rows.length === 2); }).join("") + "</div>";
                box.innerHTML = html; markWideAll();
            });
        }).catch(function (e) {
            if (token !== contToken) return;
            console.warn("Кабинет: каталог карт не загрузился:", e);
            box.className = "cab-cont is-single";
            box.innerHTML = '<div class="cab-empty" role="alert"><b>Не удалось загрузить список карт</b><span>Проверьте соединение и попробуйте ещё раз.</span>' +
                '<button class="bx-btn" type="button" data-retry="cont">Повторить</button></div>';
        });
    }
    // крестик: карта уходит из «Продолжить» здесь и (после синхронизации) на других устройствах; откроете снова — вернётся
    $("cab-cont").addEventListener("click", function (e) {
        var b = e.target.closest("[data-del]"); if (!b) return;
        var key = b.dataset.del, title = b.getAttribute("aria-label").replace(/^[^:]+: /, "");
        var btns = [].slice.call(this.querySelectorAll("[data-del]")), i = btns.indexOf(b);
        var nextKey = (btns[i + 1] || btns[i - 1] || {}).dataset; nextKey = nextKey && nextKey.del;
        var d = read("bp_recent_del", {}); if (!d || typeof d !== "object") d = {};
        d[key] = Date.now();
        var ok = write("bp_recent", arr("bp_recent").filter(function (r) { return !(r && r.game + "/" + r.map === key); })) && write("bp_recent_del", mergeDel(d));
        if (!ok) { announce("Не удалось сохранить: хранилище браузера недоступно."); return; }
        announce("Убрано из «Продолжить»: " + title);
        markDirty();
        renderCont().then(function () {
            var f = nextKey && $("cab-cont").querySelector('[data-del="' + nextKey + '"]');
            (f || $("cab-cont").querySelector("a, button") || $("cab-fav-add")).focus();
        });
    });
    var mapLabel = function (x) { return x.g.count > 1 && x.m.name && x.m.name !== x.g.title ? x.m.name : ""; };
    function countText(p) {
        return p.total ? "Найдено " + num(p.found) + " из " + num(p.total) + " " + plural(p.total, "метки", "меток", "меток") : "Прогресс пока недоступен";
    }
    function meter(v, label, cyan) {
        return '<span class="cab-meter' + (cyan ? " is-cyan" : "") + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '" aria-label="' + esc(label) + '"><i style="width:' + v + '%"></i></span>';
    }
    function mainCard(x) {
        var v = pct(x.p.found, x.p.total), sub = mapLabel(x);
        return '<article class="cab-main">' + '<button class="cab-del" type="button" data-del="' + esc(x.r.game + "/" + x.r.map) + '" aria-label="Убрать из «Продолжить»: ' + esc(x.g.title + (sub ? " — " + sub : "")) + '" title="Убрать из «Продолжить»"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#cab-i-x"/></svg></button>' + coverImg(x.g, "cab-cover", "(max-width: 900px) 100vw, 680px").replace(' loading="lazy"', ' fetchpriority="high"') +
            '<div class="cab-main-body"><div><h3 class="cab-game">' + esc(x.g.title) + (sub ? '<span class="cab-mapname">' + esc(sub) + "</span>" : "") + "</h3>" +
            '<p class="cab-count"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#cab-i-pin"/></svg>' + countText(x.p) + "</p>" +
            (x.p.total ? '<div class="cab-prog">' + meter(v, "Прогресс: " + x.g.title) + "<span>" + v + "%</span></div>" : "") + "</div>" +
            '<a class="bx-btn bx-btn-primary" href="' + esc(x.m.href) + '">Продолжить карту<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#cab-i-arrow"/></svg></a></div></article>';
    }
    function miniCard(x, tall) {
        var v = pct(x.p.found, x.p.total), sub = mapLabel(x);
        return '<div class="cab-mini-wrap' + (tall ? " is-tall" : "") + '">' + '<button class="cab-del" type="button" data-del="' + esc(x.r.game + "/" + x.r.map) + '" aria-label="Убрать из «Продолжить»: ' + esc(x.g.title + (sub ? " — " + sub : "")) + '" title="Убрать из «Продолжить»"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#cab-i-x"/></svg></button>' + '<a class="cab-mini' + (tall ? " is-tall" : "") + '" href="' + esc(x.m.href) + '" aria-label="Открыть карту: ' + esc(x.g.title + (sub ? " — " + sub : "")) + (x.p.total ? ", " + v + "%" : "") + '">' +
            '<span class="cab-thumb">' + coverImg(x.g, "", "(max-width: 900px) 112px, 360px") + "</span>" +
            '<span class="cab-mini-body"><span class="cab-game">' + esc(x.g.title) + "</span>" + (sub ? '<span class="cab-mapname">' + esc(sub) + "</span>" : "") +
            '<span class="cab-count"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#cab-i-pin"/></svg>' + countText(x.p) + "</span>" +
            (x.p.total ? '<span class="cab-prog">' + meter(v, "Прогресс") + "<span>" + v + "%</span></span>" : "") + "</span>" +
            '<span class="cab-go" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#cab-i-chev"/></svg><span class="cab-go-text bx-btn">Открыть карту</span></span></a></div>';
    }

    // ---------- 3. Избранное (тот же bp_fav, что у звёздочек главной и меню «Игры») ----------
    var favKeys = function (cat) { return arr("bp_fav").filter(function (k) { return cat.games[k]; }); };
    function toggleFav(key) {
        var favs = arr("bp_fav"), i = favs.indexOf(key), on = i < 0;
        if (on) favs.push(key); else favs.splice(i, 1);
        if (!write("bp_fav", favs)) { announce("Не удалось сохранить: хранилище браузера недоступно."); return on; }
        dispatchEvent(new Event("bp:fav"));
        award();
        markDirty();
        return on;
    }
    function renderFav() {
        var box = $("cab-fav");
        return catalog().then(function (cat) {
            var keys = favKeys(cat);
            if (!keys.length) {
                // подсказка: игры, где уже есть прогресс или недавние карты
                var seen = {}, sugg = arr("bp_recent").map(function (r) { return r && r.game; })
                    .concat((read("bp_prog", {}) || {}).games ? read("bp_prog", {}).games.map(function (g) { return g.id; }) : [])
                    .filter(function (k) { return cat.games[k] && !seen[k] && (seen[k] = true); }).slice(0, 3);
                box.innerHTML = '<div class="cab-empty"><b>В избранном пока пусто</b><span>Отметьте игры звёздочкой — они будут первыми на главной и в меню «Игры» на всех ваших устройствах.</span>' +
                    (sugg.length ? '<div class="cab-chips">' + sugg.map(function (k) {
                        return '<button class="cab-chip" type="button" data-fav-add="' + esc(k) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#cab-i-star"/></svg>' + esc(cat.games[k].title) + "</button>";
                    }).join("") + "</div>" : "") + "</div>";
                return;
            }
            box.innerHTML = keys.map(function (k) {
                var g = cat.games[k];
                return '<article class="cab-favc" data-key="' + esc(k) + '">' + coverImg(g, "cab-cover", "(max-width: 560px) 50vw, 340px") +
                    '<a href="' + esc(g.href) + '">' + esc(g.title) + "</a>" +
                    '<button class="cab-star" type="button" aria-pressed="true" data-fav="' + esc(k) + '" aria-label="Убрать из избранного: ' + esc(g.title) + '" title="Убрать из избранного">' +
                    '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#cab-i-star"/></svg></button></article>';
            }).join("");
            markWideAll();
        }).catch(function () {
            box.innerHTML = '<div class="cab-empty" role="alert"><b>Не удалось загрузить список игр</b><button class="bx-btn" type="button" data-retry="fav">Повторить</button></div>';
        });
    }
    $("cab-fav").addEventListener("click", function (e) {
        var add = e.target.closest("[data-fav-add]");
        if (add) { toggleFav(add.dataset.favAdd); renderFav().then(function () { var s = $("cab-fav").querySelector(".cab-star"); if (s) s.focus(); }); announce("Добавлено в избранное"); return; }
        var b = e.target.closest("[data-fav]"); if (!b) return;
        var card = b.closest(".cab-favc"), next = card && (card.nextElementSibling || card.previousElementSibling);
        var nextKey = next && next.dataset.key, title = card ? card.querySelector("a").textContent : "";
        toggleFav(b.dataset.fav);
        renderFav().then(function () {
            var f = nextKey && $("cab-fav").querySelector('[data-fav="' + nextKey + '"]');
            (f || $("cab-fav-add")).focus();
        });
        announce("Убрано из избранного: " + title);
    });

    // окно выбора избранных игр
    function renderPick() {
        return catalog().then(function (cat) {
            var favs = favKeys(cat);
            $("cab-pick").innerHTML = cat.order.map(function (k) {
                var g = cat.games[k], on = favs.indexOf(k) >= 0;
                return '<li><button type="button" data-pick="' + esc(k) + '" aria-pressed="' + on + '">' + coverImg(g, "", "72px") +
                    "<span>" + esc(g.title) + '</span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#cab-i-star"/></svg></button></li>';
            }).join("");
        });
    }
    $("cab-pick").addEventListener("click", function (e) {
        var b = e.target.closest("[data-pick]"); if (!b) return;
        var on = toggleFav(b.dataset.pick);
        b.setAttribute("aria-pressed", String(on));
        announce((on ? "Добавлено в избранное: " : "Убрано из избранного: ") + b.textContent);
        renderFav();
    });

    // ---------- 4. Достижения ----------
    function stats() {
        var s = read("bp_prog", null); if (!s || typeof s !== "object") return null;
        var games = Array.isArray(s.games) ? s.games : [], maxPct = 0;
        games.forEach(function (g) { if (g.total) maxPct = Math.max(maxPct, g.found / g.total); });
        var fav = arr("bp_fav").filter(function (k) { return byKey[k]; }).length;
        return { found: s.found || 0, games: games.length, maxPct: maxPct, done: s.done || 0, fav: fav };
    }
    // выдача по текущей сводке — как BPP.saveSummary: только то, чего ещё нет, дата — сегодня; уже полученное не трогаем
    function award() {
        var s = stats() || { found: 0, games: 0, maxPct: 0, done: 0, fav: arr("bp_fav").filter(function (k) { return byKey[k]; }).length };
        var got = read("bp_ach", {}), today = new Date().toISOString().slice(0, 10), ch = false;
        if (!got || typeof got !== "object") got = {};
        BPP.ACH.forEach(function (a) { if (!got[a[0]] && a[3](s)) { got[a[0]] = today; ch = true; } });
        if (ch) write("bp_ach", got);
        renderAch();
    }
    var ICONS = {
        first: '<path d="M12 20s-5.5-4.8-5.5-9.5a5.5 5.5 0 0 1 11 0c0 4.7-5.5 9.5-5.5 9.5z"/><circle cx="12" cy="10.5" r="1.9"/>',
        f100: '<circle cx="12" cy="12" r="8"/><path d="m15 9-1.9 4.1L9 15l1.9-4.1z"/>',
        f500: '<path d="M8 4.5h8v4.5a4 4 0 0 1-8 0zM8 6.5H5.5a2.5 2.5 0 0 0 2.6 3.4M16 6.5h2.5a2.5 2.5 0 0 1-2.6 3.4M12 13v3.5M9 19.5h6M10 16.5h4"/>',
        f1000: '<path d="M4 6.5 9 4.5l6 2 5-2v13l-5 2-6-2-5 2zM9 4.5v13M15 6.5v13"/>',
        f5000: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.6 2.6 2.6 13.4 0 16M12 4c-2.6 2.6-2.6 13.4 0 16"/>',
        g3: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6.5a3 3 0 0 0 0-6h-5a3 3 0 0 1 0-6H16"/>',
        half: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16"/><path d="M12 4a8 8 0 0 1 0 16" fill="currentColor" stroke="none"/>',
        full: '<circle cx="12" cy="12" r="8"/><path d="m8.5 12.3 2.4 2.4 4.8-5"/>',
        fav: '<path d="M12 19s-6.5-4-6.5-8.6A3.6 3.6 0 0 1 12 8.2a3.6 3.6 0 0 1 6.5 2.2C18.5 15 12 19 12 19z"/>'
    };
    var WREATH = '<svg class="cab-wreath" viewBox="0 0 52 52" aria-hidden="true"><g id="w"><path d="M19 46C10 42 5.5 31 8.5 18"/>' +
        '<path d="M12.5 40.5q-6 .5-8.5-4.5q6-1 8.5 4.5z"/><path d="M8.8 33q-5.5-1.5-6.5-7q5.6 1.3 6.5 7z"/><path d="M7.6 25q-4.2-3.6-3.4-9q4.6 3.2 3.4 9z"/><path d="M9.6 17.4q-2-5 1-9q3 4.2-1 9z"/></g>' +
        '<g transform="translate(52 0) scale(-1 1)"><path d="M19 46C10 42 5.5 31 8.5 18"/><path d="M12.5 40.5q-6 .5-8.5-4.5q6-1 8.5 4.5z"/><path d="M8.8 33q-5.5-1.5-6.5-7q5.6 1.3 6.5 7z"/><path d="M7.6 25q-4.2-3.6-3.4-9q4.6 3.2 3.4 9z"/><path d="M9.6 17.4q-2-5 1-9q3 4.2-1 9z"/></g></svg>';
    var badge = function (id, cls) { return '<span class="cab-badge ' + (cls || "") + '" aria-hidden="true">' + WREATH + '<svg class="cab-badge-i" viewBox="0 0 24 24">' + (ICONS[id] || ICONS.f500) + "</svg></span>"; };
    var day = function (s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s)); return m ? new Date(+m[1], m[2] - 1, +m[3]).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : String(s); };
    // прогресс к цели — только там, где он честно считается из сводки
    function goal(a, s) {
        if (!s || !a[4]) return null;
        var key = a[4][0], target = a[4][1], v = s[key];
        if (typeof v !== "number") return null;
        if (key === "maxPct") {
            var p = Math.round(v * 100), t = Math.round(target * 100);
            return { ratio: Math.min(v / target, 1), now: p + "%", of: t + "%", left: "Лучший результат в игре — " + p + "% из " + t + "%", bar: p + "% из " + t + "%" };
        }
        var unit = key === "found" ? ["метка", "метки", "меток"] : key === "games" ? ["игра", "игры", "игр"] : ["игра", "игры", "игр"];
        var rest = Math.max(0, target - v);
        return { ratio: Math.min(v / target, 1), left: key === "found" ? "До цели — " + num(rest) + " " + plural(rest, unit[0], unit[1], unit[2]) :
            key === "games" ? "Осталось " + rest + " " + plural(rest, unit[0], unit[1], unit[2]) + " с прогрессом" : a[2],
            bar: num(Math.min(v, target)) + " из " + num(target) };
    }
    function renderAch() {
        var got = read("bp_ach", {}); if (!got || typeof got !== "object") got = {};
        var s = stats(), ACH = BPP.ACH;
        var earned = ACH.filter(function (a) { return got[a[0]]; }).sort(function (x, y) { return String(got[y[0]]).localeCompare(String(got[x[0]])); });
        var open = ACH.filter(function (a) { return !got[a[0]]; });
        $("cab-ach-n").textContent = earned.length + " из " + ACH.length;
        $("cab-ach-got").innerHTML = earned.length ? earned.slice(0, 2).map(function (a) {
            return '<li class="cab-ach-item">' + badge(a[0]) + "<span>" + esc(a[1]) + "<small>Получено " + esc(day(got[a[0]])) + "</small></span></li>";
        }).join("") : '<li class="cab-ach-none">Пока нет достижений — отметьте первую находку на любой карте.</li>';
        // ближайшее: наибольшая доля пути среди ещё не полученных (без сводки — первое по порядку, без полосы)
        var best = null, bg = null;
        open.forEach(function (a) { var g = goal(a, s); if (!best || (g && (!bg || g.ratio > bg.ratio))) { best = a; bg = g; } });
        var next = $("cab-ach-next");
        if (!best) next.innerHTML = badge("full", "is-big") + "<div><b>Все достижения получены</b><p>Отличная работа, исследователь!</p></div>";
        else next.innerHTML = badge(best[0], "is-big") + "<div><b>" + esc(best[1]) + "</b><p>" + esc(bg ? bg.left : best[2]) + "</p>" +
            (bg ? '<div class="cab-prog">' + meter(Math.round(bg.ratio * 100), "Прогресс достижения «" + best[1] + "»", true) + "<span>" + esc(bg.bar) + "</span></div>" : "") + "</div>";
        $("cab-ach-list").innerHTML = ACH.map(function (a) {
            var on = !!got[a[0]], g = on ? null : goal(a, s);
            return '<li class="' + (on ? "is-on" : "") + '">' + badge(a[0], on ? "" : "is-off") + '<span class="cab-ach-txt"><span>' + esc(a[1]) + "</span>" +
                "<small>" + (on ? "Получено " + esc(day(got[a[0]])) : esc(a[2]) + (g ? " · " + esc(g.bar) : "")) + "</small>" +
                (g ? meter(Math.round(g.ratio * 100), "Прогресс достижения «" + a[1] + "»", true) : "") + "</span></li>";
        }).join("");
        $("cab-ach-all").hidden = false;
    }
    $("cab-ach-all").addEventListener("click", function () {
        var list = $("cab-ach-list"), show = list.hidden;
        list.hidden = !show;
        this.setAttribute("aria-expanded", String(show));
        this.textContent = show ? "Свернуть" : "Показать все";
    });

    // ---------- окна: фокус внутри, Escape, возврат фокуса на кнопку, которая открыла ----------
    function openDlg(d, from) {
        d._from = from || document.activeElement;
        if (typeof d.showModal === "function") { if (!d.open) d.showModal(); } else d.setAttribute("open", "");
        var f = d.querySelector("[autofocus], input:not([type=hidden]):not([hidden]), .cab-dlg-in button:not([data-close])") || d.querySelector("button");
        if (f) f.focus();
    }
    [].forEach.call(document.querySelectorAll(".cab-dlg"), function (d) {
        d.addEventListener("click", function (e) {
            if (e.target === d || e.target.closest("[data-close]")) d.close ? d.close() : d.removeAttribute("open");
        });
        d.addEventListener("close", function () { var f = d._from; d._from = null; if (f && document.contains(f) && !f.closest("[hidden]")) f.focus(); });
    });

    // ---------- окно «Профиль» ----------
    $("cab-edit").addEventListener("click", function () {
        var p = profile(); if (!p) return;
        $("cab-name-in").value = p.name; $("cab-name-in").removeAttribute("aria-invalid"); $("cab-name-err").textContent = "";
        var opts = (user.photoURL ? [["google", "Google", user.photoURL]] : []).concat(AVAS.map(function (a) { return [a[0], a[1], avaSrc(a[0])]; }));
        var cur = p.avatar === "google" && !user.photoURL ? "compass" : p.avatar;
        $("cab-avas").innerHTML = opts.map(function (o) {
            return '<label><input type="radio" name="ava" value="' + esc(o[0]) + '"' + (o[0] === cur ? " checked" : "") + '><img src="' + esc(o[2]) + '" alt="" referrerpolicy="no-referrer"><span>' + esc(o[1]) + "</span></label>";
        }).join("");
        openDlg($("cab-dlg-profile"), this);
    });
    $("cab-profile-form").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!user) return;
        var input = $("cab-name-in"), name = cleanName(input.value);
        if (name.length < 2 || name.length > 32) {
            input.setAttribute("aria-invalid", "true");
            $("cab-name-err").textContent = "Имя — от 2 до 32 символов.";
            input.focus(); return;
        }
        var sel = this.querySelector("input[name=ava]:checked"), avatar = sel ? sel.value : "google";
        if (!write("bp_profile:" + user.uid, { name: name, avatar: avatar, src: avatar === "google" ? "" : avaSrc(avatar), at: Date.now() })) {
            $("cab-name-err").textContent = "Не удалось сохранить: хранилище браузера недоступно."; return;
        }
        paintProfile();
        $("cab-dlg-profile").close();
        announce("Профиль сохранён");
        markDirty();
    });

    // ---------- окно «Настройки» ----------
    $("cab-settings").addEventListener("click", function () { renderHist(); renderAccount(); devPanel(); $("cab-restore").hidden = true; say(""); openDlg($("cab-dlg-settings"), this); });
    $("cab-fav-add").addEventListener("click", function () { var b = this; renderPick().then(function () { openDlg($("cab-dlg-fav"), b); }, function () { announce("Не удалось загрузить список игр"); }); });
    function renderHist() {
        var ul = $("cab-hist");
        if (!user) { ul.innerHTML = "<li>Появится после входа через Google: здесь видно, когда кабинет сохранял данные в облако.</li>"; return; }
        ul.innerHTML = hist.length ? hist.map(function (a) {
            return "<li><b>" + esc(new Date(a.at).toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })) + "</b><span>" + esc(a.info || "синхронизация") + "</span></li>";
        }).join("") : "<li>Пока пусто</li>";
    }
    function renderAccount() {
        $("cab-acc-text").textContent = user ? "Вход через Google" + (user.email ? ": " + user.email : "") + ". Кабинет синхронизируется с этим аккаунтом." : "Вы не вошли. Данные хранятся только в этом браузере.";
        $("cab-exit").hidden = !user; $("cab-google-2").hidden = !!user;
    }
    $("cab-exit").addEventListener("click", function () {
        if (!fb) return;
        var b = this; b.disabled = true;
        fb.auth().signOut().then(function () { $("cab-dlg-settings").close(); announce("Вы вышли из аккаунта"); }, function (e) { say("Не удалось выйти: " + errText(e), true); }).then(function () { b.disabled = false; });
    });
    var say = function (t, bad, ok) { var m = $("cab-backup-msg"); m.textContent = t; m.className = "cab-msg" + (bad ? " is-bad" : ok ? " is-ok" : ""); };

    // ---------- резервная копия ----------
    // Формат: {format: "broskiplay-backup", version: 1, exportedAt, data: {ключ localStorage: строка}}.
    // В копию идут ключи игр (префиксы BPP.GAMES) и общие bp_*, кроме служебных этого устройства и аккаунта.
    var FORMAT = "broskiplay-backup", VERSION = 1;
    var PREFIXES = GAMES.map(function (g) { return g.u.split("_")[0] + "_"; }).filter(function (p, i, a) { return a.indexOf(p) === i; }).concat(["bp_"]);
    var SKIP = /^bp_(dev_ads|prog$|fav_sync:|profile:|cab_)/;
    var ours = function (k) { return !SKIP.test(k) && PREFIXES.some(function (p) { return k.indexOf(p) === 0; }); };
    $("cab-export").addEventListener("click", function () {
        var data = {}, n = 0;
        try {
            for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && ours(k)) { data[k] = localStorage.getItem(k); n++; } }
        } catch (e) { return say("Хранилище браузера недоступно — копию сделать нельзя.", true); }
        if (!n) return say("В этом браузере пока нет данных сайта — сохранять нечего.", true);
        var blob = new Blob([JSON.stringify({ format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), site: "broskiplay.ru", data: data }, null, 1)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = "broskiplay-backup-" + new Date().toISOString().slice(0, 10) + ".json";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        say("Копия сохранена: " + n + " " + plural(n, "запись", "записи", "записей") + ".", false, true);
    });
    $("cab-import").addEventListener("click", function () { $("cab-import-file").value = ""; $("cab-import-file").click(); });
    $("cab-import-file").addEventListener("change", function () {
        var f = this.files && this.files[0]; if (!f) return;
        if (f.size > 20 * 1024 * 1024) return say("Файл слишком большой для резервной копии сайта.", true);
        say("Проверяем файл…");
        f.text().then(function (t) { return Promise.all([JSON.parse(t), catalog()]); })
            .then(function (x) { return check(x[0], x[1]); })
            .then(function (p) { plan = p; showPlan(p); })
            .catch(function (e) { plan = null; $("cab-restore").hidden = true; say(e && e.user ? e.user : "Это не резервная копия BroskiPlay: файл не читается как JSON.", true); });
    });
    var plan = null;
    var parse = function (v) { try { return JSON.parse(v); } catch (e) { return undefined; } };
    var bad = function (t) { return { user: t }; };
    var isDict = function (v) { return !!v && typeof v === "object" && !Array.isArray(v); };
    var dict = function (k) { var v = read(k, {}); return isDict(v) ? v : {}; };
    var NOTE_MAX = 500, FLAG_OK = { star: 1, later: 1 };   // как в js/map-extras.js (dictStore)
    var notePre = function (g) { return g.u.split("_")[0] + "_"; };
    var cmDoc = function (g, id) { return (g.m != null ? g.m : g.c) + id; };   // customMarkers (у Stellar Blade свой префикс)
    // ключ localStorage карты → {g, kind: f | u | notes | flags, id карты}
    function keyInfo(k) {
        for (var i = 0; i < GAMES.length; i++) {
            var g = GAMES[i], pre = notePre(g);
            if (k.indexOf(g.f) === 0) return { g: g, kind: "f", id: k.slice(g.f.length) };
            if (k.indexOf(g.u) === 0) return { g: g, kind: "u", id: k.slice(g.u.length) };
            if (k.indexOf(pre + "notes_") === 0) return { g: g, kind: "notes", id: k.slice(pre.length + 6) };
            if (k.indexOf(pre + "flags_") === 0) return { g: g, kind: "flags", id: k.slice(pre.length + 6) };
        }
        return null;
    }
    // своя метка: как в app.js карт — нужны id, категория и координаты; лишние поля отбрасываем
    function cleanUser(m) {
        if (!isDict(m) || m.id == null || typeof m.cat !== "string" || !m.cat || !Array.isArray(m.pos) || m.pos.length < 2) return null;
        var x = +m.pos[0], y = +m.pos[1];
        if (!isFinite(x) || !isFinite(y)) return null;
        return { id: String(m.id), title: String(m.title || "Моя метка").slice(0, 80), desc: String(m.desc || "").slice(0, 500), cat: m.cat, pos: [x, y] };
    }
    var cleanVal = function (kind, v) { return kind === "flags" ? (FLAG_OK[v] ? v : "") : String(v == null ? "" : v).trim().slice(0, NOTE_MAX); };
    // недавние карты из копии, которых здесь нет (или здесь открыты раньше) и которые не убраны крестиком позже
    function newRecent(list) {
        var mine = Object.create(null), del = read("bp_recent_del", {}) || {};
        arr("bp_recent").forEach(function (r) { if (r && r.game) mine[r.game + "/" + r.map] = Math.max(mine[r.game + "/" + r.map] || 0, +r.at || 0); });
        return list.filter(function (r) { var k = r.game + "/" + r.map; return !(k in mine && mine[k] >= (+r.at || 0)) && !(+del[k] >= (+r.at || 0)); });
    }
    // проверка копии и план слияния: ничего не удаляем, существующее не перезаписываем. Promise<план>
    function check(b, cat) {
        if (!b || typeof b !== "object" || b.format !== FORMAT) throw bad("Это не резервная копия BroskiPlay.");
        if (typeof b.version !== "number" || b.version > VERSION) throw bad("Копия создана более новой версией сайта (формат " + esc(b.version) + "). Обновите страницу и попробуйте снова.");
        if (!b.data || typeof b.data !== "object") throw bad("В копии нет данных.");
        var p = { maps: [], set: {}, keep: 0, skip: 0, foreign: 0, bogus: 0, fav: [], achV: {}, ach: 0, recentV: [], date: b.exportedAt };
        var byMap = {}, slot = function (g, game, map) {
            var k = g.key + "/" + map.id;
            return byMap[k] || (byMap[k] = { g: g, game: game, map: map, fk: g.f + map.id, uk: g.u + map.id, pre: notePre(g), found: [], user: [], notes: {}, flags: {}, cur: 0 });
        };
        Object.keys(b.data).forEach(function (k) {
            var raw = b.data[k];
            if (typeof raw !== "string" || !ours(k)) { p.skip++; return; }
            var hit = keyInfo(k);
            if (hit) {
                var game = cat.games[hit.g.key], map = game && game.maps[hit.id], v = parse(raw);
                if (!map) { p.foreign++; return; }   // карта не из этой игры или уже не существует
                var x = slot(hit.g, game, map);
                if (hit.kind === "f") {
                    if (!Array.isArray(v)) { p.skip++; return; }
                    x.foundRaw = v.filter(function (id) { return typeof id === "string" || typeof id === "number"; }).map(String);
                    p.skip += v.length - x.foundRaw.length;
                } else if (hit.kind === "u") {
                    if (!Array.isArray(v)) { p.skip++; return; }
                    var have = {}; arr(x.uk).forEach(function (m) { if (m && m.id != null) have[String(m.id)] = 1; });
                    v.forEach(function (m) { var c = cleanUser(m); if (!c) { p.skip++; return; } x.userAll = (x.userAll || []).concat(c); if (!have[c.id]) { have[c.id] = 1; x.user.push(c); } });
                } else {
                    if (!isDict(v)) { p.skip++; return; }
                    var cur = dict(k);
                    Object.keys(v).forEach(function (id) { var c = cleanVal(hit.kind, v[id]); if (!c) { p.skip++; return; } if (!cur[id]) x[hit.kind][id] = c; });
                }
                return;
            }
            if (k === "bp_fav") { var fv = parse(raw); if (Array.isArray(fv)) { var lf = arr("bp_fav"); p.fav = fv.filter(function (g, i) { return cat.games[g] && lf.indexOf(g) < 0 && fv.indexOf(g) === i; }); } else p.skip++; return; }
            if (k === "bp_ach") {
                var av = parse(raw), lg = read("bp_ach", {}) || {}, ids2 = BPP.ACH.map(function (a) { return a[0]; });
                if (!isDict(av)) { p.skip++; return; }
                Object.keys(av).forEach(function (id) {
                    if (ids2.indexOf(id) < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(av[id])) return;
                    if (!lg[id] || av[id] < lg[id]) { p.achV[id] = av[id]; p.ach++; }
                });
                return;
            }
            if (k === "bp_recent") {
                var rv = parse(raw);
                if (!Array.isArray(rv)) { p.skip++; return; }
                p.recentV = newRecent(rv.filter(function (r) { return r && cat.games[r.game] && cat.games[r.game].maps[r.map]; })
                    .map(function (r) { return { game: r.game, map: r.map, at: +r.at || 0 }; }));
                return;
            }
            if (k === "bp_recent_del") return;   // крестики этого устройства не переносим: копия только добавляет
            // прочие настройки: только если на устройстве такого ключа ещё нет
            var exists = null; try { exists = localStorage.getItem(k); } catch (e) {}
            if (exists === null) p.set[k] = raw; else p.keep++;
        });
        // найденные id — только метки этой карты (из индекса прогресса) или свои метки (здесь и в копии)
        var list = Object.keys(byMap).map(function (k) { return byMap[k]; });
        return Promise.all(list.map(function (x) {
            if (!x.foundRaw || !x.foundRaw.length) return null;
            return BPP.markerIds(ROOT, x.game.dir, x.map).then(function (ms) {
                if (!ms.length) throw bad("Не удалось проверить метки карты «" + x.game.title + "». Проверьте соединение и попробуйте снова.");
                var ok = {}, cur = arr(x.fk).map(String);
                ms.forEach(function (m) { if (m && m.id != null) ok[String(m.id)] = 1; });
                arr(x.uk).concat(x.userAll || []).forEach(function (m) { if (m && m.id != null) ok[String(m.id)] = 1; });
                x.cur = cur.length;
                x.foundRaw.forEach(function (id) { if (!ok[id]) p.bogus++; else if (cur.indexOf(id) < 0 && x.found.indexOf(id) < 0) x.found.push(id); });
            }, function (e) { throw e && e.user ? e : bad("Не удалось проверить метки карты «" + x.game.title + "». Проверьте соединение и попробуйте снова."); });
        })).then(function () {
            p.maps = list.filter(function (x) { return x.found.length || x.user.length || Object.keys(x.notes).length || Object.keys(x.flags).length; });
            p.total = p.maps.reduce(function (n, x) { return n + x.found.length; }, 0);
            p.userN = p.maps.reduce(function (n, x) { return n + x.user.length; }, 0);
            p.marksN = p.maps.reduce(function (n, x) { return n + Object.keys(x.notes).length + Object.keys(x.flags).length; }, 0);
            p.recent = p.recentV.length;
            p.setN = Object.keys(p.set).length;
            return p;
        });
    }
    var mapTitle = function (x) { return x.game.title + (x.game.count > 1 ? " — " + x.map.name : ""); };
    function showPlan(p) {
        var box = $("cab-restore"), li = [];
        var when = p.date && !isNaN(Date.parse(p.date)) ? new Date(p.date).toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
        p.maps.forEach(function (x) {
            if (x.found.length) li.push("<li><b>" + esc(mapTitle(x)) + "</b>: +" + num(x.found.length) + " " + plural(x.found.length, "отметка", "отметки", "отметок") + " (сейчас " + num(x.cur) + ")</li>");
        });
        if (p.userN) li.push("<li>Свои метки: +" + num(p.userN) + "</li>");
        if (p.marksN) li.push("<li>Заметки и флажки на метках: +" + num(p.marksN) + "</li>");
        if (p.fav.length) li.push("<li>Избранное: +" + p.fav.length + " " + plural(p.fav.length, "игра", "игры", "игр") + "</li>");
        if (p.ach) li.push("<li>Достижения: " + p.ach + " — новые или с более ранней датой</li>");
        if (p.recent) li.push("<li>Недавние карты: +" + p.recent + "</li>");
        if (p.setN) li.push("<li>Настройки, которых нет на устройстве: " + p.setN + "</li>");
        var none = !li.length;
        var notes = [];
        if (p.keep) notes.push(p.keep + " " + plural(p.keep, "настройка уже есть", "настройки уже есть", "настроек уже есть") + " на устройстве — останутся как есть");
        if (p.foreign) notes.push('<span class="cab-warn">' + p.foreign + " " + plural(p.foreign, "запись относится", "записи относятся", "записей относятся") + " к картам, которых на сайте нет, — пропущено</span>");
        if (p.bogus) notes.push('<span class="cab-warn">' + num(p.bogus) + " " + plural(p.bogus, "отметка не совпадает", "отметки не совпадают", "отметок не совпадают") + " с метками своих карт — пропущено</span>");
        if (p.skip) notes.push(p.skip + " " + plural(p.skip, "запись не распознана", "записи не распознаны", "записей не распознано") + " — пропущено");
        box.innerHTML = "<b>Проверка копии " + (when ? "от " + esc(when) : "(дата неизвестна)") + "</b>" +
            (none ? "<p>Нового нет: всё из копии уже есть в этом браузере.</p>" : "<p>Будет добавлено (существующий прогресс не удаляется и не перезаписывается):</p><ul>" + li.join("") + "</ul>") +
            (notes.length ? "<ul>" + notes.map(function (n) { return "<li>" + n + "</li>"; }).join("") + "</ul>" : "") +
            (!none && user && p.maps.length ? "<p>Отметки, свои метки и заметки также добавятся в облачный прогресс этих карт.</p>" : "") +
            '<div class="cab-dlg-acts cab-start">' + (none ? "" : '<button class="bx-btn bx-btn-primary" type="button" id="cab-apply">Добавить из копии</button>') +
            '<button class="bx-btn" type="button" id="cab-cancel">' + (none ? "Закрыть" : "Отмена") + "</button></div>";
        box.hidden = false; say("");
        ($("cab-apply") || $("cab-cancel")).focus();
    }
    $("cab-restore").addEventListener("click", function (e) {
        if (e.target.closest("#cab-cancel")) { plan = null; this.hidden = true; $("cab-import").focus(); return; }
        if (!e.target.closest("#cab-apply") || !plan) return;
        var p = plan, btn = e.target.closest("#cab-apply"); plan = null;
        btn.disabled = true; btn.setAttribute("aria-busy", "true");
        apply(p).then(function (r) {
            $("cab-restore").hidden = true;
            var got = [];
            if (r.found) got.push(num(r.found) + " " + plural(r.found, "отметка", "отметки", "отметок"));
            if (r.user) got.push("своих меток " + num(r.user));
            if (r.marks) got.push("заметок и флажков " + num(r.marks));
            if (r.other) got.push("прочих записей " + num(r.other));
            var head = r.fail ? "Восстановлено не всё: браузер не дал сохранить " + r.fail + " " + plural(r.fail, "запись", "записи", "записей") + " (хранилище переполнено или запрещено)" :
                got.length ? "Готово: добавлено " + got.join(", ") : "Готово: всё из копии уже было в браузере";
            say(head + (r.cloud ? "; в облако — " + r.cloud + " " + plural(r.cloud, "карта", "карты", "карт") : "") +
                (r.cloudErr ? "; облако не ответило для " + r.cloudErr + " " + plural(r.cloudErr, "карты", "карт", "карт") + " — данные остались в браузере, карта отправит их сама" : "") + ".",
                !!(r.fail || r.cloudErr), !(r.fail || r.cloudErr));
            $("cab-import").focus();
        });
    });
    // Применение: каждое значение перечитывается сейчас (а не берётся из плана) — правки других вкладок после проверки не теряются.
    function apply(p) {
        var r = { found: 0, user: 0, marks: 0, other: 0, fail: 0, cloud: 0, cloudErr: 0 };
        var put = function (k, v) { if (write(k, v)) return true; r.fail++; return false; };
        var done = p.maps.map(function (x) {
            var cur = arr(x.fk).map(String), add = x.found.filter(function (id) { return cur.indexOf(id) < 0; });
            if (add.length && put(x.fk, cur.concat(add))) r.found += add.length;
            var mine = arr(x.uk), have = {}; mine.forEach(function (m) { if (m && m.id != null) have[String(m.id)] = 1; });
            var addU = x.user.filter(function (m) { return !have[m.id]; });
            if (addU.length && put(x.uk, mine.concat(addU))) r.user += addU.length;
            var addD = {};
            ["notes", "flags"].forEach(function (kind) {
                var key = x.pre + kind + "_" + x.map.id, d = dict(key), n = 0;
                addD[kind] = {};
                Object.keys(x[kind]).forEach(function (id) { if (!d[id]) { d[id] = addD[kind][id] = x[kind][id]; n++; } });
                if (n && put(key, d)) r.marks += n;
            });
            return { x: x, found: x.found, user: x.user, notes: x.notes, flags: x.flags };
        });
        Object.keys(p.set).forEach(function (k) {
            try { if (localStorage.getItem(k) === null) { localStorage.setItem(k, p.set[k]); r.other++; } } catch (e) { r.fail++; }
        });
        var lf = arr("bp_fav"), addF = p.fav.filter(function (k) { return lf.indexOf(k) < 0; });
        if (addF.length && put("bp_fav", lf.concat(addF))) { r.other += addF.length; dispatchEvent(new Event("bp:fav")); }
        if (p.ach) {
            var g = read("bp_ach", {}); if (!isDict(g)) g = {};
            var n = 0; Object.keys(p.achV).forEach(function (id) { if (!g[id] || p.achV[id] < g[id]) { g[id] = p.achV[id]; n++; } });
            if (n && put("bp_ach", g)) r.other += n;
        }
        if (p.recent) {
            var nr = newRecent(p.recentV);
            if (nr.length && put("bp_recent", merge({ recent: arr("bp_recent"), recentDel: read("bp_recent_del", {}) }, { recent: nr }, null).recent)) r.other += nr.length;
        }
        // облако главное: без этого карта при открытии вернула бы облачную версию. Документа нет — карта сама отправит локальное.
        var uid = user && user.uid;
        var push = !user || !fb ? Promise.resolve() : Promise.all(done.map(function (d) {
            var x = d.x, jobs = [], pr = ref(x.g.c + x.map.id);
            if (d.found.length || Object.keys(d.notes).length || Object.keys(d.flags).length) jobs.push(timeout(pr.get(), 10000).then(function (s) {
                if (!s.exists) return false;
                var c = s.data() || {}, ids = (foundOf(c) || []).map(String), patch = {}, ch = false;
                var add = d.found.filter(function (id) { return ids.indexOf(id) < 0; });
                if (add.length) { patch.foundIds = ids.concat(add); ch = true; }
                ["notes", "flags"].forEach(function (kind) {
                    var cd = isDict(c[kind]) ? Object.assign({}, c[kind]) : {}, n = 0;
                    Object.keys(d[kind]).forEach(function (id) { if (!cd[id]) { cd[id] = d[kind][id]; n++; } });
                    if (n) { patch[kind] = cd; ch = true; }
                });
                if (!ch) return false;
                patch.updatedAt = fb.firestore.FieldValue.serverTimestamp();
                return timeout(pr.set(patch, { merge: true }), 10000).then(function () {
                    if (patch.foundIds && cloudIdx && user && user.uid === uid) cloudIdx[x.g.c + x.map.id] = patch.foundIds;
                    return true;
                });
            }));
            if (d.user.length) {
                var cr = fb.firestore().collection("users").doc(uid).collection("customMarkers").doc(cmDoc(x.g, x.map.id));
                jobs.push(timeout(cr.get(), 10000).then(function (s) {
                    var c = s.exists ? s.data() || {} : null;
                    if (!c || !Array.isArray(c.markers)) return false;
                    var have = {}; c.markers.forEach(function (m) { if (m && m.id != null) have[String(m.id)] = 1; });
                    var add = d.user.filter(function (m) { return !have[m.id]; });
                    if (!add.length) return false;
                    return timeout(cr.set({ markers: c.markers.concat(add), updatedAt: fb.firestore.FieldValue.serverTimestamp() }, { merge: true }), 10000).then(function () { return true; });
                }));
            }
            return Promise.all(jobs).then(function (res) { if (res.some(Boolean)) r.cloud++; }, function () { r.cloudErr++; });
        }));
        return push.then(function () {
            recount(); renderFav();
            markDirty();
            return r;
        });
    }

    // ---------- режим создателя: только аккаунту владельца (сверка SHA-256 e-mail, сам адрес в коде не хранится) ----------
    var DEV_HASH = "86d410ddae79a275fd5e9a7b1ef2803640f0af29747a13803f8e192c2074caa0";
    function devPanel() {
        var slot = $("cab-dev-slot");
        if (!user || !user.email || !window.crypto || !crypto.subtle) { slot.innerHTML = ""; return; }
        crypto.subtle.digest("SHA-256", new TextEncoder().encode(user.email.trim().toLowerCase())).then(function (buf) {
            var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
            if (hex !== DEV_HASH) { slot.innerHTML = ""; return; }
            var off = false; try { off = localStorage.getItem("bp_dev_ads") === "off"; } catch (e) {}
            slot.innerHTML = '<section class="cab-set cab-dev" aria-labelledby="cab-dev-h"><h3 id="cab-dev-h">Режим создателя</h3>' +
                "<dl><dt>Реклама у меня</dt><dd>" + (off ? "отключена" : "показывается") + "</dd></dl>" +
                '<div class="cab-dlg-acts cab-start"><button class="bx-btn bx-btn-primary" type="button" id="cab-dev-ads">' + (off ? "Включить рекламу" : "Отключить рекламу") + "</button>" +
                '<a class="bx-btn" href="/?bp-ab=1">Показать окно блокировщика</a></div>' +
                "<p>Настройка действует только в этом браузере — на другом устройстве переключите её снова. Окно блокировщика при отключённой рекламе не появляется.</p></section>";
            $("cab-dev-ads").addEventListener("click", function () {
                try { if (off) localStorage.removeItem("bp_dev_ads"); else localStorage.setItem("bp_dev_ads", "off"); } catch (e) {}
                location.reload();
            });
        });
    }

    // ---------- вход и общий вид ----------
    function view() {
        var on = !!user;
        $("cab-google").hidden = on || !window.BPAuth;
        $("cab-edit").hidden = !on;
        paintProfile();
        renderAccount();
        if ($("cab-dlg-settings").open) { renderHist(); devPanel(); }
        if (!on) setPhase(authKnown ? "guest" : phase === "authfail" ? "authfail" : "loading");
    }
    function signIn() { if (window.BPAuth && BPAuth.signIn) BPAuth.signIn(); }
    $("cab-google").addEventListener("click", signIn);
    $("cab-google-2").addEventListener("click", function () { $("cab-dlg-settings").close(); signIn(); });
    $("cab-sync").addEventListener("click", function () { wantCloud = true; sync(); });
    document.addEventListener("click", function (e) {
        var r = e.target.closest("[data-retry]"); if (!r) return;
        if (r.dataset.retry === "cont") renderCont(); else renderFav();
    });
    // другая вкладка (главная, карта) поменяла данные — перерисовать
    // Отметки карты: карта у вошедшего пишет то же и в облако — обновляем облачный индекс этой карты без чтения облака.
    // Данные кабинета (избранное, недавние, достижения, профиль) — отправить в облако: статус «Сохранено» больше не верен.
    var recountTimer = 0;
    addEventListener("storage", function (e) {
        var k = e.key;
        if (k == null) { renderFav(); renderCont(); renderAch(); paintProfile(); return; }   // localStorage.clear()
        var hit = keyInfo(k);
        if (hit && (hit.kind === "f" || hit.kind === "u")) {
            if (hit.kind === "f" && user && cloudIdx) cloudIdx[hit.g.c + hit.id] = arr(k).map(String);
            clearTimeout(recountTimer); recountTimer = setTimeout(recount, 600);
            return;
        }
        if (k === "bp_fav") { renderFav(); if ($("cab-dlg-fav").open) renderPick(); markDirty(); }
        if (k === "bp_recent" || k === "bp_recent_del") { renderCont(); markDirty(); }
        if (k === "bp_ach") { renderAch(); markDirty(); }
        if (k === "bp_prog") renderAch();
        if (user && k === "bp_profile:" + user.uid) { paintProfile(); markDirty(); }
    });

    function init() {
        renderAch(); renderFav(); renderCont();
        fresh.then(function (p) { if (p) { renderAch(); } $("cab").removeAttribute("aria-busy"); });
        paintState();
        if (!window.BPAuth) { authKnown = true; setPhase("authfail"); return; }
        $("cab-google").hidden = false;
        BPAuth.onChange(function (u, f) {
            authKnown = true;
            var was = user && user.uid; fb = f; user = u;
            if (u && u.uid !== was) {
                hist = arr("bp_cab_hist:" + u.uid); lastOk = 0; cloudIdx = null; wantCloud = true;
                view(); sync(); renderCont();
            } else if (!u) {
                hist = []; lastOk = 0; clearTimeout(dirtyTimer); cloudIdx = null; wantCloud = false;
                view(); if (was) BPP.refresh(ROOT).then(function () { renderAch(); renderCont(); });
            } else view();
        });
        if (BPAuth.warm) BPAuth.warm();   // Firebase сразу: окно входа откроется без задержки (Safari блокирует запоздалые окна)
        setTimeout(function () { if (!authKnown) { setPhase("authfail"); } }, 10000);
    }
    init();
})();
