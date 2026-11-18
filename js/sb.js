// Кабинет BroskiPlay на Supabase: вход по e-mail (magic link) и синхронизация избранного, достижений и последних карт.
// Подключается только на /cabinet/ (supabase-js грузится по требованию). Firebase-вход и прогресс карт не затрагиваются.
// Ключ publishable публичный по замыслу; доступ к данным закрыт правилами RLS (scripts/supabase/schema.sql).
(function () {
    "use strict";
    var URL_ = "https://rasokafsnynziydlksbq.supabase.co", KEY = "sb_publishable_uY_XEhYkx18W-dX5I6X2ew_HNqQPI79";
    var SDK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
    var $ = function (id) { return document.getElementById(id); };
    var read = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    var sb = null, user = null;
    // Список достижений совпадает с js/home-dash.js (получение считается там и сохраняется в bp_ach)
    var ACH = [["first", "Первая находка", "Отметьте первую метку"], ["f100", "Следопыт", "100 найденных меток"], ["f500", "Исследователь", "500 найденных меток"],
        ["f1000", "Картограф", "1 000 найденных меток"], ["f5000", "Хранитель миров", "5 000 найденных меток"], ["g3", "Путешественник", "Прогресс в 3 играх"],
        ["half", "На полпути", "50% в одной из игр"], ["full", "Стопроцентник", "Игра пройдена на 100%"], ["fav", "Любимчик", "Добавьте игру в избранное"]];
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

    function load() {
        return new Promise(function (ok, fail) {
            if (window.supabase) return ok();
            var s = document.createElement("script"); s.src = SDK; s.onload = ok; s.onerror = fail; document.head.appendChild(s);
        });
    }
    function say(t, bad) { var m = $("cab-msg"); if (m) { m.textContent = t; m.className = "cab-msg" + (bad ? " bad" : ""); } }

    // слияние: избранное — объединение, достижения — самая ранняя дата, последние карты — запись с большей меткой времени
    function merge(local, remote) {
        var fav = (remote.fav || []).slice();
        (local.fav || []).forEach(function (g) { if (fav.indexOf(g) < 0) fav.push(g); });
        var ach = Object.assign({}, remote.ach || {});
        Object.keys(local.ach || {}).forEach(function (k) { if (!ach[k] || local.ach[k] < ach[k]) ach[k] = local.ach[k]; });
        var seen = {}, recent = (Array.isArray(local.recent) ? local.recent : []).concat(Array.isArray(remote.recent) ? remote.recent : [])
            .filter(function (r) { return r && r.game && r.map; })
            .sort(function (x, y) { return (y.at || 0) - (x.at || 0); })
            .filter(function (r) { var k = r.game + "/" + r.map; return seen[k] ? false : (seen[k] = true); }).slice(0, 8);
        return { fav: fav, ach: ach, recent: recent };
    }
    function localState() { return { fav: read("bp_fav", []), ach: read("bp_ach", {}), recent: read("bp_recent", []) }; }

    async function sync() {
        say("Синхронизация…");
        var r = await sb.from("user_state").select("fav,ach,recent").eq("user_id", user.id).maybeSingle();
        if (r.error) return say("Не удалось получить данные: " + r.error.message, true);
        var m = merge(localState(), r.data || {});
        write("bp_fav", m.fav); write("bp_ach", m.ach); write("bp_recent", m.recent);
        var up = await sb.from("user_state").upsert({ user_id: user.id, fav: m.fav, ach: m.ach, recent: m.recent, updated_at: new Date().toISOString() });
        if (up.error) return say("Не удалось сохранить: " + up.error.message, true);
        await sb.from("activity").insert({ user_id: user.id, kind: "sync", info: "избранное " + m.fav.length + ", достижений " + Object.keys(m.ach).length });
        say("Готово: данные синхронизированы.");
        render(m);
    }
    async function history() {
        var r = await sb.from("activity").select("kind,info,created_at").order("created_at", { ascending: false }).limit(10);
        var ul = $("cab-hist"); if (!ul || r.error) return;
        ul.innerHTML = "";
        (r.data || []).forEach(function (a) {
            var li = document.createElement("li");
            li.textContent = new Date(a.created_at).toLocaleString("ru-RU") + " — " + (a.kind === "sync" ? "синхронизация" : a.kind) + (a.info ? " (" + a.info + ")" : "");
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
    function view(on) { $("cab-out").hidden = on; $("cab-in").hidden = !on; if (on) $("cab-mail").textContent = user.email || ""; }

    async function init() {
        renderAch(read("bp_ach", {})); renderProg();
        try { await load(); } catch (e) { return say("Не удалось загрузить библиотеку входа. Проверьте соединение.", true); }
        sb = window.supabase.createClient(URL_, KEY, { auth: { persistSession: true, detectSessionInUrl: true } });
        var s = await sb.auth.getSession();
        user = s.data.session ? s.data.session.user : null;
        view(!!user); if (user) sync();
        sb.auth.onAuthStateChange(function (ev, ses) {
            var was = !!user; user = ses ? ses.user : null; view(!!user);
            if (user && !was) sync();
        });
        $("cab-form").addEventListener("submit", async function (e) {
            e.preventDefault();
            var mail = $("cab-email").value.trim(); if (!mail) return;
            say("Отправляем ссылку…");
            var r = await sb.auth.signInWithOtp({ email: mail, options: { emailRedirectTo: location.origin + "/cabinet/" } });
            say(r.error ? "Ошибка: " + r.error.message : "Ссылка отправлена на " + mail + ". Откройте письмо на этом устройстве.", !!r.error);
        });
        $("cab-google").addEventListener("click", async function () {
            say("Переходим к Google…");
            var r = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + "/cabinet/" } });
            if (r.error) say("Ошибка входа через Google: " + r.error.message, true);
        });
        $("cab-sync").addEventListener("click", sync);
        $("cab-exit").addEventListener("click", async function () { await sb.auth.signOut(); say("Вы вышли."); });
    }
    init();
})();
