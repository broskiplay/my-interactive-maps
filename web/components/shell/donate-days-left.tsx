"use client";

import { useEffect, useState } from "react";

const word = (d: number) =>
  d % 10 === 1 && d % 100 !== 11 ? "день" : d % 10 >= 2 && d % 10 <= 4 && (d % 100 < 12 || d % 100 > 14) ? "дня" : "дней";

/** « · осталось N дней» — считается в браузере, чтобы не устаревать между публикациями. */
export function DonateDaysLeft({ deadline }: { deadline: string }) {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    setDays(Math.ceil((new Date(deadline + "T00:00:00").getTime() - Date.now()) / 864e5));
  }, [deadline]);
  if (days === null || days <= 0) return null;
  return <>{` · осталось ${days} ${word(days)}`}</>;
}
