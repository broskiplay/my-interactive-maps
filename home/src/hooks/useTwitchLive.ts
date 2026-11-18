import { useEffect, useState } from "react";
import { afterPageLoad } from "./useAfterLoad";

export interface TwitchState {
  live: boolean;
  status: string;
}

/** Идёт ли стрим (decapi.me). Проверка после загрузки страницы и раз в 5 минут; ?previewTwitch=live — предпросмотр. */
export function useTwitchLive(): TwitchState {
  const [state, setState] = useState<TwitchState>({ live: false, status: "" });

  useEffect(() => {
    if (new URLSearchParams(location.search).get("previewTwitch") === "live") {
      setState({ live: true, status: "Предпросмотр" });
      return;
    }
    let alive = true;
    const check = async () => {
      try {
        const res = await fetch("https://decapi.me/twitch/uptime/broskiplay", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const text = (await res.text()).trim();
        const live = Boolean(text) && !/offline|not found|error|invalid|rate limit/i.test(text);
        if (alive) setState({ live, status: live ? text : "" });
      } catch {
        if (alive) setState({ live: false, status: "" });
      }
    };
    const cancel = afterPageLoad(check);
    const timer = window.setInterval(check, 5 * 60 * 1000);
    return () => {
      alive = false;
      cancel();
      window.clearInterval(timer);
    };
  }, []);

  return state;
}
