/** Экран загрузки при переходе на карту (показывает js/script.js). */
export function LoadingScreen() {
  return (
    <div className="loading-screen" id="map-loading-screen" role="status" aria-live="polite" hidden>
      <div className="loading-panel">
        <p className="loading-eyebrow">BroskiPlay · загрузка локации</p>
        <h2 className="loading-title" id="map-loading-title">
          Подготовка карты
        </h2>
        <p className="loading-tip" id="map-loading-tip"></p>
        <div className="loading-track" aria-hidden="true">
          <span></span>
        </div>
        <span className="loading-caption">СИНХРОНИЗАЦИЯ ДАННЫХ И МАРКЕРОВ</span>
      </div>
    </div>
  );
}
