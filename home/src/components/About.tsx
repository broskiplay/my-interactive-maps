import { SUGGEST_URL } from "../lib/games";
import { container, cx, extLink, sectionTitle } from "../lib/ui";

const link = "font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-accent";

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className={cx(container, "scroll-mt-20 pb-16")}>
      <h2 id="about-heading" className={cx(sectionTitle, "mb-5")}>
        О проекте
      </h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <article>
          <h3 className="font-semibold">Что это</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Интерактивные карты игровых миров на русском языке: названия и описания меток переведены, найденное можно отмечать. Прогресс сохраняется в
            браузере и работает без аккаунта, а после входа через Google появится на других ваших устройствах.
          </p>
        </article>
        <article>
          <h3 className="font-semibold">Нашли ошибку?</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Нажмите «Неточное место?» или «Сообщить об ошибке» в окне метки — принятые правки попадают в{" "}
            <a href="/fixes/" className={link}>
              журнал исправлений
            </a>
            . Не нашли нужную игру?{" "}
            <a href={SUGGEST_URL} {...extLink} className={link}>
              Предложите её
            </a>
            .
          </p>
        </article>
        <article className="md:col-span-2 lg:col-span-1">
          <h3 className="font-semibold">Откуда карты</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Мы не рисуем карты с нуля: метки и подложки основаны на открытых картах игрового сообщества. Англоязычные карты переводим целиком, а названия
            мест, предметов и персонажей стараемся давать по официальной русской локализации — чтобы на карте было написано то же, что в игре. Где одного
            источника мало, сводим несколько и правим координаты и стыки. Все карты работают на нашем движке: одинаковое управление, заметки, поиск и
            работа без интернета.
          </p>
        </article>
      </div>
    </section>
  );
}
