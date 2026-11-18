// Firebase для страниц карт грузится по требованию, а не в <head>: ~150 КБ SDK + ~90 КБ iframe авторизации
// больше не задерживают первую отрисовку карты.
//   BPFirebase.load()            → Promise<firebase> (скрипты app → auth + firestore, один раз)
//   BPFirebase.hasSavedSession() → Promise<boolean>: человек уже входил (метка или сессия Firebase в IndexedDB)
//   BPFirebase.afterLoad(fn)     → fn после загрузки страницы (не позже чем через 4 с), в свободную минуту браузера
//   BPFirebase.setSignedIn(bool) → запомнить, вошёл ли человек (общая метка с главной страницей)
(function () {
    "use strict";
    var SDK = "https://www.gstatic.com/firebasejs/10.8.0/";
    var SIGNED_IN_KEY = "bp_signed_in";
    var promise = null;

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var el = document.createElement("script");
            el.src = src;
            el.onload = resolve;
            el.onerror = function () { reject(new Error("Не загрузился " + src)); };
            document.head.appendChild(el);
        });
    }

    function load() {
        if (promise) return promise;
        promise = loadScript(SDK + "firebase-app-compat.js")
            .then(function () {
                return Promise.all([loadScript(SDK + "firebase-auth-compat.js"), loadScript(SDK + "firebase-firestore-compat.js")]);
            })
            .then(function () { return window.firebase; })
            .catch(function (error) { promise = null; throw error; }); // следующая попытка загрузит заново
        return promise;
    }

    // indexedDB.open вызываем только для уже существующей базы, чтобы не создать пустую раньше Firebase
    function hasSavedSession() {
        try { if (localStorage.getItem(SIGNED_IN_KEY) === "1") return Promise.resolve(true); } catch (e) { /* нет доступа */ }
        if (!window.indexedDB || typeof indexedDB.databases !== "function") return Promise.resolve(false);
        return indexedDB.databases().then(function (dbs) {
            if (!dbs.some(function (d) { return d.name === "firebaseLocalStorageDb"; })) return false;
            return new Promise(function (resolve) {
                var req = indexedDB.open("firebaseLocalStorageDb");
                req.onerror = function () { resolve(false); };
                req.onsuccess = function () {
                    var db = req.result;
                    try {
                        if (!db.objectStoreNames.contains("firebaseLocalStorage")) { db.close(); resolve(false); return; }
                        var count = db.transaction("firebaseLocalStorage", "readonly").objectStore("firebaseLocalStorage").count();
                        count.onsuccess = function () { db.close(); resolve(count.result > 0); };
                        count.onerror = function () { db.close(); resolve(false); };
                    } catch (e) { db.close(); resolve(false); }
                };
            });
        }).catch(function () { return false; });
    }

    function afterLoad(fn) {
        var done = false;
        function run() {
            if (done) return;
            done = true;
            if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 1500 }); else setTimeout(fn, 100);
        }
        if (document.readyState === "complete") { run(); return; }
        window.addEventListener("load", run, { once: true });
        setTimeout(run, 4000); // тайлы могут грузиться долго: облако не должно ждать их все
    }

    function setSignedIn(on) {
        try { if (on) localStorage.setItem(SIGNED_IN_KEY, "1"); else localStorage.removeItem(SIGNED_IN_KEY); } catch (e) { /* нет доступа */ }
    }

    window.BPFirebase = { load: load, hasSavedSession: hasSavedSession, afterLoad: afterLoad, setSignedIn: setSignedIn };
})();
