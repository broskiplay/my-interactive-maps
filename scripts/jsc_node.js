#!/usr/bin/env node
// Замена macOS JavaScriptCore (jsc) для сборки на GitHub Actions (Linux):
// тот же интерфейс, что ждут scripts/early_data.py и scripts/category_pages.py —
//   node jsc_node.js файл.js   или   node jsc_node.js -e "код"   , вывод через print(...).
// Включается переменной окружения JSC (см. .github/workflows/pages.yml).
const fs = require("fs"), vm = require("vm");
const a = process.argv.slice(2);
const code = a[0] === "-e" ? a[1] : fs.readFileSync(a[0], "utf8");
globalThis.print = (...x) => console.log(...x);
vm.runInThisContext(code, { filename: a[0] === "-e" ? "eval.js" : a[0] });
