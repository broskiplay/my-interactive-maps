#!/usr/bin/env python3
"""Проверка собранного сайта (_site/): локальные ссылки и ресурсы в HTML должны вести на существующие файлы.

Запуск после `npm run site --prefix web`:  python3 scripts/check_links.py [_site]
Смотрит атрибуты href/src/srcset (и только их — шаблоны внутри <script> пропускаются).
Внешние адреса, якоря, mailto:, data: и шаблоны с подстановкой (${…}, {{…}}) не проверяются.
Код выхода 1, если нашлись битые ссылки (печатает до 40 примеров). Только stdlib.
"""
import os
import re
import sys
from collections import defaultdict
from urllib.parse import unquote, urlsplit

ROOT = sys.argv[1] if len(sys.argv) > 1 else "_site"
ATTR = re.compile(r'\s(?:href|src)="([^"]+)"|\ssrcset="([^"]+)"', re.I)
SCRIPT = re.compile(r"<script\b[^>]*>.*?</script>|<!--.*?-->", re.S | re.I)
BASE = re.compile(r'<base\s[^>]*href="([^"]+)"', re.I)
SKIP = re.compile(r"^(?:[a-z][a-z0-9+.-]*:|//|#|\?)|\$\{|\{\{|'\s*\+", re.I)


def exists(path):
    if os.path.isfile(path):
        return True
    return os.path.isdir(path) and os.path.isfile(os.path.join(path, "index.html"))


def main():
    root = os.path.abspath(ROOT)
    if not os.path.isdir(root):
        sys.exit(f"нет папки {ROOT}: сначала соберите сайт")
    broken = defaultdict(set)
    pages = 0
    for dirpath, _, files in os.walk(root):
        for name in files:
            if not name.endswith(".html"):
                continue
            pages += 1
            file = os.path.join(dirpath, name)
            with open(file, encoding="utf-8", errors="replace") as f:
                html = f.read()
            html = SCRIPT.sub("", html)   # и <base>, и ссылки ищем вне скриптов (в данных Next они тоже встречаются)
            b = BASE.search(html)
            bh = b.group(1) if b and not SKIP.search(b.group(1)) else ""
            here = os.path.normpath(os.path.join(root, bh.lstrip("/")) if bh.startswith("/") else os.path.join(dirpath, bh)) if bh else dirpath
            for m in ATTR.finditer(html):
                urls = [m.group(1)] if m.group(1) else [u.strip().split(" ")[0] for u in m.group(2).split(",")]
                for u in urls:
                    if not u or SKIP.search(u):
                        continue
                    p = unquote(urlsplit(u).path)
                    if not p:
                        continue
                    target = os.path.join(root, p.lstrip("/")) if p.startswith("/") else os.path.join(here, p)
                    if not exists(os.path.normpath(target)):
                        broken[u if u.startswith("/") else os.path.relpath(os.path.normpath(target), root)].add(os.path.relpath(file, root))
    print(f"проверено страниц: {pages}, битых адресов: {len(broken)}")
    for i, (u, where) in enumerate(sorted(broken.items(), key=lambda x: -len(x[1]))):
        if i == 40:
            print(f"… и ещё {len(broken) - 40}")
            break
        print(f"  {u}  ← {len(where)} стр., например {sorted(where)[0]}")
    sys.exit(1 if broken else 0)


if __name__ == "__main__":
    main()
