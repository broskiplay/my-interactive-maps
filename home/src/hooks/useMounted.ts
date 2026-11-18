import { useEffect, useState } from "react";

/** false при пререндере и первой гидратации, true после монтирования — для всего, что зависит от браузера и времени. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
