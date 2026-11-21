/** «Продолжить»: последние открытые карты. Заполняет js/script.js (renderRecent), пока список пуст — блок скрыт.
 *  На компьютере видны две, остальные — по «Показать ещё» (на телефоне кнопки нет, видны до трёх; css/home-v3.css). */
export function Recent() {
  return (
    <section className="bx-section recent-maps" id="recent-maps" aria-labelledby="recent-heading" hidden>
      <div className="bx-head">
        <h2 id="recent-heading">Продолжить</h2>
        <button type="button" className="bx-head-link recent-more" id="recent-more" aria-controls="recent-list" aria-expanded="false" hidden>
          Показать ещё
        </button>
      </div>
      <div className="recent-list" id="recent-list"></div>
    </section>
  );
}
