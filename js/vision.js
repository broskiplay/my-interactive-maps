/* VISION — живые элементы главной в стиле visionOS: наклон карточек за курсором, мини-карта в окне Hero,
   демо синхронизации, переключатель EN/RU, «печатающий» поиск по базе и индикатор эфира.
   Без зависимостей; всё работает и без скрипта (просто без движения). */
(function () {
    'use strict';
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- наклон и блик за курсором: пишем --rx/--ry/--mx/--my, остальное делает CSS ---------- */
    if (fine && !reduce) {
        var TILT = '.vx-card, .recent-item, .game-suggest-banner, .about-item';
        var cur = null, raf = 0, last = null;
        var apply = function () {
            raf = 0;
            if (!cur || !last) return;
            var r = cur.getBoundingClientRect();
            var px = (last.clientX - r.left) / r.width, py = (last.clientY - r.top) / r.height;
            var max = cur.classList.contains('vx-window') ? 6 : 4; // большое окно наклоняется заметнее
            cur.style.setProperty('--ry', ((px - .5) * max * 2).toFixed(2) + 'deg');
            cur.style.setProperty('--rx', ((.5 - py) * max * 2).toFixed(2) + 'deg');
            cur.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
            cur.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        };
        var reset = function (el) { ['--rx', '--ry', '--mx', '--my'].forEach(function (p) { el.style.removeProperty(p); }); };
        document.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse') return;
            var el = e.target.closest && e.target.closest(TILT);
            // раскрытая карточка игры (список карт) не качается — по ней кликают
            if (el && el.matches('details[open]')) el = null;
            if (el !== cur) { if (cur) reset(cur); cur = el; }
            last = e;
            if (cur && !raf) raf = requestAnimationFrame(apply);
        }, { passive: true });
        document.addEventListener('pointerleave', function () { if (cur) reset(cur); cur = null; });
        document.addEventListener('toggle', function (e) { if (e.target === cur && cur.open) { reset(cur); cur = null; } }, true);
    }

    /* ---------- мини-карта в окне Hero: метки отмечаются найденными, счётчики обновляются ---------- */
    var preview = document.getElementById('vx-preview');
    if (preview) {
        var pins = [].slice.call(preview.querySelectorAll('.vx-pin'));
        var cats = [].slice.call(preview.querySelectorAll('.vx-win-cats em'));
        var count = document.getElementById('vx-count'), bar = document.getElementById('vx-bar'), hint = document.getElementById('vx-hint');
        var names = ['Слово силы', 'Сундук', 'Пещера'];
        var update = function () {
            var found = 0, per = [0, 0, 0], tot = [0, 0, 0];
            pins.forEach(function (p) {
                var c = +p.dataset.cat, on = p.classList.contains('is-found');
                tot[c]++; if (on) { per[c]++; found++; }
            });
            if (count) count.textContent = found;
            if (bar) bar.style.width = Math.round(found / pins.length * 100) + '%';
            cats.forEach(function (em, i) { em.textContent = per[i] + '/' + tot[i]; });
            if (hint) hint.textContent = found === pins.length ? 'Всё найдено!' : found ? 'Отмечено: ' + found + ' из ' + pins.length : 'Нажмите на метку';
        };
        pins.forEach(function (p) {
            p.addEventListener('click', function () {
                var on = !p.classList.contains('is-found');
                p.classList.toggle('is-found', on);
                p.setAttribute('aria-pressed', on ? 'true' : 'false');
                p.setAttribute('aria-label', names[+p.dataset.cat] + (on ? ' — найдено' : ''));
                update();
            });
        });
        update();
    }

    /* ---------- синхронизация: «отметили на компьютере» — число растёт на обоих устройствах ---------- */
    var sync = document.getElementById('vx-sync');
    if (sync) {
        var n = 12, TOTAL = 50;
        var nums = sync.querySelectorAll('.vx-sync-n');
        var paint = function (i) { nums[i].textContent = n; };
        var step = function () {
            n = n >= TOTAL ? 12 : n + 1;
            paint(0);
            sync.classList.remove('is-sync'); void sync.offsetWidth; sync.classList.add('is-sync');
            setTimeout(function () { paint(1); }, 450);
        };
        if (reduce) { paint(0); paint(1); }
        else setInterval(step, 2200);
    }

    /* ---------- EN / RU ---------- */
    var lang = document.getElementById('vx-lang');
    if (lang) {
        var list = lang.querySelector('.vx-names'), btns = lang.querySelectorAll('.vx-seg button');
        [].forEach.call(btns, function (b) {
            b.addEventListener('click', function () {
                if (b.getAttribute('aria-pressed') === 'true') return;
                [].forEach.call(btns, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
                var l = b.dataset.l;
                list.classList.add('is-swap');
                setTimeout(function () {
                    [].forEach.call(list.children, function (li) { li.textContent = li.dataset[l]; });
                    list.classList.remove('is-swap');
                }, reduce ? 0 : 180);
            });
        });
    }

    /* ---------- поиск по базе: печатает примеры по кругу ---------- */
    var type = document.getElementById('vx-type');
    if (type && !reduce) {
        var words = ['Эбонитовый меч', 'Ксардас', 'Драконья кость', 'Сладкий рулет'], wi = 0, ci = words[0].length, del = true;
        var tick = function () {
            var wait = 70;
            if (del) {
                ci--; if (ci <= 0) { del = false; wi = (wi + 1) % words.length; wait = 350; }
                else wait = 40;
            } else {
                ci++; if (ci >= words[wi].length) { del = true; wait = 2200; }
            }
            type.textContent = words[wi].slice(0, Math.max(ci, 0)) || ' ';
            setTimeout(tick, wait);
        };
        // печать начинается, только когда карточка видна — не тратим кадры вне экрана
        var started = false;
        var go = function () { if (!started) { started = true; setTimeout(tick, 2000); } };
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { go(); io.disconnect(); } });
            io.observe(type);
        } else go();
    }

    /* ---------- эфир: повторяем состояние кнопки Twitch в шапке (её обновляет topbar.js) ---------- */
    var live = document.getElementById('vx-live'), tw = document.getElementById('twitch-button');
    if (live && tw) {
        var label = live.querySelector('span');
        var mirror = function () {
            var on = tw.classList.contains('is-live');
            live.classList.toggle('is-live', on);
            label.textContent = on ? 'В эфире' : 'Не в эфире';
        };
        mirror();
        if ('MutationObserver' in window) new MutationObserver(mirror).observe(tw, { attributes: true, attributeFilter: ['class'] });
    }
})();
