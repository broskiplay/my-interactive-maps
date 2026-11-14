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
    function render(user) {
        window.BPFirebase.setSignedIn(!!user);
        window.BPAuth.user = user; window.BPAuth.ready = true;
        listeners.forEach(function (fn) { try { fn(user, fb); } catch (e) { /* слушатель не должен ломать меню */ } });
        if (user) {
            if (status) status.innerHTML = "<b>" + esc(user.displayName || user.email || "Google") + "</b><br><span>● Облачная синхронизация активна</span>";
            btn.innerHTML = LOGOUT; btn.classList.add("logout");
            if (user.photoURL && avatar) {
                avatar.referrerPolicy = "no-referrer";
                avatar.onload = function () { if (info) info.classList.add("has-avatar"); };
                avatar.onerror = function () { if (info) info.classList.remove("has-avatar"); };
                avatar.src = user.photoURL;
            }
        } else {
            if (status) status.innerHTML = guestStatus;
            btn.innerHTML = guestHtml; btn.classList.remove("logout");
            if (info) info.classList.remove("has-avatar");
            if (avatar) avatar.removeAttribute("src");
        }
    }
    function watch() { return ensure().then(function (f) { f.auth().onAuthStateChanged(render); return f; }); }
    window.BPFirebase.hasSavedSession().then(function (saved) { if (saved) watch(); });
    btn.addEventListener("click", function () {
        if (fb && fb.auth().currentUser) { fb.auth().signOut(); return; }
        btn.classList.add("is-loading");
        (fb ? Promise.resolve(fb) : watch()).then(function (f) {
            btn.classList.remove("is-loading");
            if (f.auth().currentUser) return;
            return f.auth().signInWithPopup(new f.auth.GoogleAuthProvider()).catch(function (err) {
                if (err && (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request")) return;
                alert("Ошибка входа через Google: " + (err && err.message || err));
            });
        }).catch(function () { btn.classList.remove("is-loading"); alert("Вход через Google сейчас недоступен: Firebase не загрузился."); });
    });
})();
