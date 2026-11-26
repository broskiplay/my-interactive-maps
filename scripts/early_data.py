#!/usr/bin/env python3
"""Ранний запрос данных карт: вставляет в <game>-map/index.html (между <!-- early-data:start/end -->) скрипт,
который сразу из <head> запрашивает manifest.json тайлов и файл меток выбранной карты (<link rel="preload" as="fetch">).
Карта выбирается так же, как в js/app.js; адреса берутся из настроек самих карт (через JavaScriptCore macOS),
поэтому app.js получает уже скачанные файлы. Запускайте после изменения списка карт, путей к данным или ASSETS_ROOT:

    python3 scripts/early_data.py            # все карты
    python3 scripts/early_data.py skyrim-map # одна
Проверка: в DevTools → Network каждый manifest.json/_markers.json должен быть один раз (Initiator: link).
"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MAC_JSC = "/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"
# macOS — системный jsc; Windows/Linux — node scripts/jsc_node.cjs (или путь в переменной JSC)
JSC = os.environ.get("JSC") or (_MAC_JSC if os.path.exists(_MAC_JSC) else os.path.join(os.path.dirname(os.path.abspath(__file__)), "jsc_node.cjs"))
JSC_CMD = ["node", JSC] if JSC.endswith((".cjs", ".js")) else [JSC]

def jsc(code):
    out = subprocess.run([*JSC_CMD, "-e", code], capture_output=True, text=True)
    if out.returncode or not out.stdout.strip():
        raise RuntimeError(out.stderr or out.stdout)
    return json.loads(out.stdout)

def read(p): return open(p, encoding="utf-8").read()
def const_line(src, name):
    m = re.search(r"^const %s = .*?;\s*$" % name, src, re.M); assert m, name; return m.group(0)
def block(src, start, end_pat=r"^\];|^\};"):
    a = src.index(start); m = re.compile(end_pat, re.M).search(src, a); return src[a:m.end()]

def config(d):
    app = read(f"{d}/js/app.js")
    if d == "stellar-blade-map":
        r = jsc(read(f"{d}/js/maps.js") + "\n" + const_line(app, "ASSETS_ROOT") +
                "\nprint(JSON.stringify(MAPS.map(m=>[m.id,[ASSETS_ROOT+'/tiles/'+m.id+'/manifest.json',m.markersFile],m.legacyFile])))")
        return {"maps": {i: u for i, u, _ in r}, "def": r[0][0], "last": "sb_last_map", "legacy": {f: i for i, _, f in r if f}}
    if d in ("oblivion-remake-map", "skyrim-map", "witcher3-map", "hogwarts-legacy-map", "phantom-blade-zero-map", "dragonsword-awakening-map"):
        a = app.index("const ASSETS_ROOT"); b = app.index("\n", app.index("const MAP_ORDER")) 
        key = {"oblivion-remake-map": "ob_last_map", "skyrim-map": "sk_last_map", "witcher3-map": "w3_last_map", "hogwarts-legacy-map": "hl_last_map", "phantom-blade-zero-map": "pb_last_map", "dragonsword-awakening-map": "dsa_last_map"}[d]
        r = jsc(app[a:b] + "\nprint(JSON.stringify({o:MAP_ORDER,m:Object.fromEntries(Object.entries(MAPS).map(([k,v])=>[k,[v.tiles+'/manifest.json',v.markersFile]]))}))")
        return {"maps": r["m"], "def": r["o"][0], "last": key}
    if d == "cs2-map":  # раскидки: только метки выбранной карты (тайлы без manifest.json)
        a = app.index("const ASSETS_ROOT"); b = app.index("\n", app.index("const MAP_ORDER"))
        ids = jsc(app[a:b] + "\nprint(JSON.stringify(MAP_ORDER))")
        return {"maps": {i: [f"data/cs2_{i}.json"] for i in ids}, "def": ids[0], "last": "cs2_last_map"}
    if d in ("cyberpunk2077-map", "rdr2-map", "gta6-map", "silver-palace-map", "mortal-shell-2-map"):  # одна карта; метки ~0,9 МБ — заранее не тянем (как у Palworld), только список тайлов
        a = app.index("const ASSETS_ROOT"); b = app.index("\n", app.index("const MAP_ORDER"))
        r = jsc(app[a:b] + "\nprint(JSON.stringify(MAPS[MAP_ORDER[0]].tiles+'/manifest.json'))")
        return {"maps": {"_": [r]}, "def": "_", "single": True}
    if d in ("gothic-remake-map", "palworld-map"):
        ar = jsc(const_line(app, "ASSETS_ROOT") + "\nprint(JSON.stringify(ASSETS_ROOT))")
        mf = re.search(r'markersFile: "([^"]+)"', app).group(1)
        urls = [ar + "/tiles/manifest.json"] + ([mf] if d == "gothic-remake-map" else [])  # метки Palworld ~480 КБ: заранее не тянем
        return {"maps": {"_": urls}, "def": "_", "single": True}
    if d == "dimraeth-map":
        ar = jsc(const_line(app, "ASSETS_ROOT") + "\nprint(JSON.stringify(ASSETS_ROOT))")
        ids = jsc(block(app, "const MAPS = [") + "\nprint(JSON.stringify(MAPS.map(m=>m.id)))")
        return {"maps": {i: [f"{ar}/tiles/{i}/manifest.json?v=2", f"data/dimraeth_{i}_markers.json", "data/dimraeth_db.json"] for i in ids}, "def": ids[0]}
    if d == "tainted-grail-map":
        ids = jsc(block(app, "const MAPS = [") + "\nprint(JSON.stringify(MAPS.map(m=>m.id)))")
        return {"maps": {i: [f"data/tainted_grail_{i}_markers.json"] for i in ids}, "def": ids[0]}
    raise KeyError(d)

TPL = '''    <!-- early-data:start — список тайлов (manifest.json) и данные меток запрашиваем сразу, не дожидаясь скриптов карты.
         Карту выбираем так же, как js/app.js; адреса совпадают с его fetch(), поэтому браузер берёт уже скачанное.
         Сгенерировано scripts/early_data.py по настройкам карты: после изменения списка карт или путей запустите его снова. -->
    <script>
        (function () {
            var C = %s;
            // Карта — из адреса /<игра>/<карта>/ (у страниц локаций <base href="../">, поэтому "." — папка игры)
            var home = new URL(".", document.baseURI).pathname, seg = location.pathname.slice(home.length).split("/")[0];
            var u = new URLSearchParams(location.search), q = u.get("map");
            if (q !== null) {
                // Старые ссылки ?map=<id>: переходим на страницу локации, у одной карты — просто убираем параметр
                u.delete("map");
                var rest = u.toString() ? "?" + u.toString() : "";
                if (!C.single && C.maps[q] && !C.maps[seg]) { location.replace(home + q + "/" + rest + location.hash); return; }
                try { history.replaceState(history.state, "", location.pathname + rest + location.hash); } catch (e) { /* без History API */ }
            }
            var id = C.single ? C.def : C.maps[seg] ? seg : null;
            if (!id && C.last) { try { var l = localStorage.getItem(C.last); id = C.maps[l] ? l : (C.legacy && C.legacy[l]) || null; } catch (e) { /* нет доступа */ } }
            (C.maps[id || C.def] || []).forEach(function (u) {
                var e = document.createElement("link");
                e.rel = "preload"; e.as = "fetch"; e.crossOrigin = "anonymous"; e.href = u;
                document.head.appendChild(e);
            });
        })();
    </script>
    <!-- early-data:end -->
'''
# строка preconnect к хранилищу тайлов игры (broskiplay.github.io/<игра>-assets), после неё вставляем блок
ANCHOR_RE = re.compile(r'    <link rel="preconnect" href="https://broskiplay\.github\.io/[a-z0-9-]+-assets" crossorigin>\n')

def apply(d):
    f = os.path.join(ROOT, d, "index.html")
    s = open(f, encoding="utf-8").read()
    s = re.sub(r"    <!-- early-data:start.*?<!-- early-data:end -->\n", "", s, flags=re.S)
    found = ANCHOR_RE.findall(s)
    if len(found) != 1:
        raise RuntimeError(f + ": нет строки preconnect к broskiplay.github.io/<игра>-assets")
    s = s.replace(found[0], found[0] + TPL % json.dumps(config(d), ensure_ascii=False, separators=(",", ":")))
    open(f, "w", encoding="utf-8").write(s)
    print("ок", d)


if __name__ == "__main__":
    os.chdir(ROOT)
    maps = sys.argv[1:] or sorted(p for p in os.listdir(ROOT) if p.endswith("-map") and os.path.isdir(p))
    for d in maps:
        apply(d)
