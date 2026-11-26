// Вход через Google в верхнем меню страниц, где нет полной логики главной (страницы категорий, журнал исправлений, политика).
// Гость видит кнопку «Войти с Google» (разметка уже в странице); если человек входил раньше — после загрузки Firebase показываем аватар и «Выйти».
// Облачный прогресс здесь не читается: он открывается на картах и на главной.
(function () {
    "use strict";
    var CONFIG = {
        apiKey: "AIzaSyBZ29h18Z1k0gE4dAEca5JH8yePQgxhaII",
        authDomain: "broskiplaymaps.firebaseapp.com",
        projectId: "broskiplaymaps",
        appId: "1:418362476965:web:59ce4e677b1a0a84d7404c"
    };
    var btn = document.getElementById("auth-btn"), status = document.getElementById("auth-status"), avatar = document.getElementById("auth-avatar");
    if (!btn || !window.BPFirebase) return;
    var info = avatar && avatar.closest(".auth-info");
    var guestHtml = btn.innerHTML, guestStatus = status ? status.innerHTML : "";
    var LOGOUT = '<svg class="logout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg><span>Выйти</span>';
    var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    var fb = null, listeners = [];
    // window.BPAuth.onChange(fn(user|null, firebase)) — для страниц, которым нужен вошедший пользователь (например, чтобы писать отметки в облако).
    // Вызывается сразу, если вход уже определён, и при каждой смене пользователя.
    window.BPAuth = {
        user: null, ready: false,
        onChange: function (fn) { listeners.push(fn); if (window.BPAuth.ready) fn(window.BPAuth.user, fb); }
    };
    function ensure() {
        return window.BPFirebase.load().then(function (f) { if (!f.apps.length) f.initializeApp(CONFIG); fb = f; return f; });
    }
    // имя и аватар для шапки: профиль, сохранённый в личном кабинете (bp_profile:<uid>), иначе — из аккаунта Google
    function look(user) {
        var p = null; try { p = JSON.parse(localStorage.getItem("bp_profile:" + user.uid)); } catch (e) {}
        var name = p && typeof p.name === "string" && p.name.trim() || user.displayName || user.email || "Google";
        var src = p && p.avatar && p.avatar !== "google" && typeof p.src === "string" && p.src.indexOf("data:image/svg+xml") === 0 ? p.src : user.photoURL;
        return { name: name, src: src };
    }
    function paint(user) {
        if (user) {
            var l = look(user);
            if (status) status.innerHTML = "<b>" + esc(l.name) + "</b><br><span class='auth-online'>● Личный кабинет</span>";
            btn.innerHTML = LOGOUT; btn.classList.add("logout");
            if (l.src && avatar) {
                avatar.referrerPolicy = "no-referrer";
                avatar.onload = function () { if (info) info.classList.add("has-avatar"); };
                avatar.onerror = function () { if (info) info.classList.remove("has-avatar"); };
                if (avatar.getAttribute("src") !== l.src) avatar.src = l.src;
            } else if (info) info.classList.remove("has-avatar");
        } else {
            if (status) status.innerHTML = guestStatus;
            btn.innerHTML = guestHtml; btn.classList.remove("logout");
            if (info) info.classList.remove("has-avatar");
            if (avatar) avatar.removeAttribute("src");
        }
    }
    function render(user) {
        window.BPFirebase.setSignedIn(!!user);
        window.BPAuth.user = user; window.BPAuth.ready = true;
        paint(user);
        listeners.forEach(function (fn) { try { fn(user, fb); } catch (e) { /* слушатель не должен ломать меню */ } });
    }
    window.BPAuth.repaint = function () { if (window.BPAuth.ready) paint(window.BPAuth.user); };   // кабинет сменил имя или аватар
    function watch() { return ensure().then(function (f) { f.auth().onAuthStateChanged(render); return f; }); }
    window.BPFirebase.hasSavedSession().then(function (saved) { if (saved) watch(); });
    // вход Google всплывающим окном — его же вызывает кнопка в личном кабинете (BPAuth.signIn)
    function signIn() {
        btn.classList.add("is-loading");
        (fb ? Promise.resolve(fb) : watch()).then(function (f) {
            btn.classList.remove("is-loading");
            if (f.auth().currentUser) return;
            return f.auth().signInWithPopup(new f.auth.GoogleAuthProvider()).catch(function (err) {
                if (err && (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request")) return;
                alert("Ошибка входа через Google: " + (err && err.message || err));
            });
        }).catch(function () { btn.classList.remove("is-loading"); alert("Вход через Google сейчас недоступен: Firebase не загрузился."); });
    }
    window.BPAuth.signIn = signIn;
    window.BPAuth.warm = function () { if (!fb) watch(); };   // кабинет грузит Firebase сразу: окно входа откроется без задержки (Safari блокирует запоздалые окна)
    btn.addEventListener("click", function () {
        if (fb && fb.auth().currentUser) { fb.auth().signOut(); return; }
        signIn();
    });
})();
