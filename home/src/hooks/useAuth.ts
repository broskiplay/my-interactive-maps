import { useCallback, useEffect, useRef, useState } from "react";
import { adminReportsCount, hasSavedSession, loadFirebase, SIGNED_IN_KEY, type FbAuth, type FbUser } from "../lib/firebase";
import { remove, write } from "../lib/storage";
import { afterPageLoad } from "./useAfterLoad";

export type AuthStatus = "guest" | "loading" | "signed-in";

export interface AuthState {
  status: AuthStatus;
  user: FbUser | null;
  error: string | null;
  /** Новых сообщений об ошибках (только для автора сайта), null — не автор */
  reports: number | null;
  signIn: () => void;
  signOut: () => void;
  /** Заранее начать загрузку Firebase (наведение на кнопку «Войти») */
  prefetch: () => void;
  dismissError: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<FbUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<number | null>(null);
  const authRef = useRef<FbAuth | null>(null);

  const connect = useCallback(async (): Promise<FbAuth | null> => {
    if (authRef.current) return authRef.current;
    const fb = await loadFirebase();
    if (!fb) return null;
    if (!authRef.current) {
      const auth = fb.auth();
      authRef.current = auth;
      auth.onAuthStateChanged((next) => {
        if (next) write(SIGNED_IN_KEY, "1");
        else remove(SIGNED_IN_KEY);
        setUser(next);
      });
    }
    return authRef.current;
  }, []);

  // Уже входил — поднимаем сессию после загрузки страницы, не мешая первой отрисовке
  useEffect(
    () =>
      afterPageLoad(() => {
        hasSavedSession().then((saved) => {
          if (saved) void connect();
        });
      }),
    [connect],
  );

  // Кнопка «Очередь правок» — только у автора (правила Firestore)
  useEffect(() => {
    if (!user) {
      setReports(null);
      return;
    }
    let alive = true;
    adminReportsCount().then((n) => alive && setReports(n));
    return () => {
      alive = false;
    };
  }, [user]);

  const signIn = useCallback(async () => {
    setError(null);
    setBusy(true);
    const auth = await connect();
    setBusy(false);
    const fb = window.firebase;
    if (!auth || !fb) {
      setError("Вход через Google сейчас недоступен: Firebase не загрузился. Проверьте подключение к интернету и попробуйте ещё раз.");
      return;
    }
    if (auth.currentUser) return; // сессия восстановилась сама, пока грузился Firebase
    try {
      await auth.signInWithPopup(new fb.auth.GoogleAuthProvider());
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-closed-by-user") return;
      if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
        setError("Браузер заблокировал окно входа. Нажмите «Войти» ещё раз.");
        return;
      }
      setError(`Ошибка входа через Google: ${(err as Error).message}`);
    }
  }, [connect]);

  const signOut = useCallback(() => {
    void authRef.current?.signOut();
  }, []);

  const prefetch = useCallback(() => {
    void loadFirebase();
  }, []);

  return {
    status: busy ? "loading" : user ? "signed-in" : "guest",
    user,
    error,
    reports,
    signIn: () => void signIn(),
    signOut,
    prefetch,
    dismissError: () => setError(null),
  };
}
