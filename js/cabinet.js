// Личный кабинет BroskiPlay: вход через Google (Firebase, общий со всем сайтом — js/auth-lite.js) и синхронизация
// избранного, достижений и последних карт в Firestore: users/{uid}/mapProgress/bp_cabinet (те же правила, что и у прогресса карт).
// Вход — всплывающим окном Firebase, поэтому установленное приложение (PWA) не уходит в браузер.
(function () {
    "use strict";
    var $ = function (id) { return document.getElementById(id); };
    var read = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    var fb = null, user = null;
    var DOC = "bp_cabinet";
    // Достижения и сводка прогресса — общий модуль js/progress-core.js (подключён на странице раньше этого файла)
    var ACH = window.BPP ? BPP.ACH : [];
    // кабинет пересчитывает сводку сам — не зависит от того, открывалась ли главная после карты
    var fresh = window.BPP ? BPP.refresh("/") : Promise.resolve(null);
    function renderAch(got) {
        var ul = $("cab-achs"), n = 0; if (!ul) return;
        ul.innerHTML = "";
        ACH.forEach(function (a) {
            var on = !!got[a[0]]; if (on) n++;
            var li = document.createElement("li"); li.className = on ? "is-on" : "";
            var b = document.createElement("b"); b.textContent = a[1];
            var sm = document.createElement("small"); sm.textContent = on ? "получено " + got[a[0]] : a[2];
            li.appendChild(b); li.appendChild(sm); ul.appendChild(li);
        });
        var h = $("cab-ach-n"); if (h) h.textContent = n + " из " + ACH.length;
    }

    function say(t, bad) { var m = $("cab-msg"); if (m) { m.textContent = t; m.className = "cab-msg" + (bad ? " bad" : ""); } }

    // слияние: избранное — трёхстороннее относительно прошлой синхронизации (bp_fav_sync), достижения — самая ранняя дата,
    // последние карты — запись с большей меткой времени.
    // Избранное: к облачному списку добавляем то, что добавили здесь, и убираем то, что здесь удалили после прошлой синхронизации.
    // Без базы (первая синхронизация на устройстве) — объединение. Так удалённая игра не возвращается из облака,
    // а удаление на другом устройстве доходит сюда.
    function merge(local, remote, base) {
        var lf = Array.isArray(local.fav) ? local.fav : [], rf = Array.isArray(remote.fav) ? remote.fav : [];
        var fav = rf.slice();
        lf.forEach(function (g) { if (fav.indexOf(g) < 0 && (!base || base.indexOf(g) < 0)) fav.push(g); });
        if (base) fav = fav.filter(function (g) { return !(base.indexOf(g) >= 0 && lf.indexOf(g) < 0); });
        else lf.forEach(function (g) { if (fav.indexOf(g) < 0) fav.push(g); });
        var ach = Object.assign({}, remote.ach || {});
        Object.keys(local.ach || {}).forEach(function (k) { if (!ach[k] || local.ach[k] < ach[k]) ach[k] = local.ach[k]; });
        var seen = {}, recent = (Array.isArray(local.recent) ? local.recent : []).concat(Array.isArray(remote.recent) ? remote.recent : [])
            .filter(function (r) { return r && r.game && r.map; })
            .sort(function (x, y) { return (y.at || 0) - (x.at || 0); })
            .filter(function (r) { var k = r.game + "/" + r.map; return seen[k] ? false : (seen[k] = true); }).slice(0, 8);
        return { fav: fav, ach: ach, recent: recent };
    }
    function localState() { return { fav: read("bp_fav", []), ach: read("bp_ach", {}), recent: read("bp_recent", []) }; }

    function ref() { return fb.firestore().collection("users").doc(user.uid).collection("mapProgress").doc(DOC); }
    var hist = [];
    async function sync() {
        if (!user || !fb) return;
        say("Синхронизация…");
        await fresh;   // новые достижения из пересчёта уходят в облако в этой же синхронизации
        var snap;
        try { snap = await ref().get(); } catch (e) { return say("Не удалось получить данные: " + (e.message || e), true); }
        var remote = snap.exists ? snap.data() : {};
        var base = read("bp_fav_sync:" + user.uid, null);
        var m = merge(localState(), remote, Array.isArray(base) ? base : null);
        write("bp_fav", m.fav); write("bp_ach", m.ach); write("bp_recent", m.recent);
        hist = [{ at: Date.now(), info: "избранное " + m.fav.length + ", достижений " + Object.keys(m.ach).length }]
            .concat(Array.isArray(remote.hist) ? remote.hist : []).slice(0, 10);
        try {
            await ref().set({ fav: m.fav, ach: m.ach, recent: m.recent, hist: hist, updatedAt: fb.firestore.FieldValue.serverTimestamp() });
        } catch (e) { return say("Не удалось сохранить: " + (e.message || e), true); }
        write("bp_fav_sync:" + user.uid, m.fav);   // база для следующего слияния — то, что теперь лежит и здесь, и в облаке
        say("Готово: данные синхронизированы.");
        render(m);
    }
    function history() {
        var ul = $("cab-hist"); if (!ul) return;
        ul.innerHTML = "";
        hist.forEach(function (a) {
            var li = document.createElement("li");
            li.textContent = new Date(a.at).toLocaleString("ru-RU") + " — синхронизация" + (a.info ? " (" + a.info + ")" : "");
            ul.appendChild(li);
        });
        if (!ul.children.length) ul.innerHTML = "<li>Пока пусто</li>";
    }
    function renderProg() {
        var box = $("cab-prog"), p = read("bp_prog", null); if (!box) return;
        if (!p || !p.games || !p.games.length) { box.innerHTML = "<p>Пока нет отмеченных меток. Откройте карту и отмечайте найденное — здесь появится прогресс.</p>"; return; }
        var h = '<div class="cab-ring" style="--v:' + p.all + '"><b>' + p.all + '%</b><span>общий</span></div><div>' +
            '<p><b>' + p.found.toLocaleString("ru-RU") + '</b> меток найдено, игр с прогрессом: ' + p.games.length + ', завершено: ' + p.done + '</p><ul class="cab-bars">';
        p.games.forEach(function (g) {
            var v = g.total ? Math.round(g.found / g.total * 100) : 0, li = document.createElement("li");
            li.textContent = g.title; var b = document.createElement("b"); b.textContent = v + "%"; li.appendChild(b);
            var bar = document.createElement("span"); bar.className = "cab-bar"; var i = document.createElement("i"); i.style.width = v + "%"; bar.appendChild(i); li.appendChild(bar);
            if (/^#[0-9a-f]{3,8}$/i.test(g.accent)) li.style.setProperty("--pa", g.accent);
            h += li.outerHTML;
        });
        h += "</ul>";
        if (p.last && /^[\/.\w-]/.test(p.last.href || "")) { var a = document.createElement("a"); a.className = "sp-btn sp-pill"; a.href = p.last.href; a.textContent = "Продолжить: " + (p.last.title || p.last.name); h += a.outerHTML; }
        box.innerHTML = h + "</div>";
    }
    function render(m) {
        $("cab-fav").textContent = m.fav.length ? m.fav.join(", ") : "—";
        renderAch(m.ach);
        $("cab-maps").textContent = m.recent.length;
        history();
    }
    function view(on) { $("cab-out").hidden = on; $("cab-in").hidden = !on; if (on) $("cab-mail").textContent = user.email || user.displayName || ""; devPanel(on); }

    // Режим создателя: блок виден только аккаунту владельца (сверка SHA-256 e-mail, сам адрес в коде не хранится).
    var DEV_HASH = "86d410ddae79a275fd5e9a7b1ef2803640f0af29747a13803f8e192c2074caa0";
    async function devPanel(on) {
        var old = $("cab-dev");
        if (!on || !user || !user.email || !window.crypto || !crypto.subtle) { if (old) old.remove(); return; }
        var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(user.email.trim().toLowerCase()));
        var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
        if (hex !== DEV_HASH || $("cab-dev")) return;
        var off = false; try { off = localStorage.getItem("bp_dev_ads") === "off"; } catch (e) {}
        var sec = document.createElement("section");
        sec.className = "cab-card"; sec.id = "cab-dev";
        sec.innerHTML = "<h2>Режим создателя</h2>" +
            "<dl><dt>Реклама у меня</dt><dd>" + (off ? "отключена" : "показывается") + "</dd></dl>" +
            '<div class="cab-btns"><button class="sp-btn sp-primary" type="button" id="cab-dev-ads">' + (off ? "Включить рекламу" : "Отключить рекламу") + "</button>" +
            ' <a class="sp-btn" href="/?bp-ab=1">Показать окно блокировщика</a></div>' +
            '<p class="cab-note">Настройка действует только в этом браузере — на другом устройстве переключите её снова. Окно блокировщика при отключённой рекламе не появляется.</p>';
        var main = $("cab-in").closest(".cab-card").parentNode;  // в самый низ, после «Достижений»
        var cards = main.querySelectorAll(":scope > .cab-card"), last = cards[cards.length - 1];
        main.insertBefore(sec, last.nextSibling);
        $("cab-dev-ads").addEventListener("click", function () {
            try { if (off) localStorage.removeItem("bp_dev_ads"); else localStorage.setItem("bp_dev_ads", "off"); } catch (e) {}
            location.reload();
        });
    }

    function init() {
        renderAch(read("bp_ach", {})); renderProg();
        fresh.then(function (p) { if (p) { renderAch(read("bp_ach", {})); renderProg(); } });
        view(false);
        if (!window.BPAuth) return say("Вход сейчас недоступен.", true);
        BPAuth.onChange(function (u, f) {
            var was = user && user.uid; fb = f; user = u; view(!!u);
            if (u && u.uid !== was) sync();
        });
        if (BPAuth.warm) BPAuth.warm();
        $("cab-google").addEventListener("click", function () { BPAuth.signIn(); });
        $("cab-sync").addEventListener("click", sync);
        $("cab-exit").addEventListener("click", function () { if (fb) fb.auth().signOut().then(function () { say("Вы вышли."); }); });
    }
    init();
})();
